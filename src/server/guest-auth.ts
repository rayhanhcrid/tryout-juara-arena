/**
 * Guest identity tokens. Participants never create an account: the first
 * submitted attempt creates a guest profile on the server, and the browser
 * keeps `<guestId>.<hmac>` so later attempts count for the same person.
 * The HMAC uses a server-only key, so a guest id alone cannot be replayed.
 */
import { hmacHex, safeEqual, signingSecret } from "@/server/hmac";

export async function signGuestToken(guestId: string): Promise<string> {
  return `${guestId}.${await hmacHex(signingSecret(), `guest:${guestId}`)}`;
}

/** The guest id the token was issued for, or null when it is missing or forged. */
export async function verifyGuestToken(token: string | null | undefined): Promise<string | null> {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const guestId = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const secret = signingSecret();
  if (!secret) return null;
  return safeEqual(sig, await hmacHex(secret, `guest:${guestId}`)) ? guestId : null;
}
