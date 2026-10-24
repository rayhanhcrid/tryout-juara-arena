import { describe, expect, it } from "vitest";

import {
  answerInstruction,
  cleanAnswer,
  isComplete,
  missingRows,
  validateQuestion,
  type QuestionShape,
} from "@/lib/question-kinds";

const single: QuestionShape = {
  kind: "single",
  options: ["1", "2", "3", "4", "5"],
  categories: null,
};
const multiple: QuestionShape = {
  kind: "multiple",
  options: ["1", "2", "3", "4"],
  categories: null,
};
const category: QuestionShape = {
  kind: "category",
  options: ["s1", "s2", "s3"],
  categories: ["Benar", "Salah"],
};

describe("answers", () => {
  it("keeps a letter that belongs to the question, including E on a five-option question", () => {
    expect(cleanAnswer(single, "e")).toBe("e");
    expect(cleanAnswer(single, "f")).toBeNull();
    expect(cleanAnswer(single, ["a"])).toBeNull();
  });

  it("orders kompleks letters and drops strays", () => {
    expect(cleanAnswer(multiple, ["d", "a", "a", "z", 3])).toEqual(["a", "d"]);
    expect(cleanAnswer(multiple, [])).toBeNull();
    expect(cleanAnswer(multiple, "a")).toBeNull();
  });

  it("keeps a kategori row by row and forgets one of the wrong length", () => {
    expect(cleanAnswer(category, [0, null, 1])).toEqual([0, null, 1]);
    expect(cleanAnswer(category, [0, 5, 1])).toEqual([0, null, 1]);
    expect(cleanAnswer(category, [0, 1])).toBeNull();
    expect(cleanAnswer(category, [null, null, null])).toBeNull();
  });

  it("counts a kategori as answered only when every row is", () => {
    expect(isComplete(category, [0, null, 1])).toBe(false);
    expect(missingRows(category, [0, null, 1])).toBe(1);
    expect(isComplete(category, [0, 1, 1])).toBe(true);
    expect(missingRows(category, undefined)).toBe(3);
    expect(isComplete(multiple, ["b"])).toBe(true);
    expect(isComplete(single, undefined)).toBe(false);
  });

  it("tells the participant how to answer", () => {
    expect(answerInstruction(multiple)).toMatch(/lebih dari satu/);
    expect(answerInstruction(category)).toBe("Tentukan Benar atau Salah untuk setiap pernyataan.");
    expect(answerInstruction({ kind: "category", categories: ["Fakta", "Opini", "Ragu"] })).toBe(
      "Tentukan Fakta, Opini atau Ragu untuk setiap pernyataan.",
    );
  });
});

describe("validateQuestion", () => {
  const base = { text: " Soal ", options: [" A ", "B", "C"], categories: null };

  it("accepts and trims a pilihan ganda", () => {
    expect(validateQuestion({ ...base, kind: "single", answer: "c" })).toEqual({
      kind: "single",
      text: "Soal",
      options: ["A", "B", "C"],
      categories: null,
      answer: "c",
    });
  });

  it("rejects a key outside the options", () => {
    expect(() => validateQuestion({ ...base, kind: "single", answer: "d" })).toThrow(/kunci/);
  });

  it("needs at least two keys for a kompleks, and sorts them", () => {
    expect(() => validateQuestion({ ...base, kind: "multiple", answer: ["a"] })).toThrow(/dua/);
    expect(validateQuestion({ ...base, kind: "multiple", answer: ["c", "a"] }).answer).toEqual([
      "a",
      "c",
    ]);
  });

  it("needs a key for every kategori statement", () => {
    const cat = { ...base, kind: "category" as const, categories: ["Benar", "Salah"] };
    expect(() => validateQuestion({ ...cat, answer: [0, null, 1] })).toThrow(/setiap pernyataan/);
    expect(validateQuestion({ ...cat, answer: [0, 1, 1] }).answer).toEqual([0, 1, 1]);
    expect(() =>
      validateQuestion({ ...cat, categories: ["Benar", "benar"], answer: [0, 1, 1] }),
    ).toThrow(/kembar/);
  });

  it("refuses empty text or options", () => {
    expect(() => validateQuestion({ ...base, text: " ", kind: "single", answer: "a" })).toThrow();
    expect(() =>
      validateQuestion({ ...base, options: ["A", " "], kind: "single", answer: "a" }),
    ).toThrow(/opsi/);
  });
});
