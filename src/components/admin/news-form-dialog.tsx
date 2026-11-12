import { useEffect, useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { todayWib } from "@/lib/format";
import { TRACKS, trackLabel, type Track } from "@/lib/tracks";

export type NewsFormValues = {
  title: string;
  summary: string;
  source_name: string;
  source_url: string;
  track: Track;
  published_on: string;
};

const TRACK_OPTIONS = TRACKS.map((t) => ({ value: t, label: trackLabel(t) }));

/** One news item: a headline, a short summary, and the official page it points to. */
export function NewsFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing. */
  initial: NewsFormValues | null;
  onSave: (values: NewsFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState<NewsFormValues>(blank());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setValues(initial ?? blank());
    setError(null);
  }, [open, initial]);

  const set = (patch: Partial<NewsFormValues>) => setValues((v) => ({ ...v, ...patch }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!values.title.trim()) return setError("Judul berita wajib diisi.");
    if (!/^https?:\/\/\S+\.\S+/.test(values.source_url.trim())) {
      return setError("Isi tautan sumber lengkap, diawali https://.");
    }
    setSaving(true);
    setError(null);
    try {
      await onSave(values);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan berita.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit berita" : "Berita baru"}</DialogTitle>
          <DialogDescription>
            Peserta membaca judul dan ringkasannya, lalu membuka sumber aslinya.
          </DialogDescription>
        </DialogHeader>
        <form
          id="news-form"
          onSubmit={handleSubmit}
          className="max-h-[65dvh] space-y-5 overflow-y-auto px-0.5"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="news-title">Judul</Label>
            <Input
              id="news-title"
              value={values.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="misal: Jadwal seleksi kompetensi dasar diumumkan"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-summary">Ringkasan</Label>
            <Textarea
              id="news-summary"
              value={values.summary}
              onChange={(e) => set({ summary: e.target.value })}
              placeholder="Satu atau dua kalimat: apa yang diumumkan dan untuk siapa."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="news-url">Tautan sumber</Label>
            <Input
              id="news-url"
              type="url"
              inputMode="url"
              value={values.source_url}
              onChange={(e) => set({ source_url: e.target.value })}
              placeholder="https://"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="news-source">Nama sumber (opsional)</Label>
              <Input
                id="news-source"
                value={values.source_name}
                onChange={(e) => set({ source_name: e.target.value })}
                placeholder="misal: BKN"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="news-date">Tanggal</Label>
              <Input
                id="news-date"
                type="date"
                value={values.published_on}
                onChange={(e) => set({ published_on: e.target.value })}
                className="w-auto"
              />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium leading-none">Jalur</p>
            <SegmentedControl
              value={values.track}
              onChange={(track) => set({ track })}
              options={TRACK_OPTIONS}
              ariaLabel="Jalur berita"
            />
          </div>
          {error ? (
            <p role="alert" className="text-[13px] text-destructive-ink">
              {error}
            </p>
          ) : null}
        </form>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>
            Batal
          </Button>
          <Button type="submit" form="news-form" disabled={saving}>
            {saving ? "Menyimpan…" : initial ? "Simpan" : "Muat berita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function blank(): NewsFormValues {
  return {
    title: "",
    summary: "",
    source_name: "",
    source_url: "",
    track: "cpns",
    published_on: todayWib(),
  };
}
