import { Link } from "@tanstack/react-router";
import { Check, ChevronRight, Download, X } from "lucide-react";
import { WeekStrip } from "@/components/daily/week-strip";
import { NavigatorGrid, NavigatorLegend, type CellState } from "@/components/exam/navigator-grid";
import { Podium, type BoardEntry } from "@/components/leaderboard";
import { cn } from "@/lib/utils";
import type { DailyDay } from "@/lib/participant-api";

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

function CountdownDial({ size = 220 }: { size?: number }) {
  const stroke = Math.round(size / 15);
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
        <span
          className="tabular font-display font-semibold tracking-[-0.04em] text-destructive-ink"
          style={{ fontSize: size * 0.24 }}
        >
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
    score: 12,
    total: 12,
    submitted_at: "2026-11-12T00:12:00Z",
  },
  {
    rank: 2,
    user_id: "contoh-2",
    nama: "Raka Pratama",
    score: 11,
    total: 12,
    submitted_at: "2026-11-12T01:40:00Z",
  },
  {
    rank: 3,
    user_id: "contoh-3",
    nama: "Sinta Wulandari",
    score: 11,
    total: 12,
    submitted_at: "2026-11-12T02:05:00Z",
  },
];

/** The last week of an example routine; Sunday had no package, so it did not break it. */
const STREAK_DEMO: DailyDay[] = [
  { date: "2026-11-06", package: true, done: true },
  { date: "2026-11-07", package: true, done: true },
  { date: "2026-11-08", package: false, done: false },
  { date: "2026-11-09", package: true, done: true },
  { date: "2026-11-10", package: true, done: true },
  { date: "2026-11-11", package: true, done: true },
  { date: "2026-11-12", package: true, done: true },
];

function ReviewDemoRow({ ok, label, tag }: { ok: boolean; label: string; tag: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl px-3.5 py-2.5",
        ok
          ? "bg-success/[0.12] shadow-[inset_0_0_0_1px_rgb(48_209_88/0.45)]"
          : "bg-destructive/[0.1] shadow-[inset_0_0_0_1px_rgb(255_69_58/0.45)]",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-full",
          ok ? "bg-success text-black" : "bg-destructive text-white",
        )}
      >
        {ok ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <X className="h-3.5 w-3.5" strokeWidth={3} />
        )}
      </span>
      <span className="flex-1 text-[15px]">{label}</span>
      <span
        className={cn(
          "text-[12px] font-semibold",
          ok ? "text-success-ink" : "text-destructive-ink",
        )}
      >
        {tag}
      </span>
    </div>
  );
}

export function Highlights() {
  return (
    <section id="fitur" className="scroll-mt-14 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 className="type-title-1 max-w-[18ch]">Yang bikin kamu kembali besok.</h2>

        <div className="mt-12 grid gap-4 sm:gap-5 lg:grid-cols-6">
          {/* The routine is the product, so it takes the widest tile. */}
          <Tile className="flex flex-col gap-10 lg:col-span-4 lg:flex-row lg:items-center lg:justify-between">
            <TileText
              title="Satu paket, setiap hari."
              body="Rutinitas yang ringan untuk dijaga. Kirim paket di harinya dan hitungan hari beruntunmu bertambah; hari tanpa paket tidak memutusnya."
            />
            <div className="w-full max-w-[19rem] shrink-0 self-center rounded-[22px] bg-secondary p-5">
              <p className="flex items-baseline gap-2">
                <span className="tabular font-display text-[52px] font-bold leading-none tracking-[-0.045em]">
                  12
                </span>
                <span className="text-[17px] font-semibold">hari beruntun</span>
              </p>
              <WeekStrip days={STREAK_DEMO} today="2026-11-12" className="mt-5" />
              <p className="mt-4 text-center type-footnote text-muted-foreground">Contoh</p>
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Tahu salahnya di mana."
              body="Setiap soal datang dengan kunci dan pembahasan, jadi kesalahan hari ini tidak terulang besok."
            />
            <div className="mt-auto space-y-2">
              <ReviewDemoRow ok={false} label="Pasti" tag="Jawabanmu" />
              <ReviewDemoRow ok label="Taksa" tag="Kunci" />
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Laporan yang bisa diunduh."
              body="Skor per subtes, subtes yang paling perlu diulang, dan semua pembahasan dalam satu PDF."
            />
            <div className="mt-auto rounded-2xl bg-secondary p-4">
              {[
                { name: "TWK", value: "4/5", pct: 80, bar: "bg-success" },
                { name: "TIU", value: "5/7", pct: 71, bar: "bg-primary" },
                { name: "TKP", value: "3/6", pct: 50, bar: "bg-warning" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-3 py-1.5 text-[13px]">
                  <span className="w-9 font-semibold">{s.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-fill">
                    <span
                      className={cn("block h-full rounded-full", s.bar)}
                      style={{ width: `${s.pct}%` }}
                    />
                  </span>
                  <span className="tabular w-8 text-right text-muted-foreground">{s.value}</span>
                </div>
              ))}
              <div className="mt-3 flex h-9 items-center justify-center gap-1.5 rounded-full bg-primary text-[13px] font-medium text-primary-foreground">
                <Download className="h-4 w-4" /> Unduh PDF
              </div>
            </div>
          </Tile>

          <Tile className="flex flex-col gap-8 lg:col-span-2">
            <TileText
              title="Waktu habis? Tetap terkirim."
              body="Saat timer menyentuh nol, semua jawaban yang sudah kamu isi langsung dikirim dan dinilai."
            />
            <div className="mt-auto self-center">
              <CountdownDial size={168} />
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

          <Tile className="grid gap-10 lg:col-span-4 lg:grid-cols-[1fr_1.15fr] lg:items-end">
            <div className="self-center">
              <TileText
                title="Peringkat yang adil."
                body="Setiap paket punya papan sendiri. Yang dihitung percobaan pertama tiap peserta, karena setelah itu kunci jawabannya sudah terbuka."
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
              title="Kabar seleksi, satu tempat."
              body="Pengumuman CPNS, BUMN, dan ODP dikumpulkan di menu Berita, masing-masing dengan tautan ke sumber resminya."
            />
            <Link
              to="/berita"
              className="mt-auto inline-flex items-center gap-1 text-[17px] font-medium text-link hover:underline"
            >
              Buka Berita <ChevronRight className="h-4 w-4" />
            </Link>
          </Tile>
        </div>
      </div>
    </section>
  );
}
