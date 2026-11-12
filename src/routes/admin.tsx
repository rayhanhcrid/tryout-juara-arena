import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ActivityIndicator } from "@/components/activity-indicator";
import { AdminGate } from "@/components/admin/admin-gate";
import {
  AdminWorkspace,
  type WorkspaceActions,
  type WorkspaceView,
} from "@/components/admin/admin-workspace";
import { ExamFormDialog, type ExamFormValues } from "@/components/admin/exam-form-dialog";
import { NewsFormDialog, type NewsFormValues } from "@/components/admin/news-form-dialog";
import { NewsPanel } from "@/components/admin/news-panel";
import {
  QuestionEditor,
  type QuestionDraft,
  type QuestionSavePayload,
} from "@/components/admin/question-editor";
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
import {
  adminCheckToken,
  adminCreateExam,
  adminCreateQuestion,
  adminDeleteExam,
  adminDeleteNews,
  adminDeleteQuestion,
  adminGetQuestions,
  adminListExams,
  adminListNews,
  adminLogin,
  adminMoveQuestion,
  adminSaveNews,
  adminUpdateExam,
  adminUpdateQuestion,
  type AdminNews,
  type AdminQuestion,
} from "@/lib/admin.functions";
import { storageGet, storageRemove, storageSet } from "@/lib/exam-session";

const TOKEN_KEY = "tryout:admin-token";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel Admin — lulustes" },
      { name: "description", content: "Kelola paket soal, paket harian, dan berita lulustes." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  // undefined = still checking the stored token
  const [token, setToken] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const stored = storageGet(TOKEN_KEY);
    if (!stored) {
      setToken(null);
      return;
    }
    adminCheckToken({ data: { token: stored } })
      .then(({ valid }) => {
        if (valid) setToken(stored);
        else {
          storageRemove(TOKEN_KEY);
          setToken(null);
        }
      })
      .catch(() => setToken(null));
  }, []);

  const lock = useCallback(() => {
    storageRemove(TOKEN_KEY);
    setToken(null);
  }, []);

  if (token === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card">
        <ActivityIndicator />
      </div>
    );
  }

  if (!token) {
    return (
      <AdminGate
        onSubmitCode={(code) => adminLogin({ data: { code } })}
        onUnlock={(t) => {
          storageSet(TOKEN_KEY, t);
          setToken(t);
        }}
      />
    );
  }

  return <AdminConsole token={token} onLock={lock} />;
}

type Confirm =
  | { kind: "exam"; id: string; title: string; attempts: number }
  | { kind: "question"; id: string; number: number }
  | { kind: "news"; id: string; title: string }
  | null;

function errorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : "Terjadi kesalahan. Coba lagi.";
}

