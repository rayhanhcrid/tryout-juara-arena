/**
 * The selection a package or a news item is for, stored as `track` on exams
 * and news. drizzle/migrations/0006_lulustes_daily.sql checks the same set.
 */
export const TRACKS = ["cpns", "bumn", "odp", "umum"] as const;
export type Track = (typeof TRACKS)[number];

const LABELS: Record<Track, string> = {
  cpns: "CPNS",
  bumn: "BUMN",
  odp: "ODP",
  umum: "Umum",
};

export function isTrack(value: unknown): value is Track {
  return typeof value === "string" && (TRACKS as readonly string[]).includes(value);
}

/** Whatever the database sent, as a track; anything unknown is "umum". */
export function toTrack(value: unknown): Track {
  return isTrack(value) ? value : "umum";
}

export function trackLabel(track: Track): string {
  return LABELS[track];
}

export type TrackFilter = "semua" | Exclude<Track, "umum">;

/** Filter tabs on Latihan and Berita. "Umum" items only show under Semua. */
export const TRACK_FILTERS: readonly { value: TrackFilter; label: string }[] = [
  { value: "semua", label: "Semua" },
  { value: "cpns", label: "CPNS" },
  { value: "bumn", label: "BUMN" },
  { value: "odp", label: "ODP" },
];

export function isTrackFilter(value: unknown): value is TrackFilter {
  return TRACK_FILTERS.some((f) => f.value === value);
}

export function matchesTrack(track: Track, filter: TrackFilter): boolean {
  return filter === "semua" || track === filter;
}
