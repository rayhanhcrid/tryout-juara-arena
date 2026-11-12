import { describe, expect, it } from "vitest";

import { reviewStatus, sectionScores, statusCounts, type Gradable } from "@/lib/review";

const q = (correct: boolean, given: Gradable["given"], section: string | null): Gradable => ({
  correct,
  given,
  section,
});

describe("review", () => {
  it("tells right, wrong and empty apart", () => {
    expect(reviewStatus(q(true, "b", null))).toBe("correct");
    expect(reviewStatus(q(false, "a", null))).toBe("wrong");
    expect(reviewStatus(q(false, null, null))).toBe("empty");
    expect(statusCounts([q(true, "b", null), q(false, "a", null), q(false, null, null)])).toEqual({
      correct: 1,
      wrong: 1,
      empty: 1,
    });
  });

  it("scores each subtes in the order it first appears", () => {
    const scores = sectionScores([
      q(true, "a", "TWK"),
      q(false, "b", "TWK"),
      q(true, "c", "TIU"),
      q(true, "d", " TWK "),
      q(false, null, null),
    ]);
    expect(scores).toEqual([
      { section: "TWK", correct: 2, total: 3 },
      { section: "TIU", correct: 1, total: 1 },
      { section: "Lainnya", correct: 0, total: 1 },
    ]);
  });

  it("has no breakdown when no question names a subtes", () => {
    expect(sectionScores([q(true, "a", null), q(false, "b", "  ")])).toEqual([]);
  });
});
