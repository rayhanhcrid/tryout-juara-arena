import { Link } from "@tanstack/react-router";
import { BookOpenCheck, ChevronLeft, ChevronRight, LogIn, RotateCcw, Trophy } from "lucide-react";
import { Leaderboard, type BoardEntry } from "@/components/leaderboard";
import { ScoreRing, useCountUp } from "@/components/score-ring";
import { buttonVariants } from "@/components/ui/button";
import { formatDateTime, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AttemptItem = { id: string; score: number; total: number; submitted_at: string };

export type ResultBack = { to: "/hari-ini" | "/katalog"; label: string };

function CountedScore({ score, total }: { score: number; total: number }) {
  const value = useCountUp(score, 1600);
  return (
    <span className="tabular font-display text-[76px] font-bold leading-none tracking-[-0.05em]">
      {Math.round(value)}
      <span className="text-[34px] text-tertiary">/{total}</span>
    </span>
  );
}

function Badge({ tone, children }: { tone: "first" | "best"; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tone === "first" ? "bg-primary/20 text-link" : "bg-success/15 text-success-ink",
      )}
    >
      {children}
    </span>
  );
}

/**
 * The score moment, on black: one large activity ring that fills while the
 * number counts up, the way into the explanations, then the board and this
 * participant's history. The board ranks first attempts only.
 */
