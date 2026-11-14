/**
 * A daily package has this many questions, from Paket Harian SKD #2
 * (14 November 2026) on. The admin sees how far a daily package is from it.
 */
export const DAILY_QUESTION_COUNT = 25;

/** "25 soal, pas", "Kurang 7 soal lagi", or "Lebih 2 soal" for a daily package. */
export function dailyCountNote(count: number, target = DAILY_QUESTION_COUNT): string {
  if (count === target) return `${count} soal, sesuai target paket harian.`;
  if (count < target)
    return `${count} dari ${target} soal paket harian. Kurang ${target - count} soal lagi.`;
  return `${count} soal; paket harian biasanya ${target} soal (lebih ${count - target}).`;
}
