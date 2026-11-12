import { ArrowUpRight, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AppIcon } from "@/components/brand";
import { cn } from "@/lib/utils";

/**
 * "Kenapa harus tiap hari?": three findings from learning research, each
 * with the figure that carries it, and how lulustes applies it. Every number
 * comes from the cited paper; curves drawn from a model say so.
 */

const SOURCES = [
  {
    id: "sumber-lally",
    short: "Lally dkk., 2010",
    text: "Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.",
    doi: "10.1002/ejsp.674",
  },
  {
    id: "sumber-roediger",
    short: "Roediger & Karpicke, 2006",
    text: "Roediger, H. L., III, & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.",
    doi: "10.1111/j.1467-9280.2006.01693.x",
  },
  {
    id: "sumber-dunlosky",
    short: "Dunlosky dkk., 2013",
    text: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.",
    doi: "10.1177/1529100612453266",
  },
] as const;

export function ResearchSection() {
  return (
    <section
      id="riset"
      className="scroll-mt-14 bg-background py-24 sm:py-32"
      aria-labelledby="riset-heading"
    >
      <div className="mx-auto max-w-[1080px] px-5 sm:px-8">
        <h2 id="riset-heading" className="type-title-1 max-w-[16ch]">
          Kenapa harus tiap hari?
        </h2>
        <p className="type-lead mt-4 max-w-[38rem] text-muted-foreground">
          Bukan kata motivator. Tiga temuan riset psikologi belajar yang jadi dasar cara kerja
          lulustes, lengkap dengan angkanya.
        </p>

        <div className="mt-16 space-y-24 sm:space-y-28">
          <Finding
            title="Kebiasaan butuh waktu, dan tidak harus sempurna."
            source={SOURCES[0]}
            use="Hitungan hari beruntun menemanimu melewati minggu-minggu awal. Kalau sempat putus, mulai lagi besok: satu hari terlewat tidak menghapus kebiasaan yang sedang terbentuk."
            figure={<HabitFigure />}
          >
            <p>
              Peneliti mengikuti 96 relawan yang membangun satu kebiasaan sehat baru, dilakukan
              setiap hari selama 84 hari. Rasa “otomatis” naik cepat di awal, lalu melandai.
            </p>
            <p>
              Pada peserta yang kurvanya terukur jelas, butuh median <Strong>66 hari</Strong> untuk
              hampir mencapai puncaknya, dengan rentang 18 sampai 254 hari. Satu kali terlewat tidak
              mengganggu prosesnya secara berarti.
            </p>
          </Finding>

          <Finding
            flip
            title="Mengerjakan soal mengalahkan membaca ulang."
            source={SOURCES[1]}
            use="Karena itu latihan di lulustes berbentuk soal bertimer, bukan bacaan. Pembahasannya dibaca sesudah kamu mencoba menjawab."
            figure={<RetentionFigure />}
          >
            <p>
              Mahasiswa membaca sebuah teks, lalu membacanya sekali lagi atau langsung diuji. Lima
              menit kemudian, yang membaca ulang sedikit unggul. Seminggu kemudian, keadaannya
              berbalik: yang diuji masih ingat <Strong>56%</Strong>, yang membaca ulang tinggal 42%.
            </p>
            <p>
              Di eksperimen kedua, yang mengerjakan soal tiga kali masih ingat 61% setelah seminggu,
              sedangkan yang membaca empat kali hanya 40%, padahal mereka membaca teksnya 14,2 kali
              berbanding 3,4 kali, dan justru paling yakin akan ingat.
            </p>
          </Finding>

          <Finding
            title="Dua teknik belajar yang paling terbukti: latihan soal dan dicicil."
            source={SOURCES[2]}
            use="Satu paket soal sehari menjalankan keduanya sekaligus: kamu berlatih soal, dan latihannya tersebar di banyak hari, bukan dikebut semalam sebelum tes."
            figure={<TechniquesFigure />}
          >
            <p>
              Tim peneliti meninjau riset tentang sepuluh teknik belajar yang paling umum dipakai.
              Hanya dua yang dinilai bermanfaat <Strong>tinggi</Strong>: latihan soal dan latihan
              berjarak.
            </p>
            <p>
              Membaca ulang dan menstabilo, dua kebiasaan belajar yang paling sering dipakai, justru
              dinilai rendah.
            </p>
          </Finding>
        </div>

        <div className="mt-24 grid gap-10 border-t border-hairline pt-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <p className="type-body text-muted-foreground">
            Riset ini membahas kebiasaan dan daya ingat, bukan jaminan lulus, dan hasil tiap orang
            berbeda, seperti rentang 18 sampai 254 hari tadi. Tapi tes seleksi menguji apa yang
            masih kamu ingat di hari H, dan di situ sedikit setiap hari yang bertahan.
          </p>
          <div>
            <h3 className="text-[15px] font-semibold">Sumber</h3>
            <ol className="mt-3 space-y-3 text-[13px] leading-[1.5] text-muted-foreground">
              {SOURCES.map((s) => (
                <li key={s.id} id={s.id} className="scroll-mt-24">
                  {s.text}{" "}
                  <a
                    href={`https://doi.org/${s.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-link hover:underline"
                  >
                    doi:{s.doi}
                    <ArrowUpRight aria-hidden className="h-3 w-3" />
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function Strong({ children }: { children: React.ReactNode }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

function Finding({
  title,
  children,
  use,
  source,
  figure,
  flip = false,
}: {
  title: string;
  children: React.ReactNode;
  use: string;
  source: (typeof SOURCES)[number];
  figure: React.ReactNode;
  flip?: boolean;
}) {
  return (
    <article className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
      <div className={cn(flip && "lg:order-2")}>
        <h3 className="max-w-[20ch] font-display text-[clamp(1.625rem,1.25rem+1.1vw,2.125rem)] font-bold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h3>
        <div className="type-body mt-5 max-w-[34rem] space-y-3 text-muted-foreground">
          {children}
        </div>
        <a
          href={`#${source.id}`}
          className="mt-3 inline-block text-[13px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
        >
          Sumber: {source.short}
        </a>
        <p className="mt-6 flex max-w-[34rem] gap-3 text-[15px] leading-[1.5] text-foreground/90">
          <AppIcon size={22} className="mt-px h-[22px] w-[22px] self-start" />
          <span>
            <span className="font-semibold text-foreground">Di lulustes: </span>
            {use}
          </span>
        </p>
      </div>
      <div className={cn(flip && "lg:order-1")}>{figure}</div>
    </article>
  );
}

function FigurePanel({
  caption,
  legend,
  table,
  children,
}: {
  caption: React.ReactNode;
  legend?: React.ReactNode;
  table: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="reveal-on-scroll rounded-[28px] bg-card p-5 sm:p-7">
      {legend}
      {children}
      <figcaption className="mt-4 text-[13px] leading-[1.5] text-muted-foreground">
        {caption}
      </figcaption>
      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-[13px] font-medium text-link [&::-webkit-details-marker]:hidden">
          Lihat angkanya
          <ChevronDown
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="mt-3 overflow-x-auto">{table}</div>
      </details>
    </figure>
  );
}

function Tooltip({
  leftPct,
  align,
  title,
  rows,
}: {
  leftPct: number;
  align: "start" | "center" | "end";
  title: string;
  rows: { key: "accent" | "muted"; value: string; label: string; shape: "line" | "rect" }[];
}) {
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none absolute top-1 z-10 min-w-36 rounded-xl bg-secondary px-3 py-2.5 shadow-[var(--shadow-float)]",
        align === "center" && "-translate-x-1/2",
        align === "end" && "-translate-x-full",
      )}
      style={{ left: `${leftPct}%` }}
    >
      <p className="text-[12px] text-muted-foreground">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-[13px]">
            <span
              aria-hidden
              className={cn(
                r.shape === "line" ? "h-0.5 w-3 rounded-full" : "h-2.5 w-2.5 rounded-[3px]",
                r.key === "accent" ? "bg-link" : "bg-chart-muted",
              )}
            />
            <span className="tabular font-semibold text-foreground">{r.value}</span>
            <span className="text-muted-foreground">{r.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const tableClass =
  "w-full min-w-[18rem] text-left text-[13px] [&_td]:py-1.5 [&_th]:py-1.5 [&_tr]:border-t [&_tr]:border-hairline";

/**
 * The width a chart actually renders at, so the SVG is drawn 1:1 and its
 * labels keep their real size on a phone instead of shrinking with a viewBox.
 */
function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.max(260, Math.round(entry.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

// ---------- 1. Habit curve (Lally et al., 2010) ----------

const H = { h: 270, l: 40, r: 14, t: 36, b: 40, maxDay: 260, observed: 84 };
const H_PH = H.h - H.t - H.b;

const HABIT_LINES = [
  { days: 18, name: "Tercepat", accent: false },
  { days: 66, name: "Median", accent: true },
  { days: 254, name: "Terlama", accent: false },
] as const;

/**
 * Share of the plateau reached on `day` by an asymptotic curve (the form the
 * study fitted) that reaches 95% of its plateau on day `days95`.
 */
function automaticity(day: number, days95: number): number {
  return 100 * (1 - Math.pow(0.05, day / days95));
}

const hy = (pct: number) => H.t + (1 - pct / 100) * H_PH;

function HabitFigure() {
  const [ref, w] = useWidth(480);
  const [day, setDay] = useState<number | null>(null);
  const pw = w - H.l - H.r;
  const hx = (d: number) => H.l + (d / H.maxDay) * pw;
  // Muted lines first so the median draws on top.
  const lines = [...HABIT_LINES].sort((a, b) => Number(a.accent) - Number(b.accent));
  const bandW = hx(H.observed) - H.l;

  function path(days95: number): string {
    const pts: string[] = [];
    for (let d = 0; d <= H.maxDay; d += 2) {
      pts.push(`${hx(d).toFixed(1)},${hy(automaticity(d, days95)).toFixed(1)}`);
    }
    return `M${pts.join("L")}`;
  }

  function fromPointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setDay(Math.max(0, Math.min(H.maxDay, Math.round(((x - H.l) / pw) * H.maxDay))));
  }

  function onKey(e: React.KeyboardEvent<SVGSVGElement>) {
    const step = e.shiftKey ? 20 : 5;
    if (e.key === "ArrowRight") setDay((d) => Math.min(H.maxDay, (d ?? 66) + step));
    else if (e.key === "ArrowLeft") setDay((d) => Math.max(0, (d ?? 66) - step));
    else return;
    e.preventDefault();
  }

  return (
    <FigurePanel
      legend={
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 rounded-full bg-link" /> Peserta median
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-0.5 w-4 rounded-full bg-chart-muted" /> Tercepat dan
            terlama
          </li>
        </ul>
      }
      caption={
        <>
          Ilustrasi model kurva yang dipakai Lally dkk., dalam % dari puncak: tiap garis mencapai
          95% puncaknya pada hari ke-18, ke-66, dan ke-254. Area terang adalah 84 hari yang
          benar-benar diamati; sisanya perkiraan model.
        </>
      }
      table={
        <table className={tableClass}>
          <caption className="sr-only">Hari untuk mencapai 95% puncak kebiasaan</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="font-medium">
                Peserta
              </th>
              <th scope="col" className="text-right font-medium">
                Hari sampai 95% puncak
              </th>
            </tr>
          </thead>
          <tbody>
            {HABIT_LINES.map((l) => (
              <tr key={l.name}>
                <th scope="row" className="font-medium">
                  {l.name}
                </th>
                <td className="tabular text-right">
                  {l.days}
                  {l.days > H.observed ? " (perkiraan model)" : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={H.h}
          viewBox={`0 0 ${w} ${H.h}`}
          className="block touch-pan-y select-none outline-none focus-visible:rounded-xl focus-visible:shadow-[0_0_0_3px_var(--color-ring)]"
          role="img"
          aria-label="Kurva otomatisitas kebiasaan: naik cepat lalu melandai. Peserta median mencapai 95% puncak pada hari ke-66, tercepat hari ke-18, terlama hari ke-254. Tekan panah kiri atau kanan untuk membaca nilainya."
          tabIndex={0}
          onPointerMove={fromPointer}
          onPointerDown={fromPointer}
          onPointerLeave={() => setDay(null)}
          onFocus={() => setDay((d) => d ?? 66)}
          onBlur={() => setDay(null)}
          onKeyDown={onKey}
        >
          <rect x={H.l} y={H.t} width={bandW} height={H_PH} className="fill-foreground/[0.05]" />
          <text
            x={H.l + bandW / 2}
            y={H.t + H_PH - 10}
            textAnchor="middle"
            className="fill-muted-foreground text-[11px]"
          >
            {bandW >= 100 ? "84 hari diamati" : "diamati"}
          </text>

          {[0, 50, 95].map((p) => (
            <g key={p}>
              <line
                x1={H.l}
                x2={w - H.r}
                y1={hy(p)}
                y2={hy(p)}
                className="stroke-hairline"
                strokeWidth={1}
              />
              <text
                x={H.l - 8}
                y={hy(p) + 4}
                textAnchor="end"
                className="tabular fill-muted-foreground text-[11px]"
              >
                {p}%
              </text>
            </g>
          ))}
          {[0, 50, 100, 150, 200, 250].map((d) => (
            <text
              key={d}
              x={hx(d)}
              y={H.h - H.b + 18}
              textAnchor="middle"
              className="tabular fill-muted-foreground text-[11px]"
            >
              {d}
            </text>
          ))}
          <text
            x={w - H.r}
            y={H.h - 4}
            textAnchor="end"
            className="fill-muted-foreground text-[11px]"
          >
            hari ke-
          </text>

          {lines.map((l) => (
            <path
              key={l.name}
              d={path(l.days)}
              fill="none"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className={l.accent ? "stroke-link" : "stroke-chart-muted"}
            />
          ))}
          {HABIT_LINES.map((l) => {
            // Fastest label leans left and the others right, so they never meet.
            const anchor = l.days === 18 ? "end" : l.days > 200 ? "end" : "start";
            const dx = l.days === 18 ? 6 : l.days > 200 ? 4 : -6;
            return (
              <g key={l.name}>
                <circle
                  cx={hx(l.days)}
                  cy={hy(95)}
                  r={5}
                  strokeWidth={2}
                  className={cn("stroke-card", l.accent ? "fill-link" : "fill-chart-muted")}
                />
                <text
                  x={hx(l.days) + dx}
                  y={H.t - 14}
                  textAnchor={anchor}
                  className={cn(
                    "tabular text-[12px]",
                    l.accent ? "fill-foreground font-semibold" : "fill-muted-foreground",
                  )}
                >
                  {l.days} hari
                </text>
              </g>
            );
          })}

          {day !== null ? (
            <g>
              <line
                x1={hx(day)}
                x2={hx(day)}
                y1={H.t}
                y2={H.t + H_PH}
                className="stroke-foreground/40"
                strokeWidth={1}
              />
              {lines.map((l) => (
                <circle
                  key={l.name}
                  cx={hx(day)}
                  cy={hy(automaticity(day, l.days))}
                  r={4}
                  strokeWidth={2}
                  className={cn("stroke-card", l.accent ? "fill-link" : "fill-chart-muted")}
                />
              ))}
            </g>
          ) : null}
        </svg>
        {day !== null ? (
          <Tooltip
            leftPct={(hx(day) / w) * 100}
            align={hx(day) < 110 ? "start" : hx(day) > w - 110 ? "end" : "center"}
            title={`Hari ke-${day} · % dari puncak`}
            rows={HABIT_LINES.map((l) => ({
              key: l.accent ? "accent" : "muted",
              value: `${Math.round(automaticity(day, l.days))}%`,
              label: l.name.toLowerCase(),
              shape: "line",
            }))}
          />
        ) : null}
      </div>
    </FigurePanel>
  );
}

// ---------- 2. Retention (Roediger & Karpicke, 2006, Experiment 1) ----------

const RETENTION = [
  { interval: "5 menit", reread: 81, tested: 75 },
  { interval: "2 hari", reread: 54, tested: 68 },
  { interval: "1 minggu", reread: 42, tested: 56 },
] as const;

const R = { h: 270, l: 40, r: 8, t: 28, b: 36, bar: 24 };
const R_PH = R.h - R.t - R.b;
const ry = (pct: number) => R.t + (1 - pct / 100) * R_PH;

/** A column rounded at its data end and square on the baseline. */
function columnPath(x: number, value: number): string {
  const top = ry(value);
  const base = ry(0);
  const r = 4;
  const w = R.bar;
  return `M${x},${base}V${top + r}Q${x},${top} ${x + r},${top}H${x + w - r}Q${x + w},${top} ${x + w},${top + r}V${base}Z`;
}

function RetentionFigure() {
  const [ref, w] = useWidth(480);
  const [active, setActive] = useState<number | null>(null);
  const band = (w - R.l - R.r) / RETENTION.length;
  const groupX = (i: number) => R.l + band * (i + 0.5);

  return (
    <FigurePanel
      legend={
        <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[13px] text-muted-foreground">
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-[3px] bg-chart-muted" /> Membaca ulang
          </li>
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-[3px] bg-link" /> Langsung diuji
          </li>
        </ul>
      }
      caption={
        <>
          Rata-rata isi teks yang masih diingat pada tes akhir, Eksperimen 1 (120 mahasiswa),
          Roediger &amp; Karpicke (2006).
        </>
      }
      table={
        <table className={tableClass}>
          <caption className="sr-only">Isi teks yang masih diingat</caption>
          <thead>
            <tr className="text-muted-foreground">
              <th scope="col" className="font-medium">
                Tes akhir setelah
              </th>
              <th scope="col" className="text-right font-medium">
                Membaca ulang
              </th>
              <th scope="col" className="text-right font-medium">
                Langsung diuji
              </th>
            </tr>
          </thead>
          <tbody>
            {RETENTION.map((r) => (
              <tr key={r.interval}>
                <th scope="row" className="font-medium">
                  {r.interval}
                </th>
                <td className="tabular text-right">{r.reread}%</td>
                <td className="tabular text-right">{r.tested}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={R.h}
          viewBox={`0 0 ${w} ${R.h}`}
          className="block select-none"
          role="img"
          aria-label="Setelah 5 menit, membaca ulang 81% dan langsung diuji 75%. Setelah 2 hari, 54% dan 68%. Setelah 1 minggu, 42% dan 56%."
          onPointerLeave={() => setActive(null)}
        >
          {[0, 25, 50, 75, 100].map((p) => (
            <g key={p}>
              <line
                x1={R.l}
                x2={w - R.r}
                y1={ry(p)}
                y2={ry(p)}
                className="stroke-hairline"
                strokeWidth={1}
              />
              <text
                x={R.l - 8}
                y={ry(p) + 4}
                textAnchor="end"
                className="tabular fill-muted-foreground text-[11px]"
              >
                {p}%
              </text>
            </g>
          ))}

          {RETENTION.map((r, i) => {
            const cx = groupX(i);
            const dim = active !== null && active !== i;
            const bars = [
              { x: cx - 1 - R.bar, value: r.reread, accent: false },
              { x: cx + 1, value: r.tested, accent: true },
            ];
            return (
              <g key={r.interval}>
                <g className="transition-opacity duration-200" opacity={dim ? 0.4 : 1}>
                  {bars.map((b) => (
                    <g key={String(b.accent)}>
                      <path
                        d={columnPath(b.x, b.value)}
                        className={b.accent ? "fill-link" : "fill-chart-muted"}
                      />
                      <text
                        x={b.x + R.bar / 2}
                        y={ry(b.value) - 7}
                        textAnchor="middle"
                        className={cn(
                          "tabular text-[12px]",
                          b.accent ? "fill-foreground font-semibold" : "fill-muted-foreground",
                        )}
                      >
                        {b.value}%
                      </text>
                    </g>
                  ))}
                  <text
                    x={cx}
                    y={R.h - R.b + 20}
                    textAnchor="middle"
                    className="fill-muted-foreground text-[12px]"
                  >
                    {r.interval}
                  </text>
                </g>
                {/* The whole band is the hit target, keyboard included. */}
                <rect
                  x={cx - band / 2}
                  y={R.t}
                  width={band}
                  height={R.h - R.t}
                  fill="transparent"
                  tabIndex={0}
                  aria-label={`Setelah ${r.interval}: langsung diuji ${r.tested}%, membaca ulang ${r.reread}%`}
                  className="cursor-default outline-none focus-visible:fill-foreground/[0.06]"
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                />
              </g>
            );
          })}
        </svg>
        {active !== null ? (
          <Tooltip
            leftPct={(groupX(active) / w) * 100}
            align={active === 0 ? "start" : active === RETENTION.length - 1 ? "end" : "center"}
            title={`Tes akhir setelah ${RETENTION[active]!.interval}`}
            rows={[
              {
                key: "accent",
                value: `${RETENTION[active]!.tested}%`,
                label: "langsung diuji",
                shape: "rect",
              },
              {
                key: "muted",
                value: `${RETENTION[active]!.reread}%`,
                label: "membaca ulang",
                shape: "rect",
              },
            ]}
          />
        ) : null}
      </div>
    </FigurePanel>
  );
}

// ---------- 3. Technique ratings (Dunlosky et al., 2013) ----------

const TECHNIQUES = [
  { name: "Latihan soal", en: "practice testing", level: 3, ours: true },
  { name: "Latihan berjarak (dicicil)", en: "distributed practice", level: 3, ours: true },
  { name: "Bertanya “kenapa?”", en: "elaborative interrogation", level: 2, ours: false },
  { name: "Menjelaskan ke diri sendiri", en: "self-explanation", level: 2, ours: false },
  { name: "Mencampur jenis soal", en: "interleaved practice", level: 2, ours: false },
  { name: "Meringkas", en: "summarization", level: 1, ours: false },
  { name: "Menstabilo", en: "highlighting", level: 1, ours: false },
  { name: "Jembatan keledai", en: "keyword mnemonic", level: 1, ours: false },
  { name: "Membayangkan isi bacaan", en: "imagery for text", level: 1, ours: false },
  { name: "Membaca ulang", en: "rereading", level: 1, ours: false },
] as const;

const LEVEL_LABEL = { 1: "Rendah", 2: "Sedang", 3: "Tinggi" } as const;

function TechniquesFigure() {
  return (
    <figure className="reveal-on-scroll rounded-[28px] bg-card p-5 sm:p-7">
      <table className="w-full text-left">
        <caption className="sr-only">
          Tingkat manfaat sepuluh teknik belajar menurut Dunlosky dkk. (2013)
        </caption>
        <thead>
          <tr className="text-[13px] text-muted-foreground">
            <th scope="col" className="pb-2 font-medium">
              Teknik belajar
            </th>
            <th scope="col" className="pb-2 text-right font-medium">
              Manfaat
            </th>
          </tr>
        </thead>
        <tbody>
          {TECHNIQUES.map((t) => (
            <tr key={t.en} className="border-t border-hairline">
              <th scope="row" className="py-2.5 pr-3 align-middle font-normal">
                <span
                  className={cn(
                    "block text-[15px] leading-snug",
                    t.ours ? "font-semibold text-foreground" : "text-foreground/85",
                  )}
                >
                  {t.name}
                </span>
                <span className="block text-[12px] text-muted-foreground">{t.en}</span>
              </th>
              <td className="py-2.5 align-middle">
                <span className="flex items-center justify-end gap-3">
                  <span className="w-12 text-right text-[13px] text-muted-foreground">
                    {LEVEL_LABEL[t.level]}
                  </span>
                  <span aria-hidden className="flex gap-0.5">
                    {[1, 2, 3].map((n) => (
                      <span
                        key={n}
                        className={cn(
                          "h-2 w-6 rounded-full",
                          n > t.level ? "bg-fill" : t.ours ? "bg-link" : "bg-chart-muted",
                        )}
                      />
                    ))}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <figcaption className="mt-4 text-[13px] leading-[1.5] text-muted-foreground">
        Penilaian manfaat sepuluh teknik belajar oleh Dunlosky dkk. (2013). Biru: dua teknik yang
        dijalankan lulustes.
      </figcaption>
    </figure>
  );
}
