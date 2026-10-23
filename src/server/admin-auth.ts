/**
 * Admin session tokens for the code-gated admin dashboard.
 *
 * The admin area is unlocked with a shared access code (stored server-side
 * as the ADMIN_ACCESS_CODE secret). On success the server issues a short
 * lived HMAC-signed token; every admin server function re-verifies it, so a
 * stolen UI flag grants nothing. Tokens expire after 12 hours.
 */
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function adminSecret(): string {
  return process.env["ADMIN_ACCESS_CODE"] ?? "";
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(adminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(mac))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Returns a token when the code matches, otherwise null. */
export async function createAdminToken(code: string): Promise<string | null> {
  const secret = adminSecret();
  if (!secret || code !== secret) return null;
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const secret = adminSecret();
  if (!secret) return false;
  return safeEqual(sig, await hmac(expStr));
}
