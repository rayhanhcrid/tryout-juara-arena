import { formatClock } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TimerTone = "normal" | "warning" | "critical";

/** Product thresholds: orange under five minutes, red in the final minute. */
export function timerTone(ms: number): TimerTone {
  if (ms < 60_000) return "critical";
  if (ms < 5 * 60_000) return "warning";
  return "normal";
}

const TONE = {
  normal: { pill: "bg-fill text-foreground", ring: "stroke-foreground" },
  warning: { pill: "bg-warning/15 text-warning-ink", ring: "stroke-warning" },
  critical: { pill: "bg-destructive/12 text-destructive-ink", ring: "stroke-destructive" },
} as const;

/** Running countdown: a draining ring like the iOS Timer, then the clock. */
export function TimerPill({
  ms,
  fraction,
  tone = timerTone(ms),
  className,
  style,
}: {
  ms: number;
  /** Remaining share of the full duration, 0..1. */
  fraction: number;
  tone?: TimerTone;
  className?: string;
  style?: React.CSSProperties;
}) {
  const r = 6.5;
  const c = 2 * Math.PI * r;
  const t = TONE[tone];
  return (
    <div
      role="timer"
      aria-label={`Sisa waktu ${formatClock(ms)}`}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full pl-2.5 pr-3.5 text-[15px] font-semibold transition-colors duration-300",
        t.pill,
        className,
      )}
      style={style}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" className="-rotate-90" aria-hidden>
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          strokeWidth="2.5"
          className="stroke-current opacity-20"
        />
        <circle
          cx="9"
          cy="9"
          r={r}
          fill="none"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, fraction)))}
          className={cn("transition-[stroke-dashoffset] duration-1000 ease-linear", t.ring)}
        />
      </svg>
      <span className="tabular">{formatClock(ms)}</span>
      {tone === "critical" ? (
        <span aria-hidden className="animate-pulse-dot h-1.5 w-1.5 rounded-full bg-destructive" />
      ) : null}
    </div>
  );
}
