import { Check, ImagePlus, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { SegmentedControl } from "@/components/segmented-control";
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
import {
  CATEGORY_LIMITS,
  CATEGORY_PRESETS,
  LETTERS,
  OPTION_LIMITS,
  STATEMENT_LIMITS,
  validateQuestion,
  type AnswerKey,
  type QuestionKind,
  type ValidQuestion,
} from "@/lib/question-kinds";
import { cn } from "@/lib/utils";

export type QuestionDraft = {
  kind: QuestionKind;
  text: string;
  options: string[];
  categories: string[] | null;
  answer: AnswerKey;
};

export type QuestionSavePayload = ValidQuestion & {
  imageBase64: string | null;
  imageName: string | null;
  removeImage: boolean;
};

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;

const KIND_OPTIONS = [
  { value: "single", label: "Pilihan ganda" },
  { value: "multiple", label: "PG kompleks" },
  { value: "category", label: "Kategori" },
] as const;

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

/**
 * The editor keeps every form's parts side by side, so switching the form
 * back and forth never throws away what was typed.
 */
type Work = {
  kind: QuestionKind;
  text: string;
  choices: string[];
  singleKey: string;
  multiKeys: string[];
  statements: string[];
  categories: string[];
  rowKeys: (number | null)[];
};

function workFrom(initial: QuestionDraft | null): Work {
  const base: Work = {
    kind: "single",
    text: "",
    choices: ["", "", "", ""],
    singleKey: "",
    multiKeys: [],
    statements: ["", "", ""],
    categories: [...(CATEGORY_PRESETS[0] ?? ["Benar", "Salah"])],
    rowKeys: [null, null, null],
  };
  if (!initial) return base;
  const keys = Array.isArray(initial.answer) ? initial.answer : [];
  if (initial.kind === "category") {
    return {
      ...base,
      kind: "category",
      text: initial.text,
      statements: initial.options,
      categories: initial.categories ?? base.categories,
      rowKeys: initial.options.map((_, i) => (typeof keys[i] === "number" ? keys[i] : null)),
    };
  }
  return {
    ...base,
    kind: initial.kind,
    text: initial.text,
    choices: initial.options,
    singleKey: typeof initial.answer === "string" ? initial.answer : "",
    multiKeys: keys.filter((k): k is string => typeof k === "string"),
  };
}

function toInput(work: Work) {
  if (work.kind === "category") {
    return {
      kind: work.kind,
      text: work.text,
      options: work.statements,
      categories: work.categories,
      answer: work.rowKeys,
    };
  }
  return {
    kind: work.kind,
    text: work.text,
    options: work.choices,
    categories: null,
    answer: work.kind === "single" ? work.singleKey : work.multiKeys,
  };
}

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
  const [work, setWork] = useState<Work>(() => workFrom(null));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<"text" | "answers" | "image" | "form", string>>
  >({});
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setWork(workFrom(initial));
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

  const set = (patch: Partial<Work>) => setWork((w) => ({ ...w, ...patch }));

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
    let valid: ValidQuestion;
    try {
      valid = validateQuestion(toInput(work));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Periksa lagi isian soal.";
      setErrors(work.text.trim() ? { answers: message } : { text: message });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      await onSave({
        ...valid,
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
            <p className="text-[13px] font-semibold text-muted-foreground">Bentuk soal</p>
            <SegmentedControl
              value={work.kind}
              onChange={(kind) => {
                set({ kind });
                setErrors(({ answers: _cleared, ...rest }) => rest);
              }}
              options={KIND_OPTIONS}
              ariaLabel="Bentuk soal"
            />
            <p className="text-[13px] text-muted-foreground">
              {work.kind === "single"
                ? "Satu jawaban benar, 2–6 opsi."
                : work.kind === "multiple"
                  ? "Jawaban benar lebih dari satu; peserta harus mencentang semuanya."
                  : "Setiap pernyataan dijawab dengan satu kategori, misal Benar atau Salah."}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="q-text" className="text-[13px] font-semibold text-muted-foreground">
              Pertanyaan
            </label>
            <Textarea
              id="q-text"
              value={work.text}
              onChange={(e) => set({ text: e.target.value })}
              placeholder="misal: Hasil dari 12 + 8 × 2 adalah …"
              rows={4}
              aria-invalid={!!errors.text}
              aria-describedby={errors.text ? undefined : "q-text-hint"}
              autoFocus
            />
            {errors.text ? (
              <p className="text-[13px] text-destructive-ink">{errors.text}</p>
            ) : (
              <p id="q-text-hint" className="text-[13px] text-muted-foreground">
                Ada bacaan panjang? Tulis bacaannya, lalu satu baris berisi --- , lalu
                pertanyaannya. Gambar tampil di antara keduanya.
              </p>
            )}
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

          {work.kind === "category" ? (
            <CategoryFields work={work} set={set} />
          ) : (
            <ChoiceFields work={work} set={set} />
          )}
          {errors.answers ? (
            <p role="alert" className="-mt-5 text-[13px] text-destructive-ink">
              {errors.answers}
            </p>
          ) : null}
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

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive-ink"
    >
      <X className="h-4 w-4" />
    </button>
  );
}

/** Options for pilihan ganda and kompleks; tapping a letter marks it as (a) key. */
function ChoiceFields({ work, set }: { work: Work; set: (patch: Partial<Work>) => void }) {
  const multiple = work.kind === "multiple";
  const isKey = (l: string) => (multiple ? work.multiKeys.includes(l) : work.singleKey === l);

  function toggleKey(letter: string) {
    if (!multiple) return set({ singleKey: letter });
    const next = work.multiKeys.includes(letter)
      ? work.multiKeys.filter((k) => k !== letter)
      : [...work.multiKeys, letter];
    set({ multiKeys: LETTERS.filter((l) => next.includes(l)) });
  }

  function removeChoice(index: number) {
    const letters = LETTERS.slice(0, work.choices.length);
    // Keys after the removed option shift up one letter, with their text.
    const shift = (l: string): string | null => {
      const i = (letters as readonly string[]).indexOf(l);
      if (i < 0 || i === index) return null;
      return LETTERS[i > index ? i - 1 : i] ?? null;
    };
    set({
      choices: work.choices.filter((_, i) => i !== index),
      singleKey: shift(work.singleKey) ?? "",
      multiKeys: work.multiKeys.map(shift).filter((l): l is string => l !== null),
    });
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-[13px] font-semibold text-muted-foreground">Pilihan jawaban</legend>
      <p className="-mt-1 text-[13px] text-muted-foreground">
        {multiple
          ? "Ketuk huruf untuk menandai setiap kunci jawaban (minimal dua)."
          : "Ketuk huruf untuk menjadikannya kunci jawaban."}
      </p>
      <div
        role={multiple ? "group" : "radiogroup"}
        aria-label="Kunci jawaban"
        className="space-y-2.5"
      >
        {work.choices.map((value, i) => {
          const letter = LETTERS[i]!;
          const key = isKey(letter);
          return (
            <div key={i} className="flex items-center gap-3">
              <button
                type="button"
                role={multiple ? "checkbox" : "radio"}
                aria-checked={key}
                aria-label={`Jadikan ${letter.toUpperCase()} kunci jawaban`}
                onClick={() => toggleKey(letter)}
                className={cn(
                  "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center text-[15px] font-semibold uppercase transition-[background-color,color,transform] duration-200 ease-apple active:scale-90",
                  multiple ? "rounded-[10px]" : "rounded-full",
                  key
                    ? "bg-success text-white"
                    : "bg-fill text-muted-foreground hover:bg-secondary-hover hover:text-foreground",
                )}
              >
                {key ? <Check className="h-5 w-5" strokeWidth={3} /> : letter}
              </button>
              <Input
                value={value}
                onChange={(e) =>
                  set({ choices: work.choices.map((c, j) => (j === i ? e.target.value : c)) })
                }
                placeholder={`Opsi ${letter.toUpperCase()}`}
                aria-label={`Opsi ${letter.toUpperCase()}`}
                className={cn(key && "border-success/60")}
              />
              {work.choices.length > OPTION_LIMITS.min ? (
                <RemoveButton
                  label={`Hapus opsi ${letter.toUpperCase()}`}
                  onClick={() => removeChoice(i)}
                />
              ) : null}
            </div>
          );
        })}
      </div>
      {work.choices.length < OPTION_LIMITS.max ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => set({ choices: [...work.choices, ""] })}
        >
          <Plus /> Tambah opsi {LETTERS[work.choices.length]?.toUpperCase()}
        </Button>
      ) : null}
    </fieldset>
  );
}

