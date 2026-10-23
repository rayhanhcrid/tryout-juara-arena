import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ActivityIndicator } from "@/components/activity-indicator";
import { AdminGate } from "@/components/admin/admin-gate";
import { AdminWorkspace, type WorkspaceActions } from "@/components/admin/admin-workspace";
import { ExamFormDialog, type ExamFormValues } from "@/components/admin/exam-form-dialog";
import {
  QuestionEditor,
  type QuestionDraft,
  type QuestionSavePayload,
} from "@/components/admin/question-editor";
import type { OptionKey } from "@/components/exam/option-row";
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
  adminDeleteQuestion,
  adminGetQuestions,
  adminListExams,
  adminLogin,
  adminMoveQuestion,
  adminSeedSmaCatalogs,
  adminUpdateExam,
  adminUpdateQuestion,
  type AdminQuestion,
} from "@/lib/admin.functions";
import { storageGet, storageRemove, storageSet } from "@/lib/exam-session";

const TOKEN_KEY = "tryout:admin-token";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel Admin — TryOutKu" },
      { name: "description", content: "Kelola katalog ujian dan soal TryOutKu." },
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
  | null;

function errorMessage(err: unknown): string {
  return err instanceof Error && err.message ? err.message : "Terjadi kesalahan. Coba lagi.";
}

function AdminConsole({ token, onLock }: { token: string; onLock: () => void }) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [examDialog, setExamDialog] = useState<{ open: boolean; editing: boolean }>({
    open: false,
    editing: false,
  });
  const [editor, setEditor] = useState<{ open: boolean; index: number | null }>({
    open: false,
    index: null,
  });
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busyQuestionId, setBusyQuestionId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

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

  // On wide screens, open the first catalog straight away.
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
        toast.success("Katalog diperbarui.");
      } else {
        const { examId } = await adminCreateExam({ data: { token, ...values } });
        setSelectedId(examId);
        toast.success("Katalog dibuat. Sekarang tambahkan soalnya.");
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

  async function runDelete() {
    if (!confirm) return;
    const target = confirm;
    setConfirm(null);
    try {
      if (target.kind === "exam") {
        await adminDeleteExam({ data: { token, examId: target.id } });
        setSelectedId(null);
        toast.success("Katalog dihapus.");
      } else {
        setBusyQuestionId(target.id);
        await adminDeleteQuestion({ data: { token, questionId: target.id } });
        toast.success("Soal dihapus.");
      }
      await refresh();
    } catch (err) {
      toast.error(guard(err));
    } finally {
      setBusyQuestionId(null);
    }
  }

  const editingQuestion = editor.index !== null ? questions[editor.index] : undefined;
  const editorInitial: QuestionDraft | null = editingQuestion
    ? {
        text: editingQuestion.text,
        option_a: editingQuestion.option_a,
        option_b: editingQuestion.option_b,
        option_c: editingQuestion.option_c,
        option_d: editingQuestion.option_d,
        correct_option: editingQuestion.correct_option as OptionKey,
      }
    : null;

  const actions: WorkspaceActions = {
    onSelect: setSelectedId,
    onNewExam: () => setExamDialog({ open: true, editing: false }),
    onSeed: async () => {
      setSeeding(true);
      try {
        const { added, total } = await adminSeedSmaCatalogs({ data: { token } });
        toast.success(
          added > 0
            ? `${added} katalog contoh SMA ditambahkan.`
            : `Semua ${total} katalog contoh SMA sudah ada.`,
        );
        await refresh();
      } catch (err) {
        toast.error(guard(err));
      } finally {
        setSeeding(false);
      }
    },
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
        exams={exams}
        seeding={seeding}
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
        initial={
          examDialog.editing && selected
            ? {
                title: selected.title,
                description: selected.description,
                duration_minutes: selected.duration_minutes,
              }
            : null
        }
        onSave={saveExam}
      />

      <QuestionEditor
        open={editor.open}
        onOpenChange={(open) => setEditor((e) => ({ ...e, open }))}
        examTitle={selected?.title ?? ""}
        number={editor.index !== null ? editor.index + 1 : questions.length + 1}
        initial={editorInitial}
        initialImageUrl={editingQuestion?.imageUrl ?? null}
        onSave={saveQuestion}
      />

      <AlertDialog open={!!confirm} onOpenChange={(open) => !open && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.kind === "exam"
                ? `Hapus “${confirm.title}”?`
                : `Hapus soal ${confirm?.kind === "question" ? confirm.number : ""}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.kind === "exam"
                ? `Semua soal${confirm.attempts > 0 ? ` dan ${confirm.attempts} percobaan peserta` : ""} di katalog ini ikut terhapus. Tindakan ini tidak bisa dibatalkan.`
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
