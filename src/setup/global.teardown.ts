import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger/logger';

async function globalTeardown(): Promise<void> {
  logger.info('=== Global Teardown: Starting ===');

  // Consolidate run metadata for KPI tracking
  const resultsPath = path.resolve('test-results/results.json');
  if (fs.existsSync(resultsPath)) {
    try {
      const raw = fs.readFileSync(resultsPath, 'utf-8');
      const results = JSON.parse(raw) as {
        stats?: {
          expected?: number;
          unexpected?: number;
          flaky?: number;
          skipped?: number;
          duration?: number;
        };
      };
      const stats = results.stats ?? {};
      const total = (stats.expected ?? 0) + (stats.unexpected ?? 0);
      const passRate = total > 0 ? (((stats.expected ?? 0) / total) * 100).toFixed(1) : 'N/A';
      const flakyCnt = stats.flaky ?? 0;

      logger.info('=== Run Summary ===');
      logger.info(`  Passed  : ${stats.expected ?? 0}`);
      logger.info(`  Failed  : ${stats.unexpected ?? 0}`);
      logger.info(`  Flaky   : ${flakyCnt}`);
      logger.info(`  Skipped : ${stats.skipped ?? 0}`);
      logger.info(`  Pass Rate: ${passRate}%`);
      logger.info(`  Duration : ${((stats.duration ?? 0) / 1000).toFixed(1)}s`);
    } catch {
      logger.warn('Could not parse test results for summary');
    }
  }

  logger.info('=== Global Teardown: Complete ===');
}

export default globalTeardown;