/** Categories (with quick presets) and the statements, each with its key category. */
function CategoryFields({ work, set }: { work: Work; set: (patch: Partial<Work>) => void }) {
  const presetIndex = CATEGORY_PRESETS.findIndex(
    (p) => p.length === work.categories.length && p.every((c, i) => c === work.categories[i]),
  );

  function setCategories(categories: string[]) {
    // A key pointing past the end no longer has a category.
    set({
      categories,
      rowKeys: work.rowKeys.map((k) => (k !== null && k < categories.length ? k : null)),
    });
  }

  return (
    <>
      <fieldset className="space-y-3">
        <legend className="text-[13px] font-semibold text-muted-foreground">
          Kategori jawaban
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_PRESETS.map((preset, i) => (
            <button
              key={preset.join("/")}
              type="button"
              aria-pressed={presetIndex === i}
              onClick={() => setCategories([...preset])}
              className={cn(
                "h-8 cursor-pointer rounded-full px-3 text-[13px] font-medium transition-colors",
                presetIndex === i
                  ? "bg-primary text-primary-foreground"
                  : "bg-fill hover:bg-secondary-hover",
              )}
            >
              {preset.join(" / ")}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          {work.categories.map((value, i) => (
            <div key={i} className="flex items-center gap-3">
              <Input
                value={value}
                onChange={(e) =>
                  setCategories(work.categories.map((c, j) => (j === i ? e.target.value : c)))
                }
                placeholder={`Kategori ${i + 1}`}
                aria-label={`Kategori ${i + 1}`}
              />
              {work.categories.length > CATEGORY_LIMITS.min ? (
                <RemoveButton
                  label={`Hapus kategori ${i + 1}`}
                  onClick={() => setCategories(work.categories.filter((_, j) => j !== i))}
                />
              ) : null}
            </div>
          ))}
        </div>
        {work.categories.length < CATEGORY_LIMITS.max ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCategories([...work.categories, ""])}
          >
            <Plus /> Tambah kategori
          </Button>
        ) : null}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-[13px] font-semibold text-muted-foreground">Pernyataan</legend>
        <p className="-mt-1 text-[13px] text-muted-foreground">
          Tulis setiap pernyataan, lalu pilih kategori yang benar sebagai kuncinya.
        </p>
        <ol className="space-y-4">
          {work.statements.map((value, i) => (
            <li key={i} className="space-y-2 rounded-2xl bg-fill/60 p-3">
              <div className="flex items-start gap-3">
                <span className="tabular mt-2.5 w-5 shrink-0 text-[14px] font-semibold text-muted-foreground">
                  {i + 1}.
                </span>
                <Textarea
                  value={value}
                  onChange={(e) =>
                    set({
                      statements: work.statements.map((s, j) => (j === i ? e.target.value : s)),
                    })
                  }
                  rows={2}
                  placeholder={`Pernyataan ${i + 1}`}
                  aria-label={`Pernyataan ${i + 1}`}
                  className="min-h-0 bg-card"
                />
                {work.statements.length > STATEMENT_LIMITS.min ? (
                  <RemoveButton
                    label={`Hapus pernyataan ${i + 1}`}
                    onClick={() =>
                      set({
                        statements: work.statements.filter((_, j) => j !== i),
                        rowKeys: work.rowKeys.filter((_, j) => j !== i),
                      })
                    }
                  />
                ) : null}
              </div>
              <div
                role="radiogroup"
                aria-label={`Kunci pernyataan ${i + 1}`}
                className="flex flex-wrap gap-1.5 pl-8"
              >
                {work.categories.map((category, c) => {
                  const selected = work.rowKeys[i] === c;
                  return (
                    <button
                      key={c}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() =>
                        set({
                          rowKeys: work.statements.map((_, j) =>
                            j === i ? c : (work.rowKeys[j] ?? null),
                          ),
                        })
                      }
                      className={cn(
                        "inline-flex h-8 cursor-pointer items-center gap-1 rounded-full px-3 text-[13px] font-medium transition-colors",
                        selected
                          ? "bg-success text-white"
                          : "bg-card text-foreground hover:bg-secondary-hover",
                      )}
                    >
                      {selected ? (
                        <Check aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : null}
                      {category || `Kategori ${c + 1}`}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ol>
        {work.statements.length < STATEMENT_LIMITS.max ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() =>
              set({ statements: [...work.statements, ""], rowKeys: [...work.rowKeys, null] })
            }
          >
            <Plus /> Tambah pernyataan
          </Button>
        ) : null}
      </fieldset>
    </>
  );
}
