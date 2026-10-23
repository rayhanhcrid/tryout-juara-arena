import { Link } from "@tanstack/react-router";
import { ChevronLeft, Play, Trophy } from "lucide-react";
import { CatalogCover } from "@/components/catalog-cover";
import { InitialsAvatar } from "@/components/initials-avatar";
import { Leaderboard, type BoardEntry } from "@/components/leaderboard";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration, percent } from "@/lib/format";

export type BoardExam = {
  id: string;
  title: string;
  duration_minutes: number;
  questionCount: number;
};

/** One catalog's leaderboard: only the people who took this catalog. */
export function CatalogBoardView({
  exam,
  entries,
  meId,
}: {
  exam: BoardExam;
  entries: BoardEntry[];
  meId: string | null;
}) {
  const me = meId ? (entries.find((e) => e.user_id === meId) ?? null) : null;
  const canStart = exam.questionCount > 0;

  return (
    <div>
      <Link
        to="/katalog"
        className="inline-flex items-center gap-0.5 rounded-full py-1 text-[15px] text-link hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> Katalog
      </Link>

      <div className="mt-3 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="type-title-1">Peringkat {exam.title}</h1>
          <p className="type-lead mt-2 max-w-[40rem] text-muted-foreground">
            {exam.questionCount} soal · {formatDuration(exam.duration_minutes)} · {entries.length}{" "}
            peserta. Yang dihitung skor terbaik tiap peserta; kalau sama, yang lebih dulu mengirim
            berada di atas.
          </p>
        </div>
        {canStart ? (
          <Link
            to="/ujian/$examId"
            params={{ examId: exam.id }}
            className={buttonVariants({
              size: "lg",
              className: "shrink-0 self-start sm:self-auto",
            })}
          >
            <Play className="fill-current" /> {me ? "Kerjakan lagi" : "Mulai"}
          </Link>
        ) : null}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <div>
          {entries.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] bg-card px-6 py-16 text-center shadow-[var(--shadow-card)]">
              <Trophy className="h-8 w-8 text-tertiary" />
              <p className="type-title-3 mt-4">Belum ada peserta.</p>
              <p className="type-callout mt-2 text-muted-foreground">
                Kerjakan {exam.title} dan jadilah nama pertama di papan ini.
              </p>
            </div>
          ) : (
            <Leaderboard entries={entries} meId={meId} />
          )}
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="overflow-hidden rounded-[28px] bg-card shadow-[var(--shadow-card)]">
            <CatalogCover id={exam.id} title={exam.title} showTitle={false} className="h-20" />
            <div className="p-5">
              <p className="text-[13px] font-semibold text-muted-foreground">Posisimu</p>
              {me ? (
                <div className="mt-3 flex items-center gap-3">
                  <InitialsAvatar name={me.nama} seed={me.user_id} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="tabular font-display text-[28px] font-bold leading-none tracking-[-0.04em]">
                      #{me.rank}
                    </p>
                    <p className="tabular mt-1 text-[13px] text-muted-foreground">
                      {me.score}/{me.total} · {percent(me.score, me.total)}% benar
                    </p>
                  </div>
                </div>
              ) : (
                <p className="type-callout mt-2 text-muted-foreground">
                  Kamu belum mengerjakan {exam.title} dari perangkat ini.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export function CatalogBoardSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-20" />
      <Skeleton className="mt-4 h-12 w-2/3" />
      <Skeleton className="mt-3 h-5 w-1/2" />
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem]">
        <Skeleton className="h-72 rounded-[28px]" />
        <Skeleton className="h-40 rounded-[28px]" />
      </div>
    </div>
  );
}
