import { Link } from "@tanstack/react-router";
import { ChevronRight, Play } from "lucide-react";
import { CatalogCover } from "@/components/catalog-cover";
import { buttonVariants } from "@/components/ui/button";
import { formatDay, formatDuration } from "@/lib/format";
import { trackLabel } from "@/lib/tracks";
import type { Daily } from "@/lib/participant-api";

/**
 * The real package of the day (from the loader), so the landing's promise is
 * checkable on the spot. Renders nothing on a day without one.
 */
export function TodaySection({ daily }: { daily: Daily | null }) {
  const pkg = daily?.package;
  if (!daily || !pkg || pkg.questionCount === 0) return null;
  const meta = [
    pkg.track !== "umum" ? trackLabel(pkg.track) : null,
    `${pkg.questionCount} soal`,
    formatDuration(pkg.duration_minutes),
  ].filter(Boolean);

  return (
    <section
      id="paket-hari-ini"
      className="scroll-mt-14 bg-background py-24 sm:py-28"
      aria-labelledby="paket-hari-ini-heading"
    >
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 id="paket-hari-ini-heading" className="type-title-1 max-w-[16ch]">
          Paket hari ini.
        </h2>
        <p className="type-lead mt-3 max-w-[36rem] text-muted-foreground">
          Terbit {formatDay(daily.today, "long")}. Kirim hari ini juga supaya masuk hitungan hari
          beruntunmu.
        </p>

        <article className="mt-10 grid overflow-hidden rounded-[28px] bg-card lg:grid-cols-[1.2fr_1fr]">
          <Link
            to="/ujian/$examId"
            params={{ examId: pkg.id }}
            aria-label={`Kerjakan ${pkg.title}`}
            className="group block focus-visible:outline-offset-[-4px]"
          >
            <CatalogCover
              id={pkg.id}
              title={pkg.title}
              className="h-64 sm:h-80 lg:h-full lg:min-h-[340px] [&>p]:inset-x-7 [&>p]:bottom-6 [&>p]:text-[28px] sm:[&>p]:text-[34px]"
            />
          </Link>
          <div className="flex flex-col p-7 sm:p-9">
            <p className="tabular text-[15px] font-medium text-muted-foreground">
              {meta.join(" · ")}
            </p>
            {pkg.description ? (
              <p className="type-body mt-4 text-foreground/85">{pkg.description}</p>
            ) : null}
            <p className="type-callout mt-4 text-muted-foreground">
              {pkg.attemptCount > 0
                ? `Sudah ${pkg.attemptCount} kali dikerjakan hari ini. Percobaan pertama yang masuk papan peringkat.`
                : "Belum ada yang mengerjakan hari ini. Percobaan pertama yang masuk papan peringkat."}
            </p>
            <div className="mt-auto flex flex-wrap items-center gap-x-7 gap-y-4 pt-8">
              <Link
                to="/ujian/$examId"
                params={{ examId: pkg.id }}
                className={buttonVariants({ size: "lg" })}
              >
                <Play className="fill-current" /> Kerjakan sekarang
              </Link>
              <Link
                to="/peringkat/$examId"
                params={{ examId: pkg.id }}
                className="inline-flex items-center gap-0.5 text-[17px] text-link hover:underline"
              >
                Peringkat hari ini <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}
