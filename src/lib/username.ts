/**
 * Username -> synthetic email mapping.
 * Accounts here log in with username + password; the backend requires an
 * email, so every account gets a deterministic synthetic address derived
 * from its normalized username. Password reset by email is therefore
 * unavailable by design (see AGENTS.md).
 */
export function normalizeUsername(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, "");
}

export function sanitizeUsernamePart(username: string): string {
  const safe = username.replace(/[^a-z0-9._-]/g, "");
  return safe.length > 0 ? safe : "user";
}

export function syntheticEmail(normalizedUsername: string): string {
  return `${sanitizeUsernamePart(normalizedUsername)}@users.tryout.local`;
}
