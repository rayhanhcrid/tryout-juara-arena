/** Countdown clock: mm:ss, or h:mm:ss once an exam runs an hour or longer. */
export function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const WIB = "Asia/Jakarta";

/** Today's date in WIB as "YYYY-MM-DD", the same day the database calls today. */
export function todayWib(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: WIB }).format(now);
}

const DAY_STYLES = {
  long: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  short: { day: "numeric", month: "short" },
  weekday: { weekday: "short" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

/**
 * A calendar day stored as "YYYY-MM-DD" (a package date or a news date):
 * "Kamis, 12 November 2026", "12 Nov", or "Kam". Read at noon WIB so no time
 * zone can push it onto the neighbouring day.
 */
export function formatDay(day: string, style: keyof typeof DAY_STYLES = "long"): string {
  const date = new Date(`${day}T12:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return day;
  return date.toLocaleDateString("id-ID", { ...DAY_STYLES[style], timeZone: WIB });
}

export function percent(score: number, total: number): number {
  return total > 0 ? Math.round((score / total) * 100) : 0;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} menit`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase();
}

export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}

/** Stable small hash so a catalog or person always gets the same colour. */
export function hashIndex(seed: string, modulo: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % modulo;
}
