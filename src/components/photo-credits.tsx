import { ChevronDown } from "lucide-react";
import { COVER_PHOTO_LIST } from "@/lib/cover-photos";
import { cn } from "@/lib/utils";

/** Attribution for the cover photographs, as their Creative Commons licenses require. */
export function PhotoCredits({ className }: { className?: string }) {
  return (
    <details id="kredit-foto" className={cn("group scroll-mt-20", className)}>
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-[13px] text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        Kredit foto sampul
        <ChevronDown
          aria-hidden
          className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
        />
      </summary>
      <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-[12px] leading-[1.45] text-muted-foreground sm:grid-cols-2">
        {COVER_PHOTO_LIST.map((p) => (
          <li key={p.src}>
            <a href={p.page} target="_blank" rel="noreferrer" className="hover:underline">
              {p.title}
            </a>{" "}
            · {p.author} ·{" "}
            {p.licenseUrl ? (
              <a href={p.licenseUrl} target="_blank" rel="noreferrer" className="hover:underline">
                {p.license}
              </a>
            ) : (
              p.license
            )}
            , via Wikimedia Commons
          </li>
        ))}
      </ul>
    </details>
  );
}
