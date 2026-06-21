import { fail } from "@/lib/api/response";
import { getDatabaseUrl } from "@/lib/env";

export function requireDatabase() {
  if (!getDatabaseUrl()) {
    return fail("DATABASE_URL is required for this feature", 503);
  }
  return null;
}
