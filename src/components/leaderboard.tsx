import { Crown } from "lucide-react";
import { InitialsAvatar } from "@/components/initials-avatar";
import { formatDate, percent } from "@/lib/format";
import { cn } from "@/lib/utils";

export type BoardEntry = {
  rank: number;
  user_id: string;
  nama: string;
  score: number;
  total: number;
  submitted_at: string;
};

const MEDAL = {
  1: { ring: "ring-gold", bg: "bg-gold", height: "h-28 sm:h-32" },
  2: { ring: "ring-silver", bg: "bg-silver", height: "h-20 sm:h-24" },
  3: { ring: "ring-bronze", bg: "bg-bronze", height: "h-14 sm:h-16" },
} as const;

function displayName(e: BoardEntry): string {
  return e.nama || "Peserta";
}

/** Top three on pedestals, ordered 2 · 1 · 3 like a real podium. */
export function Podium({ entries, meId }: { entries: BoardEntry[]; meId?: string | null }) {
  const top = entries.slice(0, 3);
  if (top.length === 0) return null;
  const order = [top[1], top[0], top[2]].filter((e): e is BoardEntry => !!e);

  return (
    <div
      className="flex items-end justify-center gap-3 sm:gap-6"
      role="list"
      aria-label="Tiga besar"
    >
      {order.map((e) => {
        const medal = MEDAL[e.rank as 1 | 2 | 3] ?? MEDAL[3];
        const isMe = meId === e.user_id;
        const first = e.rank === 1;
        return (
          <div
            key={e.user_id}
            role="listitem"
            className="flex w-[30%] max-w-44 flex-col items-center"
          >
            <div className="relative mb-3">
              {first ? (
                <Crown
                  aria-hidden
                  className="absolute -top-6 left-1/2 h-5 w-5 -translate-x-1/2 fill-gold text-gold"
                />
              ) : null}
              <InitialsAvatar
                name={displayName(e)}
                seed={e.user_id}
                size={first ? 76 : 60}
                className={cn("ring-[3px] ring-offset-[3px] ring-offset-card", medal.ring)}
              />
              <span
                className={cn(
                  "absolute -bottom-1.5 left-1/2 flex h-6 min-w-6 -translate-x-1/2 items-center justify-center rounded-full px-1.5 text-[12px] font-bold text-foreground ring-2 ring-card",
                  medal.bg,
                )}
              >
                {e.rank}
              </span>
            </div>
            <p className="w-full truncate text-center text-[15px] font-semibold tracking-[-0.015em]">
              {displayName(e)}
              {isMe ? <span className="sr-only"> (kamu)</span> : null}
            </p>
            <p className="tabular mb-3 text-center text-[13px] text-muted-foreground">
              {e.score}/{e.total} · {percent(e.score, e.total)}%
            </p>
            <div
              className={cn(
                "flex w-full items-start justify-center rounded-t-2xl pt-2",
                isMe ? "bg-primary/12" : "bg-fill",
                medal.height,
              )}
            >
              <span className="font-display text-2xl font-bold tracking-[-0.04em] text-foreground/75">
                {e.rank}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Podium for the top three, then the ranked list. With `limit`, the list stops
 * there and the viewer's own row is pinned below if they fall outside it.
 */
export function Leaderboard({
  entries,
  meId,
  limit,
}: {
  entries: BoardEntry[];
  meId?: string | null;
  limit?: number;
}) {
  const rest = entries.slice(3, limit ?? entries.length);
  const me = meId ? entries.find((e) => e.user_id === meId) : undefined;
  const mePinned = !!me && !!limit && me.rank > limit;
  return (
    <div>
      <div className="overflow-hidden rounded-[28px] bg-card px-3 pt-12 shadow-[var(--shadow-card)] sm:px-10">
        <Podium entries={entries} meId={meId ?? null} />
      </div>
      {rest.length > 0 ? <RankList entries={rest} meId={meId ?? null} className="mt-4" /> : null}
      {mePinned && me ? (
        <>
          <p
            aria-hidden
            className="py-1 text-center text-[20px] leading-none tracking-[0.3em] text-tertiary"
          >
            ···
          </p>
          <RankList entries={[me]} meId={meId ?? null} />
        </>
      ) : null}
    </div>
  );
}

/** Grouped inset list of ranks, iOS Settings style. */
export function RankList({
  entries,
  meId,
  className,
}: {
  entries: BoardEntry[];
  meId?: string | null;
  className?: string;
}) {
  if (entries.length === 0) return null;
  return (
    <ol
      className={cn("overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]", className)}
    >
      {entries.map((e, i) => {
        const isMe = meId === e.user_id;
        return (
          <li
            key={e.user_id}
            className={cn(
              "relative flex items-center gap-3.5 px-4 py-3 sm:px-5",
              isMe && "bg-primary/[0.07]",
            )}
          >
            {i > 0 ? (
              <span
                aria-hidden
                className="absolute inset-x-0 top-0 ml-[4.25rem] h-px bg-hairline"
              />
            ) : null}
            <span className="tabular w-7 shrink-0 text-center text-[15px] font-semibold text-muted-foreground">
              {e.rank}
            </span>
            <InitialsAvatar name={displayName(e)} seed={e.user_id} size={36} />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-[15px] font-semibold tracking-[-0.012em]">
                <span className="truncate">{displayName(e)}</span>
                {isMe ? (
                  <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">
                    Kamu
                  </span>
                ) : null}
              </p>
              <p className="truncate text-[13px] text-muted-foreground">
                {formatDate(e.submitted_at)}
              </p>
            </div>
            <div className="text-right">
              <p className="tabular text-[17px] font-semibold tracking-[-0.02em]">
                {e.score}
                <span className="text-muted-foreground">/{e.total}</span>
              </p>
              <p className="tabular text-[12px] text-muted-foreground">
                {percent(e.score, e.total)}%
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
