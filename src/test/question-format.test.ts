import { describe, expect, it } from "vitest";

import { isBundledImage, isLongStem, splitQuestionText } from "@/lib/question-format";

describe("question text", () => {
  it("treats text without a divider as the question alone", () => {
    expect(splitQuestionText("  Hasil dari 12 + 8 × 2 adalah …\n")).toEqual({
      stimulus: null,
      stem: "Hasil dari 12 + 8 × 2 adalah …",
    });
  });

  it("splits a reading passage from the question at a --- line", () => {
    const text =
      "Perhatikan peta berikut.\n\nPeta menunjukkan curah hujan.\n---\nWilayah terkering adalah …";
    expect(splitQuestionText(text)).toEqual({
      stimulus: "Perhatikan peta berikut.\n\nPeta menunjukkan curah hujan.",
      stem: "Wilayah terkering adalah …",
    });
  });

  it("splits only at the first divider and tolerates spaces and CRLF", () => {
    const { stimulus, stem } = splitQuestionText("Bacaan\r\n  ---  \r\n(1) a\r\n---\r\nb");
    expect(stimulus).toBe("Bacaan");
    expect(stem).toBe("(1) a\r\n---\r\nb");
  });

  it("does not split at dashes inside a sentence", () => {
    expect(splitQuestionText("Jawa Tengah---DIY")).toEqual({
      stimulus: null,
      stem: "Jawa Tengah---DIY",
    });
  });

  it("keeps the text when the divider has nothing after it", () => {
    expect(splitQuestionText("Pertanyaan …\n---\n")).toEqual({
      stimulus: null,
      stem: "Pertanyaan …",
    });
  });

  it("sets multi-line or paragraph-long questions in body size", () => {
    expect(isLongStem("Ibu kota Indonesia adalah …")).toBe(false);
    expect(isLongStem("(1) satu\n(2) dua")).toBe(true);
    expect(isLongStem("x".repeat(141))).toBe(true);
  });
});

describe("question images", () => {
  it("serves bundled images as is and signs stored ones", () => {
    expect(isBundledImage("/soal/tka-geografi-2025/01-wallace-weber.jpg")).toBe(true);
    expect(isBundledImage("8f0c2b9e/1730000000000-peta.png")).toBe(false);
  });
});
