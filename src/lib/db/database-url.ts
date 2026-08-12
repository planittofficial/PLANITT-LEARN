/**
 * Normalize DATABASE_URL for serverless hosts (Vercel).
 *
 * Supabase session pooler (port 5432) allows few concurrent clients and exhausts
 * quickly under serverless load. Transaction pooler (6543) + connection_limit=1
 * is the recommended Prisma setup on Vercel.
 */
export function normalizeDatabaseUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  const match = trimmed.match(/^(postgresql(?:\+[a-z]+)?:\/\/)(.+)$/i);
  if (!match) return trimmed;

  const [, protocol, rest] = match;
  const queryIndex = rest.indexOf("?");
  const authorityAndPath = queryIndex >= 0 ? rest.slice(0, queryIndex) : rest;
  const params = new URLSearchParams(queryIndex >= 0 ? rest.slice(queryIndex + 1) : "");

  const isServerless = Boolean(process.env.VERCEL);
  const isSupabasePooler = authorityAndPath.includes("pooler.supabase.com");

  if (!isServerless || !isSupabasePooler) {
    return trimmed;
  }

  let hostPath = authorityAndPath;
  if (hostPath.includes(":5432/")) {
    hostPath = hostPath.replace(":5432/", ":6543/");
  }

  if (!params.has("pgbouncer")) params.set("pgbouncer", "true");
  if (!params.has("connection_limit")) params.set("connection_limit", "1");
  if (!params.has("sslmode")) params.set("sslmode", "require");

  const query = params.toString();
  return `${protocol}${hostPath}${query ? `?${query}` : ""}`;
}
