/**
 * The three TKA question forms, as stored in `questions` (kind, options,
 * categories, answer) and graded by the database (see
 * drizzle/migrations/0004_question_kinds.sql, which mirrors these rules):
 *
 *   single    Pilihan ganda: 2–6 options, one key letter ("b").
 *   multiple  Pilihan ganda kompleks: 2–6 options, a sorted array of key
 *             letters (["a","e"]); the answer must match the set exactly.
 *   category  Pilihan ganda kompleks kategori: 1–8 statements each sorted
 *             into one of 2–3 categories (Benar/Salah, Sesuai/Tidak Sesuai,
 *             Fakta/Opini…); the key is one category index per statement.
 *
 * Every question is worth one point, earned only when fully correct.
 */

export const QUESTION_KINDS = ["single", "multiple", "category"] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

export const LETTERS = ["a", "b", "c", "d", "e", "f"] as const;
export type Letter = (typeof LETTERS)[number];

export const OPTION_LIMITS = { min: 2, max: 6 } as const;
export const STATEMENT_LIMITS = { min: 1, max: 8 } as const;
export const CATEGORY_LIMITS = { min: 2, max: 3 } as const;

export const CATEGORY_PRESETS: readonly (readonly string[])[] = [
  ["Benar", "Salah"],
  ["Sesuai", "Tidak Sesuai"],
  ["Fakta", "Opini"],
];

/** What a participant has chosen: a letter, a set of letters, or a category per statement. */
export type Answer = string | string[] | (number | null)[];
export type AnswerKey = string | string[] | number[];

export type QuestionShape = {
  kind: QuestionKind;
  options: string[];
  categories: string[] | null;
};

export function isQuestionKind(value: unknown): value is QuestionKind {
  return typeof value === "string" && (QUESTION_KINDS as readonly string[]).includes(value);
}

function lettersFor(count: number): readonly string[] {
  return LETTERS.slice(0, count);
}

/**
 * Coerce whatever is stored for a question (an older session, a hand-edited
 * localStorage) into a valid answer for it, or null when nothing usable is left.
 */
export function cleanAnswer(q: QuestionShape, raw: unknown): Answer | null {
  const letters = lettersFor(q.options.length);
  if (q.kind === "single") {
    return typeof raw === "string" && letters.includes(raw) ? raw : null;
  }
  if (q.kind === "multiple") {
    if (!Array.isArray(raw)) return null;
    const picked = letters.filter((l) => raw.includes(l));
    return picked.length > 0 ? picked : null;
  }
  const count = q.categories?.length ?? 0;
  if (!Array.isArray(raw) || raw.length !== q.options.length) return null;
  const rows = raw.map((v) => (Number.isInteger(v) && v >= 0 && v < count ? (v as number) : null));
  return rows.some((v) => v !== null) ? rows : null;
}

/** Answered in full: the navigator, the count and the submit warning all use this. */
export function isComplete(q: QuestionShape, answer: Answer | undefined): boolean {
  if (answer === undefined) return false;
  const clean = cleanAnswer(q, answer);
  if (clean === null) return false;
  if (q.kind === "category") return (clean as (number | null)[]).every((v) => v !== null);
  return true;
}

/** Statements of a category question with a choice still missing. */
export function missingRows(q: QuestionShape, answer: Answer | undefined): number {
  if (q.kind !== "category") return 0;
  const clean = cleanAnswer(q, answer) as (number | null)[] | null;
  return clean ? clean.filter((v) => v === null).length : q.options.length;
}

export function kindLabel(kind: QuestionKind): string {
  if (kind === "single") return "Pilihan ganda";
  if (kind === "multiple") return "Pilihan ganda kompleks";
  return "Kategori";
}

/** One line under the question saying how to answer it. */
export function answerInstruction(q: Pick<QuestionShape, "kind" | "categories">): string {
  if (q.kind === "single") return "Pilih satu jawaban.";
  if (q.kind === "multiple")
    return "Pilih semua jawaban yang benar. Jawaban benar lebih dari satu.";
  const cats = q.categories ?? [];
  const named =
    cats.length > 1
      ? `${cats.slice(0, -1).join(", ")} atau ${cats[cats.length - 1]}`
      : (cats[0] ?? "kategorinya");
  return `Tentukan ${named} untuk setiap pernyataan.`;
}

export type QuestionInput = QuestionShape & { text: string; answer: unknown };

export type ValidQuestion = {
  kind: QuestionKind;
  text: string;
  options: string[];
  categories: string[] | null;
  answer: AnswerKey;
};

/** The admin's form and server both check a question with this before it is saved. */
export function validateQuestion(input: QuestionInput): ValidQuestion {
  const text = input.text.trim();
  if (!text) throw new Error("Tulis pertanyaannya dulu.");
  if (!isQuestionKind(input.kind)) throw new Error("Pilih bentuk soal.");
  const options = input.options.map((o) => o.trim());

  if (input.kind === "category") {
    if (options.length < STATEMENT_LIMITS.min || options.length > STATEMENT_LIMITS.max) {
      throw new Error(`Isi ${STATEMENT_LIMITS.min}–${STATEMENT_LIMITS.max} pernyataan.`);
    }
    if (options.some((o) => !o)) throw new Error("Semua pernyataan harus diisi.");
    const categories = (input.categories ?? []).map((c) => c.trim());
    if (categories.length < CATEGORY_LIMITS.min || categories.length > CATEGORY_LIMITS.max) {
      throw new Error("Pilih 2 atau 3 kategori jawaban.");
    }
    if (categories.some((c) => !c)) throw new Error("Nama kategori tidak boleh kosong.");
    if (new Set(categories.map((c) => c.toLowerCase())).size !== categories.length) {
      throw new Error("Nama kategori tidak boleh kembar.");
    }
    const key = input.answer;
    if (
      !Array.isArray(key) ||
      key.length !== options.length ||
      key.some((v) => !Number.isInteger(v) || v < 0 || v >= categories.length)
    ) {
      throw new Error("Tentukan kunci untuk setiap pernyataan.");
    }
    return { kind: "category", text, options, categories, answer: key as number[] };
  }

  if (options.length < OPTION_LIMITS.min || options.length > OPTION_LIMITS.max) {
    throw new Error(`Isi ${OPTION_LIMITS.min}–${OPTION_LIMITS.max} opsi jawaban.`);
  }
  if (options.some((o) => !o)) throw new Error("Semua opsi jawaban harus diisi.");
  const letters = lettersFor(options.length);

  if (input.kind === "single") {
    if (typeof input.answer !== "string" || !letters.includes(input.answer)) {
      throw new Error("Pilih satu kunci jawaban.");
    }
    return { kind: "single", text, options, categories: null, answer: input.answer };
  }

  const raw: unknown[] = Array.isArray(input.answer) ? input.answer : [];
  const key = letters.filter((l) => raw.includes(l));
  if (key.length < 2) {
    throw new Error("Pilihan ganda kompleks butuh minimal dua kunci jawaban.");
  }
  return { kind: "multiple", text, options, categories: null, answer: key };
}
