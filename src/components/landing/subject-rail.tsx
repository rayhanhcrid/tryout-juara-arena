import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CatalogCover } from "@/components/catalog-cover";
import { CatalogActions } from "@/components/catalog/catalog-view";
import { formatDuration } from "@/lib/format";
import type { CatalogEntry } from "@/lib/exam.functions";

/**
 * The real catalog (the subjects the admin set up) as a sideways rail. Each
 * card starts that subject or opens that subject's own leaderboard.
 */
export function SubjectRail({ exams }: { exams: CatalogEntry[] }) {
  const ready = exams.filter((e) => e.questionCount > 0);
  if (ready.length === 0) return null;
  return (
    <section
      id="mata-pelajaran"
      className="scroll-mt-14 bg-background py-24 sm:py-28"
      aria-labelledby="mapel-heading"
    >
      <div className="mx-auto flex max-w-[1080px] items-end justify-between gap-6 px-5 sm:px-8">
        <div>
          <h2 id="mapel-heading" className="type-title-1 max-w-[16ch]">
            Pilih mata pelajaranmu.
          </h2>
          <p className="type-lead mt-3 max-w-[34rem] text-muted-foreground">
            Setiap mata pelajaran punya papan peringkatnya sendiri.
          </p>
        </div>
        <Link
          to="/katalog"
          className="hidden shrink-0 items-center gap-0.5 text-[17px] text-link hover:underline sm:inline-flex"
        >
          Lihat semua <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <ul className="no-scrollbar mt-10 flex snap-x snap-mandatory scroll-px-[max(20px,calc((100vw-1080px)/2+32px))] gap-4 overflow-x-auto scroll-smooth px-[max(20px,calc((100vw-1080px)/2+32px))] pb-2">
        {ready.map((exam) => (
          <li key={exam.id} className="w-[250px] shrink-0 snap-start sm:w-[272px]">
            <Link
              to="/ujian/$examId"
              params={{ examId: exam.id }}
              aria-label={`Mulai ${exam.title}`}
              className="group block rounded-[24px] focus-visible:outline-offset-4"
            >
              <CatalogCover
                id={exam.id}
                title={exam.title}
                className="h-[280px] rounded-[24px] transition-transform duration-500 ease-apple group-hover:scale-[1.02] [&>p]:bottom-5 [&>p]:text-[24px]"
              />
            </Link>
            <p className="tabular mt-3 px-1 text-[14px] text-muted-foreground">
              {exam.questionCount} soal · {formatDuration(exam.duration_minutes)}
            </p>
            <CatalogActions examId={exam.id} started={false} empty={false} className="mt-3" />
          </li>
        ))}
      </ul>
      <div className="mx-auto mt-6 max-w-[1080px] px-5 sm:hidden">
        <Link
          to="/katalog"
          className="inline-flex items-center gap-0.5 text-[17px] text-link hover:underline"
        >
          Lihat semua <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
