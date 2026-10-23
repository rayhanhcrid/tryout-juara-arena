import { Link } from "@tanstack/react-router";
import {
  CloudOff,
  Clock,
  FileText,
  LayoutGrid,
  Play,
  Search,
  TimerOff,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CatalogCover } from "@/components/catalog-cover";
import { TimerPill } from "@/components/exam/timer-pill";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { firstName, formatDuration, percent } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogEntry } from "@/lib/participant-api";

export type CatalogItem = CatalogEntry;

export type SessionBanner = {
  examId: string;
  title: string;
  durationMinutes: number;
  status: "running" | "expired";
  deadline: number;
};

export function CatalogView({
  name,
  items,
  sessions,
  loading,
  failed = false,
}: {
  name: string | null;
  items: CatalogItem[];
  sessions: SessionBanner[];
  loading: boolean;
  /** The server could not read the catalog (e.g. no database key on this machine). */
  failed?: boolean;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) => `${it.title} ${it.description}`.toLowerCase().includes(q));
  }, [items, query]);

  const tried = items.filter((it) => it.myBest).length;
  const hello = name ? firstName(name) : "";
  const summary =
    items.length === 0
      ? "Mata pelajaran akan muncul di sini."
      : tried === 0
        ? "Pilih mata pelajaran, tulis namamu, lalu mulai. Tanpa daftar akun."
        : `Kamu sudah mencoba ${tried} dari ${items.length} mata pelajaran.`;

  return (
    <div>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="type-title-1">Katalog</h1>
          <p className="type-lead mt-2 max-w-[38rem] text-muted-foreground">
            {hello ? `Halo, ${hello}. ` : ""}
            {summary}
          </p>
        </div>
        {items.length > 3 ? (
          <label className="relative block w-full sm:w-72">
            <span className="sr-only">Cari mata pelajaran</span>
            <Search
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari mata pelajaran"
              className="h-10 w-full rounded-xl bg-fill pl-9 pr-3 text-[15px] outline-none transition-shadow placeholder:text-muted-foreground focus-visible:shadow-[0_0_0_4px_var(--color-ring)]"
            />
          </label>
        ) : null}
      </div>

      {sessions.length > 0 ? (
        <div className="mt-8 space-y-3">
          {sessions.map((s) => (
            <SessionCard key={s.examId} session={s} />
          ))}
        </div>
      ) : null}

      <div className="mt-10">
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="surface overflow-hidden">
                <Skeleton className="aspect-[16/9] rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="mt-6 h-8 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : failed ? (
          <div className="surface flex flex-col items-center px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
              <CloudOff className="h-7 w-7" />
            </span>
            <h2 className="type-title-3 mt-5">Katalog tidak bisa dimuat</h2>
            <p className="type-callout mt-2 max-w-md text-muted-foreground">
              Server tidak bisa membaca database. Coba muat ulang halaman sebentar lagi.
            </p>
          </div>
        ) : items.length === 0 ? (
          <EmptyCatalog />
        ) : filtered.length === 0 ? (
          <p className="type-body py-16 text-center text-muted-foreground">
            Tidak ada mata pelajaran yang cocok dengan “{query.trim()}”.
          </p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <CatalogCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CoverChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
      {children}
    </span>
  );
}

function CatalogCard({ item }: { item: CatalogItem }) {
  const best = item.myBest;
  const pct = best ? percent(best.score, best.total) : 0;
  const empty = item.questionCount === 0;
  return (
    <article className="surface group flex flex-col overflow-hidden transition-[box-shadow,transform] duration-300 ease-apple hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]">
      <CatalogCover id={item.id} title={item.title} className="aspect-[16/9]">
        <div className="absolute left-4 top-4 flex gap-1.5">
          <CoverChip>
            <FileText className="h-3 w-3" /> {item.questionCount} soal
          </CoverChip>
          <CoverChip>
            <Clock className="h-3 w-3" /> {formatDuration(item.duration_minutes)}
          </CoverChip>
        </div>
      </CatalogCover>

      <div className="flex flex-1 flex-col p-5">
        {item.description ? (
          <p className="type-callout line-clamp-2 text-muted-foreground">{item.description}</p>
        ) : null}

        <div className="mt-auto pt-5">
          {best ? (
            <div>
              <div className="flex items-baseline justify-between text-[13px]">
                <span className="text-muted-foreground">Skor terbaikmu</span>
                <span className="tabular font-semibold">
                  {best.score}/{best.total} · {pct}%
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fill" aria-hidden>
                <div
                  className={cn(
                    "h-full rounded-full",
                    pct >= 80 ? "bg-success" : pct >= 50 ? "bg-primary" : "bg-warning",
                  )}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-muted-foreground">
              {empty
                ? "Belum ada soal di katalog ini."
                : item.attemptCount > 0
                  ? `Sudah ${item.attemptCount} kali dikerjakan peserta.`
                  : "Belum ada yang mencoba. Jadilah yang pertama."}
            </p>
          )}

          <CatalogActions examId={item.id} started={!!best} empty={empty} className="mt-4" />
        </div>
      </div>
    </article>
  );
}

/** The two things a catalog offers: take it, or see who has taken it. */
export function CatalogActions({
  examId,
  started,
  empty,
  className,
}: {
  examId: string;
  started: boolean;
  empty: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {empty ? (
        <span
          className={buttonVariants({
            size: "sm",
            variant: "secondary",
            className: "pointer-events-none opacity-50",
          })}
        >
          Belum ada soal
        </span>
      ) : (
        <Link to="/ujian/$examId" params={{ examId }} className={buttonVariants({ size: "sm" })}>
          <Play className="fill-current" /> {started ? "Kerjakan lagi" : "Mulai"}
        </Link>
      )}
      <Link
        to="/peringkat/$examId"
        params={{ examId }}
        className={buttonVariants({ size: "sm", variant: "secondary" })}
      >
        <Trophy /> Peringkat
      </Link>
    </div>
  );
}

function SessionCard({ session }: { session: SessionBanner }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (session.status !== "running") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [session.status]);

  const remaining = Math.max(0, session.deadline - now);
  const running = session.status === "running" && remaining > 0;

  return (
    <div className="surface flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:p-5">
      {running ? (
        <TimerPill
          ms={remaining}
          fraction={remaining / (session.durationMinutes * 60_000)}
          className="self-start sm:self-center"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-warning/15 text-warning-ink">
          <TimerOff className="h-5 w-5" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="type-headline truncate">{session.title}</p>
        <p className="type-callout text-muted-foreground">
          {running
            ? "Ujian ini sedang berlangsung dan timernya terus berjalan."
            : "Waktunya habis saat kamu pergi. Jawabanmu belum terkirim."}
        </p>
      </div>
      <Link
        to="/ujian/$examId"
        params={{ examId: session.examId }}
        className={buttonVariants({ size: "sm", className: "self-start sm:self-center" })}
      >
        {running ? "Lanjutkan" : "Kirim sekarang"}
      </Link>
    </div>
  );
}

function EmptyCatalog() {
  return (
    <div className="surface flex flex-col items-center px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
        <LayoutGrid className="h-7 w-7" />
      </span>
      <h2 className="type-title-3 mt-5">Belum ada katalog</h2>
      <p className="type-callout mt-2 max-w-sm text-muted-foreground">
        Admin belum membuat katalog ujian. Cek lagi nanti, ya.
      </p>
    </div>
  );
}
