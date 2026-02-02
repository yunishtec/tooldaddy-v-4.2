/**
 * Safe Error Handling & Logging
 * Prevents exposure of sensitive information in error messages
 */

/**
 * Create a safe error response that hides sensitive details from clients
 * while logging full error details for debugging
 */
export interface SafeError {
  message: string;
  code: string;
  status: number;
  context?: Record<string, unknown>;
}

export function createSafeError(
  error: Error | unknown,
  publicMessage: string,
  errorCode: string = 'INTERNAL_ERROR',
  httpStatus: number = 500,
  context?: Record<string, unknown>
): SafeError {
  // Log full error internally (server-side only)
  const fullError = error instanceof Error ? error : new Error(String(error));
  
  if (typeof console !== 'undefined') {
    console.error({
      message: 'Internal error occurred',
      error: fullError.message,
      stack: fullError.stack,
      code: errorCode,
      context,
    });
  }

  // Return safe error to client (no stack traces, no internal details)
  return {
    message: publicMessage,
    code: errorCode,
    status: httpStatus,
    context: filterSensitiveContext(context),
  };
}

/**
 * Filter out sensitive keys from context before sending to client
 */
function filterSensitiveContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!context) return undefined;

  const SENSITIVE_KEYS = [
    'password',
    'token',
    'secret',
    'api_key',
    'apiKey',
    'authorization',
    'auth',
    'private',
    'key',
    'credential',
    'email',
    'phone',
    'ssn',
    'dob',
    'credit',
    'card',
  ];

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(context)) {
    const keyLower = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(
      sensitive => keyLower.includes(sensitive)
    );

    if (!isSensitive) {
      filtered[key] = value;
    } else {
      filtered[key] = '[REDACTED]';
    }
  }

  return filtered;
}

/**
 * Validate error is safe to expose to client
 * Returns true if error can be shown to user safely
 */
export function isSafeClientError(error: Error | unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  // Only allow specific error types to be exposed
  const SAFE_ERROR_TYPES = [
    'ValidationError',
    'NotFoundError',
    'UnauthorizedError',
    'ForbiddenError',
    'ConflictError',
    'RateLimitError',
  ];

  return SAFE_ERROR_TYPES.includes(error.name);
}

/**
 * Custom error classes for different scenarios
 */

export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Authentication required') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  constructor(message: string = 'Access denied') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  constructor(message: string = 'Resource already exists') {
    super(message);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string = 'Too many requests',
    public retryAfter?: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Convert custom errors to HTTP responses
 */
export function getErrorResponse(error: Error | unknown): { status: number; message: string } {
  if (error instanceof ValidationError) {
    return { status: 400, message: error.message };
  }
  if (error instanceof UnauthorizedError) {
    return { status: 401, message: error.message };
  }
  if (error instanceof ForbiddenError) {
    return { status: 403, message: error.message };
  }
  if (error instanceof NotFoundError) {
    return { status: 404, message: error.message };
  }
  if (error instanceof ConflictError) {
    return { status: 409, message: error.message };
  }
  if (error instanceof RateLimitError) {
    return { status: 429, message: error.message };
  }

  // Generic internal error
  return { status: 500, message: 'An internal error occurred' };
}
