/** Thrown when a DB-backed operation fails due to connectivity or configuration. */
export class DatabaseError extends Error {
  constructor(message = "Database unavailable", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "DatabaseError";
  }
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export const DB_UNAVAILABLE_MESSAGE =
  "Content service temporarily unavailable. Please try again shortly.";
