import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

let loaded = false;

function parseEnvFile(text: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) values[key] = value;
  }
  return values;
}

/**
 * In local dev, shell-level DATABASE_URL can override `.env.local` and break Prisma.
 * Load `.env.local` with priority before Prisma connects.
 */
export function loadLocalEnv(): void {
  if (loaded || process.env.NODE_ENV === "production") return;
  loaded = true;

  const envPath = resolve(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const values = parseEnvFile(readFileSync(envPath, "utf8"));
  for (const [key, value] of Object.entries(values)) {
    process.env[key] = value;
  }
}
