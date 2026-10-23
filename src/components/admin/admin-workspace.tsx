import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  ListPlus,
  Lock,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { BrandLink } from "@/components/brand";
import { CatalogCover, CoverMark, catalogCoverClass } from "@/components/catalog-cover";
import { OPTION_KEYS } from "@/components/exam/option-row";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

export type WorkspaceExam = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questionCount: number;
  attemptCount: number;
};

export type WorkspaceQuestion = {
  id: string;
  text: string;
  imageUrl: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
};

export type WorkspaceActions = {
  onSelect: (id: string | null) => void;
  onNewExam: () => void;
  onSeed: () => void;
  onEditExam: () => void;
  onDeleteExam: () => void;
  onNewQuestion: () => void;
  onEditQuestion: (index: number) => void;
  onDeleteQuestion: (index: number) => void;
  onMoveQuestion: (index: number, direction: "up" | "down") => void;
  onLock: () => void;
};

export function AdminWorkspace({
  exams,
  seeding,
  loadingExams,
  selectedId,
  questions,
  loadingQuestions,
  busyQuestionId,
  actions,
}: {
  exams: WorkspaceExam[];
  /** True while the SMA demo catalogs are being inserted. */
  seeding: boolean;
  loadingExams: boolean;
  selectedId: string | null;
  questions: WorkspaceQuestion[];
  loadingQuestions: boolean;
  busyQuestionId: string | null;
  actions: WorkspaceActions;
}) {
  const selected = exams.find((e) => e.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-background">
      <header className="material-bar sticky top-0 z-40 border-b border-hairline">
        <div className="mx-auto flex h-[52px] max-w-7xl items-center gap-3 px-4 sm:px-6">
          <BrandLink to="/" iconSize={24} />
          <span aria-hidden className="h-5 w-px bg-border" />
          <span className="text-[15px] font-medium text-muted-foreground">Admin</span>
          <div className="ml-auto flex items-center gap-1">
            <Link
              to="/"
              className="hidden items-center gap-1 rounded-full px-3 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-fill hover:text-foreground sm:inline-flex"
            >
              Lihat situs <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <Button variant="ghost" size="sm" onClick={actions.onLock}>
              <Lock /> Kunci
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:grid lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-10 lg:py-10">
        <aside className={cn(selected ? "hidden lg:block" : "block")}>
          <ExamSidebar
            exams={exams}
            loading={loadingExams}
            seeding={seeding}
            selectedId={selectedId}
            actions={actions}
          />
        </aside>
        <section className={cn(selected ? "block" : "hidden lg:block")}>
          {selected ? (
            <ExamDetail
              exam={selected}
              questions={questions}
              loading={loadingQuestions}
              busyQuestionId={busyQuestionId}
              actions={actions}
            />
          ) : (
            <div className="hidden h-[60vh] flex-col items-center justify-center text-center lg:flex">
              <FileText className="h-9 w-9 text-tertiary" />
              <p className="type-title-3 mt-4">
                {exams.length === 0 && !loadingExams ? "Belum ada katalog" : "Pilih katalog"}
              </p>
              <p className="type-callout mt-1 text-muted-foreground">
                {exams.length === 0 && !loadingExams
                  ? "Buat katalog pertama, lalu tambahkan soalnya."
                  : "Soal-soalnya akan tampil di sini."}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function ExamSidebar({
  exams,
  loading,
  seeding,
  selectedId,
  actions,
}: {
  exams: WorkspaceExam[];
  loading: boolean;
  seeding: boolean;
  selectedId: string | null;
  actions: WorkspaceActions;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? exams.filter((e) => e.title.toLowerCase().includes(q)) : exams;
  }, [exams, query]);
  const totalQuestions = exams.reduce((n, e) => n + e.questionCount, 0);

  return (
    <div className="lg:sticky lg:top-[92px]">
      <div className="flex items-center justify-between gap-3">
        <h1 className="type-title-2">Katalog</h1>
        <Button size="sm" onClick={actions.onNewExam}>
          <Plus /> Baru
        </Button>
      </div>
      <p className="tabular mt-1 text-[13px] text-muted-foreground">
        {exams.length} katalog · {totalQuestions} soal
      </p>

      {exams.length > 5 ? (
        <label className="relative mt-4 block">
          <span className="sr-only">Cari katalog</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari katalog"
            className="h-9 w-full rounded-xl bg-fill pl-9 pr-3 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:shadow-[0_0_0_4px_var(--color-ring)]"
          />
        </label>
      ) : null}

      <div className="mt-4">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-[62px] rounded-2xl" />
            ))}
          </div>
        ) : exams.length === 0 ? (
          <div className="rounded-2xl bg-card px-5 py-10 text-center shadow-[var(--shadow-card)]">
            <p className="type-headline">Belum ada katalog</p>
            <p className="type-callout mt-1 text-muted-foreground">
              Buat katalog sendiri, atau isi dulu dengan 12 mata pelajaran SMA beserta soal
              contohnya.
            </p>
            <div className="mt-5 flex flex-col items-center gap-2">
              <Button onClick={actions.onSeed} disabled={seeding}>
                <ListPlus /> {seeding ? "Mengisi…" : "Isi katalog contoh SMA"}
              </Button>
              <Button variant="ghost" onClick={actions.onNewExam}>
                <Plus /> Buat katalog kosong
              </Button>
            </div>
          </div>
        ) : (
          <ul className="overflow-hidden rounded-2xl bg-card p-1.5 shadow-[var(--shadow-card)]">
            {filtered.map((exam) => {
              const active = exam.id === selectedId;
              return (
                <li key={exam.id}>
                  <button
                    type="button"
                    onClick={() => actions.onSelect(exam.id)}
                    aria-current={active ? "true" : undefined}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors duration-150",
                      active ? "bg-primary text-primary-foreground" : "hover:bg-fill",
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] text-white",
                        catalogCoverClass(exam.id, exam.title),
                      )}
                    >
                      <CoverMark title={exam.title} className="h-5 w-5 text-[17px]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold tracking-[-0.012em]">
                        {exam.title}
                      </span>
                      <span
                        className={cn(
                          "tabular block truncate text-[12px]",
                          active ? "text-primary-foreground/80" : "text-muted-foreground",
                        )}
                      >
                        {exam.questionCount} soal · {exam.duration_minutes} mnt ·{" "}
                        {exam.attemptCount} percobaan
                      </span>
                    </span>
                    <ChevronRight
                      aria-hidden
                      className={cn(
                        "h-4 w-4 shrink-0 lg:hidden",
                        active ? "text-primary-foreground/80" : "text-tertiary",
                      )}
                    />
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 ? (
              <li className="px-3 py-6 text-center text-[13px] text-muted-foreground">
                Tidak ada yang cocok.
              </li>
            ) : null}
          </ul>
        )}
        {!loading && exams.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 text-muted-foreground"
            onClick={actions.onSeed}
            disabled={seeding}
          >
            <ListPlus /> {seeding ? "Mengisi katalog contoh…" : "Tambahkan katalog contoh SMA"}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function MetaItem({ icon: Icon, children }: { icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
      <Icon className="h-4 w-4" />
      {children}
    </span>
  );
}

function ExamDetail({
  exam,
  questions,
  loading,
  busyQuestionId,
  actions,
}: {
  exam: WorkspaceExam;
  questions: WorkspaceQuestion[];
  loading: boolean;
  busyQuestionId: string | null;
  actions: WorkspaceActions;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => actions.onSelect(null)}
        className="mb-4 inline-flex cursor-pointer items-center gap-0.5 text-[15px] text-link hover:underline lg:hidden"
      >
        <ChevronLeft className="h-4 w-4" /> Katalog
      </button>

      <div className="overflow-hidden rounded-[28px] bg-card shadow-[var(--shadow-card)]">
        <CatalogCover
          id={exam.id}
          title={exam.title}
          className="h-36 sm:h-44 [&>p]:text-[26px] sm:[&>p]:text-[30px]"
        />
        <div className="p-5 sm:p-6">
          {exam.description ? (
            <p className="type-body max-w-[65ch] text-muted-foreground">{exam.description}</p>
          ) : (
            <p className="type-callout text-tertiary">Belum ada deskripsi.</p>
          )}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            <MetaItem icon={Clock}>{formatDuration(exam.duration_minutes)}</MetaItem>
            <MetaItem icon={FileText}>{exam.questionCount} soal</MetaItem>
            <MetaItem icon={Users}>{exam.attemptCount} percobaan</MetaItem>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={actions.onEditExam}>
              <Pencil /> Edit katalog
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive-ink hover:bg-destructive/10"
              onClick={actions.onDeleteExam}
            >
              <Trash2 /> Hapus
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12 flex items-end justify-between gap-4">
        <div>
          <h2 className="type-title-2">Soal</h2>
          <p className="tabular mt-1 text-[13px] text-muted-foreground">
            Urutan di sini adalah urutan yang dilihat peserta.
          </p>
        </div>
        <Button onClick={actions.onNewQuestion}>
          <Plus /> Tambah soal
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="space-y-3">
            {[0, 1].map((i) => (
              <Skeleton key={i} className="h-44 rounded-2xl" />
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-border px-6 py-14 text-center">
            <p className="type-headline">Belum ada soal</p>
            <p className="type-callout mt-1 max-w-sm text-muted-foreground">
              Peserta baru bisa mengerjakan katalog ini setelah ada minimal satu soal.
            </p>
            <Button className="mt-5" onClick={actions.onNewQuestion}>
              <Plus /> Tambah soal pertama
            </Button>
          </div>
        ) : (
          <ol className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                index={i}
                count={questions.length}
                busy={busyQuestionId === q.id}
                actions={actions}
              />
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  disabled,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-colors disabled:cursor-default disabled:opacity-30 [&_svg]:h-4 [&_svg]:w-4",
        destructive
          ? "text-destructive-ink hover:bg-destructive/10"
          : "text-muted-foreground hover:bg-fill hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function QuestionCard({
  question,
  index,
  count,
  busy,
  actions,
}: {
  question: WorkspaceQuestion;
  index: number;
  count: number;
  busy: boolean;
  actions: WorkspaceActions;
}) {
  return (
    <li
      className={cn(
        "rounded-2xl bg-card p-4 shadow-[var(--shadow-card)] transition-opacity sm:p-5",
        busy && "pointer-events-none opacity-50",
      )}
    >
      <div className="flex gap-3 sm:gap-4">
        <span className="tabular flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fill text-[14px] font-semibold">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="type-body whitespace-pre-line pt-0.5">{question.text}</p>
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt={`Gambar soal ${index + 1}`}
              loading="lazy"
              className="mt-3 max-h-44 rounded-xl bg-fill object-contain"
            />
          ) : null}
          <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
            {OPTION_KEYS.map((k) => {
              const correct = question.correct_option === k;
              return (
                <li
                  key={k}
                  className={cn(
                    "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[14px]",
                    correct ? "bg-success/12 font-medium text-success-ink" : "bg-background",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold uppercase",
                      correct ? "bg-success text-white" : "bg-fill text-muted-foreground",
                    )}
                  >
                    {correct ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : k}
                  </span>
                  <span className="min-w-0 break-words">{question[`option_${k}`]}</span>
                  {correct ? <span className="sr-only">(kunci jawaban)</span> : null}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="-mr-1 flex shrink-0 flex-col gap-0.5">
          <IconAction
            label="Pindah ke atas"
            disabled={index === 0}
            onClick={() => actions.onMoveQuestion(index, "up")}
          >
            <ArrowUp />
          </IconAction>
          <IconAction
            label="Pindah ke bawah"
            disabled={index === count - 1}
            onClick={() => actions.onMoveQuestion(index, "down")}
          >
            <ArrowDown />
          </IconAction>
          <IconAction label="Edit soal" onClick={() => actions.onEditQuestion(index)}>
            <Pencil />
          </IconAction>
          <IconAction
            label="Hapus soal"
            destructive
            onClick={() => actions.onDeleteQuestion(index)}
          >
            <Trash2 />
          </IconAction>
        </div>
      </div>
    </li>
  );
}
