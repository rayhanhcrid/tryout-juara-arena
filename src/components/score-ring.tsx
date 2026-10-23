import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Counts from 0 to `target` with an expo ease-out, once per target change. */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setValue(target * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

export function scoreTone(pct: number): "great" | "good" | "low" {
  if (pct >= 80) return "great";
  if (pct >= 50) return "good";
  return "low";
}

const TONE_STROKE = {
  great: "stroke-success",
  good: "stroke-primary",
  low: "stroke-warning",
} as const;

/**
 * Activity-ring style score: the arc is the percentage of correct answers,
 * drawn while the number counts up.
 */
export function ScoreRing({
  pct,
  size = 220,
  stroke = 20,
  children,
  className,
}: {
  pct: number;
  size?: number;
  stroke?: number;
  children?: React.ReactNode;
  className?: string;
}) {
  const animated = useCountUp(pct);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(100, Math.max(0, animated)) / 100);
  const tone = scoreTone(pct);

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-fill"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={TONE_STROKE[tone]}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ?? (
          <span className="tabular font-display text-5xl font-bold tracking-[-0.04em]">
            {Math.round(animated)}%
          </span>
        )}
      </div>
    </div>
  );
}
