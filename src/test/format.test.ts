import { describe, expect, it } from "vitest";

import { formatClock, formatDuration, hashIndex, initials, percent } from "@/lib/format";

describe("formatClock", () => {
  it("shows mm:ss under an hour, rounding partial seconds up", () => {
    expect(formatClock(30 * 60_000)).toBe("30:00");
    expect(formatClock(61_500)).toBe("01:02");
  });

  it("switches to h:mm:ss for exams of an hour or more", () => {
    expect(formatClock(90 * 60_000)).toBe("1:30:00");
  });

  it("never goes below zero", () => {
    expect(formatClock(-5_000)).toBe("00:00");
  });
});

describe("formatDuration", () => {
  it("reads naturally in Indonesian", () => {
    expect(formatDuration(45)).toBe("45 menit");
    expect(formatDuration(60)).toBe("1 jam");
    expect(formatDuration(90)).toBe("1 jam 30 menit");
  });
});

describe("helpers", () => {
  it("rounds percentages and survives an empty exam", () => {
    expect(percent(13, 20)).toBe(65);
    expect(percent(0, 0)).toBe(0);
  });

  it("takes first and last initials", () => {
    expect(initials("Budi Santoso")).toBe("BS");
    expect(initials("nadia")).toBe("N");
    expect(initials("  ")).toBe("?");
  });

  it("hashes to a stable index within range", () => {
    const a = hashIndex("11111111-1111-1111-1111-111111111111", 8);
    expect(a).toBe(hashIndex("11111111-1111-1111-1111-111111111111", 8));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(8);
  });
});
