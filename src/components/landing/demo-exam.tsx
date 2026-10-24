import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NavigatorGrid, NavigatorLegend, type CellState } from "@/components/exam/navigator-grid";
import { OptionRow } from "@/components/exam/option-row";
import { TimerPill, type TimerTone } from "@/components/exam/timer-pill";
import { ScoreRing } from "@/components/score-ring";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTION_KEYS = ["a", "b", "c", "d"] as const;
type OptionKey = (typeof OPTION_KEYS)[number];

/** The five questions of the seeded "Try Out Matematika Dasar" catalog. */
const QUESTIONS: { text: string; options: Record<OptionKey, string>; key: OptionKey }[] = [
  {
    text: "Hasil dari 12 + 8 × 2 adalah …",
    options: { a: "40", b: "28", c: "30", d: "32" },
    key: "b",
  },
  {
    text: "Jika x + 5 = 12, maka nilai x adalah …",
    options: { a: "5", b: "6", c: "7", d: "8" },
    key: "c",
  },
  {
    text: "Luas persegi dengan sisi 7 cm adalah …",
    options: { a: "14 cm²", b: "28 cm²", c: "42 cm²", d: "49 cm²" },
    key: "d",
  },
  { text: "25% dari 200 adalah …", options: { a: "25", b: "50", c: "75", d: "100" }, key: "b" },
  { text: "Nilai dari 3³ adalah …", options: { a: "6", b: "9", c: "27", d: "81" }, key: "c" },
];

const DEMO_MS = 2 * 60_000;

function demoTone(ms: number): TimerTone {
  if (ms < 20_000) return "critical";
  if (ms < 60_000) return "warning";
  return "normal";
}

/**
 * A working miniature of the exam screen, shown on the landing devices: real
 * questions, a real clock that auto-submits at zero, a real score. Nothing is
 * saved. `variant` sets the layout by device, not by viewport width.
 */
