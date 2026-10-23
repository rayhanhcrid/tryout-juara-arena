/**
 * Pure grading logic for multiple-choice attempts.
 * Shared by the server-side submit function and unit tests — the client
 * never decides the score.
 */
export type OptionLetter = "a" | "b" | "c" | "d";

export function gradeAnswers(
  answers: Record<string, string>,
  correct: Record<string, string>,
): { score: number; total: number } {
  const ids = Object.keys(correct);
  let score = 0;
  for (const id of ids) {
    const chosen = answers[id];
    if (chosen && chosen === correct[id]) score += 1;
  }
  return { score, total: ids.length };
}
