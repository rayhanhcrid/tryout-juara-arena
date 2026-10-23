import { cn } from "@/lib/utils";

export type CellState = "empty" | "answered" | "flagged";

const CELL = {
  empty: "bg-fill text-muted-foreground hover:bg-secondary-hover hover:text-foreground",
  answered: "bg-primary text-primary-foreground hover:bg-primary-hover",
  flagged: "bg-warning text-foreground hover:bg-warning/85",
} as const;

/** Jump-to-question grid: blue answered, orange "ragu-ragu", ring on the current one. */
export function NavigatorGrid({
  states,
  current,
  onJump,
  compact = false,
  className,
}: {
  states: CellState[];
  current: number;
  onJump?: (index: number) => void;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-2",
        compact ? "grid-cols-5" : "grid-cols-[repeat(auto-fill,minmax(2.5rem,1fr))]",
        className,
      )}
    >
      {states.map((state, i) => {
        const isCurrent = i === current;
        const label = `Soal ${i + 1}${state === "answered" ? ", terjawab" : state === "flagged" ? ", ragu-ragu" : ", belum dijawab"}`;
        return (
          <button
            key={i}
            type="button"
            aria-label={label}
            aria-current={isCurrent ? "step" : undefined}
            disabled={!onJump}
            onClick={() => onJump?.(i)}
            className={cn(
              "tabular flex aspect-square cursor-pointer items-center justify-center rounded-xl text-[14px] font-semibold transition-[background-color,color,box-shadow] duration-200 disabled:cursor-default",
              compact ? "min-h-8" : "min-h-10",
              CELL[state],
              isCurrent && "shadow-[0_0_0_2px_var(--color-card),0_0_0_4px_var(--color-foreground)]",
            )}
          >
            {i + 1}
          </button>
        );
      })}
    </div>
  );
}

export function NavigatorLegend({ className }: { className?: string }) {
  const items = [
    { label: "Terjawab", swatch: "bg-primary" },
    { label: "Ragu-ragu", swatch: "bg-warning" },
    { label: "Belum", swatch: "bg-fill" },
  ];
  return (
    <ul
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1.5 type-footnote text-muted-foreground",
        className,
      )}
    >
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span aria-hidden className={cn("h-2.5 w-2.5 rounded-[4px]", it.swatch)} />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
