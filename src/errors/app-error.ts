// errors/app-error.ts
export class AppError extends Error {
  constructor(message: string, public statusCode: number, public code?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AuthError extends AppError {
  constructor(message = 'Invalid credentials') {
    super(message, 401, 'AUTH_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409, 'CONFLICT');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}