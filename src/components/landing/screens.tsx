import { Search } from "lucide-react";
import { CatalogCover } from "@/components/catalog-cover";
import { NavigatorGrid, type CellState } from "@/components/exam/navigator-grid";
import { OptionRow } from "@/components/exam/option-row";
import { TimerPill } from "@/components/exam/timer-pill";
import { InitialsAvatar } from "@/components/initials-avatar";
import { ScoreRing } from "@/components/score-ring";
import { cn } from "@/lib/utils";

/**
 * Small app screens shown on the landing devices. They are illustrations
 * built from the real components, at device scale, and labeled as examples
 * where they appear.
 */

export const SUBJECTS = [
  { title: "Matematika", meta: "5 soal · 20 menit" },
  { title: "Fisika", meta: "5 soal · 20 menit" },
  { title: "Kimia", meta: "5 soal · 15 menit" },
  { title: "Biologi", meta: "5 soal · 15 menit" },
  { title: "Bahasa Indonesia", meta: "5 soal · 15 menit" },
  { title: "Bahasa Inggris", meta: "5 soal · 15 menit" },
  { title: "Sejarah Indonesia", meta: "5 soal · 10 menit" },
  { title: "Geografi", meta: "5 soal · 10 menit" },
] as const;

/** Light catalog: large title, search, subject covers. */
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
      <p className="font-display text-[26px] font-bold tracking-[-0.03em]">Katalog</p>
      <p className="text-[11px] text-muted-foreground">Pilih mata pelajaran, tulis nama, mulai.</p>
      <div className="mt-3 flex h-7 items-center gap-1.5 rounded-lg bg-fill px-2.5 text-[11px] text-muted-foreground">
        <Search className="h-3 w-3" /> Cari mata pelajaran
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
          20:00
        </text>
      </svg>
      <p className="mt-4 font-display text-[21px] font-bold tracking-[-0.03em]">Fisika</p>
      <p className="text-[11px] text-muted-foreground">5 soal · 20 menit</p>
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
  const states: CellState[] = ["answered", "answered", "flagged", "answered", "empty"];
  return (
    <div className="light h-full bg-background text-foreground" style={{ paddingTop: topInset }}>
      <div className="flex items-center justify-between bg-card px-4 pb-2.5 pt-3">
        <div>
          <p className="text-[12px] font-semibold">Fisika</p>
          <p className="text-[10px] text-muted-foreground">Nadia · Soal 3 dari 5</p>
        </div>
        <TimerPill ms={214_000} fraction={0.18} className="h-7 text-[12px]" />
      </div>
      <div className="h-[3px] bg-fill">
        <div className="h-full w-3/5 bg-primary" />
      </div>
      <div className="px-4 pt-4">
        <p className="font-display text-[15px] font-semibold leading-snug tracking-[-0.02em]">
          Benda bermassa 5 kg diberi gaya 20 N. Percepatannya adalah …
        </p>
        <div className="mt-3 space-y-1.5">
          {["a", "b", "c", "d"].map((k, i) => (
            <OptionRow
              key={k}
              letter={k}
              size="compact"
              label={["2 m/s²", "4 m/s²", "15 m/s²", "100 m/s²"][i] ?? ""}
              selected={k === "b"}
              onSelect={() => {}}
              disabled
            />
          ))}
        </div>
        <NavigatorGrid states={states} current={2} compact className="mt-4" />
      </div>
    </div>
  );
}

/** Dark result: the score moment, as an activity ring on black. */
export function ResultScreen({ topInset = 0, pct = 100 }: { topInset?: number; pct?: number }) {
  const rows = [
    { name: "Nadia Putri", score: "5/5" },
    { name: "Raka Pratama", score: "4/5" },
    { name: "Sinta Wulandari", score: "4/5" },
  ];
  return (
    <div
      className="flex h-full flex-col items-center bg-background px-4 text-foreground"
      style={{ paddingTop: topInset + 18 }}
    >
      <ScoreRing pct={pct} size={136} stroke={14}>
        <span className="tabular font-display text-[30px] font-bold tracking-[-0.04em]">
          {Math.round((pct / 100) * 5)}/5
        </span>
      </ScoreRing>
      <p className="mt-4 font-display text-[18px] font-bold tracking-[-0.02em]">Peringkat #1</p>
      <p className="text-[11px] text-muted-foreground">Fisika · dari 12 peserta</p>
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
