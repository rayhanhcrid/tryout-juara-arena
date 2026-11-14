/** What a username may be; drizzle/migrations/0007_akun_profil.sql checks the same. */
export const USERNAME_RULE = /^[a-z0-9_.]{3,20}$/;

/** "@Budi.S " -> "budi.s", the same cleanup the database does. */
export function cleanUsername(value: string): string {
  return value.trim().replace(/^@/, "").toLowerCase();
}
