import { z } from "zod";
import { toJsonSchema } from "../utils/zod-to-json.js";

export const userSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type UserSchema = z.infer<typeof userSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type RefreshTokenSchema = z.infer<typeof refreshTokenSchema>;

// ---- Fastify/Swagger route schemas ----

const errorResponse = {
  type: 'object',
  properties: { error: { type: 'string' } },
};

const authErrorResponse = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    code: { type: 'string' },
  },
};

export const registerRouteSchema = {
  description: 'Register a new user',
  tags: ['auth'],
  body: toJsonSchema(userSchema),
  response: {
    201: {
      description: 'User created successfully',
      type: 'object',
      properties: {
        id: { type: 'number' },
        email: { type: 'string' },
        role: { type: 'string' },
      },
    },
    409: { description: 'Email already in use', ...errorResponse },
  },
};

export const loginRouteSchema = {
  description: 'Log in and receive access + refresh tokens',
  tags: ['auth'],
  body: toJsonSchema(loginSchema),
  response: {
    200: {
      description: 'Login successful',
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            email: { type: 'string' },
            role: { type: 'string' },
          },
        },
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    401: { description: 'Invalid credentials', ...authErrorResponse },
  },
};

export const refreshRouteSchema = {
  description: 'Exchange a refresh token for a new access + refresh token pair',
  tags: ['auth'],
  body: toJsonSchema(refreshTokenSchema),
  response: {
    200: {
      description: 'New token pair issued',
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
    401: { description: 'Invalid or expired refresh token', ...authErrorResponse },
  },
};

export const deleteUserRouteSchema = {
  description: 'Delete a user by ID (admin only)',
  tags: ['users'],
  security: [{ bearerAuth: [] }],
  params: {
    type: 'object',
    properties: { id: { type: 'string' } },
  },
  response: {
    204: { description: 'User deleted successfully', type: 'null' },
    403: { description: 'Forbidden — not an admin', ...errorResponse },
    404: { description: 'User not found', ...errorResponse },
  },
};