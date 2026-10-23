import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Flag,
  LayoutGrid,
  RotateCw,
  Send,
  Timer,
  X,
  ZoomIn,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import { ActivityIndicator } from "@/components/activity-indicator";
import { FieldGroup, FloatingField } from "@/components/form-fields";
import { NavigatorGrid, NavigatorLegend, type CellState } from "@/components/exam/navigator-grid";
import { OPTION_KEYS, OptionRow, type OptionKey } from "@/components/exam/option-row";
import { TimerPill } from "@/components/exam/timer-pill";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  clearSession,
  readSession,
  sessionKeys,
  storageGet,
  storageGetJSON,
  storageSet,
} from "@/lib/exam-session";
import { formatClock, formatDuration } from "@/lib/format";
import { isLongStem, splitQuestionText } from "@/lib/question-format";
import { cn } from "@/lib/utils";

export type RunnerExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
};

export type RunnerQuestion = {
  id: string;
  text: string;
  imageUrl: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

type Phase = "loading" | "intro" | "running" | "submitting" | "failed";

function withViewTransition(update: () => void) {
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!doc.startViewTransition || reduce) {
    update();
    return;
  }
  doc.startViewTransition(() => flushSync(update));
}

export function ExamRunner({
  exam,
  questions,
  ownerId,
  defaultName,
  onSubmit,
  onExit,
}: {
  exam: RunnerExam;
  questions: RunnerQuestion[];
  /** This browser's device id; sessions are stored under it. */
  ownerId: string;
  /** Name last used on this browser, offered in the intro. */
  defaultName: string;
  /** Sends the answers under the participant's name; throws on failure. */
  onSubmit: (answers: Record<string, string>, nama: string) => Promise<void>;
  onExit: () => void;
}) {
  const keys = sessionKeys(ownerId, exam.id);
  const totalMs = exam.duration_minutes * 60_000;

  const [phase, setPhase] = useState<Phase>("loading");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [current, setCurrent] = useState(0);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [remaining, setRemaining] = useState(totalMs);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [nama, setNama] = useState(defaultName);

  const deadlineRef = useRef<number | null>(null);
  const submittingRef = useRef(false);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const namaRef = useRef(nama);
  namaRef.current = nama;

  const submit = useCallback(
    async (reason: "manual" | "timeout" | "expired") => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setConfirmSubmit(false);
      setPhase("submitting");
      if (reason === "timeout") toast.info("Waktu habis! Jawabanmu dikirim otomatis.");
      if (reason === "expired")
        toast.info("Waktu habis saat kamu pergi. Jawabanmu dikirim otomatis.");
      try {
        await onSubmit(answersRef.current, namaRef.current);
        clearSession(keys);
      } catch {
        submittingRef.current = false;
        setPhase("failed");
      }
    },
    // keys is derived from stable ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onSubmit, ownerId, exam.id],
  );

  // Resume an attempt after refresh; send one whose clock ran out meanwhile.
  useEffect(() => {
    const state = readSession(keys, exam.duration_minutes);
    if (state.status === "none") {
      setPhase("intro");
      return;
    }
    const restored = storageGetJSON<Record<string, string>>(keys.answers) ?? {};
    setAnswers(restored);
    const savedName = storageGet(keys.name) || defaultName || "Peserta";
    setNama(savedName);
    namaRef.current = savedName;
    setFlags(storageGetJSON<Record<string, boolean>>(keys.flags) ?? {});
    if (state.status === "running") {
      deadlineRef.current = state.deadline;
      setRemaining(state.deadline - Date.now());
      setPhase("running");
      const count = Object.keys(restored).length;
      toast.info("Ujian dilanjutkan.", {
        id: "exam-resume",
        description:
          count > 0
            ? `${count} jawaban dipulihkan · sisa ${formatClock(state.deadline - Date.now())}`
            : `Timer tetap berjalan · sisa ${formatClock(state.deadline - Date.now())}`,
      });
    } else if (state.hasAnswers) {
      answersRef.current = storageGetJSON<Record<string, string>>(keys.answers) ?? {};
      void submit("expired");
    } else {
      clearSession(keys);
      setPhase("intro");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exam.id, ownerId]);

  // Countdown; auto-submit at zero.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const deadline = deadlineRef.current;
      if (!deadline) return;
      const rem = Math.max(0, deadline - Date.now());
      setRemaining(rem);
      if (rem <= 0) void submit("timeout");
    }, 1000);
    return () => clearInterval(id);
  }, [phase, submit]);

  function start(name: string) {
    const started = Date.now();
    setNama(name);
    namaRef.current = name;
    storageSet(keys.name, name);
    storageSet(keys.start, String(started));
    storageSet(keys.answers, "{}");
    storageSet(keys.flags, "{}");
    deadlineRef.current = started + totalMs;
    withViewTransition(() => {
      setRemaining(totalMs);
      setAnswers({});
      setFlags({});
      setCurrent(0);
      setPhase("running");
    });
  }

  const go = useCallback(
    (index: number) => {
      const next = Math.max(0, Math.min(questions.length - 1, index));
      setDir(next >= current ? "next" : "prev");
      setCurrent(next);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [current, questions.length],
  );

  const q = questions[current];

  const pick = useCallback(
    (letter: OptionKey) => {
      if (!q) return;
      setAnswers((prev) => {
        const next = { ...prev, [q.id]: letter };
        storageSet(keys.answers, JSON.stringify(next));
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [q?.id],
  );

  const toggleFlag = useCallback(() => {
    if (!q) return;
    setFlags((prev) => {
      const next = { ...prev, [q.id]: !prev[q.id] };
      storageSet(keys.flags, JSON.stringify(next));
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);

  // Keyboard: A–D or 1–4 choose, arrows move, R flags.
  useEffect(() => {
    if (phase !== "running" || confirmSubmit || confirmExit || navOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      )
        return;
      const k = e.key.toLowerCase();
      const byNumber = { "1": "a", "2": "b", "3": "c", "4": "d" } as const;
      if (k === "a" || k === "b" || k === "c" || k === "d") pick(k);
      else if (k in byNumber) pick(byNumber[k as keyof typeof byNumber]);
      else if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (k === "r") toggleFlag();
      else return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, confirmSubmit, confirmExit, navOpen, pick, go, toggleFlag, current]);

  const answeredCount = questions.filter((item) => answers[item.id]).length;
  const flaggedCount = questions.filter((item) => flags[item.id]).length;
  const unanswered = questions.length - answeredCount;
  const states: CellState[] = questions.map((item) =>
    flags[item.id] ? "flagged" : answers[item.id] ? "answered" : "empty",
  );

  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ActivityIndicator />
      </div>
    );
  }

  if (phase === "intro") {
    return (
      <ExamIntro
        exam={exam}
        count={questions.length}
        defaultName={nama}
        onStart={start}
        onBack={onExit}
      />
    );
  }

  if (phase === "submitting" || phase === "failed") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <div className="max-w-sm text-center" aria-live="polite">
          {phase === "submitting" ? (
            <>
              <ActivityIndicator size={36} className="mx-auto" />
              <p className="type-title-3 mt-6">Menghitung skor…</p>
              <p className="type-callout mt-2 text-muted-foreground">
                Jangan tutup halaman ini dulu, ya.
              </p>
            </>
          ) : (
            <>
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/12 text-destructive-ink">
                <Send className="h-6 w-6" />
              </span>
              <p className="type-title-3 mt-6">Jawabanmu belum terkirim.</p>
              <p className="type-callout mt-2 text-muted-foreground">
                Sepertinya koneksi terputus. Jawabanmu masih tersimpan di perangkat ini, jadi coba
                kirim lagi.
              </p>
              <Button size="lg" className="mt-8" onClick={() => void submit("manual")}>
                Coba kirim lagi
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  if (!q) return null;
  const isLast = current === questions.length - 1;
  const flagged = !!flags[q.id];

  return (
    <div className="flex min-h-screen flex-col">
      {/* Focus bar */}
      <header className="material-bar sticky top-0 z-30 border-b border-hairline">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            aria-label="Keluar dari ujian"
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-fill text-muted-foreground transition-colors hover:bg-secondary-hover hover:text-foreground"
          >
            <X className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-semibold tracking-[-0.015em]">{exam.title}</p>
            <p className="tabular text-[12px] text-muted-foreground">
              {nama} · Soal {current + 1} dari {questions.length} · {answeredCount} terjawab
            </p>
          </div>
          <TimerPill
            ms={remaining}
            fraction={remaining / totalMs}
            style={{ viewTransitionName: "exam-timer" } as React.CSSProperties}
          />
        </div>
        <div className="h-[3px] bg-fill" aria-hidden>
          <div
            className="h-full bg-primary transition-[width] duration-500 ease-apple"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl flex-1 px-4 pb-32 pt-8 sm:px-6 sm:pt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-12 lg:pb-16">
        <main className="mx-auto w-full max-w-3xl">
          <div
            key={current}
            className={dir === "next" ? "animate-slide-next" : "animate-slide-prev"}
          >
            <QuestionBody text={q.text} imageUrl={q.imageUrl} />

            <div className="mt-8 grid gap-3" role="group" aria-label="Pilihan jawaban">
              {OPTION_KEYS.map((key) => (
                <OptionRow
                  key={key}
                  letter={key}
                  label={q[`option_${key}` as const]}
                  selected={answers[q.id] === key}
                  onSelect={() => pick(key)}
                />
              ))}
            </div>
          </div>

          <div className="mt-10 hidden items-center justify-between gap-3 lg:flex">
            <Button variant="secondary" disabled={current === 0} onClick={() => go(current - 1)}>
              <ChevronLeft /> Sebelumnya
            </Button>
            <Button
              variant="ghost"
              aria-pressed={flagged}
              onClick={toggleFlag}
              className={cn(flagged && "bg-warning/15 text-warning-ink hover:bg-warning/20")}
            >
              <Flag /> {flagged ? "Ditandai ragu-ragu" : "Tandai ragu-ragu"}
            </Button>
            {isLast ? (
              <Button onClick={() => setConfirmSubmit(true)}>
                Selesai <Send />
              </Button>
            ) : (
              <Button onClick={() => go(current + 1)}>
                Berikutnya <ChevronRight />
              </Button>
            )}
          </div>
          <p className="mt-8 hidden type-footnote text-muted-foreground lg:block">
            Pintasan: <Kbd>A</Kbd>–<Kbd>D</Kbd> pilih jawaban ·{" "}
            <Kbd>
              <ArrowLeft aria-label="panah kiri" className="h-3 w-3" strokeWidth={2.5} />
            </Kbd>{" "}
            <Kbd>
              <ArrowRight aria-label="panah kanan" className="h-3 w-3" strokeWidth={2.5} />
            </Kbd>{" "}
            pindah soal · <Kbd>R</Kbd> tandai ragu-ragu
          </p>
        </main>

        <aside className="hidden lg:block">
          <div className="sticky top-[92px] rounded-3xl bg-card p-5 shadow-[var(--shadow-card)]">
            <p className="text-[13px] font-semibold text-muted-foreground">Navigasi soal</p>
            <NavigatorGrid states={states} current={current} onJump={go} className="mt-3" />
            <NavigatorLegend className="mt-4" />
            <div className="mt-6 border-t border-hairline pt-5">
              <p className="tabular text-[13px] text-muted-foreground">
                {answeredCount} dari {questions.length} terjawab
                {flaggedCount > 0 ? ` · ${flaggedCount} ragu-ragu` : ""}
              </p>
              <Button className="mt-3 w-full" onClick={() => setConfirmSubmit(true)}>
                Kirim jawaban
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Phone toolbar */}
      <nav
        aria-label="Navigasi soal"
        className="material-bar fixed inset-x-0 bottom-0 z-30 border-t border-hairline pb-[env(safe-area-inset-bottom)] lg:hidden"
      >
        <div className="mx-auto grid h-16 max-w-xl grid-cols-4 items-center px-2">
          <ToolbarButton
            label="Sebelumnya"
            disabled={current === 0}
            onClick={() => go(current - 1)}
          >
            <ChevronLeft />
          </ToolbarButton>
          <ToolbarButton
            label={flagged ? "Batal ragu-ragu" : "Ragu-ragu"}
            active={flagged}
            onClick={toggleFlag}
          >
            <Flag />
          </ToolbarButton>
          <ToolbarButton
            label={`Soal ${current + 1}/${questions.length}`}
            onClick={() => setNavOpen(true)}
          >
            <LayoutGrid />
          </ToolbarButton>
          {isLast ? (
            <ToolbarButton label="Kirim" primary onClick={() => setConfirmSubmit(true)}>
              <Send />
            </ToolbarButton>
          ) : (
            <ToolbarButton label="Berikutnya" onClick={() => go(current + 1)}>
              <ChevronRight />
            </ToolbarButton>
          )}
        </div>
      </nav>

      <Sheet open={navOpen} onOpenChange={setNavOpen}>
        <SheetContent side="bottom" className="pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>Navigasi soal</SheetTitle>
          </SheetHeader>
          <NavigatorGrid
            states={states}
            current={current}
            onJump={(i) => {
              go(i);
              setNavOpen(false);
            }}
            className="mt-2"
          />
          <NavigatorLegend className="mt-4" />
          <Button
            className="mt-6 w-full"
            size="lg"
            onClick={() => {
              setNavOpen(false);
              setConfirmSubmit(true);
            }}
          >
            Kirim jawaban
          </Button>
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmSubmit} onOpenChange={setConfirmSubmit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim jawaban sekarang?</AlertDialogTitle>
            <AlertDialogDescription>
              {unanswered === 0
                ? "Semua soal sudah kamu jawab."
                : `${unanswered} soal belum dijawab dan akan dihitung salah.`}
              {flaggedCount > 0 ? ` ${flaggedCount} soal masih ditandai ragu-ragu.` : ""} Sisa waktu{" "}
              {formatClock(remaining)}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Periksa lagi</AlertDialogCancel>
            <AlertDialogAction onClick={() => void submit("manual")}>Kirim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmExit} onOpenChange={setConfirmExit}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari ujian?</AlertDialogTitle>
            <AlertDialogDescription>
              Timer tetap berjalan. Kamu bisa melanjutkan dari halaman Katalog selama waktunya masih
              ada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tetap di sini</AlertDialogCancel>
            <AlertDialogAction onClick={onExit}>Keluar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mx-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-card px-1 font-sans text-[11px] font-semibold text-foreground shadow-[0_0_0_1px_var(--color-border),0_1px_0_var(--color-border)]">
      {children}
    </kbd>
  );
}

function ToolbarButton({
  label,
  onClick,
  disabled,
  active,
  primary,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  primary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={cn(
        "flex h-full cursor-pointer flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors disabled:cursor-default disabled:opacity-35 [&_svg]:h-[22px] [&_svg]:w-[22px]",
        primary ? "text-primary" : active ? "text-warning-ink" : "text-foreground",
      )}
    >
      {children}
      <span className="tabular">{label}</span>
    </button>
  );
}

function ExamIntro({
  exam,
  count,
  defaultName,
  onStart,
  onBack,
}: {
  exam: RunnerExam;
  count: number;
  defaultName: string;
  onStart: (name: string) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [touched, setTouched] = useState(false);
  const clean = name.trim().replace(/\s+/g, " ").slice(0, 40);
  const valid = clean.length >= 2;

  const size = 236;
  const stroke = 16;
  const r = (size - stroke) / 2;
  const facts = [
    { icon: FileText, text: `${count} soal pilihan ganda, A sampai D` },
    {
      icon: Timer,
      text: `${formatDuration(exam.duration_minutes)}, mulai berjalan begitu kamu menekan Mulai`,
    },
    { icon: Flag, text: "Tandai soal ragu-ragu, cek lagi sebelum kirim" },
    { icon: RotateCw, text: "Jawaban tersimpan walau halaman ter-refresh" },
    { icon: Send, text: "Waktu habis? Jawabanmu terkirim otomatis" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    if (valid) onStart(clean);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-5 py-4">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex cursor-pointer items-center gap-0.5 rounded-full px-1 py-2 text-[15px] text-link hover:underline"
        >
          <ChevronLeft className="h-4 w-4" /> Katalog
        </button>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
        <div
          className="relative animate-rise"
          style={
            { width: size, height: size, viewTransitionName: "exam-timer" } as React.CSSProperties
          }
        >
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              strokeWidth={stroke}
              className="stroke-primary"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="tabular font-display text-[52px] font-semibold tracking-[-0.04em]">
              {formatClock(exam.duration_minutes * 60_000)}
            </span>
            <span className="text-[13px] text-muted-foreground">siap dimulai</span>
          </div>
        </div>

        <h1 className="type-title-1 mt-10">{exam.title}</h1>
        {exam.description ? (
          <p className="type-lead mt-4 max-w-xl text-muted-foreground">{exam.description}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-10 w-full max-w-md text-left" noValidate>
          <FieldGroup shake={false}>
            <FloatingField
              label="Namamu"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              autoComplete="name"
              maxLength={40}
              autoFocus={!defaultName}
              aria-invalid={touched && !valid}
              aria-describedby="nama-hint"
            />
          </FieldGroup>
          <p
            id="nama-hint"
            className={cn(
              "mt-2 px-1 text-[13px]",
              touched && !valid ? "text-destructive-ink" : "text-muted-foreground",
            )}
          >
            {touched && !valid
              ? "Tulis namamu dulu, minimal 2 huruf."
              : "Nama ini yang tampil di papan peringkat."}
          </p>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={touched && !valid}>
            Mulai ujian
          </Button>
        </form>

        <ul className="mt-10 w-full max-w-md overflow-hidden rounded-2xl bg-card text-left shadow-[var(--shadow-card)]">
          {facts.map((f, i) => (
            <li key={f.text} className="relative flex items-center gap-3.5 px-4 py-3.5">
              {i > 0 ? (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 ml-[3.25rem] h-px bg-hairline"
                />
              ) : null}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </span>
              <span className="type-callout">{f.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * A short question alone reads as a headline. A question with a reading
 * passage (see splitQuestionText) shows passage, image, then the question.
 */
function QuestionBody({ text, imageUrl }: { text: string; imageUrl: string | null }) {
  const { stimulus, stem } = splitQuestionText(text);
  const image = imageUrl ? <QuestionImage url={imageUrl} /> : null;
  const stemClass = isLongStem(stem)
    ? "whitespace-pre-line text-[19px] font-semibold leading-[1.45] tracking-[-0.014em] sm:text-[21px]"
    : "whitespace-pre-line font-display text-[clamp(1.375rem,1.1rem+1.1vw,1.875rem)] font-semibold leading-[1.3] tracking-[-0.022em]";

  const heading = (
    <h1 className={cn(stemClass, stimulus && "mt-8")}>
      <StemLines stem={stem} />
    </h1>
  );
  if (!stimulus) {
    return (
      <>
        {heading}
        {image}
      </>
    );
  }
  return (
    <>
      <p className="type-body whitespace-pre-line leading-[1.6] text-pretty">{stimulus}</p>
      {image}
      {heading}
    </>
  );
}

const NUMBERED = /^\((\d+)\)\s+(.*)$/;

/** Numbered statements, "(1) …", read as a list in body weight under the question's lines. */
function StemLines({ stem }: { stem: string }) {
  const lines = stem.split(/\r?\n/);
  if (!lines.some((l) => NUMBERED.test(l))) return <>{stem}</>;
  return (
    <>
      {lines.map((line, i) => {
        const m = NUMBERED.exec(line);
        const prevNumbered = i > 0 && NUMBERED.test(lines[i - 1] ?? "");
        // Space where the list starts and ends; list items sit closer together.
        const gap = i === 0 ? "" : !!m === prevNumbered ? (m ? "mt-1.5" : "") : "mt-3";
        if (!m) {
          return (
            <span key={i} className={cn("block", gap)}>
              {line}
            </span>
          );
        }
        return (
          <span
            key={i}
            className={cn("grid grid-cols-[2.25rem_1fr] font-normal tracking-[-0.012em]", gap)}
          >
            <span className="tabular text-muted-foreground">({m[1]})</span>
            <span>{m[2]}</span>
          </span>
        );
      })}
    </>
  );
}

function QuestionImage({ url }: { url: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [url]);

  if (failed) {
    return (
      <p className="mt-6 rounded-2xl bg-fill px-4 py-6 text-center type-callout text-muted-foreground">
        Gambar soal gagal dimuat. Coba muat ulang halaman.
      </p>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        className={cn(
          "group relative mt-6 block cursor-zoom-in overflow-hidden rounded-2xl bg-card shadow-[var(--shadow-card)]",
          !loaded && "min-h-56 min-w-72 animate-pulse bg-fill",
        )}
        aria-label="Perbesar gambar soal"
      >
        <img
          src={url}
          alt="Gambar soal"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className="max-h-[22rem] w-auto object-contain sm:max-h-[30rem]"
        />
        <span className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="max-w-4xl p-3 sm:p-3">
          <DialogTitle className="sr-only">Gambar soal</DialogTitle>
          <img
            src={url}
            alt="Gambar soal, diperbesar"
            className="max-h-[80dvh] w-full rounded-2xl object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
