/**
 * Conventions in how a question is stored, beyond its plain columns.
 *
 * Text: a long reading passage (maps, data, a news excerpt) can come before
 * the question itself, separated by a line holding only "---". The question's
 * image, if any, is shown between the two.
 *
 * Images: normally a path in the private "exam-images" bucket. A path starting
 * with "/" is a file bundled with the site under public/ (catalogs seeded from
 * the repository) and is served as is.
 */

const DIVIDER = /^[ \t]*-{3,}[ \t]*$/m;

export function splitQuestionText(text: string): { stimulus: string | null; stem: string } {
  const match = DIVIDER.exec(text);
  if (!match) return { stimulus: null, stem: text.trim() };
  const stimulus = text.slice(0, match.index).trim();
  const stem = text.slice(match.index + match[0].length).trim();
  // A divider with nothing after it is a typo, not an empty question.
  if (!stem) return { stimulus: null, stem: stimulus };
  return { stimulus: stimulus || null, stem };
}

/** A question too long to set as a headline: several lines, or a paragraph. */
export function isLongStem(stem: string): boolean {
  return stem.includes("\n") || stem.length > 140;
}

export function isBundledImage(path: string): boolean {
  return path.startsWith("/");
}
