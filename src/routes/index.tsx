import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppIcon } from "@/components/brand";
import { HeroStage } from "@/components/landing/hero-stage";
import { Highlights } from "@/components/landing/highlights";
import { SiteHeader } from "@/components/landing/site-header";
import { StepsGallery } from "@/components/landing/steps-gallery";
import { SubjectRail } from "@/components/landing/subject-rail";
import { buttonVariants } from "@/components/ui/button";
import { fetchCatalog, type CatalogEntry } from "@/lib/participant-api";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ exams: CatalogEntry[] }> => {
    try {
      return { exams: await fetchCatalog(null) };
    } catch {
      // The landing must render even when the catalog cannot be read.
      return { exams: [] };
    }
  },
  head: () => ({
    meta: [
      { title: "TryOutKu — Try Out Ujian Online dengan Leaderboard" },
      {
        name: "description",
        content:
          "Pilih mata pelajaran, tulis namamu, kerjakan soal dengan timer, lalu lihat skor dan peringkatmu. Tanpa daftar akun.",
      },
      { property: "og:title", content: "TryOutKu — Try Out Ujian Online dengan Leaderboard" },
      {
        property: "og:description",
        content: "Pilih mata pelajaran, tulis namamu, dan bersaing di papan peringkat.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: Index,
});

function Index() {
  const { exams } = Route.useLoaderData();

  return (
    <div className="page-dark dark min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* overflow-x-clip, not overflow-hidden: a scroll container here would capture the stage's view() timeline */}
        <section className="overflow-x-clip pb-20 pt-[calc(52px+4.5rem)] sm:pb-28 sm:pt-[calc(52px+6rem)]">
          <div className="mx-auto max-w-[980px] px-5 text-center sm:px-8">
            <h1 className="type-hero animate-rise">
              <span className="block">Latihan ujian.</span>
              <span className="block text-tertiary">Rasanya seperti hari H.</span>
            </h1>
            <p className="type-lead animate-rise mx-auto mt-6 max-w-[36rem] text-muted-foreground [animation-delay:120ms]">
              Pilih mata pelajaran, tulis namamu, lalu kerjakan soal dengan waktu yang terus
              berjalan. Tanpa daftar akun.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 [animation-delay:220ms]">
              <Link to="/katalog" className={buttonVariants({ size: "lg" })}>
                Pilih mata pelajaran
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex items-center gap-0.5 text-[17px] text-link hover:underline"
              >
                Lihat cara kerjanya <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-12 px-4 sm:mt-14 sm:px-8">
            <HeroStage />
            <p className="mx-auto mt-8 max-w-md text-center type-footnote text-muted-foreground">
              Ujian di layar ini bisa kamu coba. Soalnya dari katalog contoh, dan tidak ada yang
              disimpan.
            </p>
          </div>
        </section>

        <SubjectRail exams={exams} />
        <StepsGallery />
        <Highlights />

        <section className="bg-background py-28 text-center sm:py-36">
          <div className="mx-auto max-w-[980px] px-5 sm:px-8">
            <AppIcon size={72} className="mx-auto" />
            <h2 className="type-title-1 mx-auto mt-8 max-w-[16ch]">
              Waktumu dimulai saat kamu siap.
            </h2>
            <p className="type-lead mx-auto mt-5 max-w-[30rem] text-muted-foreground">
              Tidak perlu akun. Pilih mata pelajaran, tulis namamu, dan mulai.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link to="/katalog" className={buttonVariants({ size: "lg" })}>
                Pilih mata pelajaran
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-background">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-4 px-5 py-8 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} TryOutKu. Latihan ujian online.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Tautan kaki">
            <Link to="/katalog" className="hover:text-foreground hover:underline">
              Katalog
            </Link>
            <Link to="/admin" className="hover:text-foreground hover:underline">
              Panel admin
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