function AdminConsole({ token, onLock }: { token: string; onLock: () => void }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<WorkspaceView>("paket");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examDialog, setExamDialog] = useState<{ open: boolean; editing: boolean }>({
    open: false,
    editing: false,
  });
  const [editor, setEditor] = useState<{ open: boolean; index: number | null }>({
    open: false,
    index: null,
  });
  const [newsDialog, setNewsDialog] = useState<{ open: boolean; editing: AdminNews | null }>({
    open: false,
    editing: null,
  });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busyQuestionId, setBusyQuestionId] = useState<string | null>(null);

  /** Expired sessions lock the panel instead of failing silently. */
  const guard = useCallback(
    (err: unknown) => {
      const msg = errorMessage(err);
      if (msg.includes("Sesi admin")) {
        toast.error("Sesi admin berakhir. Masukkan kata sandi lagi.");
        onLock();
      }
      return msg;
    },
    [onLock],
  );

  const examsQuery = useQuery({
    queryKey: ["admin", "exams", token],
    queryFn: async () => (await adminListExams({ data: { token } })).exams,
    retry: false,
  });

  const exams = examsQuery.data ?? [];
  const selected = exams.find((e) => e.id === selectedId) ?? null;

  useEffect(() => {
    if (examsQuery.error) toast.error(guard(examsQuery.error));
  }, [examsQuery.error, guard]);

  // On wide screens, open the first package straight away.
  const firstExamId = examsQuery.data?.[0]?.id ?? null;
  useEffect(() => {
    if (selectedId || !firstExamId) return;
    if (window.matchMedia("(min-width: 1024px)").matches) setSelectedId(firstExamId);
  }, [firstExamId, selectedId]);

  const questionsQuery = useQuery({
    queryKey: ["admin", "questions", selectedId, token],
    enabled: !!selectedId,
    queryFn: async () =>
      (await adminGetQuestions({ data: { token, examId: selectedId! } })).questions,
    retry: false,
  });
  const questions: AdminQuestion[] = questionsQuery.data ?? [];

  useEffect(() => {
    if (questionsQuery.error) toast.error(guard(questionsQuery.error));
  }, [questionsQuery.error, guard]);

  const newsQuery = useQuery({
    queryKey: ["admin", "news", token],
    enabled: view === "berita",
    queryFn: async () => (await adminListNews({ data: { token } })).news,
    retry: false,
  });

  useEffect(() => {
    if (newsQuery.error) toast.error(guard(newsQuery.error));
  }, [newsQuery.error, guard]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin"] });
  }, [queryClient]);

  const moveMutation = useMutation({
    mutationFn: async (vars: { questionId: string; direction: "up" | "down" }) => {
      setBusyQuestionId(vars.questionId);
      await adminMoveQuestion({ data: { token, ...vars } });
    },
    onSuccess: refresh,
    onError: (err) => toast.error(guard(err)),
    onSettled: () => setBusyQuestionId(null),
  });

  async function saveExam(values: ExamFormValues) {
    try {
      if (examDialog.editing && selected) {
        await adminUpdateExam({ data: { token, examId: selected.id, ...values } });
        toast.success("Paket diperbarui.");
      } else {
        const { examId } = await adminCreateExam({ data: { token, ...values } });
        setSelectedId(examId);
        toast.success("Paket dibuat. Sekarang tambahkan soal dan pembahasannya.");
      }
      await refresh();
    } catch (err) {
      throw new Error(guard(err));
    }
  }

  async function saveQuestion(payload: QuestionSavePayload) {
    if (!selected) return;
    const editing = editor.index !== null ? questions[editor.index] : undefined;
    try {
      if (editing) {
        await adminUpdateQuestion({ data: { token, questionId: editing.id, ...payload } });
        toast.success("Soal diperbarui.");
      } else {
        const { removeImage: _ignored, ...rest } = payload;
        await adminCreateQuestion({ data: { token, examId: selected.id, ...rest } });
        toast.success("Soal ditambahkan.");
      }
      await refresh();
    } catch (err) {
      throw new Error(guard(err));
    }
  }

  async function saveNews(values: NewsFormValues) {
    try {
      await adminSaveNews({ data: { token, newsId: newsDialog.editing?.id ?? null, ...values } });
      toast.success(newsDialog.editing ? "Berita diperbarui." : "Berita dimuat.");
      await refresh();
    } catch (err) {
      throw new Error(guard(err));
    }
  }

  async function runDelete() {
    if (!confirm) return;
    const target = confirm;
    setConfirm(null);
    try {
      if (target.kind === "exam") {
        await adminDeleteExam({ data: { token, examId: target.id } });
        setSelectedId(null);
        toast.success("Paket dihapus.");
      } else if (target.kind === "question") {
        setBusyQuestionId(target.id);
        await adminDeleteQuestion({ data: { token, questionId: target.id } });
        toast.success("Soal dihapus.");
      } else {
        await adminDeleteNews({ data: { token, newsId: target.id } });
        toast.success("Berita dihapus.");
      }
      await refresh();
    } catch (err) {
      toast.error(guard(err));
    } finally {
      setBusyQuestionId(null);
    }
  }

  const editingQuestion = editor.index !== null ? questions[editor.index] : undefined;
  // Memoised: the editor resets its form whenever `initial` changes identity.
  const editorInitial = useMemo<QuestionDraft | null>(
    () =>
      editingQuestion
        ? {
            kind: editingQuestion.kind,
            text: editingQuestion.text,
            options: editingQuestion.options,
            categories: editingQuestion.categories,
            answer: editingQuestion.answer,
            section: editingQuestion.section,
            explanation: editingQuestion.explanation,
          }
        : null,
    [editingQuestion],
  );
  const examInitial = useMemo<ExamFormValues | null>(
    () =>
      examDialog.editing && selected
        ? {
            title: selected.title,
            description: selected.description,
            duration_minutes: selected.duration_minutes,
            featured: selected.featured,
            track: selected.track,
            daily_date: selected.daily_date,
          }
        : null,
    [examDialog.editing, selected],
  );
  const newsInitial = useMemo<NewsFormValues | null>(() => {
    const n = newsDialog.editing;
    return n
      ? {
          title: n.title,
          summary: n.summary,
          source_name: n.source_name,
          source_url: n.source_url,
          track: n.track,
          published_on: n.published_on,
        }
      : null;
  }, [newsDialog.editing]);

  const actions: WorkspaceActions = {
    onSelect: setSelectedId,
    onNewExam: () => setExamDialog({ open: true, editing: false }),
    onEditExam: () => setExamDialog({ open: true, editing: true }),
    onDeleteExam: () =>
      selected &&
      setConfirm({
        kind: "exam",
        id: selected.id,
        title: selected.title,
        attempts: selected.attemptCount,
      }),
    onNewQuestion: () => setEditor({ open: true, index: null }),
    onEditQuestion: (index) => setEditor({ open: true, index }),
    onDeleteQuestion: (index) => {
      const q = questions[index];
      if (q) setConfirm({ kind: "question", id: q.id, number: index + 1 });
    },
    onMoveQuestion: (index, direction) => {
      const q = questions[index];
      if (q) moveMutation.mutate({ questionId: q.id, direction });
    },
    onLock,
  };

  return (
    <>
      <AdminWorkspace
        view={view}
        onViewChange={setView}
        news={
          <NewsPanel
            items={newsQuery.data ?? []}
            loading={newsQuery.isLoading}
            onNew={() => setNewsDialog({ open: true, editing: null })}
            onEdit={(item) => setNewsDialog({ open: true, editing: item })}
            onDelete={(item) => setConfirm({ kind: "news", id: item.id, title: item.title })}
          />
        }
        exams={exams}
        loadingExams={examsQuery.isLoading}
        selectedId={selectedId}
        questions={questions}
        loadingQuestions={!!selectedId && questionsQuery.isLoading}
        busyQuestionId={busyQuestionId}
        actions={actions}
      />

      <ExamFormDialog
        open={examDialog.open}
        onOpenChange={(open) => setExamDialog((d) => ({ ...d, open }))}
        initial={examInitial}
        onSave={saveExam}
      />

      <QuestionEditor
        open={editor.open}
        onOpenChange={(open) => setEditor((e) => ({ ...e, open }))}
        examTitle={selected?.title ?? ""}
        number={editor.index !== null ? editor.index + 1 : questions.length + 1}
        initial={editorInitial}
        initialImageUrl={editingQuestion?.imageUrl ?? null}
        lastSection={questions[questions.length - 1]?.section ?? ""}
        onSave={saveQuestion}
      />

      <NewsFormDialog
        open={newsDialog.open}
        onOpenChange={(open) => setNewsDialog((d) => ({ ...d, open }))}
        initial={newsInitial}
        onSave={saveNews}
      />

      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "question"
                ? `Hapus soal ${confirm.number}?`
                : confirm
                  ? `Hapus “${confirm.title}”?`
                  : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "exam"
                ? `Semua soal${confirm.attempts > 0 ? ` dan ${confirm.attempts} percobaan peserta` : ""} di paket ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`
                : confirm?.kind === "news"
                  ? "Berita ini hilang dari menu Berita dan halaman Hari ini."
                  : "Soal dan gambarnya akan dihapus. Skor yang sudah tercatat tidak berubah."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={runDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
