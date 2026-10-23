import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { useCallback, useState } from "react";
import { ActivityIndicator } from "@/components/activity-indicator";
import { ExamRunner } from "@/components/exam/exam-runner";
import { Button } from "@/components/ui/button";
import { deviceId, readGuest } from "@/lib/exam-session";
import { fetchExamForTaking, submitAsGuest } from "@/lib/participant-api";

export const Route = createFileRoute("/ujian/$examId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Ujian Berlangsung — TryOutKu" },
      { name: "description", content: "Kerjakan soal try out sebelum waktu habis." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UjianPage,
});

function UjianPage() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [owner] = useState(() => deviceId());
  const [lastName] = useState(() => readGuest()?.nama ?? "");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam", examId],
    queryFn: () => fetchExamForTaking(examId),
    staleTime: Infinity,
  });

  const onSubmit = useCallback(
    async (answers: Record<string, string>, nama: string) => {
      await submitAsGuest(examId, answers, nama);
      await queryClient.invalidateQueries({ queryKey: ["catalog"] });
      await queryClient.invalidateQueries({ queryKey: ["hasil", examId] });
      navigate({ to: "/hasil/$examId", params: { examId }, search: { baru: true }, replace: true });
    },
    [examId, navigate, queryClient],
  );

  const backToCatalog = useCallback(() => navigate({ to: "/katalog" }), [navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <ActivityIndicator />
      </div>
    );
  }

  if (isError || !data?.exam) {
    return (
      <Unavailable
        title="Mata pelajaran ini tidak ditemukan."
        body="Mungkin katalognya sudah dihapus admin."
        onBack={backToCatalog}
      />
    );
  }

  if (data.questions.length === 0) {
    return (
      <Unavailable
        title="Katalog ini belum punya soal."
        body="Admin belum menambahkan soal. Coba lagi nanti, ya."
        onBack={backToCatalog}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ExamRunner
        exam={data.exam}
        questions={data.questions}
        ownerId={owner}
        defaultName={lastName}
        onSubmit={onSubmit}
        onExit={backToCatalog}
      />
    </div>
  );
}

function Unavailable({ title, body, onBack }: { title: string; body: string; onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-sm text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-fill text-muted-foreground">
          <FileQuestion className="h-7 w-7" />
        </span>
        <h1 className="type-title-3 mt-6">{title}</h1>
        <p className="type-callout mt-2 text-muted-foreground">{body}</p>
        <Button className="mt-8" variant="secondary" onClick={onBack}>
          Kembali ke katalog
        </Button>
      </div>
    </div>
  );
}
