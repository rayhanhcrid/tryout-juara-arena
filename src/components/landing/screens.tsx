import { Check, Play, X } from "lucide-react";
import { CatalogCover } from "@/components/catalog-cover";
import { WeekStrip } from "@/components/daily/week-strip";
import { NavigatorGrid, type CellState } from "@/components/exam/navigator-grid";
import { OptionRow } from "@/components/exam/option-row";
import { TimerPill } from "@/components/exam/timer-pill";
import { InitialsAvatar } from "@/components/initials-avatar";
import { ScoreRing } from "@/components/score-ring";
import { cn } from "@/lib/utils";
import type { DailyDay } from "@/lib/participant-api";

/**
 * Small app screens shown on the landing devices. They are illustrations
 * built from the real components, at device scale, and labeled as examples
 * where they appear.
 */

export const SUBJECTS = [
  { title: "Paket Harian SKD #12", meta: "12 soal · 15 menit" },
  { title: "Latihan TWK: Pilar Negara", meta: "30 soal · 30 menit" },
  { title: "Latihan TIU: Deret Angka", meta: "20 soal · 20 menit" },
  { title: "Latihan TKP: Pelayanan Publik", meta: "25 soal · 25 menit" },
  { title: "Rekrutmen BUMN: TKD", meta: "30 soal · 30 menit" },
  { title: "ODP Bank: Bahasa Inggris", meta: "25 soal · 20 menit" },
  { title: "Tes Verbal: Sinonim", meta: "20 soal · 15 menit" },
  { title: "Simulasi SKD CPNS", meta: "110 soal · 100 menit" },
] as const;

const EXAMPLE_TODAY = "2026-11-12";

/** A week of the routine: six kept days, a Sunday without a package, today still open. */
const EXAMPLE_WEEK: DailyDay[] = [
  { date: "2026-11-06", package: true, done: true },
  { date: "2026-11-07", package: true, done: true },
  { date: "2026-11-08", package: false, done: false },
  { date: "2026-11-09", package: true, done: true },
  { date: "2026-11-10", package: true, done: true },
  { date: "2026-11-11", package: true, done: true },
  { date: "2026-11-12", package: true, done: false },
];

