#!/usr/bin/env node
/**
 * AI-powered pre-commit review.
 *
 * Provider is selected via AI_REVIEW_PROVIDER (default: anthropic).
 * Supported providers:
 *   - anthropic  → requires ANTHROPIC_API_KEY
 *   - openai     → requires OPENAI_API_KEY
 *
 * Set AI_REVIEW_MODEL to override the default model for the chosen provider.
 */

const { execSync } = require('child_process');
const https = require('https');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = execSync('git rev-parse --show-toplevel').toString().trim();
const AGENT_FILE = path.join(REPO_ROOT, '.github', 'agents', 'pr-review.agent.md');

const PROVIDERS = {
  anthropic: {
    host: 'api.anthropic.com',
    path: '/v1/messages',
    defaultModel: 'claude-opus-4-8',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    buildBody: (model, prompt) => JSON.stringify({
      model,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    }),
    parseResponse: (body) => {
      const json = JSON.parse(body);
      return json.content?.[0]?.text ?? '';
    },
  },
  openai: {
    host: 'api.openai.com',
    path: '/v1/chat/completions',
    defaultModel: 'gpt-4o',
    apiKeyEnv: 'OPENAI_API_KEY',
    buildBody: (model, prompt) => JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2048,
    }),
    buildHeaders: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }),
    parseResponse: (body) => {
      const json = JSON.parse(body);
      return json.choices?.[0]?.message?.content ?? '';
    },
  },
};

function callApi(provider, headers, bodyStr) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      { hostname: provider.host, path: provider.path, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`API error ${res.statusCode}: ${data}`));
          } else {
            resolve(data);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(bodyStr);
    req.end();
  });
}

async function main() {
  // Check staged files
  const stagedFiles = execSync('git diff --cached --name-only').toString().trim();
  if (!stagedFiles) {
    process.exit(0);
  }

  // Check agent definition exists
  if (!fs.existsSync(AGENT_FILE)) {
    console.warn('⚠️  pr-review agent not found at .github/agents/pr-review.agent.md — skipping AI review');
    process.exit(0);
  }

  // Resolve provider
  const providerName = (process.env.AI_REVIEW_PROVIDER || 'anthropic').toLowerCase();
  const provider = PROVIDERS[providerName];
  if (!provider) {
    console.warn(`⚠️  Unknown AI_REVIEW_PROVIDER "${providerName}" — skipping AI review`);
    process.exit(0);
  }

  const apiKey = process.env[provider.apiKeyEnv];
  if (!apiKey) {
    console.warn(`⚠️  ${provider.apiKeyEnv} not set — skipping AI review`);
    process.exit(0);
  }

  const model = process.env.AI_REVIEW_MODEL || provider.defaultModel;
  const agentInstructions = fs.readFileSync(AGENT_FILE, 'utf8');
  const stagedDiff = execSync('git diff --cached').toString();
  const fileCount = stagedFiles.split('\n').length;

  console.log(`\n🤖 Running AI PR review on ${fileCount} staged file(s) via ${providerName} (${model})...\n`);

  const prompt = `You are performing a pre-commit code review on staged git changes.

${agentInstructions}

Here are the staged changes:
\`\`\`diff
${stagedDiff}
\`\`\`

Review the diff above and follow the output format from your instructions exactly.
End your response with exactly one of these verdict lines:
- Overall verdict: ✅ Approved
- Overall verdict: ⚠️ Needs Changes
- Overall verdict: 🚫 Blocked`;

  let reviewOutput;
  try {
    const headers = provider.buildHeaders(apiKey);
    const body = provider.buildBody(model, prompt);
    headers['Content-Length'] = Buffer.byteLength(body);
    const rawResponse = await callApi(provider, headers, body);
    reviewOutput = provider.parseResponse(rawResponse);
  } catch (err) {
    console.warn(`⚠️  AI review failed (${err.message}) — skipping`);
    process.exit(0);
  }

  console.log(reviewOutput);
  console.log('');

  if (reviewOutput.includes('Overall verdict: 🚫 Blocked')) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌  Commit BLOCKED — critical issues found.');
    console.log('    Fix the issues above and try again.');
    console.log('    Bypass (not recommended): git commit --no-verify');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  if (reviewOutput.includes('Overall verdict: ⚠️ Needs Changes')) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️   Commit BLOCKED — review findings must be addressed.');
    console.log('    Fix the issues above and try again.');
    console.log('    Bypass (not recommended): git commit --no-verify');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(1);
  }

  if (reviewOutput.includes('Overall verdict: ✅ Approved')) {
    console.log('✅  AI review passed — commit allowed.');
    process.exit(0);
  }

  // Verdict not found — allow with a warning
  console.warn('⚠️  Could not parse AI review verdict — allowing commit with caution.');
  process.exit(0);
}

main();
