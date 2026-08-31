import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, cleanDb } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('POST /refresh', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDb();
  });

  // helper: register + login, return the refreshToken from the response
  async function registerAndLogin() {
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: { email: 'refresh@example.com', password: 'password123' },
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/login',
      payload: { email: 'refresh@example.com', password: 'password123' },
    });

    return loginResponse.json().refreshToken as string;
  }

  it('issues a new access token and a new refresh token', async () => {
    const oldRefreshToken = await registerAndLogin();

    const response = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: oldRefreshToken },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(body.refreshToken).not.toBe(oldRefreshToken); // rotation happened
  });

  it('rejects reuse of an already-rotated refresh token', async () => {
    const oldRefreshToken = await registerAndLogin();

    // use it once — this rotates it
    await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: oldRefreshToken },
    });

    // try to use the same (now-deleted) token again
    const response = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: oldRefreshToken },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Invalid or expired refresh token',
      code: 'AUTH_ERROR',
    });
  });

  it('rejects a garbage/nonexistent refresh token', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: { refreshToken: 'this-token-does-not-exist-at-all' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 400 when refreshToken is missing from the body', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/refresh',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });
});