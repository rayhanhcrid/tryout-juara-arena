import { describe, expect, it } from "vitest";

import { DAILY_QUESTION_COUNT, dailyCountNote } from "@/lib/daily-package";
import { labelIndexes, runsOf } from "@/lib/score-series";
import { USERNAME_RULE, cleanUsername } from "@/lib/username";

describe("score chart", () => {
  it("breaks the line at a package that was not done", () => {
    const pts = [{ pct: 60 }, { pct: 72 }, { pct: null }, { pct: 80 }, { pct: 84 }, { pct: 88 }];
    expect(runsOf(pts)).toEqual([
      [0, 1],
      [3, 4, 5],
    ]);
  });

  it("keeps a lone done day as its own run", () => {
    expect(runsOf([{ pct: null }, { pct: 40 }, { pct: null }])).toEqual([[1]]);
    expect(runsOf([])).toEqual([]);
  });

  it("thins date labels to what fits, always keeping the latest day", () => {
    const all = labelIndexes(5, 600);
    expect([...all].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);

    const thin = labelIndexes(60, 280);
    expect(thin.has(59)).toBe(true);
    expect(thin.size).toBeLessThanOrEqual(5);
  });
});

describe("accounts", () => {
  it("cleans a username the way the database does", () => {
    expect(cleanUsername("  @Budi.S ")).toBe("budi.s");
    expect(USERNAME_RULE.test("budi.s")).toBe(true);
    expect(USERNAME_RULE.test("bu")).toBe(false);
    expect(USERNAME_RULE.test("budi santoso")).toBe(false);
  });
});

describe("daily package size", () => {
  it("is 25 questions", () => {
    expect(DAILY_QUESTION_COUNT).toBe(25);
  });

  it("tells the admin how far a daily package is from it", () => {
    expect(dailyCountNote(18)).toBe("18 dari 25 soal paket harian. Kurang 7 soal lagi.");
    expect(dailyCountNote(25)).toBe("25 soal, sesuai target paket harian.");
    expect(dailyCountNote(27)).toContain("lebih 2");
  });
});
