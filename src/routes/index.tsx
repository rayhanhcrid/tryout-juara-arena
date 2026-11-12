import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { AppIcon } from "@/components/brand";
import { HeroStage } from "@/components/landing/hero-stage";
import { Highlights } from "@/components/landing/highlights";
import { PhotoWall } from "@/components/landing/photo-wall";
import { ResearchSection } from "@/components/landing/research-section";
import { SiteHeader } from "@/components/landing/site-header";
import { StepsGallery } from "@/components/landing/steps-gallery";
import { TodaySection } from "@/components/landing/today-section";
import { buttonVariants } from "@/components/ui/button";
import { fetchDaily, type Daily } from "@/lib/participant-api";

export const Route = createFileRoute("/")({
  loader: async (): Promise<{ daily: Daily | null }> => {
    try {
      return { daily: await fetchDaily(null) };
    } catch {
      // The landing must render even when the database cannot be read.
      return { daily: null };
    }
  },
  head: () => ({
    meta: [
      { title: "lulustes — Satu Paket Soal Sehari untuk Tes CPNS, BUMN & ODP" },
      {
        name: "description",
        content:
          "Latihan rutin untuk tes CPNS, BUMN, dan ODP: satu paket soal setiap hari, pembahasan tiap soal, laporan PDF, dan peringkat. Tanpa daftar akun.",
      },
      {
        property: "og:title",
        content: "lulustes — Satu Paket Soal Sehari untuk Tes CPNS, BUMN & ODP",
      },
      {
        property: "og:description",
        content: "Kerjakan paket hari ini, baca pembahasannya, dan jaga hari beruntunmu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: Index,
});

function Index() {
  const { daily } = Route.useLoaderData();

  return (
    <div className="page-dark dark min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* overflow-x-clip, not overflow-hidden: a scroll container here would capture the stage's view() timeline */}
        <section className="relative isolate overflow-x-clip pb-20 pt-[calc(52px+4.5rem)] sm:pb-28 sm:pt-[calc(52px+6rem)]">
          <PhotoWall rows={5} />
          <div aria-hidden className="hero-scrim pointer-events-none absolute inset-0 -z-10" />
          <div className="mx-auto max-w-[980px] px-5 text-center sm:px-8">
            <h1 className="type-hero animate-rise">
              <span className="block">Satu paket soal sehari.</span>
              <span className="block text-tertiary">Sampai lulus tes.</span>
            </h1>
            <p className="type-lead animate-rise mx-auto mt-6 max-w-[38rem] text-muted-foreground [animation-delay:120ms]">
              Latihan rutin untuk tes CPNS, BUMN, dan ODP. Kerjakan paket hari ini, baca pembahasan
              tiap soal, dan jaga hari beruntunmu. Tanpa daftar akun.
            </p>
            <div className="animate-rise mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 [animation-delay:220ms]">
              <Link to="/hari-ini" className={buttonVariants({ size: "lg" })}>
                Kerjakan paket hari ini
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
              Ujian di layar ini bisa kamu coba: soalnya contoh dan tidak ada yang disimpan. Layar
              lainnya tampilan contoh.
            </p>
          </div>
        </section>

        <TodaySection daily={daily} />
        <ResearchSection />
        <StepsGallery />
        <Highlights />

        <section className="relative isolate overflow-hidden bg-background py-28 text-center sm:py-36">
          <PhotoWall rows={3} />
          <div aria-hidden className="cta-scrim pointer-events-none absolute inset-0 -z-10" />
          <div className="mx-auto max-w-[980px] px-5 sm:px-8">
            <AppIcon size={72} className="mx-auto" />
            <h2 className="type-title-1 mx-auto mt-8 max-w-[16ch]">Lulus tes dimulai hari ini.</h2>
            <p className="type-lead mx-auto mt-5 max-w-[30rem] text-muted-foreground">
              Tidak perlu akun. Tulis namamu, kerjakan paket hari ini, lalu baca pembahasannya.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              <Link to="/hari-ini" className={buttonVariants({ size: "lg" })}>
                Kerjakan paket hari ini
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-hairline bg-background">
        <div className="mx-auto flex max-w-[1080px] flex-col gap-4 px-5 py-8 text-[12px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© {new Date().getFullYear()} lulustes. Latihan harian tes CPNS, BUMN, dan ODP.</p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Tautan kaki">
            <Link to="/hari-ini" className="hover:text-foreground hover:underline">
              Hari ini
            </Link>
            <Link to="/katalog" className="hover:text-foreground hover:underline">
              Latihan
            </Link>
            <Link to="/berita" className="hover:text-foreground hover:underline">
              Berita
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
