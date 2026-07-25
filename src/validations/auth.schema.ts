export type CredentialsLoginInput = {
  email: string;
  password: string;
};

export type MpinLoginInput = {
  email: string;
  mpin: string;
};

export function parseCredentialsLogin(body: unknown): CredentialsLoginInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const password = typeof record.password === "string" ? record.password : "";

  if (!email || !email.includes("@") || password.length < 1) return null;

  return { email, password };
}

export function parseMpinLogin(body: unknown): MpinLoginInput | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  const rawMpin =
    typeof record.mpin === "string"
      ? record.mpin.trim()
      : typeof record.mpin === "number"
        ? String(record.mpin)
        : "";
  const mpin = rawMpin.replace(/\D/g, "");

  if (!email || !email.includes("@") || !/^\d{6}$/.test(mpin)) return null;

  return { email, mpin };
}

export function parseHandoffCode(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const record = body as Record<string, unknown>;
  const code = typeof record.code === "string" ? record.code.trim() : "";
  return code || null;
}
