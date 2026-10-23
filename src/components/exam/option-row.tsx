import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const OPTION_KEYS = ["a", "b", "c", "d"] as const;
export type OptionKey = (typeof OPTION_KEYS)[number];

/** One answer choice. Selection reads as a filled letter plus a hairline of blue. */
export function OptionRow({
  letter,
  label,
  selected,
  onSelect,
  disabled,
  size = "default",
}: {
  letter: OptionKey;
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  size?: "default" | "compact";
}) {
  const compact = size === "compact";
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "group flex w-full cursor-pointer items-center text-left transition-[background-color,border-color,box-shadow,transform] duration-200 ease-apple active:scale-[0.99] disabled:cursor-default disabled:active:scale-100",
        compact
          ? "gap-3 rounded-xl border px-3 py-2.5"
          : "gap-4 rounded-2xl border px-4 py-3.5 sm:px-5 sm:py-4",
        selected
          ? "border-primary bg-primary/[0.06] shadow-[0_0_0_1px_var(--color-primary)]"
          : "border-hairline bg-card hover:border-border hover:bg-accent/70",
      )}
    >
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full font-semibold uppercase transition-colors duration-200",
          compact ? "h-7 w-7 text-[13px]" : "h-8 w-8 text-[14px]",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-fill text-muted-foreground group-hover:text-foreground",
        )}
      >
        {letter}
      </span>
      <span className={cn("flex-1", compact ? "type-callout" : "type-body")}>{label}</span>
      <Check
        aria-hidden
        strokeWidth={3}
        className={cn(
          "h-4 w-4 shrink-0 text-primary transition-[opacity,transform] duration-200 ease-apple",
          selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
        )}
      />
    </button>
  );
}
