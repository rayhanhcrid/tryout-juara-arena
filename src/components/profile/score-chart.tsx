import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatDay, percent } from "@/lib/format";
import { labelIndexes, runsOf } from "@/lib/score-series";
import { cn } from "@/lib/utils";
import type { ProfileDay } from "@/lib/participant-api";

/**
 * Score per package day: the first attempt's % benar, one point per daily
 * package, a gap where a package was not done. One series, so no legend; the
 * section title names it. Drawn 1:1 at the measured width so labels keep
 * their real size on a phone (as the landing charts do).
 */

const C = { h: 240, l: 40, r: 14, t: 30, b: 34 };
const PH = C.h - C.t - C.b;
const y = (pct: number) => C.t + (1 - pct / 100) * PH;

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

type Point = ProfileDay & { pct: number | null };

/** Above the point, unless the day before sits higher; then below, room permitting. */
function latestLabelY(points: Point[], i: number): number {
  const pct = points[i]!.pct!;
  const prev = points[i - 1]?.pct ?? null;
  const below = prev !== null && prev > pct && pct > 12;
  return below ? y(pct) + 20 : y(pct) - 12;
}

export function ScoreChart({ days }: { days: ProfileDay[] }) {
  const [ref, w] = useWidth(640);
  const [active, setActive] = useState<number | null>(null);

  const points: Point[] = days.map((d) => ({
    ...d,
    pct: d.score !== null && d.total ? percent(d.score, d.total) : null,
  }));
  const n = points.length;
  const pw = w - C.l - C.r;
  const band = pw / Math.max(1, n);
  const x = (i: number) => C.l + band * (i + 0.5);
  const runs = runsOf(points);
  const labels = labelIndexes(n, pw);
  const lastDone = points.reduce<number | null>((acc, p, i) => (p.pct !== null ? i : acc), null);

  function onKey(e: React.KeyboardEvent<SVGSVGElement>) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const from = active ?? lastDone ?? n - 1;
    setActive(Math.max(0, Math.min(n - 1, from + (e.key === "ArrowRight" ? 1 : -1))));
  }

  const done = points.filter((p) => p.pct !== null).length;
  const summary =
    done === 0
      ? "Belum ada paket harian yang dikerjakan."
      : `Skor ${done} paket harian. Terakhir ${points[lastDone!]!.pct}% benar pada ${formatDay(points[lastDone!]!.date, "long")}. Tekan panah kiri atau kanan untuk membaca tiap hari.`;

  const a = active !== null ? points[active] : null;

  return (
    <figure className="surface p-5 sm:p-7">
      <div ref={ref} className="relative">
        <svg
          width="100%"
          height={C.h}
          viewBox={`0 0 ${w} ${C.h}`}
          role="img"
          aria-label={summary}
          tabIndex={0}
          className="block touch-pan-y select-none outline-none focus-visible:rounded-xl focus-visible:shadow-[0_0_0_3px_var(--color-ring)]"
          onPointerLeave={() => setActive(null)}
          onFocus={() => setActive((i) => i ?? lastDone ?? n - 1)}
          onBlur={() => setActive(null)}
          onKeyDown={onKey}
        >
          {[0, 50, 100].map((p) => (
            <g key={p}>
              <line
                x1={C.l}
                x2={w - C.r}
                y1={y(p)}
                y2={y(p)}
                className="stroke-hairline"
                strokeWidth={1}
              />
              <text
                x={C.l - 8}
                y={y(p) + 4}
                textAnchor="end"
                className="tabular fill-muted-foreground text-[11px]"
              >
                {p}%
              </text>
            </g>
          ))}

          {points.map((p, i) =>
            labels.has(i) ? (
              <text
                key={p.date}
                x={x(i)}
                y={C.h - C.b + 20}
                textAnchor={n > 1 && i === n - 1 && band < 56 ? "end" : "middle"}
                className={cn(
                  "tabular text-[11px]",
                  i === active ? "fill-foreground" : "fill-muted-foreground",
                )}
              >
                {formatDay(p.date, "short")}
              </text>
            ) : null,
          )}

          {active !== null ? (
            <line
              x1={x(active)}
              x2={x(active)}
              y1={C.t}
              y2={C.t + PH}
              className="stroke-foreground/30"
              strokeWidth={1}
            />
          ) : null}

          {runs
            .filter((r) => r.length > 1)
            .map((r) => (
              <path
                key={r[0]}
                d={`M${r.map((i) => `${x(i).toFixed(1)},${y(points[i]!.pct!).toFixed(1)}`).join("L")}`}
                fill="none"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="stroke-link"
              />
            ))}

          {points.map((p, i) =>
            p.pct !== null ? (
              <circle
                key={p.date}
                cx={x(i)}
                cy={y(p.pct)}
                r={i === active ? 5 : 4}
                strokeWidth={2}
                className="fill-link stroke-card"
              />
            ) : null,
          )}

          {/* One direct label: the latest score, on the side away from the incoming line. */}
          {lastDone !== null && active === null ? (
            <text
              x={x(lastDone) > w - 40 ? x(lastDone) + 6 : x(lastDone)}
              y={latestLabelY(points, lastDone)}
              textAnchor={
                x(lastDone) > w - 40 ? "end" : x(lastDone) < C.l + 30 ? "start" : "middle"
              }
              className="tabular fill-foreground text-[12px] font-semibold"
            >
              {points[lastDone]!.pct}%
            </text>
          ) : null}

          {/* Each day's whole column is the hit target. */}
          {points.map((p, i) => (
            <rect
              key={p.date}
              x={x(i) - band / 2}
              y={C.t - 10}
              width={band}
              height={PH + 10}
              fill="transparent"
              onPointerEnter={() => setActive(i)}
              onPointerDown={() => setActive(i)}
            />
          ))}
        </svg>

        {a ? (
          <div
            role="status"
            className={cn(
              "pointer-events-none absolute top-0 z-10 min-w-40 max-w-60 rounded-xl bg-secondary px-3 py-2.5 shadow-[var(--shadow-float)]",
              x(active!) < 120
                ? ""
                : x(active!) > w - 120
                  ? "-translate-x-full"
                  : "-translate-x-1/2",
            )}
            style={{ left: `${(x(active!) / w) * 100}%` }}
          >
            <p className="text-[12px] text-muted-foreground">{formatDay(a.date, "long")}</p>
            <p className="mt-0.5 truncate text-[13px] font-medium">{a.title}</p>
            {a.pct !== null ? (
              <p className="mt-1.5 flex items-center gap-2 text-[13px]">
                <span aria-hidden className="h-0.5 w-3 rounded-full bg-link" />
                <span className="tabular font-semibold">{a.pct}%</span>
                <span className="tabular text-muted-foreground">
                  {a.score}/{a.total} benar
                </span>
              </p>
            ) : (
              <p className="mt-1.5 text-[13px] text-muted-foreground">Tidak dikerjakan</p>
            )}
            {a.pct !== null && !a.onTime ? (
              <p className="mt-1 text-[12px] text-muted-foreground">
                Dikirim di hari lain, tidak menambah hari beruntun.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <figcaption className="mt-4 text-[13px] leading-[1.5] text-muted-foreground">
        % benar pada percobaan pertama tiap paket harian, yang juga dihitung papan peringkat. Paket
        yang tidak dikerjakan dibiarkan kosong.
      </figcaption>

      <details className="group mt-3">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-md text-[13px] font-medium text-link [&::-webkit-details-marker]:hidden">
          Lihat angkanya
          <ChevronDown
            aria-hidden
            className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180"
          />
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[18rem] text-left text-[13px] [&_td]:py-1.5 [&_th]:py-1.5 [&_tr]:border-t [&_tr]:border-hairline">
            <caption className="sr-only">Skor percobaan pertama tiap paket harian</caption>
            <thead>
              <tr className="text-muted-foreground">
                <th scope="col" className="font-medium">
                  Tanggal
                </th>
                <th scope="col" className="font-medium">
                  Paket
                </th>
                <th scope="col" className="text-right font-medium">
                  Skor
                </th>
              </tr>
            </thead>
            <tbody>
              {[...points].reverse().map((p) => (
                <tr key={p.date}>
                  <th scope="row" className="tabular whitespace-nowrap pr-3 font-medium">
                    {formatDay(p.date, "short")}
                  </th>
                  <td className="pr-3">{p.title}</td>
                  <td className="tabular whitespace-nowrap text-right">
                    {p.pct !== null ? `${p.score}/${p.total} · ${p.pct}%` : "–"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