export function ResultView({
  exam,
  attempts,
  leaderboard,
  meId,
  fresh,
  guestName,
  signedIn = false,
  streak,
  back,
}: {
  exam: { id: string; title: string };
  /** This participant's attempts, newest first. May be empty for a visitor. */
  attempts: AttemptItem[];
  leaderboard: BoardEntry[];
  meId: string | null;
  /** True right after submitting: the ring shows this attempt, not the best one. */
  fresh: boolean;
  guestName: string | null;
  /** This browser is signed in to an account; otherwise the score moment offers to save it. */
  signedIn?: boolean;
  /** Days in a row, shown when this is today's package. */
  streak: number | null;
  back: ResultBack;
}) {
  const latest = attempts[0];
  const first = attempts[attempts.length - 1];
  const best = attempts.length > 0 ? attempts.reduce((a, b) => (b.score > a.score ? b : a)) : null;
  const shown = fresh ? latest : best;
  const myRank = meId ? (leaderboard.find((e) => e.user_id === meId) ?? null) : null;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to={back.to}
        className="inline-flex items-center gap-0.5 rounded-full py-1 text-[15px] text-link hover:underline"
      >
        <ChevronLeft className="h-4 w-4" /> {back.label}
      </Link>

      {shown && best && latest && first ? (
        <ScoreMoment
          exam={exam}
          shown={shown}
          best={best}
          first={first}
          attemptsCount={attempts.length}
          isNewBest={
            fresh &&
            attempts.length > 1 &&
            latest.score > Math.max(...attempts.slice(1).map((a) => a.score))
          }
          fresh={fresh}
          rank={myRank?.rank ?? null}
          participants={leaderboard.length}
          guestName={guestName}
          signedIn={signedIn}
          streak={streak}
          back={back}
        />
      ) : (
        <section className="flex flex-col items-center pb-6 pt-10 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-card">
            <Trophy className="h-9 w-9 text-gold" />
          </span>
          <h1 className="type-title-1 mt-8">{exam.title}</h1>
          <p className="type-lead mt-3 max-w-xl text-muted-foreground">
            Kerjakan paket ini, lihat posisimu di papan peringkat, lalu baca pembahasannya.
          </p>
          <Link
            to="/ujian/$examId"
            params={{ examId: exam.id }}
            className={buttonVariants({ size: "lg", className: "mt-8" })}
          >
            Kerjakan sekarang
          </Link>
        </section>
      )}

      <section className="mt-20" aria-labelledby="peringkat-heading">
        <div className="flex items-end justify-between gap-4">
          <h2 id="peringkat-heading" className="type-title-2">
            Peringkat
          </h2>
          <Link
            to="/peringkat/$examId"
            params={{ examId: exam.id }}
            className="inline-flex items-center text-[15px] text-link hover:underline"
          >
            {leaderboard.length > 10 ? `Semua ${leaderboard.length}` : "Lihat papan"}{" "}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6">
          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] bg-card px-6 py-14 text-center">
              <Trophy className="h-8 w-8 text-tertiary" />
              <p className="type-callout mt-3 text-muted-foreground">Belum ada peserta.</p>
            </div>
          ) : (
            <Leaderboard entries={leaderboard} meId={meId} limit={10} />
          )}
        </div>
      </section>

      {attempts.length > 0 && best && first ? (
        <section className="mt-16" aria-labelledby="riwayat-heading">
          <h2 id="riwayat-heading" className="type-title-2">
            Riwayat pengerjaanmu
          </h2>
          <p className="type-callout mt-2 text-muted-foreground">
            Buka percobaan mana pun untuk melihat kunci dan pembahasannya.
          </p>
          <ol className="mt-6 overflow-hidden rounded-2xl bg-card">
            {attempts.map((a, i) => {
              const p = percent(a.score, a.total);
              return (
                <li key={a.id} className="relative">
                  {i > 0 ? (
                    <span aria-hidden className="absolute inset-x-0 top-0 ml-5 h-px bg-hairline" />
                  ) : null}
                  <Link
                    to="/pembahasan/$attemptId"
                    params={{ attemptId: a.id }}
                    className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/60 focus-visible:outline-offset-[-3px]"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[15px] font-medium">
                        {formatDateTime(a.submitted_at)}
                        {a.id === first.id ? <Badge tone="first">Masuk peringkat</Badge> : null}
                        {a.id === best.id && attempts.length > 1 ? (
                          <Badge tone="best">Terbaik</Badge>
                        ) : null}
                      </p>
                      <div
                        className="mt-2 h-1 max-w-56 overflow-hidden rounded-full bg-fill"
                        aria-hidden
                      >
                        <div
                          className={cn(
                            "h-full rounded-full",
                            p >= 80 ? "bg-success" : p >= 50 ? "bg-primary" : "bg-warning",
                          )}
                          style={{ width: `${p}%` }}
                        />
                      </div>
                    </div>
                    <p className="tabular text-right text-[17px] font-semibold tracking-[-0.02em]">
                      {a.score}
                      <span className="text-muted-foreground">/{a.total}</span>
                      <span className="block text-[12px] font-normal text-muted-foreground">
                        {p}%
                      </span>
                    </p>
                    <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-tertiary" />
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ) : null}
    </div>
  );
}

function ScoreMoment({
  exam,
  shown,
  best,
  first,
  attemptsCount,
  isNewBest,
  fresh,
  rank,
  participants,
  guestName,
  signedIn,
  streak,
  back,
}: {
  exam: { id: string; title: string };
  shown: AttemptItem;
  best: AttemptItem;
  first: AttemptItem;
  attemptsCount: number;
  isNewBest: boolean;
  fresh: boolean;
  rank: number | null;
  participants: number;
  guestName: string | null;
  signedIn: boolean;
  streak: number | null;
  back: ResultBack;
}) {
  const pct = percent(shown.score, shown.total);
  const firstTry = attemptsCount === 1;
  const who = guestName ? guestName.split(" ")[0] : null;
  const firstScore = `${first.score}/${first.total}`;

  let headline: string;
  let line: string;
  if (!fresh) {
    headline = "Skor terbaikmu.";
    line =
      shown.id === first.id
        ? "Ini juga percobaan pertamamu, yang tercatat di papan peringkat."
        : `Papan peringkat memakai percobaan pertamamu, ${firstScore}.`;
  } else if (firstTry) {
    headline =
      pct >= 80 ? `Keren${who ? `, ${who}` : ""}. Awal yang kuat.` : "Jawabanmu sudah dinilai.";
    line = "Skor ini masuk papan peringkat. Sekarang lihat mana yang benar dan mana yang salah.";
  } else if (isNewBest) {
    headline = "Skor terbaik baru.";
    line = `Latihan ulang tidak mengubah peringkat: papan tetap memakai percobaan pertamamu, ${firstScore}.`;
  } else {
    headline = "Latihan ulang tercatat.";
    line = `Papan peringkat tetap memakai percobaan pertamamu, ${firstScore}.`;
  }

  const stats = [
    { label: "Peringkat", value: rank ? `#${rank}` : "–", sub: `dari ${participants} peserta` },
    streak !== null
      ? { label: "Beruntun", value: `${streak}`, sub: "hari berturut-turut" }
      : {
          label: "Terbaik",
          value: `${best.score}/${best.total}`,
          sub: `${percent(best.score, best.total)}% benar`,
        },
    {
      label: "Percobaan",
      value: `${attemptsCount}×`,
      sub: fresh ? "termasuk yang ini" : "total",
    },
  ];

  return (
    <section aria-label="Skor" className="flex flex-col items-center pb-4 pt-6 text-center">
      <p className="text-[15px] text-muted-foreground">
        {exam.title}
        {guestName ? ` · ${guestName}` : ""}
      </p>
      <ScoreRing key={shown.id} pct={pct} size={300} stroke={28} className="mt-8">
        <CountedScore score={shown.score} total={shown.total} />
        <span className="tabular mt-3 text-[15px] text-muted-foreground">{pct}% benar</span>
      </ScoreRing>
      <h1 className="type-title-1 mt-10">{headline}</h1>
      <p className="type-lead mt-3 max-w-xl text-muted-foreground">{line}</p>

      <dl className="mt-10 grid w-full max-w-lg grid-cols-3 divide-x divide-hairline rounded-2xl bg-card py-4">
        {stats.map((s) => (
          <div key={s.label} className="px-3">
            <dt className="text-[12px] text-muted-foreground">{s.label}</dt>
            <dd className="tabular mt-1 font-display text-[24px] font-bold tracking-[-0.03em]">
              {s.value}
            </dd>
            <dd className="text-[11px] text-muted-foreground">{s.sub}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/pembahasan/$attemptId"
          params={{ attemptId: shown.id }}
          className={buttonVariants({ size: "lg" })}
        >
          <BookOpenCheck /> Lihat pembahasan
        </Link>
        <Link
          to="/ujian/$examId"
          params={{ examId: exam.id }}
          className={buttonVariants({ size: "lg", variant: "secondary" })}
        >
          <RotateCcw /> Kerjakan lagi
        </Link>
      </div>
      <Link
        to={back.to}
        className="mt-6 inline-flex items-center text-[15px] text-link hover:underline"
      >
        {back.to === "/hari-ini" ? "Kembali ke Hari ini" : "Paket lainnya"}{" "}
        <ChevronRight className="h-4 w-4" />
      </Link>

      {!signedIn ? (
        <div className="mt-10 flex w-full max-w-lg flex-col items-center gap-4 rounded-2xl bg-card px-5 py-5 sm:flex-row sm:text-left">
          <p className="type-callout flex-1 text-muted-foreground">
            Simpan skor ini ke akun supaya hari beruntun dan riwayatmu bisa dibuka dari perangkat
            lain.
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <Link to="/masuk" className={buttonVariants({ variant: "tinted", size: "sm" })}>
              <LogIn /> Masuk
            </Link>
            <Link
              to="/masuk"
              search={{ mode: "daftar" }}
              className="text-[13px] font-medium text-link hover:underline"
            >
              Buat akun
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
