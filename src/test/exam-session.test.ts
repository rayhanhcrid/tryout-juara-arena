import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearSession,
  guestTokenFor,
  readSession,
  saveGuest,
  sessionKeys,
  storageSet,
} from "@/lib/exam-session";

const keys = sessionKeys("user-1", "exam-1");

afterEach(() => {
  localStorage.clear();
  vi.useRealTimers();
});

describe("exam session", () => {
  it("keeps the original storage key format so old attempts still resume", () => {
    expect(keys.start).toBe("tryout:start:user-1:exam-1");
    expect(keys.answers).toBe("tryout:answers:user-1:exam-1");
  });

  it("reports no session when nothing was started", () => {
    expect(readSession(keys, 30)).toEqual({ status: "none" });
  });

  it("reports a running session with its deadline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T10:00:00Z"));
    const started = Date.now() - 10 * 60_000;
    storageSet(keys.start, String(started));
    expect(readSession(keys, 30)).toEqual({ status: "running", deadline: started + 30 * 60_000 });
  });

  it("flags an expired session that still has answers to send", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-23T10:00:00Z"));
    const started = Date.now() - 31 * 60_000;
    storageSet(keys.start, String(started));
    storageSet(keys.answers, JSON.stringify({ q1: "a" }));
    expect(readSession(keys, 30)).toEqual({
      status: "expired",
      deadline: started + 30 * 60_000,
      hasAnswers: true,
    });
  });

  it("flags an expired session with no answers as having nothing to send", () => {
    storageSet(keys.start, String(Date.now() - 2 * 60 * 60_000));
    storageSet(keys.answers, "{}");
    expect(readSession(keys, 30)).toMatchObject({ status: "expired", hasAnswers: false });
  });

  it("drops a corrupt start time", () => {
    storageSet(keys.start, "not-a-number");
    expect(readSession(keys, 30)).toEqual({ status: "none" });
    expect(localStorage.getItem(keys.start)).toBeNull();
  });

  it("clears every key of a session", () => {
    storageSet(keys.start, "1");
    storageSet(keys.answers, "{}");
    storageSet(keys.flags, "{}");
    storageSet(keys.name, "Nadia");
    clearSession(keys);
    expect(localStorage.length).toBe(0);
  });
});

describe("guest identity", () => {
  it("reuses the saved token only for the same name", () => {
    saveGuest({ nama: "Nadia Putri", token: "guest-1.sig" });
    expect(guestTokenFor("  nadia   putri ")).toBe("guest-1.sig");
    // A classmate on the same lab computer becomes a separate participant.
    expect(guestTokenFor("Raka")).toBeNull();
  });

  it("has no token before anyone has submitted", () => {
    expect(guestTokenFor("Nadia")).toBeNull();
  });
});