export function DemoExam({ variant }: { variant: "laptop" | "phone" }) {
  const phone = variant === "phone";
  const rootRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(DEMO_MS);
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [answers, setAnswers] = useState<Partial<Record<number, OptionKey>>>({});
  const [flags, setFlags] = useState<Record<number, boolean>>({});
  const [timedOut, setTimedOut] = useState(false);

  const start = useCallback(() => {
    setDeadline(Date.now() + DEMO_MS);
    setRemaining(DEMO_MS);
    setPhase("running");
  }, []);

  // The clock starts the first time the screen is mostly on view.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || phase !== "idle") return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          start();
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [phase, start]);

  useEffect(() => {
    if (phase !== "running" || deadline === null) return;
    const id = setInterval(() => {
      const rem = Math.max(0, deadline - Date.now());
      setRemaining(rem);
      if (rem <= 0) {
        setTimedOut(true);
        setPhase("done");
      }
    }, 250);
    return () => clearInterval(id);
  }, [phase, deadline]);

  function go(index: number) {
    setDir(index >= current ? "next" : "prev");
    setCurrent(Math.max(0, Math.min(QUESTIONS.length - 1, index)));
  }

  function choose(key: OptionKey) {
    if (phase === "idle") start();
    setAnswers((prev) => ({ ...prev, [current]: key }));
  }

  function reset() {
    setAnswers({});
    setFlags({});
    setCurrent(0);
    setTimedOut(false);
    start();
  }

  const q = QUESTIONS[current] ?? QUESTIONS[0]!;
  const answeredCount = QUESTIONS.filter((_, i) => answers[i]).length;
  const score = QUESTIONS.filter((item, i) => answers[i] === item.key).length;
  const states: CellState[] = QUESTIONS.map((_, i) =>
    flags[i] ? "flagged" : answers[i] ? "answered" : "empty",
  );
  const isLast = current === QUESTIONS.length - 1;

  return (
    <div ref={rootRef} className="relative flex h-full flex-col bg-background text-foreground">
      {/* App bar */}
      <div
        className={cn(
          "flex items-center justify-between gap-3 bg-card",
          phone ? "px-4 pb-3 pt-11" : "px-6 py-3.5",
        )}
      >
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold tracking-[-0.015em]">
            Try Out Matematika Dasar
          </p>
          <p className="tabular text-[12px] text-muted-foreground">
            Soal {current + 1} dari {QUESTIONS.length} · {answeredCount} terjawab
          </p>
        </div>
        <TimerPill
          ms={remaining}
          fraction={remaining / DEMO_MS}
          tone={demoTone(remaining)}
          className={phone ? "h-8 text-[13px]" : ""}
        />
      </div>
      <div className="h-[3px] shrink-0 bg-fill" aria-hidden>
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-apple"
          style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }}
        />
      </div>

      <div className={cn("relative grid min-h-0 flex-1", !phone && "grid-cols-[1fr_15rem]")}>
        <div className={cn("flex min-h-0 flex-col", phone ? "px-4 pb-4 pt-5" : "px-8 pb-5 pt-6")}>
          <div
            key={current}
            className={dir === "next" ? "animate-slide-next" : "animate-slide-prev"}
          >
            <p
              className={cn(
                "font-display font-semibold leading-snug tracking-[-0.022em]",
                phone ? "text-[19px]" : "text-[24px]",
              )}
            >
              {q.text}
            </p>
            <div
              className={cn("grid", phone ? "mt-4 gap-2" : "mt-5 gap-2")}
              role="group"
              aria-label="Pilihan jawaban"
            >
              {OPTION_KEYS.map((key) => (
                <OptionRow
                  key={key}
                  letter={key}
                  size="compact"
                  label={q.options[key]}
                  selected={answers[current] === key}
                  disabled={phase === "done"}
                  onSelect={() => choose(key)}
                />
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={current === 0}
              onClick={() => go(current - 1)}
              aria-label="Soal sebelumnya"
            >
              <ChevronLeft /> {phone ? null : "Sebelumnya"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              aria-pressed={!!flags[current]}
              className={cn(flags[current] && "bg-warning/15 text-warning-ink hover:bg-warning/20")}
              onClick={() => setFlags((prev) => ({ ...prev, [current]: !prev[current] }))}
            >
              <Flag /> Ragu-ragu
            </Button>
            {isLast ? (
              <Button size="sm" onClick={() => setPhase("done")} disabled={phase === "done"}>
                Kirim
              </Button>
            ) : (
              <Button size="sm" onClick={() => go(current + 1)} aria-label="Soal berikutnya">
                {phone ? null : "Berikutnya"} <ChevronRight />
              </Button>
            )}
          </div>
        </div>

        {phone ? null : (
          <aside className="flex flex-col border-l border-hairline bg-card p-5">
            <p className="text-[12px] font-semibold text-muted-foreground">Navigasi soal</p>
            <NavigatorGrid states={states} current={current} onJump={go} compact className="mt-3" />
            <NavigatorLegend className="mt-4" />
            <div className="mt-auto">
              <p className="tabular mb-2.5 text-[12px] text-muted-foreground">
                {answeredCount} dari {QUESTIONS.length} terjawab
              </p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => setPhase("done")}
                disabled={phase === "done"}
              >
                Kirim jawaban
              </Button>
            </div>
          </aside>
        )}

        {phase === "done" ? (
          <div
            className="animate-rise absolute inset-0 z-10 flex flex-col items-center justify-center bg-card/90 px-5 text-center backdrop-blur-md"
            aria-live="polite"
          >
            <ScoreRing
              pct={(score / QUESTIONS.length) * 100}
              size={phone ? 120 : 136}
              stroke={phone ? 12 : 13}
            >
              <span className="tabular font-display text-3xl font-bold tracking-[-0.04em]">
                {score}/{QUESTIONS.length}
              </span>
            </ScoreRing>
            <p className="type-title-3 mt-5">
              {timedOut
                ? "Waktu habis. Jawabanmu terkirim otomatis."
                : `Skormu ${score} dari ${QUESTIONS.length}.`}
            </p>
            <p className="mt-1.5 max-w-xs text-[13px] text-muted-foreground">
              Di try out sungguhan, skor ini langsung masuk papan peringkat.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link to="/katalog" className={buttonVariants({ size: "sm" })}>
                Coba sungguhan
              </Link>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw /> Ulangi
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
