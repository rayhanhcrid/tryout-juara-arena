import { Check } from "lucide-react";
import { formatDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { DailyDay } from "@/lib/participant-api";

type DayState = "done" | "today" | "missed" | "none";

function stateOf(day: DailyDay, today: string): DayState {
  if (day.done) return "done";
  if (!day.package) return "none";
  return day.date === today ? "today" : "missed";
}

const SPOKEN: Record<DayState, string> = {
  done: "dikerjakan",
  today: "paket hari ini, belum dikerjakan",
  missed: "terlewat",
  none: "tidak ada paket",
};

/**
 * The last seven days as the routine sees them: a filled blue check for a
 * package sent that day, an open blue ring for today's package still waiting,
 * an empty well for a package missed, and a small dot for a day without one.
 */
export function WeekStrip({
  days,
  today,
  size = "default",
  className,
}: {
  days: DailyDay[];
  today: string;
  size?: "default" | "compact";
  className?: string;
}) {
  const compact = size === "compact";
  return (
    <ol className={cn("grid grid-cols-7", compact ? "gap-1" : "gap-1.5", className)}>
      {days.map((day) => {
        const state = stateOf(day, today);
        const isToday = day.date === today;
        return (
          <li key={day.date} className="flex flex-col items-center">
            <span
              aria-hidden
              className={cn(
                "font-medium",
                compact ? "text-[9px]" : "text-[12px]",
                isToday ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {formatDay(day.date, "weekday")}
            </span>
            <span
              aria-hidden
              className={cn(
                "flex items-center justify-center rounded-full",
                compact ? "mt-1 h-6 w-6" : "mt-2 h-9 w-9",
                state === "done" && "bg-primary text-primary-foreground",
                state === "today" && "shadow-[inset_0_0_0_2px_var(--color-primary)]",
                state === "missed" && "bg-fill",
              )}
            >
              {state === "done" ? (
                <Check className={compact ? "h-3 w-3" : "h-4 w-4"} strokeWidth={3} />
              ) : state === "none" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-tertiary/50" />
              ) : null}
            </span>
            <span
              aria-hidden
              className={cn(
                "tabular",
                compact ? "mt-0.5 text-[9px]" : "mt-1.5 text-[12px]",
                isToday ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {Number(day.date.slice(8, 10))}
            </span>
            <span className="sr-only">
              {formatDay(day.date, "long")}: {SPOKEN[state]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
