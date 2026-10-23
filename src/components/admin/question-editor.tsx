import { Check, ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { OPTION_KEYS, type OptionKey } from "@/components/exam/option-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type QuestionDraft = {
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: OptionKey | "";
};

export type QuestionSavePayload = Omit<QuestionDraft, "correct_option"> & {
  correct_option: OptionKey;
  imageBase64: string | null;
  imageName: string | null;
  removeImage: boolean;
};

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

function readAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

const EMPTY: QuestionDraft = {
  text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_option: "",
};

export function QuestionEditor({
  open,
  onOpenChange,
  examTitle,
  number,
  initial,
  initialImageUrl,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examTitle: string;
  /** Position of the question in the catalog, for the sheet title. */
  number: number;
  initial: QuestionDraft | null;
  initialImageUrl: string | null;
  onSave: (payload: QuestionSavePayload) => Promise<void>;
}) {
  const [draft, setDraft] = useState<QuestionDraft>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"text" | "options" | "key" | "image" | "form", string>>
  >({});
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(initial ?? EMPTY);
    setFile(null);
    setPreview(null);
    setRemoveImage(false);
    setErrors({});
  }, [open, initial]);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function acceptFile(f: File | undefined | null) {
    if (!f) return;
    if (!ACCEPT.includes(f.type)) {
      setErrors((e) => ({ ...e, image: "Format gambar harus PNG, JPG, WEBP, atau GIF." }));
      return;
    }
    if (f.size > MAX_BYTES) {
      setErrors((e) => ({ ...e, image: "Ukuran gambar maksimal 5MB." }));
      return;
    }
    setErrors(({ image: _cleared, ...rest }) => rest);
    setFile(f);
    setRemoveImage(false);
  }

  function clearImage() {
    setFile(null);
    setPreview(null);
    setRemoveImage(true);
    if (fileInput.current) fileInput.current.value = "";
  }

  const shownImage = preview ?? (!removeImage ? initialImageUrl : null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!draft.text.trim()) next.text = "Tulis pertanyaannya dulu.";
    if (OPTION_KEYS.some((k) => !draft[`option_${k}`].trim()))
      next.options = "Keempat opsi jawaban wajib diisi.";
    if (!draft.correct_option) next.key = "Pilih kunci jawaban dengan mengetuk salah satu huruf.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      await onSave({
        text: draft.text,
        option_a: draft.option_a,
        option_b: draft.option_b,
        option_c: draft.option_c,
        option_d: draft.option_d,
        correct_option: draft.correct_option as OptionKey,
        imageBase64: file ? await readAsBase64(file) : null,
        imageName: file ? file.name : null,
        removeImage: removeImage && !file,
      });
      onOpenChange(false);
    } catch (err) {
      setErrors({ form: err instanceof Error ? err.message : "Gagal menyimpan soal." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <SheetContent
        side="right"
        className="flex flex-col gap-0 p-0 sm:max-w-xl"
        onPaste={(e) => {
          const pasted = Array.from(e.clipboardData.files).find((f) => f.type.startsWith("image/"));
          if (pasted) {
            e.preventDefault();
            acceptFile(pasted);
          }
        }}
      >
        <SheetHeader className="border-b border-hairline px-6 pb-4 pt-6">
          <SheetTitle>{initial ? `Edit soal ${number}` : `Soal ${number}`}</SheetTitle>
          <SheetDescription className="truncate">{examTitle}</SheetDescription>
        </SheetHeader>

        <form
          id="question-form"
          onSubmit={handleSubmit}
          noValidate
          className="flex-1 space-y-8 overflow-y-auto px-6 py-6"
        >
          <div className="space-y-2">
            <label htmlFor="q-text" className="text-[13px] font-semibold text-muted-foreground">
              Pertanyaan
            </label>
            <Textarea
              id="q-text"
              value={draft.text}
              onChange={(e) => setDraft({ ...draft, text: e.target.value })}
              placeholder="misal: Hasil dari 12 + 8 × 2 adalah …"
              rows={4}
              aria-invalid={!!errors.text}
              autoFocus
            />
            {errors.text ? <p className="text-[13px] text-destructive-ink">{errors.text}</p> : null}
          </div>

          <div className="space-y-2">
            <p className="text-[13px] font-semibold text-muted-foreground">Gambar (opsional)</p>
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPT.join(",")}
              className="sr-only"
              onChange={(e) => acceptFile(e.target.files?.[0])}
              aria-label="Pilih gambar soal"
            />
            {shownImage ? (
              <div className="overflow-hidden rounded-2xl bg-fill">
                <img
                  src={shownImage}
                  alt="Pratinjau gambar soal"
                  className="max-h-64 w-full object-contain"
                />
                <div className="flex gap-2 border-t border-hairline bg-card p-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => fileInput.current?.click()}
                  >
                    <RefreshCw /> Ganti
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive-ink hover:bg-destructive/10"
                    onClick={clearImage}
                  >
                    <Trash2 /> Hapus gambar
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  acceptFile(e.dataTransfer.files[0]);
                }}
                className={cn(
                  "flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-9 text-center transition-colors",
                  dragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-tertiary hover:bg-accent/60",
                )}
              >
                <ImagePlus className="h-7 w-7 text-primary" />
                <span className="text-[15px] font-medium">
                  Seret gambar ke sini, tempel, atau pilih file
                </span>
                <span className="text-[13px] text-muted-foreground">
                  PNG, JPG, WEBP, atau GIF · maks. 5MB
                </span>
              </button>
            )}
            {errors.image ? (
              <p className="text-[13px] text-destructive-ink">{errors.image}</p>
            ) : null}
          </div>

          <fieldset className="space-y-3">
            <legend className="text-[13px] font-semibold text-muted-foreground">
              Pilihan jawaban
            </legend>
            <p className="-mt-1 text-[13px] text-muted-foreground">
              Ketuk huruf untuk menjadikannya kunci jawaban.
            </p>
            <div role="radiogroup" aria-label="Kunci jawaban" className="space-y-2.5">
              {OPTION_KEYS.map((k) => {
                const isKey = draft.correct_option === k;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isKey}
                      aria-label={`Jadikan ${k.toUpperCase()} kunci jawaban`}
                      onClick={() => setDraft({ ...draft, correct_option: k })}
                      className={cn(
                        "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[15px] font-semibold uppercase transition-[background-color,color,transform] duration-200 ease-apple active:scale-90",
                        isKey
                          ? "bg-success text-white"
                          : "bg-fill text-muted-foreground hover:bg-secondary-hover hover:text-foreground",
                      )}
                    >
                      {isKey ? <Check className="h-5 w-5" strokeWidth={3} /> : k}
                    </button>
                    <Input
                      value={draft[`option_${k}`]}
                      onChange={(e) => setDraft({ ...draft, [`option_${k}`]: e.target.value })}
                      placeholder={`Opsi ${k.toUpperCase()}`}
                      aria-label={`Opsi ${k.toUpperCase()}`}
                      className={cn(isKey && "border-success/60")}
                    />
                  </div>
                );
              })}
            </div>
            {errors.options ? (
              <p className="text-[13px] text-destructive-ink">{errors.options}</p>
            ) : null}
            {errors.key ? <p className="text-[13px] text-destructive-ink">{errors.key}</p> : null}
          </fieldset>
        </form>

        <div className="border-t border-hairline bg-card px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {errors.form ? (
            <p role="alert" className="mb-3 text-[13px] text-destructive-ink">
              {errors.form}
            </p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Batal
            </Button>
            <Button type="submit" form="question-form" disabled={saving}>
              {saving ? "Menyimpan…" : initial ? "Simpan perubahan" : "Simpan soal"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
