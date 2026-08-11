import { fail } from "@/lib/api/response";
import { DB_UNAVAILABLE_MESSAGE, isDatabaseError } from "@/lib/db/database-error";

export function dbUnavailableResponse() {
  return fail(DB_UNAVAILABLE_MESSAGE, 503);
}

export function handleDatabaseError(error: unknown) {
  if (isDatabaseError(error)) return dbUnavailableResponse();
  throw error;
}
