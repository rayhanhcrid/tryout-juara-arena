/**
 * Admin session tokens for the code-gated admin dashboard.
 *
 * The admin area is unlocked with an access code. The built-in code is the
 * owner's chosen password, stored here only as a SHA-256 hash; an
 * ADMIN_ACCESS_CODE secret, when set, is accepted as well. On success the
 * server issues a short-lived HMAC-signed token (signed with a server-only
 * key, so knowing the code does not let anyone forge tokens). Every admin
 * server function re-verifies it. Tokens expire after 12 hours.
 */
import { hmacHex, safeEqual, sha256Hex, signingSecret } from "@/server/hmac";

const TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

/** sha256 of the owner-chosen admin password. */
const DEFAULT_CODE_SHA256 = "1cae6fd4b9ab2654c54db44446a8ff0f0a972f6ee27cd4b31af0fbf1ec661eac";

async function codeMatches(code: string): Promise<boolean> {
  const envCode = process.env["ADMIN_ACCESS_CODE"];
  if (envCode && safeEqual(code, envCode)) return true;
  return safeEqual(await sha256Hex(code), DEFAULT_CODE_SHA256);
}

/** Returns a token when the code matches, otherwise null. */
export async function createAdminToken(code: string): Promise<string | null> {
  const secret = signingSecret();
  if (!secret || !(await codeMatches(code))) return null;
  const exp = String(Date.now() + TOKEN_TTL_MS);
  return `${exp}.${await hmacHex(secret, `admin:${exp}`)}`;
}

export async function verifyAdminToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot <= 0) return false;
  const expStr = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp <= Date.now()) return false;
  const secret = signingSecret();
  if (!secret) return false;
  return safeEqual(sig, await hmacHex(secret, `admin:${expStr}`));
}
