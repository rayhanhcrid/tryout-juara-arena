/**
 * In-progress exam state lives in localStorage so a refresh never loses the
 * clock, the answers, or the name typed before starting. Sessions are keyed
 * by this browser's device id (there are no accounts) and the exam id.
 */
export type SessionKeys = { start: string; answers: string; flags: string; name: string };

export function sessionKeys(ownerId: string, examId: string): SessionKeys {
  return {
    start: `tryout:start:${ownerId}:${examId}`,
    answers: `tryout:answers:${ownerId}:${examId}`,
    flags: `tryout:flags:${ownerId}:${examId}`,
    name: `tryout:name:${ownerId}:${examId}`,
  };
}

const DEVICE_KEY = "tryout:device";
const GUEST_KEY = "tryout:guest";

/** A random id for this browser, created on first use. */
export function deviceId(): string {
  const existing = storageGet(DEVICE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  storageSet(DEVICE_KEY, id);
  return id;
}

/** The participant who last submitted from this browser. */
export type Guest = { nama: string; token: string };

export function readGuest(): Guest | null {
  const g = storageGetJSON<Guest>(GUEST_KEY);
  return g && typeof g.nama === "string" && typeof g.token === "string" ? g : null;
}

export function saveGuest(guest: Guest): void {
  storageSet(GUEST_KEY, JSON.stringify(guest));
}

export function sameName(a: string, b: string): boolean {
  const norm = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();
  return norm(a) === norm(b);
}

/**
 * The token to send with a submission: reused only when the same name is
 * typed again, so classmates sharing a lab computer stay separate people.
 */
export function guestTokenFor(nama: string): string | null {
  const g = readGuest();
  return g && sameName(g.nama, nama) ? g.token : null;
}

export function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function storageSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode or full storage: the attempt still works, it just won't survive a refresh.
  }
}

export function storageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function storageGetJSON<T>(key: string): T | null {
  const raw = storageGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function clearSession(keys: SessionKeys): void {
  storageRemove(keys.start);
  storageRemove(keys.answers);
  storageRemove(keys.flags);
  storageRemove(keys.name);
}

export type SessionState =
  | { status: "none" }
  | { status: "running"; deadline: number }
  /** The clock ran out while the page was closed; saved answers still need sending. */
  | { status: "expired"; deadline: number; hasAnswers: boolean };

export function readSession(keys: SessionKeys, durationMinutes: number): SessionState {
  const rawStart = storageGet(keys.start);
  if (!rawStart) return { status: "none" };
  const deadline = Number(rawStart) + durationMinutes * 60_000;
  if (!Number.isFinite(deadline)) {
    clearSession(keys);
    return { status: "none" };
  }
  if (Date.now() < deadline) return { status: "running", deadline };
  const answers = storageGetJSON<Record<string, string>>(keys.answers);
  return { status: "expired", deadline, hasAnswers: !!answers && Object.keys(answers).length > 0 };
}
