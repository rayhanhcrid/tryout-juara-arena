import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * A kategori question: each statement gets one of the categories (Benar/Salah,
 * Sesuai/Tidak Sesuai…). Each row is its own radio group of labelled pills,
 * set beside the statement on wide screens and under it on phones; the pills
 * share one fixed width so their columns line up down the list.
 */
export function CategoryRows({
  statements,
  categories,
  value,
  onChange,
}: {
  statements: string[];
  categories: string[];
  value: (number | null)[];
  onChange: (row: number, category: number) => void;
}) {
  return (
    <ol
      className="divide-y divide-hairline overflow-hidden rounded-2xl border border-hairline bg-card"
      style={{ "--cats": categories.length } as React.CSSProperties}
    >
      {statements.map((statement, row) => {
        const picked = value[row] ?? null;
        const labelId = `statement-${row}`;
        return (
          <li
            key={row}
            className="grid gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-5 sm:px-5"
          >
            <p id={labelId} className="type-body flex gap-3">
              <span className="tabular w-5 shrink-0 text-muted-foreground">{row + 1}.</span>
              <span>{statement}</span>
            </p>
            <div
              role="radiogroup"
              aria-labelledby={labelId}
              className="grid grid-cols-[repeat(var(--cats),minmax(0,1fr))] gap-2 pl-8 sm:grid-cols-[repeat(var(--cats),7.5rem)] sm:pl-0"
            >
              {categories.map((category, c) => {
                const selected = picked === c;
                return (
                  <button
                    key={category}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange(row, c)}
                    className={cn(
                      "inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-[15px] font-medium transition-[background-color,border-color,color,transform] duration-200 ease-apple active:scale-[0.97]",
                      selected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:border-tertiary",
                    )}
                  >
                    {selected ? <Check aria-hidden className="h-4 w-4" strokeWidth={3} /> : null}
                    <span className="truncate">{category}</span>
                  </button>
                );
              })}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
