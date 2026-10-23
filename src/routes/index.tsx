import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TryOutKu — Try Out Ujian Online dengan Leaderboard" },
      { name: "description", content: "Pilih katalog try out, kerjakan soal dengan timer, lihat skor otomatis, dan bersaing di leaderboard." },
      { property: "og:title", content: "TryOutKu — Try Out Ujian Online dengan Leaderboard" },
      { property: "og:description", content: "Ikuti try out, lihat skormu, dan bersaing di leaderboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  {
    emoji: "📚",
    title: "Pilih katalog ujian",
    text: "Pilih mata ujian yang mau kamu ikuti, lengkap dengan jumlah soal dan durasinya.",
  },
  {
    emoji: "⏱️",
    title: "Timer otomatis",
    text: "Waktu pengerjaan diatur ketat. Saat waktu habis, jawabanmu terkirim otomatis.",
  },
  {
    emoji: "🏆",
    title: "Skor & leaderboard",
    text: "Skor dihitung otomatis begitu kamu submit, dan hasilnya masuk papan peringkat.",
  },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
            T
          </span>
          <span className="font-display text-xl font-bold tracking-tight">TryOutKu</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/admin" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Admin
          </Link>
          <Button asChild>
            <Link to="/auth">Masuk</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-8 lg:grid-cols-2 lg:gap-6">
          <div>
            <Badge variant="secondary" className="mb-4">
              Platform try out online
            </Badge>
            <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Latihan ujian, <span className="gold-underline">skormu</span>, papan peringkat.
            </h1>
            <p className="mt-5 max-w-md text-base text-muted-foreground sm:text-lg">
              Ikuti try out sesuai katalog yang tersedia, kerjakan soal dalam waktu yang ditentukan,
              lalu lihat langsung skor akhirnya. Hasilmu otomatis masuk leaderboard.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to="/auth">Mulai Sekarang</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/auth">Sudah punya akun? Masuk</Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <div className="paper-lines rounded-3xl border border-border bg-card p-3 ink-shadow">
              <img
                src={heroImage}
                alt="Ilustrasi siswa mengerjakan try out"
                width={1600}
                height={1200}
                className="w-full rounded-2xl"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-20">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-xl">
                    {f.emoji}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 text-sm text-muted-foreground">
          <span>© {new Date().getFullYear()} TryOutKu</span>
          <Link to="/admin" className="transition-colors hover:text-foreground">
            Masuk sebagai admin
          </Link>
        </div>
      </footer>
    </div>
  );
}
