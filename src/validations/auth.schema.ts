export type CredentialsLoginInput = {
  email: string;
  password: string;
};

export function parseCredentialsLogin(body: unknown): CredentialsLoginInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !email.includes("@") || password.length < 1) return null;

  return { email, password };
}
