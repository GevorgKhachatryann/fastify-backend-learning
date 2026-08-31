import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestApp, cleanDb, createAdminAndToken, createUserAndToken } from './helpers.js';
import { prisma } from '../src/plugins/prisma.js';
import type { FastifyInstance } from 'fastify';

describe('DELETE /users/:id', () => {
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

  it('allows an admin to delete an existing user', async () => {
    const { token: adminToken } = await createAdminAndToken();

    // create a separate user to be deleted
    const targetUser = await prisma.user.create({
      data: { email: 'target@example.com', passwordHash: 'irrelevant-hash', role: 'user' },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${targetUser.id}`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(204);

    // confirm it's actually gone
    const stillExists = await prisma.user.findUnique({ where: { id: targetUser.id } });
    expect(stillExists).toBeNull();
  });

  it('returns 403 when a non-admin tries to delete a user', async () => {
    const { token: userToken } = await createUserAndToken();

    const targetUser = await prisma.user.create({
      data: { email: 'target2@example.com', passwordHash: 'irrelevant-hash', role: 'user' },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${targetUser.id}`,
      headers: { authorization: `Bearer ${userToken}` },
    });

    expect(response.statusCode).toBe(403);
  });

  it('returns 401 when no auth token is provided', async () => {
    const targetUser = await prisma.user.create({
      data: { email: 'target3@example.com', passwordHash: 'irrelevant-hash', role: 'user' },
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${targetUser.id}`,
      // no authorization header at all
    });

    expect(response.statusCode).toBe(401);
  });

  it('returns 404 when the target user does not exist', async () => {
    const { token: adminToken } = await createAdminAndToken();

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/999999`, // an id that doesn't exist
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ error: 'User not found' });
  });

  it('returns 400 for a non-numeric id', async () => {
    const { token: adminToken } = await createAdminAndToken();

    const response = await app.inject({
      method: 'DELETE',
      url: `/users/not-a-number`,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(response.statusCode).toBe(400);
  });
});