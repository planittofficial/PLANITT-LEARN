import { Prisma } from "@prisma/client";

import { fail } from "@/lib/api/response";
import { DB_UNAVAILABLE_MESSAGE, isDatabaseError } from "@/lib/db/database-error";
import { logServerError } from "@/lib/security/server-log";

export function dbUnavailableResponse() {
  return fail(DB_UNAVAILABLE_MESSAGE, 503);
}

function isPrismaError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientRustPanicError
  );
}

export function handleDatabaseError(error: unknown) {
  if (isDatabaseError(error) || isPrismaError(error)) return dbUnavailableResponse();
  logServerError("database", error);
  return fail("Internal server error", 500);
}
