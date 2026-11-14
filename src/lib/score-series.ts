/** Geometry helpers for the profile's day-by-day score chart. */

/** Runs of consecutive done days (indexes), each drawn as one line. */
export function runsOf(points: { pct: number | null }[]): number[][] {
  const runs: number[][] = [];
  let run: number[] = [];
  points.forEach((p, i) => {
    if (p.pct === null) {
      if (run.length) runs.push(run);
      run = [];
    } else run.push(i);
  });
  if (run.length) runs.push(run);
  return runs;
}

/** Which date labels fit under the plot: every k-th, always the latest. */
export function labelIndexes(count: number, plotWidth: number, minGap = 56): Set<number> {
  const fit = Math.max(2, Math.floor(plotWidth / minGap));
  const step = Math.max(1, Math.ceil(count / fit));
  const keep = new Set<number>();
  for (let i = count - 1; i >= 0; i -= step) keep.add(i);
  return keep;
}
