import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { CloudOff, Newspaper } from "lucide-react";
import { useMemo } from "react";
import { AppShell } from "@/components/app-shell";
import { NewsList } from "@/components/news/news-list";
import { SegmentedControl } from "@/components/segmented-control";
import { fetchNews, type NewsItem } from "@/lib/participant-api";
import { TRACK_FILTERS, isTrackFilter, matchesTrack, type TrackFilter } from "@/lib/tracks";

export const Route = createFileRoute("/berita")({
  validateSearch: (search: Record<string, unknown>): { jalur?: TrackFilter } => {
    const jalur = search["jalur"];
    return isTrackFilter(jalur) && jalur !== "semua" ? { jalur } : {};
  },
  loader: async (): Promise<{ news: NewsItem[]; failed: boolean }> => {
    try {
      return { news: await fetchNews(100), failed: false };
    } catch {
      return { news: [], failed: true };
    }
  },
  head: () => ({
    meta: [
      { title: "Berita Seleksi — lulustes" },
      {
        name: "description",
        content:
          "Kabar seleksi CPNS, BUMN, dan ODP, masing-masing dengan tautan ke sumber resminya.",
      },
      { property: "og:title", content: "Berita Seleksi — lulustes" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: BeritaPage,
});

function BeritaPage() {
  const { news, failed } = Route.useLoaderData();
  const { jalur = "semua" } = Route.useSearch();
  const navigate = useNavigate({ from: "/berita" });
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const shown = useMemo(() => news.filter((n) => matchesTrack(n.track, jalur)), [news, jalur]);

  return (
    <AppShell pathname={pathname}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="type-title-1">Berita</h1>
          <p className="type-lead mt-2 max-w-[38rem] text-muted-foreground">
            Kabar seleksi CPNS, BUMN, dan ODP. Setiap berita membuka sumber aslinya, jadi selalu cek
            jadwal dan syarat di sana.
          </p>
        </div>
        {news.length > 0 ? (
          <SegmentedControl
            value={jalur}
            onChange={(value) =>
              navigate({ search: value === "semua" ? {} : { jalur: value }, replace: true })
            }
            options={TRACK_FILTERS}
            ariaLabel="Saring berdasarkan jalur"
            className="w-full sm:w-80"
          />
        ) : null}
      </div>

      <div className="mx-auto mt-10 max-w-3xl">
        {failed ? (
          <Empty
            icon={<CloudOff className="h-7 w-7" />}
            title="Berita tidak bisa dimuat"
            body="Server sedang tidak bisa membaca database. Coba muat ulang halaman sebentar lagi."
          />
        ) : news.length === 0 ? (
          <Empty
            icon={<Newspaper className="h-7 w-7" />}
            title="Belum ada berita"
            body="Admin belum memuat kabar seleksi. Sementara itu, pengumuman resmi CPNS ada di sscasn.bkn.go.id."
          />
        ) : shown.length === 0 ? (
          <p className="type-body py-16 text-center text-muted-foreground">
            Belum ada berita untuk jalur ini.
          </p>
        ) : (
          <NewsList items={shown} />
        )}
      </div>
    </AppShell>
  );
}

function Empty({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="surface flex flex-col items-center px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
        {icon}
      </span>
      <h2 className="type-title-3 mt-5">{title}</h2>
      <p className="type-callout mt-2 max-w-sm text-muted-foreground">{body}</p>
    </div>
  );
}
