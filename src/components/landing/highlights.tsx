import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, RotateCw, TimerOff } from "lucide-react";
import { NavigatorGrid, NavigatorLegend, type CellState } from "@/components/exam/navigator-grid";
import { Podium, type BoardEntry } from "@/components/leaderboard";
import { cn } from "@/lib/utils";

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "reveal-on-scroll relative overflow-hidden rounded-[28px] bg-card p-7 sm:p-9",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TileText({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-display text-[clamp(1.5rem,1.2rem+0.9vw,1.875rem)] font-bold leading-[1.1] tracking-[-0.028em]">
        {title}
      </h3>
      <p className="type-body mt-3 max-w-[30rem] text-muted-foreground">{body}</p>
    </div>
  );
}

function CountdownDial() {
  const size = 220;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-fill"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * 0.96}
          className="stroke-destructive"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="tabular font-display text-[52px] font-semibold tracking-[-0.04em] text-destructive-ink">
          00:09
        </span>
        <span className="text-[13px] text-muted-foreground">sisa waktu</span>
      </div>
    </div>
  );
}

const FLAG_DEMO: CellState[] = [
  "answered",
  "answered",
  "answered",
  "flagged",
  "answered",
  "answered",
  "empty",
  "answered",
  "flagged",
  "answered",
  "answered",
  "answered",
  "empty",
  "answered",
  "answered",
  "flagged",
  "answered",
  "empty",
  "empty",
  "empty",
];

const PODIUM_DEMO: BoardEntry[] = [
  {
    rank: 1,
    user_id: "contoh-1",
    nama: "Nadia Putri",
    score: 19,
    total: 20,
    submitted_at: "2026-10-01T08:12:00Z",
  },
  {
    rank: 2,
    user_id: "contoh-2",
    nama: "Raka Pratama",
    score: 19,
    total: 20,
    submitted_at: "2026-10-01T09:40:00Z",
  },
  {
    rank: 3,
    user_id: "contoh-3",
    nama: "Sinta Wulandari",
    score: 18,
    total: 20,
    submitted_at: "2026-10-02T07:05:00Z",
  },
];

export function Highlights() {
  return (
    <section id="fitur" className="scroll-mt-14 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 className="type-title-1 max-w-[18ch]">Detail kecil yang bikin tenang.</h2>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-6">
          <Tile className="flex flex-col gap-10 lg:col-span-4 lg:flex-row lg:items-center lg:justify-between">
            <TileText
              title="Waktu habis? Tetap terkirim."
              body="Saat timer menyentuh nol, semua jawaban yang sudah kamu isi langsung dikirim dan dinilai. Tidak ada yang hilang."
            />
            <div className="flex flex-col items-center gap-5 self-center">
              <CountdownDial />
              <div className="flex items-center gap-2 rounded-2xl bg-secondary px-4 py-2.5 text-[13px] font-medium">
                <TimerOff className="h-4 w-4 text-link" />
                Waktu habis! Jawabanmu dikirim otomatis.
              </div>
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Ragu-ragu? Tandai dulu."
              body="Soal yang kamu tandai menyala oranye, jadi gampang dicek ulang sebelum kirim."
            />
            <div className="mt-auto">
              <NavigatorGrid states={FLAG_DEMO} current={6} compact />
              <NavigatorLegend className="mt-4" />
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Tanpa daftar akun."
              body="Cukup tulis nama sebelum mulai. Nama itulah yang tampil di papan peringkat."
            />
            <div className="mt-auto space-y-3">
              <div className="rounded-2xl bg-secondary px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Namamu</p>
                <p className="text-[17px]">
                  Nadia Putri
                  <span className="ml-0.5 inline-block h-4 w-px translate-y-0.5 animate-pulse-dot bg-link" />
                </p>
              </div>
              <div className="flex h-11 items-center justify-center rounded-full bg-primary text-[15px] font-medium text-primary-foreground">
                Mulai ujian
              </div>
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Tahan refresh."
              body="Ter-refresh atau tak sengaja tertutup? Buka lagi di perangkat yang sama, timer dan jawabanmu masih di tempatnya."
            />
            <div className="mt-auto flex items-center gap-3 rounded-2xl bg-secondary p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-link">
                <RotateCw className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold">Ujian dilanjutkan.</p>
                <p className="tabular text-[13px] text-muted-foreground">
                  18 jawaban dipulihkan · sisa 23:41
                </p>
              </div>
              <Check className="h-5 w-5 text-success" strokeWidth={3} />
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Soal bisa bergambar."
              body="Bangun datar, grafik, atau tabel. Admin bisa menyertakan gambar di setiap soal."
            />
            <div className="light mt-auto rounded-2xl bg-card p-5">
              <svg
                viewBox="0 0 220 130"
                className="w-full"
                role="img"
                aria-label="Segitiga siku-siku dengan alas 8 cm dan tinggi 6 cm"
              >
                <path
                  d="M46 110 L196 110 L46 20 Z"
                  className="fill-primary/10 stroke-primary"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
                <path d="M46 96 h14 v14" className="fill-none stroke-primary" strokeWidth="2" />
                <text
                  x="121"
                  y="126"
                  textAnchor="middle"
                  className="fill-foreground text-[12px] font-semibold"
                >
                  8 cm
                </text>
                <text
                  x="36"
                  y="69"
                  textAnchor="end"
                  className="fill-foreground text-[12px] font-semibold"
                >
                  6 cm
                </text>
                <text x="132" y="58" className="fill-muted-foreground text-[13px] font-semibold">
                  ?
                </text>
              </svg>
            </div>
          </Tile>

          <Tile className="grid gap-10 lg:col-span-4 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div className="self-center">
              <TileText
                title="Peringkat yang adil."
                body="Setiap mata pelajaran punya papan sendiri. Yang dihitung skor terbaik tiap peserta; kalau sama, yang lebih dulu mengirim berada di atas."
              />
            </div>
            <div>
              <Podium entries={PODIUM_DEMO} />
              <p className="mt-3 text-center type-footnote text-muted-foreground">
                Nama dan skor contoh
              </p>
            </div>
          </Tile>

          {/* The one light tile on the dark page: the door to the working world. */}
          <Tile className="light flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Punya soal sendiri?"
              body="Lewat panel admin, susun katalog, tulis dan urutkan soal, unggah gambar, serta atur durasinya."
            />
            <Link
              to="/admin"
              className="mt-auto inline-flex items-center gap-1 text-[17px] font-medium text-link hover:underline"
            >
              Buka panel admin <ChevronRight className="h-4 w-4" />
            </Link>
          </Tile>
        </div>
      </div>
    </section>
  );
}
