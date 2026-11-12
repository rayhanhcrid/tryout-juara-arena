import { ExternalLink, Newspaper, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDay } from "@/lib/format";
import { trackLabel } from "@/lib/tracks";
import type { AdminNews } from "@/lib/admin.functions";

/** The admin's list of selection news, newest first, as participants see it on Berita. */
export function NewsPanel({
  items,
  loading,
  onNew,
  onEdit,
  onDelete,
}: {
  items: AdminNews[];
  loading: boolean;
  onNew: () => void;
  onEdit: (item: AdminNews) => void;
  onDelete: (item: AdminNews) => void;
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="type-title-2">Berita</h1>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Setiap berita membuka sumber aslinya. Muat hanya dari sumber resmi.
          </p>
        </div>
        <Button onClick={onNew}>
          <Plus /> Berita baru
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center">
            <Newspaper className="h-8 w-8 text-tertiary" />
            <p className="type-headline mt-3">Belum ada berita</p>
            <p className="type-callout mt-1 max-w-sm text-muted-foreground">
              Muat pengumuman seleksi CPNS, BUMN, atau ODP. Peserta melihatnya di menu Berita dan di
              halaman Hari ini.
            </p>
            <Button className="mt-5" onClick={onNew}>
              <Plus /> Muat berita pertama
            </Button>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]">
            {items.map((n, i) => (
              <li key={n.id} className="relative flex gap-4 px-5 py-4">
                {i > 0 ? (
                  <span aria-hidden className="absolute inset-x-0 top-0 ml-5 h-px bg-hairline" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="tabular text-[12px] text-muted-foreground">
                    {formatDay(n.published_on, "short")} · {trackLabel(n.track)}
                  </p>
                  <p className="mt-0.5 text-[16px] font-semibold tracking-[-0.016em]">{n.title}</p>
                  {n.summary ? (
                    <p className="type-callout mt-0.5 line-clamp-2 text-muted-foreground">
                      {n.summary}
                    </p>
                  ) : null}
                  <a
                    href={n.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1 text-[13px] text-link hover:underline"
                  >
                    {n.source_name} <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="-mr-1 flex shrink-0 flex-col gap-0.5">
                  <button
                    type="button"
                    aria-label={`Edit ${n.title}`}
                    title="Edit berita"
                    onClick={() => onEdit(n)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-fill hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Hapus ${n.title}`}
                    title="Hapus berita"
                    onClick={() => onDelete(n)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-destructive-ink transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
