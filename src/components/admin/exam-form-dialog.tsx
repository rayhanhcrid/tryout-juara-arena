import { Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";

export type ExamFormValues = { title: string; description: string; duration_minutes: number };

const PRESETS = [15, 30, 45, 60, 90, 120];

export function ExamFormDialog({
  open,
  onOpenChange,
  initial,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing. */
  initial: ExamFormValues | null;
  onSave: (values: ExamFormValues) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(initial?.title ?? "");
    setDescription(initial?.description ?? "");
    setDuration(initial?.duration_minutes ?? 30);
    setError(null);
  }, [open, initial]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Judul katalog wajib diisi.");
    if (!Number.isFinite(duration) || duration < 1) return setError("Durasi minimal 1 menit.");
    setSaving(true);
    setError(null);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        duration_minutes: duration,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan katalog.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "Edit katalog" : "Katalog baru"}</DialogTitle>
          <DialogDescription>
            Peserta melihat judul, deskripsi, dan durasi sebelum mulai.
          </DialogDescription>
        </DialogHeader>
        <form id="exam-form" onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="exam-title">Judul</Label>
            <Input
              id="exam-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="misal: Try Out Bahasa Inggris"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-desc">Deskripsi</Label>
            <Textarea
              id="exam-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Materi yang diujikan, tingkat kesulitan, atau catatan untuk peserta."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-duration">Durasi</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-11 items-center rounded-xl bg-fill p-1">
                <button
                  type="button"
                  aria-label="Kurangi 5 menit"
                  onClick={() => setDuration((d) => Math.max(1, d - 5))}
                  className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-card"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <input
                  id="exam-duration"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  value={Number.isFinite(duration) ? duration : ""}
                  onChange={(e) => setDuration(Math.round(Number(e.target.value)))}
                  className="tabular h-9 w-16 bg-transparent text-center text-[17px] font-semibold outline-none [appearance:textfield] focus-visible:outline-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                  type="button"
                  aria-label="Tambah 5 menit"
                  onClick={() => setDuration((d) => d + 5)}
                  className="flex h-9 w-10 cursor-pointer items-center justify-center rounded-lg transition-colors hover:bg-card"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="type-callout text-muted-foreground">menit</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(m)}
                  className={cn(
                    "tabular h-7 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors",
                    duration === m
                      ? "bg-primary text-primary-foreground"
                      : "bg-fill hover:bg-secondary-hover",
                  )}
                >
                  {m}
                </button>
              ))}
            </div>
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
          <Button type="submit" form="exam-form" disabled={saving}>
            {saving ? "Menyimpan…" : initial ? "Simpan" : "Buat katalog"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
