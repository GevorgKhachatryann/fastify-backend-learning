import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, cleanDb } from './helpers.js';
import type { FastifyInstance } from 'fastify';

describe('POST /users (register)', () => {
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

  it('registers a new user successfully', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'newuser@example.com',
        password: 'securepassword123',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.id).toBeDefined();
    expect(body.email).toBe('newuser@example.com');
    expect(body.passwordHash).toBeUndefined(); // never leak the hash
  });

  it('returns 409 for a duplicate email', async () => {
    // register once
    await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'dupe@example.com',
        password: 'securepassword123',
      },
    });

    // register again with the same email
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'dupe@example.com',
        password: 'differentpassword456',
      },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toEqual({ error: 'Email already in use' });
  });

  it('returns 400 for a missing password', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'nopassword@example.com',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for an invalid email format', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/users',
      payload: {
        email: 'not-an-email',
        password: 'securepassword123',
      },
    });

    expect(response.statusCode).toBe(400);
  });
});