/** Light Latihan: large title, jalur filter, package covers. */
export function CatalogScreen({
  columns = 2,
  count = 6,
  topInset = 0,
}: {
  columns?: 1 | 2;
  count?: number;
  topInset?: number;
}) {
  return (
    <div
      className="light h-full bg-background px-4 text-foreground"
      style={{ paddingTop: topInset + 18 }}
    >
      <p className="font-display text-[26px] font-bold tracking-[-0.03em]">Latihan</p>
      <p className="text-[11px] text-muted-foreground">Semua paket, termasuk yang terlewat.</p>
      <div className="mt-3 grid h-7 grid-cols-4 rounded-lg bg-fill p-0.5 text-center text-[10px] font-medium">
        {["Semua", "CPNS", "BUMN", "ODP"].map((t, i) => (
          <span
            key={t}
            className={cn(
              "flex items-center justify-center rounded-md",
              i === 1 && "bg-card font-semibold shadow-[0_2px_6px_rgb(0_0_0/0.12)]",
            )}
          >
            {t}
          </span>
        ))}
      </div>
      <div className={cn("mt-3 grid gap-2.5", columns === 2 ? "grid-cols-2" : "grid-cols-1")}>
        {SUBJECTS.slice(0, count).map((s) => (
          <div
            key={s.title}
            className="overflow-hidden rounded-xl bg-card shadow-[var(--shadow-card)]"
          >
            <CatalogCover
              id={s.title}
              title={s.title}
              className={cn(
                "[&>p]:inset-x-2.5 [&>p]:bottom-2 [&>p]:text-[12px]",
                columns === 2 ? "h-[62px]" : "h-[70px] [&>p]:text-[14px]",
              )}
            />
            <p className="px-2.5 py-1.5 text-[10px] text-muted-foreground">{s.meta}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Light Hari ini: today's package and the week that keeps the streak. */
export function DailyScreen({ topInset = 0 }: { topInset?: number }) {
  return (
    <div
      className="light h-full bg-background px-4 text-foreground"
      style={{ paddingTop: topInset + 18 }}
    >
      <p className="font-display text-[26px] font-bold tracking-[-0.03em]">Hari ini</p>
      <p className="text-[11px] text-muted-foreground">Halo, Nadia. Kamis, 12 November.</p>
      <div className="mt-3 overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">
        <CatalogCover
          id="Paket Harian SKD #12"
          title="Paket Harian SKD #12"
          className="h-[92px] [&>p]:inset-x-3 [&>p]:bottom-2.5 [&>p]:text-[15px]"
        />
        <div className="flex items-center justify-between gap-2 p-3">
          <p className="text-[10px] text-muted-foreground">12 soal · 15 menit · CPNS</p>
          <span className="flex h-7 items-center gap-1 rounded-full bg-primary px-3 text-[11px] font-semibold text-primary-foreground">
            <Play className="h-3 w-3 fill-current" /> Kerjakan
          </span>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)]">
        <p className="flex items-baseline gap-1.5">
          <span className="tabular font-display text-[30px] font-bold leading-none tracking-[-0.04em]">
            5
          </span>
          <span className="text-[12px] font-semibold">hari beruntun</span>
        </p>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Kirim paket hari ini supaya tidak terputus.
        </p>
        <WeekStrip days={EXAMPLE_WEEK} today={EXAMPLE_TODAY} size="compact" className="mt-3" />
      </div>
    </div>
  );
}

/** Light exam intro with the participant's name typed in. */
export function NameScreen({ topInset = 0 }: { topInset?: number }) {
  const size = 132;
  const r = (size - 12) / 2;
  return (
    <div
      className="light flex h-full flex-col items-center bg-background px-5 text-center text-foreground"
      style={{ paddingTop: topInset + 22 }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="shrink-0"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={12}
          className="stroke-primary"
        />
        <text
          x="50%"
          y="52%"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground font-display text-[30px] font-semibold tabular"
        >
          15:00
        </text>
      </svg>
      <p className="mt-4 font-display text-[21px] font-bold tracking-[-0.03em]">Paket Harian SKD</p>
      <p className="text-[11px] text-muted-foreground">12 soal · 15 menit</p>
      <div className="mt-5 w-full rounded-xl border border-primary bg-card px-3 py-2 text-left shadow-[0_0_0_3px_rgb(0_113_227/0.15)]">
        <p className="text-[9px] text-muted-foreground">Namamu</p>
        <p className="text-[14px]">
          Nadia Putri
          <span className="ml-px inline-block h-3.5 w-px translate-y-0.5 animate-pulse-dot bg-primary" />
        </p>
      </div>
      <p className="mt-1.5 self-start text-[10px] text-muted-foreground">
        Tampil di papan peringkat.
      </p>
      <div className="mt-5 flex h-10 w-full items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-primary-foreground">
        Mulai ujian
      </div>
    </div>
  );
}

/** Light exam in progress, time running low. */
export function ExamScreen({ topInset = 0 }: { topInset?: number }) {
  const states: CellState[] = [
    "answered",
    "answered",
    "answered",
    "flagged",
    "answered",
    "answered",
    "empty",
    "empty",
    "empty",
    "empty",
    "empty",
    "empty",
  ];
  return (
    <div className="light h-full bg-background text-foreground" style={{ paddingTop: topInset }}>
      <div className="flex items-center justify-between bg-card px-4 pb-2.5 pt-3">
        <div>
          <p className="text-[12px] font-semibold">Paket Harian SKD</p>
          <p className="text-[10px] text-muted-foreground">Nadia · Soal 7 dari 12 · TIU</p>
        </div>
        <TimerPill ms={214_000} fraction={0.24} className="h-7 text-[12px]" />
      </div>
      <div className="h-[3px] bg-fill">
        <div className="h-full w-1/2 bg-primary" />
      </div>
      <div className="px-4 pt-4">
        <p className="font-display text-[15px] font-semibold leading-snug tracking-[-0.02em]">
          3, 5, 9, 17, 33, … Bilangan berikutnya adalah …
        </p>
        <div className="mt-3 space-y-1.5">
          {["a", "b", "c", "d"].map((k, i) => (
            <OptionRow
              key={k}
              letter={k}
              size="compact"
              label={["49", "57", "63", "65"][i] ?? ""}
              selected={k === "d"}
              onSelect={() => {}}
              disabled
            />
          ))}
        </div>
        <NavigatorGrid states={states} current={6} compact className="mt-4" />
      </div>
    </div>
  );
}

/** Light review: the report, then one question with its key and explanation. */
export function ReviewScreen({ topInset = 0 }: { topInset?: number }) {
  const sections = [
    { name: "TWK", value: "4/5", pct: 80, bar: "bg-success" },
    { name: "TIU", value: "5/7", pct: 71, bar: "bg-primary" },
  ];
  return (
    <div
      className="light h-full bg-background px-4 text-foreground"
      style={{ paddingTop: topInset + 18 }}
    >
      <p className="font-display text-[22px] font-bold tracking-[-0.03em]">Paket Harian SKD</p>
      <div className="mt-3 rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)]">
        <p className="flex items-baseline gap-2">
          <span className="tabular font-display text-[26px] font-bold leading-none tracking-[-0.04em]">
            9<span className="text-[14px] text-tertiary">/12</span>
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground">75% benar</span>
          <span className="ml-auto flex h-6 items-center rounded-full bg-primary px-2.5 text-[10px] font-semibold text-primary-foreground">
            Unduh PDF
          </span>
        </p>
        <div className="mt-3 space-y-1.5">
          {sections.map((s) => (
            <div key={s.name} className="flex items-center gap-2 text-[10px]">
              <span className="w-7 font-semibold">{s.name}</span>
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-fill">
                <span
                  className={cn("block h-full rounded-full", s.bar)}
                  style={{ width: `${s.pct}%` }}
                />
              </span>
              <span className="tabular w-6 text-right text-muted-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)]">
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-0.5 text-[10px] font-semibold text-destructive-ink">
          <X className="h-2.5 w-2.5" strokeWidth={3} /> Salah
        </span>
        <p className="mt-2 font-display text-[13px] font-semibold tracking-[-0.015em]">
          Sinonim kata AMBIGU adalah …
        </p>
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2 rounded-lg bg-destructive/[0.06] px-2 py-1.5 text-[11px] shadow-[inset_0_0_0_1px_rgb(255_59_48/0.4)]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-white">
              <X className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            Pasti
            <span className="ml-auto text-[9px] font-semibold text-destructive-ink">Jawabanmu</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-success/[0.08] px-2 py-1.5 text-[11px] shadow-[inset_0_0_0_1px_rgb(52_199_89/0.45)]">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
            Taksa
            <span className="ml-auto text-[9px] font-semibold text-success-ink">Kunci</span>
          </div>
        </div>
        <div className="mt-2 rounded-lg bg-background p-2">
          <p className="text-[9px] font-semibold text-muted-foreground">Pembahasan</p>
          <p className="mt-0.5 text-[10px] leading-[1.4]">
            Ambigu berarti bermakna lebih dari satu. Padanannya dalam KBBI adalah taksa.
          </p>
        </div>
      </div>
    </div>
  );
}

/** Dark result: the score moment, as an activity ring on black. */
export function ResultScreen({ topInset = 0, pct = 100 }: { topInset?: number; pct?: number }) {
  const rows = [
    { name: "Nadia Putri", score: "12/12" },
    { name: "Raka Pratama", score: "11/12" },
    { name: "Sinta Wulandari", score: "11/12" },
  ];
  return (
    <div
      className="flex h-full flex-col items-center bg-background px-4 text-foreground"
      style={{ paddingTop: topInset + 18 }}
    >
      <ScoreRing pct={pct} size={136} stroke={14}>
        <span className="tabular font-display text-[28px] font-bold tracking-[-0.04em]">
          {Math.round((pct / 100) * 12)}/12
        </span>
      </ScoreRing>
      <p className="mt-4 font-display text-[18px] font-bold tracking-[-0.02em]">Peringkat #1</p>
      <p className="text-[11px] text-muted-foreground">Paket hari ini · 5 hari beruntun</p>
      <div className="mt-4 w-full overflow-hidden rounded-xl bg-card">
        {rows.map((r, i) => (
          <div
            key={r.name}
            className={cn(
              "flex items-center gap-2 px-3 py-2",
              i > 0 && "border-t border-hairline",
              i === 0 && "bg-primary/15",
            )}
          >
            <span className="tabular w-3 text-center text-[11px] font-semibold text-muted-foreground">
              {i + 1}
            </span>
            <InitialsAvatar name={r.name} seed={r.name} size={22} />
            <span className="flex-1 truncate text-[12px] font-semibold">
              {r.name.split(" ")[0]}
            </span>
            <span className="tabular text-[12px] font-semibold">{r.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
