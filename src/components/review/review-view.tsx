import { Link } from "@tanstack/react-router";
import { Check, ChevronLeft, ChevronRight, Download, Minus, X } from "lucide-react";
import { useMemo, useState } from "react";
import { AppIcon, Wordmark } from "@/components/brand";
import { QuestionBody } from "@/components/exam/question-body";
import { SegmentedControl } from "@/components/segmented-control";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatDateTime, percent, todayWib } from "@/lib/format";
import { LETTERS } from "@/lib/question-kinds";
import {
  reviewStatus,
  sectionScores,
  statusCounts,
  type ReviewStatus,
  type SectionScore,
} from "@/lib/review";
import { trackLabel } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import type { AttemptReview, ReviewQuestion } from "@/lib/participant-api";

type Filter = "semua" | ReviewStatus;

const STATUS = {
  correct: {
    label: "Benar",
    icon: Check,
    chip: "bg-success/15 text-success-ink",
    bar: "bg-success",
  },
  wrong: {
    label: "Salah",
    icon: X,
    chip: "bg-destructive/12 text-destructive-ink",
    bar: "bg-destructive",
  },
  empty: {
    label: "Kosong",
    icon: Minus,
    chip: "bg-fill text-muted-foreground",
    bar: "bg-tertiary/45",
  },
} as const;

function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Saves the review through the browser's own "Save as PDF": the page carries
 * a print stylesheet, and the document title becomes the suggested file name.
 */
function saveAsPdf(review: AttemptReview) {
  const previous = document.title;
  const day = review.attempt.submittedAt ? todayWib(new Date(review.attempt.submittedAt)) : "";
  document.title = ["lulustes", "pembahasan", slug(review.exam.title), day]
    .filter(Boolean)
    .join("-");
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

/**
 * Report and explanations for one attempt, on the light working world. The
 * same page is the downloadable PDF: on paper the controls and bars drop
 * away and every question prints, whatever the filter shows on screen.
 */
export function ReviewView({
  review,
  rank,
}: {
  review: AttemptReview;
  /** The board position this attempt holds; only a first attempt has one. */
  rank: { rank: number; participants: number } | null;
}) {
  const { attempt, exam, questions } = review;
  const counts = useMemo(() => statusCounts(questions), [questions]);
  const sections = useMemo(() => sectionScores(questions), [questions]);
  const [filter, setFilter] = useState<Filter>("semua");

  const filters = [
    { value: "semua" as const, label: `Semua ${questions.length}` },
    { value: "wrong" as const, label: `Salah ${counts.wrong}` },
    { value: "empty" as const, label: `Kosong ${counts.empty}` },
    { value: "correct" as const, label: `Benar ${counts.correct}` },
  ].filter((f) => f.value === "semua" || counts[f.value] > 0);

  const first = attempt.number === 1;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 hidden items-center justify-between border-b border-hairline pb-4 print:flex">
        <span className="flex items-center gap-2">
          <AppIcon size={22} />
          <Wordmark className="text-[16px]" />
        </span>
        <span className="text-[12px] text-muted-foreground">Laporan dan pembahasan</span>
      </div>

      <Link
        to="/hasil/$examId"
        params={{ examId: exam.id }}
        className="inline-flex items-center gap-0.5 rounded-full py-1 text-[15px] text-link hover:underline print:hidden"
      >
        <ChevronLeft className="h-4 w-4" /> Hasil
      </Link>

      <h1 className="type-title-1 mt-3 print:mt-0">{exam.title}</h1>
      <p className="type-lead mt-2 text-muted-foreground">
        {attempt.nama} · {formatDateTime(attempt.submittedAt)} ·{" "}
        {first ? "percobaan pertama" : `percobaan ke-${attempt.number}`}
        {exam.track !== "umum" ? ` · ${trackLabel(exam.track)}` : ""}
      </p>

      <div className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 print:hidden">
        <Button size="lg" onClick={() => saveAsPdf(review)}>
          <Download /> Unduh PDF
        </Button>
        <Link
          to="/ujian/$examId"
          params={{ examId: exam.id }}
          className="inline-flex items-center text-[17px] text-link hover:underline"
        >
          Kerjakan lagi <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Report
        score={attempt.score}
        total={attempt.total}
        counts={counts}
        sections={sections}
        first={first}
        rank={rank}
      />

      <section aria-labelledby="pembahasan-heading" className="mt-14 print:mt-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="pembahasan-heading" className="type-title-2">
            Pembahasan
          </h2>
          {filters.length > 2 ? (
            <SegmentedControl
              value={filter}
              onChange={setFilter}
              options={filters}
              ariaLabel="Tampilkan soal"
              className="w-full sm:w-[25rem] print:hidden"
            />
          ) : null}
        </div>

        <ol className="mt-6 space-y-4 print:mt-4 print:space-y-0">
          {questions.map((q, i) => {
            const status = reviewStatus(q);
            const shown = filter === "semua" || filter === status;
            return (
              <li key={q.id} className={cn(!shown && "hidden print:block")}>
                <ReviewCard question={q} number={i + 1} status={status} />
              </li>
            );
          })}
        </ol>
      </section>

      <p className="mt-10 hidden text-[11px] text-muted-foreground print:block">
        Dibuat dari lulustes. Nilai percobaan ini {attempt.score}/{attempt.total}.
      </p>
    </div>
  );
}

