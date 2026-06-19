import { DataHelper } from '../../utils/helpers/data-helper';

/**
 * ApiDataBuilder constructs typed request payload objects for API tests.
 * Each inner builder class is self-contained and returns a plain object
 * via build(), making it easy to extend per endpoint.
 *
 * Example:
 *   const payload = new PostBuilder().withTitle('My Post').build();
 *   const user    = new ApiUserBuilder().withEmail('x@y.com').build();
 */

// ─── Post ─────────────────────────────────────────────────────────────────────

export interface PostPayload {
  title: string;
  body: string;
  userId: number;
}

export class PostBuilder {
  private data: PostPayload = {
    title: `Test Post ${DataHelper.generateRandomString(6)}`,
    body: `Auto-generated body ${DataHelper.generateRandomString(12)}`,
    userId: 1,
  };

  withTitle(title: string): this {
    this.data.title = title;
    return this;
  }

  withBody(body: string): this {
    this.data.body = body;
    return this;
  }

  withUserId(userId: number): this {
    this.data.userId = userId;
    return this;
  }

  build(): PostPayload {
    return { ...this.data };
  }
}

// ─── API User ─────────────────────────────────────────────────────────────────

export interface ApiUserPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  website?: string;
}

export class ApiUserBuilder {
  private data: ApiUserPayload = {
    name: `Test User ${DataHelper.generateRandomString(4)}`,
    username: `testuser_${DataHelper.generateRandomString(6)}`,
    email: DataHelper.generateRandomEmail(),
  };

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withUsername(username: string): this {
    this.data.username = username;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withPhone(phone: string): this {
    this.data.phone = phone;
    return this;
  }

  withWebsite(website: string): this {
    this.data.website = website;
    return this;
  }

  build(): ApiUserPayload {
    return { ...this.data };
  }
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface CommentPayload {
  postId: number;
  name: string;
  email: string;
  body: string;
}

export class CommentBuilder {
  private data: CommentPayload = {
    postId: 1,
    name: `Comment ${DataHelper.generateRandomString(4)}`,
    email: DataHelper.generateRandomEmail(),
    body: `Test comment body ${DataHelper.generateRandomString(10)}`,
  };

  withPostId(postId: number): this {
    this.data.postId = postId;
    return this;
  }

  withName(name: string): this {
    this.data.name = name;
    return this;
  }

  withEmail(email: string): this {
    this.data.email = email;
    return this;
  }

  withBody(body: string): this {
    this.data.body = body;
    return this;
  }

  build(): CommentPayload {
    return { ...this.data };
  }
}
