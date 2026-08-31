import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, cleanDb } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('POST /login', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await cleanDb(); // start every test with an empty DB
  });

  it('returns a 401 for a non-existent email', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'doesnotexist@example.com',
        password: 'whatever123',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
      code: 'AUTH_ERROR',
    });
  });

  it('returns a 401 for a wrong password', async () => {
    // first, register a real user
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'test@example.com',
        password: 'correctpassword123',
      },
    });

    // then try logging in with the wrong password
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'wrongpassword',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      error: 'Invalid email or password',
      code: 'AUTH_ERROR',
    });
  });

  it('returns 200 with tokens for correct credentials', async () => {
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'test@example.com',
        password: 'correctpassword123',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
        password: 'correctpassword123',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.accessToken).toBeDefined();
    expect(body.refreshToken).toBeDefined();
    expect(body.user.email).toBe('test@example.com');
    expect(body.user.passwordHash).toBeUndefined(); // never leak the hash
  });

  it('returns 400 for missing password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/login',
      payload: {
        email: 'test@example.com',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});