function Report({
  score,
  total,
  counts,
  sections,
  first,
  rank,
}: {
  score: number;
  total: number;
  counts: Record<ReviewStatus, number>;
  sections: SectionScore[];
  first: boolean;
  rank: { rank: number; participants: number } | null;
}) {
  const pct = percent(score, total);
  const answered = counts.correct + counts.wrong + counts.empty;
  // Point the next session at the weakest subtes, when there is more than one.
  const weakest =
    sections.length > 1
      ? sections.reduce((a, b) =>
          percent(b.correct, b.total) < percent(a.correct, a.total) ? b : a,
        )
      : null;
  const weakestPct = weakest ? percent(weakest.correct, weakest.total) : 100;

  return (
    <section
      aria-labelledby="laporan-heading"
      className="surface mt-10 p-6 sm:p-8 print:mt-6 print:rounded-2xl print:border print:border-border print:shadow-none"
    >
      <h2 id="laporan-heading" className="type-title-3">
        Laporan
      </h2>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <p className="flex items-baseline gap-3">
          <span className="tabular font-display text-[52px] font-bold leading-none tracking-[-0.045em]">
            {score}
            <span className="text-[26px] text-tertiary">/{total}</span>
          </span>
          <span className="tabular text-[17px] font-semibold text-muted-foreground">
            {pct}% benar
          </span>
        </p>
        <dl className="flex gap-6">
          {(["correct", "wrong", "empty"] as const).map((s) => (
            <div key={s}>
              <dt className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <span aria-hidden className={cn("h-2 w-2 rounded-full", STATUS[s].bar)} />
                {STATUS[s].label}
              </dt>
              <dd className="tabular mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">
                {counts[s]}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {answered > 0 ? (
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-fill" aria-hidden>
          {(["correct", "wrong", "empty"] as const).map((s) =>
            counts[s] > 0 ? (
              <span
                key={s}
                className={cn("h-full", STATUS[s].bar)}
                style={{ width: `${(counts[s] / answered) * 100}%` }}
              />
            ) : null,
          )}
        </div>
      ) : null}

      {sections.length > 0 ? (
        <table className="mt-8 w-full text-left">
          <caption className="sr-only">Skor per subtes</caption>
          <thead>
            <tr className="text-[13px] text-muted-foreground">
              <th scope="col" className="pb-2 font-semibold">
                Subtes
              </th>
              <th scope="col" className="pb-2 text-right font-semibold">
                Benar
              </th>
              <th scope="col" className="hidden w-[40%] pb-2 pl-6 font-semibold sm:table-cell">
                <span className="sr-only">Persentase</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => {
              const p = percent(s.correct, s.total);
              return (
                <tr key={s.section} className="border-t border-hairline">
                  <th scope="row" className="py-3 text-[15px] font-semibold">
                    {s.section}
                  </th>
                  <td className="tabular py-3 text-right text-[15px]">
                    {s.correct}/{s.total}
                    <span className="ml-2 text-muted-foreground">{p}%</span>
                  </td>
                  <td className="hidden py-3 pl-6 sm:table-cell">
                    <div className="h-1.5 overflow-hidden rounded-full bg-fill" aria-hidden>
                      <div
                        className={cn(
                          "h-full rounded-full",
                          p >= 80 ? "bg-success" : p >= 50 ? "bg-primary" : "bg-warning",
                        )}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : null}

      <div className="mt-6 space-y-1.5 border-t border-hairline pt-5 text-[15px] leading-[1.5]">
        {first ? (
          <p>
            {rank
              ? `Percobaan pertama ini menempati peringkat #${rank.rank} dari ${rank.participants} peserta.`
              : "Percobaan pertama ini yang dihitung di papan peringkat."}
          </p>
        ) : (
          <p className="text-muted-foreground">
            Latihan ulang. Papan peringkat tetap memakai percobaan pertamamu.
          </p>
        )}
        {weakest && weakestPct < 100 ? (
          <p className="text-muted-foreground">
            Paling perlu diulang: {weakest.section}, {weakestPct}% benar. Baca pembahasannya di
            bawah sebelum paket berikutnya.
          </p>
        ) : null}
      </div>
    </section>
  );
}

function StatusChip({ status }: { status: ReviewStatus }) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold",
        s.chip,
      )}
    >
      <s.icon aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
      {s.label}
    </span>
  );
}

function ReviewCard({
  question,
  number,
  status,
}: {
  question: ReviewQuestion;
  number: number;
  status: ReviewStatus;
}) {
  return (
    <article
      aria-label={`Soal ${number}, ${STATUS[status].label.toLowerCase()}`}
      className="rounded-[28px] bg-card p-5 shadow-[var(--shadow-card)] sm:p-8 print:break-inside-avoid print:rounded-none print:border-t print:border-hairline print:px-0 print:py-6 print:shadow-none"
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="tabular flex h-8 min-w-8 items-center justify-center rounded-full bg-fill px-2 text-[14px] font-semibold">
          {number}
        </span>
        <StatusChip status={status} />
        {question.section ? (
          <span className="text-[13px] font-medium text-muted-foreground">{question.section}</span>
        ) : null}
      </div>

      <QuestionBody text={question.text} imageUrl={question.imageUrl} size="review" as="h3" />

      {status === "empty" ? (
        <p className="mt-5 text-[15px] text-muted-foreground">Kamu tidak menjawab soal ini.</p>
      ) : null}

      {question.kind === "category" ? (
        <CategoryReview question={question} />
      ) : (
        <ChoiceReview question={question} />
      )}

      <div className="mt-6 rounded-2xl bg-background p-4 sm:p-5 print:border print:border-hairline print:bg-transparent">
        <p className="text-[13px] font-semibold text-muted-foreground">Pembahasan</p>
        <p
          className={cn(
            "type-body mt-1.5 whitespace-pre-line",
            !question.explanation && "text-muted-foreground",
          )}
        >
          {question.explanation || "Belum ada pembahasan untuk soal ini."}
        </p>
      </div>
    </article>
  );
}

/** Options with the key and the chosen answer marked; nothing to press any more. */
function ChoiceReview({ question }: { question: ReviewQuestion }) {
  const keys: unknown[] = Array.isArray(question.key) ? question.key : [question.key];
  const given: unknown[] = Array.isArray(question.given)
    ? question.given
    : question.given === null
      ? []
      : [question.given];
  const multiple = question.kind === "multiple";

  return (
    <ul className="mt-6 grid gap-2.5" aria-label="Pilihan jawaban">
      {question.options.map((label, i) => {
        const letter = LETTERS[i]!;
        const isKey = keys.includes(letter);
        const picked = given.includes(letter);
        const tag =
          isKey && picked ? "Jawabanmu, benar" : isKey ? "Kunci" : picked ? "Jawabanmu" : null;
        return (
          <li
            key={letter}
            className={cn(
              "flex items-center gap-4 rounded-2xl px-4 py-3 sm:px-5",
              isKey
                ? "bg-success/[0.08] shadow-[inset_0_0_0_1px_rgb(52_199_89/0.45)]"
                : picked
                  ? "bg-destructive/[0.06] shadow-[inset_0_0_0_1px_rgb(255_59_48/0.4)]"
                  : "shadow-[inset_0_0_0_1px_var(--color-hairline)]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center text-[14px] font-semibold uppercase",
                multiple ? "rounded-[8px]" : "rounded-full",
                isKey
                  ? "bg-success text-white"
                  : picked
                    ? "bg-destructive text-white"
                    : "bg-fill text-muted-foreground",
              )}
            >
              {isKey ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : picked ? (
                <X className="h-4 w-4" strokeWidth={3} />
              ) : (
                letter
              )}
            </span>
            <span className={cn("type-body flex-1", !isKey && !picked && "text-muted-foreground")}>
              <span className="sr-only">{letter.toUpperCase()}. </span>
              {label}
            </span>
            {tag ? (
              <span
                className={cn(
                  "shrink-0 text-[13px] font-semibold",
                  isKey ? "text-success-ink" : "text-destructive-ink",
                )}
              >
                {tag}
              </span>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** Each statement with the category chosen and, where it differs, the key. */
function CategoryReview({ question }: { question: ReviewQuestion }) {
  const cats = question.categories ?? [];
  const keys = Array.isArray(question.key) ? (question.key as number[]) : [];
  const given = Array.isArray(question.given) ? (question.given as (number | null)[]) : [];

  return (
    <ol className="mt-6 overflow-hidden rounded-[22px] shadow-[inset_0_0_0_1px_var(--color-hairline)]">
      {question.options.map((statement, i) => {
        const key = keys[i];
        const pick = given[i] ?? null;
        const right = pick !== null && pick === key;
        return (
          <li
            key={i}
            className={cn(
              "flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:gap-6 sm:px-5",
              i > 0 && "border-t border-hairline",
            )}
          >
            <p className="flex min-w-0 flex-1 gap-2.5 text-[15px] leading-[1.5]">
              <span className="tabular text-muted-foreground">{i + 1}.</span>
              <span>{statement}</span>
            </p>
            <div className="flex shrink-0 flex-wrap gap-2 pl-6 sm:pl-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-semibold",
                  pick === null
                    ? "bg-fill text-muted-foreground"
                    : right
                      ? "bg-success/15 text-success-ink"
                      : "bg-destructive/12 text-destructive-ink",
                )}
              >
                {pick === null ? (
                  "Kosong"
                ) : (
                  <>
                    {right ? (
                      <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                    ) : (
                      <X aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                    )}
                    <span className="sr-only">Jawabanmu: </span>
                    {cats[pick] ?? "?"}
                  </>
                )}
              </span>
              {!right ? (
                <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-1 text-[13px] font-semibold text-success-ink">
                  Kunci: {key !== undefined ? (cats[key] ?? "?") : "?"}
                </span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
