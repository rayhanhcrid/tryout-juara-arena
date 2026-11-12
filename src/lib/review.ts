import type { Answer } from "@/lib/question-kinds";

/**
 * Reading a graded attempt: each question is right, wrong, or left empty,
 * and the report adds them up per subtes (TWK, TIU…) when the package names one.
 */

export type ReviewStatus = "correct" | "wrong" | "empty";

export type Gradable = { correct: boolean; given: Answer | null; section: string | null };

export function reviewStatus(q: Gradable): ReviewStatus {
  if (q.correct) return "correct";
  return q.given === null ? "empty" : "wrong";
}

export type StatusCounts = Record<ReviewStatus, number>;

export function statusCounts(questions: Gradable[]): StatusCounts {
  const counts: StatusCounts = { correct: 0, wrong: 0, empty: 0 };
  for (const q of questions) counts[reviewStatus(q)] += 1;
  return counts;
}

export type SectionScore = { section: string; correct: number; total: number };

/**
 * Score per subtes in the order the subtes first appear. Empty when no
 * question names one; questions without a subtes in a package that does use
 * them are grouped as "Lainnya".
 */
export function sectionScores(questions: Gradable[]): SectionScore[] {
  if (!questions.some((q) => q.section?.trim())) return [];
  const bySection = new Map<string, SectionScore>();
  for (const q of questions) {
    const section = q.section?.trim() || "Lainnya";
    const row = bySection.get(section) ?? { section, correct: 0, total: 0 };
    row.total += 1;
    if (q.correct) row.correct += 1;
    bySection.set(section, row);
  }
  return [...bySection.values()];
}
