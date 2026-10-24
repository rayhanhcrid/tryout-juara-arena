import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One answer choice. Single choice reads as a round letter that fills plus a
 * check at the end; multiple choice uses a square that fills with a check,
 * the checkbox shape people already know means "pick any".
 */
export function OptionRow({
  letter,
  label,
  selected,
  onSelect,
  disabled,
  size = "default",
  mode = "single",
}: {
  letter: string;
  label: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
  size?: "default" | "compact";
  mode?: "single" | "multiple";
}) {
  const compact = size === "compact";
  const multiple = mode === "multiple";
  return (
    <button
      type="button"
      role={multiple ? "checkbox" : "radio"}
      aria-checked={selected}
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
          "flex shrink-0 items-center justify-center font-semibold uppercase transition-colors duration-200",
          multiple ? "rounded-[8px]" : "rounded-full",
          compact ? "h-7 w-7 text-[13px]" : "h-8 w-8 text-[14px]",
          selected
            ? "bg-primary text-primary-foreground"
            : "bg-fill text-muted-foreground group-hover:text-foreground",
        )}
      >
        {multiple && selected ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : letter}
      </span>
      <span className={cn("flex-1", compact ? "type-callout" : "type-body")}>
        {multiple ? <span className="sr-only">{letter.toUpperCase()}. </span> : null}
        {label}
      </span>
      {multiple ? null : (
        <Check
          aria-hidden
          strokeWidth={3}
          className={cn(
            "h-4 w-4 shrink-0 text-primary transition-[opacity,transform] duration-200 ease-apple",
            selected ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
        />
      )}
    </button>
  );
}
