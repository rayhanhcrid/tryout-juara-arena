import { Link } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  Check,
  ChevronRight,
  Clock,
  CloudOff,
  FileText,
  Play,
  Trophy,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CatalogCover } from "@/components/catalog-cover";
import { WeekStrip } from "@/components/daily/week-strip";
import { TimerPill } from "@/components/exam/timer-pill";
import { Leaderboard, type BoardEntry } from "@/components/leaderboard";
import { NewsList } from "@/components/news/news-list";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { firstName, formatDay, formatDuration, percent } from "@/lib/format";
import { trackLabel } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import type { Daily, DailyPackage, NewsItem } from "@/lib/participant-api";

/** An attempt at today's package still on the clock in this browser. */
export type RunningSession = { deadline: number; durationMinutes: number };

/**
 * The routine's home: today's package, the streak it keeps, today's board,
 * and the latest selection news. Light world: this is where people work.
 */
export function TodayView({
  today,
  daily,
  failed,
  name,
  session,
  board,
  meId,
  news,
}: {
  /** "YYYY-MM-DD" in WIB. */
  today: string;
  daily: Daily | null;
  failed: boolean;
  name: string | null;
  session: RunningSession | null;
  /** Today's board, or null while it loads. */
  board: BoardEntry[] | null;
  meId: string | null;
  news: NewsItem[] | null;
}) {
  const hello = name ? `Halo, ${firstName(name)}. ` : "";
  const pkg = daily?.package ?? null;

  return (
    <div>
      <h1 className="type-title-1">Hari ini</h1>
      <p className="type-lead mt-2 text-muted-foreground">
        {hello}
        {formatDay(today, "long")}.
      </p>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        {failed ? (
          <LoadFailed />
        ) : !daily ? (
          <Skeleton className="h-[26rem] rounded-[28px]" />
        ) : pkg ? (
          <PackageCard pkg={pkg} mine={daily.mine} session={session} />
        ) : (
          <NoPackage />
        )}
        <StreakCard daily={daily} today={today} />
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-2 lg:gap-10">
        {pkg ? (
          <section aria-labelledby="papan-hari-ini">
            <SectionHead
              id="papan-hari-ini"
              title="Peringkat hari ini"
              link={
                board && board.length > 0 ? (
                  <Link
                    to="/peringkat/$examId"
                    params={{ examId: pkg.id }}
                    className="inline-flex items-center text-[15px] text-link hover:underline"
                  >
                    Lihat papan <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : null
              }
            />
            <div className="mt-5">
              {board === null ? (
                <Skeleton className="h-64 rounded-[28px]" />
              ) : board.length === 0 ? (
                <div className="flex flex-col items-center rounded-[28px] bg-card px-6 py-12 text-center shadow-[var(--shadow-card)]">
                  <Trophy className="h-8 w-8 text-tertiary" />
                  <p className="type-callout mt-3 max-w-xs text-muted-foreground">
                    Belum ada yang mengirim paket hari ini. Nama pertama di papan bisa jadi namamu.
                  </p>
                </div>
              ) : (
                <Leaderboard entries={board} meId={meId} limit={5} />
              )}
            </div>
          </section>
        ) : null}

        <section aria-labelledby="berita-terbaru" className={cn(!pkg && "lg:col-span-2")}>
          <SectionHead
            id="berita-terbaru"
            title="Berita terbaru"
            link={
              <Link
                to="/berita"
                className="inline-flex items-center text-[15px] text-link hover:underline"
              >
                Semua berita <ChevronRight className="h-4 w-4" />
              </Link>
            }
          />
          <div className="mt-5">
            {news === null ? (
              <Skeleton className="h-64 rounded-[22px]" />
            ) : news.length === 0 ? (
              <p className="type-callout rounded-[22px] bg-card px-5 py-8 text-center text-muted-foreground shadow-[var(--shadow-card)]">
                Belum ada berita seleksi yang dimuat.
              </p>
            ) : (
              <NewsList items={news} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionHead({ id, title, link }: { id: string; title: string; link: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="type-title-2">
        {title}
      </h2>
      {link}
    </div>
  );
}

function CoverChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="tabular inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
      {children}
    </span>
  );
}

function PackageCard({
  pkg,
  mine,
  session,
}: {
  pkg: DailyPackage;
  mine: Daily["mine"];
  session: RunningSession | null;
}) {
  const ready = pkg.questionCount > 0;
  return (
    <article className="surface overflow-hidden">
      <CatalogCover
        id={pkg.id}
        title={pkg.title}
        eager
        className="h-52 sm:h-64 [&>p]:bottom-5 [&>p]:text-[26px] sm:[&>p]:inset-x-7 sm:[&>p]:text-[34px]"
      >
        <div className="absolute left-4 top-4 flex flex-wrap gap-1.5 sm:left-6 sm:top-5">
          {pkg.track !== "umum" ? <CoverChip>{trackLabel(pkg.track)}</CoverChip> : null}
          <CoverChip>
            <FileText className="h-3 w-3" /> {pkg.questionCount} soal
          </CoverChip>
          <CoverChip>
            <Clock className="h-3 w-3" /> {formatDuration(pkg.duration_minutes)}
          </CoverChip>
        </div>
      </CatalogCover>

      <div className="p-5 sm:p-7">
        {pkg.description ? (
          <p className="type-body max-w-[60ch] text-muted-foreground">{pkg.description}</p>
        ) : null}

        <div className="mt-6">
          {!ready ? (
            <p className="type-callout text-muted-foreground">
              Soal paket ini sedang disiapkan admin. Coba buka lagi sebentar lagi.
            </p>
          ) : session ? (
            <Running pkg={pkg} session={session} />
          ) : mine ? (
            <Done pkg={pkg} mine={mine} />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="type-callout text-muted-foreground">
                {pkg.attemptCount > 0
                  ? `${pkg.attemptCount} kali dikerjakan hari ini. Percobaan pertamamu yang masuk peringkat.`
                  : "Belum ada yang mengerjakan hari ini. Percobaan pertamamu yang masuk peringkat."}
              </p>
              <Link
                to="/ujian/$examId"
                params={{ examId: pkg.id }}
                className={buttonVariants({ size: "lg", className: "shrink-0" })}
              >
                <Play className="fill-current" /> Kerjakan sekarang
              </Link>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Running({ pkg, session }: { pkg: DailyPackage; session: RunningSession }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const remaining = Math.max(0, session.deadline - now);
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <TimerPill
        ms={remaining}
        fraction={remaining / (session.durationMinutes * 60_000)}
        className="self-start sm:self-center"
      />
      <p className="type-callout flex-1 text-muted-foreground">
        {remaining > 0
          ? "Kamu sedang mengerjakan paket ini dan timernya terus berjalan."
          : "Waktunya habis saat kamu pergi. Jawabanmu belum terkirim."}
      </p>
      <Link
        to="/ujian/$examId"
        params={{ examId: pkg.id }}
        className={buttonVariants({ size: "lg", className: "shrink-0" })}
      >
        {remaining > 0 ? "Lanjutkan" : "Kirim sekarang"}
      </Link>
    </div>
  );
}

function Done({ pkg, mine }: { pkg: DailyPackage; mine: NonNullable<Daily["mine"]> }) {
  const pct = percent(mine.score, mine.total);
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success/15 text-success-ink">
          <Check className="h-5 w-5" strokeWidth={3} />
        </span>
        <div>
          <p className="type-headline">Paket hari ini selesai.</p>
          <p className="tabular text-[15px] text-muted-foreground">
            Skormu {mine.score}/{mine.total} · {pct}% benar
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Link
          to="/ujian/$examId"
          params={{ examId: pkg.id }}
          className="inline-flex items-center text-[15px] text-link hover:underline"
        >
          Kerjakan lagi <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          to="/pembahasan/$attemptId"
          params={{ attemptId: mine.attemptId }}
          className={buttonVariants({ size: "lg" })}
        >
          <BookOpenCheck /> Lihat pembahasan
        </Link>
      </div>
    </div>
  );
}

function NoPackage() {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
        <CalendarClock className="h-7 w-7" />
      </span>
      <h2 className="type-title-3 mt-5">Paket hari ini belum terbit.</h2>
      <p className="type-callout mt-2 max-w-sm text-muted-foreground">
        Sambil menunggu, kerjakan salah satu paket latihan. Hari tanpa paket tidak memutus hari
        beruntunmu.
      </p>
      <Link to="/katalog" className={buttonVariants({ variant: "secondary", className: "mt-7" })}>
        Buka Latihan
      </Link>
    </div>
  );
}

function LoadFailed() {
  return (
    <div className="surface flex flex-col items-center px-6 py-16 text-center sm:py-20">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
        <CloudOff className="h-7 w-7" />
      </span>
      <h2 className="type-title-3 mt-5">Paket hari ini tidak bisa dimuat.</h2>
      <p className="type-callout mt-2 max-w-sm text-muted-foreground">
        Server sedang tidak bisa membaca database. Coba muat ulang halaman sebentar lagi.
      </p>
    </div>
  );
}

/** The streak in words, then the week that built it. */
function StreakCard({ daily, today }: { daily: Daily | null; today: string }) {
  if (!daily) {
    return <Skeleton className="h-64 rounded-[28px]" />;
  }
  const { current, best } = daily.streak;
  const doneToday = !!daily.mine;
  const line =
    current === 0
      ? daily.package
        ? "Kirim paket hari ini untuk memulai."
        : "Mulai lagi begitu paket berikutnya terbit."
      : doneToday
        ? "Paket hari ini sudah masuk hitungan."
        : daily.package
          ? "Kirim paket hari ini supaya tidak terputus."
          : "Tetap aman: hari ini tidak ada paket.";

  return (
    <aside className="surface p-6 lg:sticky lg:top-24" aria-label="Hari beruntun">
      <p className="flex items-baseline gap-2">
        <span className="tabular font-display text-[56px] font-bold leading-none tracking-[-0.045em]">
          {current}
        </span>
        <span className="text-[17px] font-semibold tracking-[-0.016em]">hari beruntun</span>
      </p>
      <p className="type-callout mt-2 text-muted-foreground">
        {line}
        {best > current ? ` Rekormu ${best} hari.` : ""}
      </p>
      <WeekStrip days={daily.days} today={today} className="mt-6" />
      <p className="mt-5 border-t border-hairline pt-4 text-[13px] leading-[1.45] text-muted-foreground">
        Hitungan bertambah saat paket dikirim di harinya sendiri (WIB). Hari tanpa paket tidak
        memutusnya.
      </p>
    </aside>
  );
}
