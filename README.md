# Fastify Auth Backend

A backend authentication API built from scratch to learn professional backend engineering practices — layered architecture, JWT authentication with refresh token rotation, centralized error handling, integration testing, and CI/CD.

[![Tests](https://github.com/GevorgKhachatryann/fastify-backend-learning/actions/workflows/test.yml/badge.svg)](https://github.com/GevorgKhachatryann/fastify-backend-learning/actions/workflows/test.yml)

## Tech Stack

- **Framework:** Fastify
- **Language:** TypeScript (Node.js, ESM/NodeNext)
- **Database:** PostgreSQL (via Docker)
- **ORM:** Prisma 7 (driver adapters, `@prisma/adapter-pg`)
- **Auth:** JWT (access tokens) + DB-stored refresh tokens with rotation
- **Validation:** Zod
- **Testing:** Vitest + Fastify's `inject()` (integration tests) + `@vitest/coverage-v8`
- **API Docs:** Swagger / OpenAPI (`@fastify/swagger` + `@fastify/swagger-ui`)
- **CI/CD:** GitHub Actions

## Architecture

The project follows a layered architecture to separate concerns and keep business logic testable and independent of the HTTP/database layers:

```
routes → controllers → services → repositories → Prisma → PostgreSQL
```

- **Routes** — map HTTP method + path to a controller, attach Fastify schemas (for validation + Swagger docs)
- **Controllers** — handle HTTP concerns only: parse/validate input, call the service, shape the response
- **Services** — business logic (password hashing, token issuing, rotation rules)
- **Repositories** — the only layer that talks to the database directly

Errors are handled centrally via a global Fastify `setErrorHandler`, using custom `AppError` subclasses (`AuthError`, `NotFoundError`, `ConflictError`, `ForbiddenError`) so every layer can `throw` instead of manually formatting HTTP responses.

## Features

- User registration with bcrypt password hashing
- Login issuing short-lived JWT access tokens + long-lived, DB-stored refresh tokens
- **Refresh token rotation** — every `/refresh` call invalidates the old token and issues a new one
- Role-based access control (RBAC) with `authenticate` / `authorize(role)` guards
- Centralized error handling with typed error classes
- Zod-based request validation
- Full integration test suite (coverage)
- Auto-generated interactive API docs at `/docs`
- CI pipeline that runs the full test suite (with a real Postgres instance) on every push

## Getting Started

### Prerequisites
- Node.js 20+
- Docker Desktop

### Setup

```bash
# install dependencies
npm install

# start Postgres (dev + test databases)
docker compose up -d

# copy env files and fill in real values
cp .env.example .env
cp .env.example .env.test

# run migrations
npx prisma migrate deploy

# start the dev server
npm run dev
```

Server runs at `http://localhost:3000`. Interactive API docs at `http://localhost:3000/docs`.

### Running tests

```bash
npm test              # run the full suite once
npm run test:watch    # watch mode
npm run test:coverage # with coverage report (outputs to /coverage)
```

Tests run against a separate, isolated Postgres database (`learning_test_db`) so they never touch dev data.

## API Endpoints

| Method | Path         | Description                          | Auth              |
|--------|--------------|---------------------------------------|-------------------|
| POST   | `/users`     | Register a new user                  | —                 |
| POST   | `/login`     | Log in, receive access + refresh tokens | —              |
| POST   | `/refresh`   | Exchange a refresh token for a new pair | —              |
| GET    | `/me`        | Get the current authenticated user   | Bearer token      |
| DELETE | `/users/:id` | Delete a user                        | Bearer token, admin only |
| GET    | `/health`    | Database connectivity check          | —                 |

Full request/response schemas are documented interactively at `/docs`.

## What I Learned

This project was my hands-on introduction to backend engineering beyond QA, built step by step over several sessions. Some of the concepts I worked through:

- **Why layered architecture matters** — not just as a folder structure, but for testability (mocking a repository instead of a real DB), and for isolating change (swapping Prisma's connection method didn't touch my services or controllers at all)
- **JWT vs. refresh tokens** — short-lived, stateless access tokens vs. long-lived, revocable, DB-stored refresh tokens, and why refresh token *rotation* closes a real security gap (a leaked refresh token becomes useless after one legitimate use)
- **Centralized error handling** — moving from ad hoc `try/catch` in every controller to custom error classes and one global Fastify error handler, and debugging a real Fastify encapsulation/registration-order bug along the way (two plugins competing to set the error handler — the last one registered silently won)
- **Integration testing** — using Fastify's `inject()` to test the full stack (routing → validation → business logic → real database) without needing a running server, and hitting a genuine concurrency bug (parallel test files sharing one database) that taught me about test isolation and `fileParallelism`
- **CI/CD** — setting up GitHub Actions to spin up a temporary Postgres service, generate the Prisma client, run migrations, and run the full test suite on every push, plus debugging a "works locally, fails in CI" issue (the generated Prisma client wasn't committed and CI never regenerated it)

## Known Technical Debt / Not Yet Implemented

- API security hardening (rate limiting, CORS config, security headers) — deprioritized in favor of testing/docs/CI
- No reuse-detection on refresh tokens (rotation deletes+reissues, but doesn't yet revoke *all* tokens for a user on detected reuse)
- No structured/production-grade logging (currently using Fastify's default Pino logger as-is)

