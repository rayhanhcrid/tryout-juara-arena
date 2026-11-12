import { ArrowUpRight } from "lucide-react";
import { formatDay } from "@/lib/format";
import { trackLabel } from "@/lib/tracks";
import { cn } from "@/lib/utils";
import type { NewsItem } from "@/lib/participant-api";

/**
 * Selection news as one grouped inset list. Every row opens its source in a
 * new tab: lulustes points to the announcement, it does not restate it.
 */
export function NewsList({ items, className }: { items: NewsItem[]; className?: string }) {
  return (
    <ul
      className={cn(
        "overflow-hidden rounded-[22px] bg-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {items.map((n, i) => (
        <li key={n.id} className="relative">
          {i > 0 ? (
            <span aria-hidden className="absolute inset-x-0 top-0 ml-5 h-px bg-hairline" />
          ) : null}
          <a
            href={n.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex gap-4 px-5 py-4 transition-colors hover:bg-accent/60 focus-visible:outline-offset-[-3px]"
          >
            <div className="min-w-0 flex-1">
              <p className="tabular flex flex-wrap items-center gap-x-2 text-[12px] text-muted-foreground">
                <time dateTime={n.publishedOn}>{formatDay(n.publishedOn, "short")}</time>
                {n.track !== "umum" ? (
                  <>
                    <span aria-hidden>·</span>
                    <span className="font-semibold text-foreground/80">{trackLabel(n.track)}</span>
                  </>
                ) : null}
              </p>
              <h3 className="mt-1 text-[17px] font-semibold leading-snug tracking-[-0.018em] group-hover:underline">
                {n.title}
              </h3>
              {n.summary ? (
                <p className="type-callout mt-1 line-clamp-2 text-muted-foreground">{n.summary}</p>
              ) : null}
              <p className="mt-2 text-[13px] text-link">
                {n.sourceName}
                <span className="sr-only"> (buka di tab baru)</span>
              </p>
            </div>
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-tertiary transition-colors group-hover:text-link"
            />
          </a>
        </li>
      ))}
    </ul>
  );
}
