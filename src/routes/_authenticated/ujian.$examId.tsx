import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { submitAttempt } from "@/lib/exam.functions";

export const Route = createFileRoute("/_authenticated/ujian/$examId")({
  head: () => ({
    meta: [
      { title: "Ujian Berlangsung — TryOutKu" },
      { name: "description", content: "Kerjakan soal try out sebelum waktu habis." },
      { property: "og:title", content: "Ujian Berlangsung — TryOutKu" },
      { property: "og:description", content: "Kerjakan soal try out sebelum waktu habis." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: UjianPage,
});

type QuestionRow = {
  id: string;
  text: string;
  image_path: string | null;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

const OPTION_KEYS = ["a", "b", "c", "d"] as const;

function formatTime(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function UjianPage() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();
  const submitFn = useServerFn(submitAttempt);
  const submittingRef = useRef(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["exam", examId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi tidak ditemukan");
      const [{ data: exam }, { data: questions }] = await Promise.all([
        supabase.from("exams").select("*").eq("id", examId).maybeSingle(),
        supabase
          .from("questions")
          .select("id, text, image_path, option_a, option_b, option_c, option_d")
          .eq("exam_id", examId)
          .order("order_index", { ascending: true }),
      ]);
      if (!exam) throw new Error("Katalog ujian tidak ditemukan");
      return { exam, questions: (questions ?? []) as QuestionRow[], userId: user.id };
    },
  });

  const exam = data?.exam;
  const questions = data?.questions ?? [];

  const storageKeys = useMemo(
    () =>
      data
        ? {
            start: `tryout:start:${data.userId}:${examId}`,
            answers: `tryout:answers:${data.userId}:${examId}`,
          }
        : null,
    [data, examId],
  );

  const [phase, setPhase] = useState<"intro" | "running" | "submitting">("intro");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [current, setCurrent] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const deadlineRef = useRef<number | null>(null);

  // Resume an in-progress attempt after refresh; drop stale ones.
  useEffect(() => {
    if (!data || !exam || !storageKeys) return;
    const rawStart = localStorage.getItem(storageKeys.start);
    if (!rawStart) {
      setPhase("intro");
      return;
    }
    const deadline = Number(rawStart) + exam.duration_minutes * 60000;
    if (Number.isFinite(deadline) && Date.now() < deadline) {
      deadlineRef.current = deadline;
      setRemaining(deadline - Date.now());
      setPhase("running");
      const saved = localStorage.getItem(storageKeys.answers);
      if (saved) {
        try {
          setAnswers(JSON.parse(saved) as Record<string, string>);
        } catch {
          // ignore corrupt state
        }
      }
    } else {
      localStorage.removeItem(storageKeys.start);
      localStorage.removeItem(storageKeys.answers);
      setPhase("intro");
    }
  }, [data, exam, storageKeys]);

  const doSubmit = useCallback(
    async (auto = false) => {
      if (submittingRef.current) return;
      submittingRef.current = true;
      setPhase("submitting");
      if (auto) toast.info("Waktu habis! Jawabanmu dikirim otomatis.");
      try {
        await submitFn({ data: { examId, answers } });
      } catch {
        toast.error("Gagal mengirim jawaban. Coba lagi.");
        submittingRef.current = false;
        setPhase("running");
        return;
      }
      if (storageKeys) {
        localStorage.removeItem(storageKeys.start);
        localStorage.removeItem(storageKeys.answers);
      }
      navigate({ to: "/hasil/$examId", params: { examId }, replace: true });
    },
    [answers, examId, navigate, storageKeys, submitFn],
  );

  const doSubmitRef = useRef(doSubmit);
  useEffect(() => {
    doSubmitRef.current = doSubmit;
  }, [doSubmit]);

  // Countdown; auto-submit at zero.
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      const deadline = deadlineRef.current;
      if (!deadline) return;
      const rem = Math.max(0, deadline - Date.now());
      setRemaining(rem);
      if (rem <= 0) doSubmitRef.current(true);
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  function startExam() {
    if (!exam || !storageKeys) return;
    const started = Date.now();
    localStorage.setItem(storageKeys.start, String(started));
    deadlineRef.current = started + exam.duration_minutes * 60000;
    setRemaining(exam.duration_minutes * 60000);
    setAnswers({});
    setCurrent(0);
    setPhase("running");
  }

  function pick(questionId: string, letter: string) {
    setAnswers((prev) => {
      const next = { ...prev, [questionId]: letter };
      if (storageKeys) localStorage.setItem(storageKeys.answers, JSON.stringify(next));
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardContent className="py-12 text-center">
          <p className="font-medium">Katalog ujian tidak ditemukan.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Kembali ke katalog
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardContent className="py-12 text-center">
          <p className="font-medium">Katalog ini belum punya soal.</p>
          <p className="mt-1 text-sm text-muted-foreground">Hubungi admin ya.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Kembali ke katalog
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-2xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/dashboard" })}>
          ← Kembali ke katalog
        </Button>
        <Card className="ink-shadow">
          <CardContent className="p-8 text-center">
            <Badge variant="secondary" className="mb-4">Sebelum mulai, baca dulu ya</Badge>
            <h1 className="font-display text-3xl font-bold">{exam.title}</h1>
            {exam.description ? (
              <p className="mt-3 text-muted-foreground">{exam.description}</p>
            ) : null}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Badge variant="secondary">📝 {questions.length} soal</Badge>
              <Badge variant="secondary">⏱️ {exam.duration_minutes} menit</Badge>
              <Badge variant="secondary">✅ {questions.length} pilihan ganda</Badge>
            </div>
            <ul className="mx-auto mt-6 max-w-md space-y-2 text-left text-sm text-muted-foreground">
              <li>• Timer langsung berjalan begitu kamu menekan mulai.</li>
              <li>• Jawaban tersimpan otomatis walau halaman ter-refresh.</li>
              <li>• Kalau waktu habis, jawaban dikirim otomatis.</li>
              <li>• Skor muncul begitu kamu submit, dan masuk leaderboard.</li>
            </ul>
            <Button size="lg" className="mt-8 w-full sm:w-auto" onClick={startExam}>
              Mulai Ujian
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const q = questions[current];
  const answeredCount = questions.filter((item) => answers[item.id]).length;

  if (phase === "submitting") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-medium">Mengirim jawaban &amp; menghitung skor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Top bar */}
      <div className="sticky top-0 z-10 mb-6 rounded-2xl border border-border bg-card p-4 ink-shadow">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{exam.title}</p>
            <p className="text-xs text-muted-foreground">
              Soal {current + 1} dari {questions.length} • terjawab {answeredCount}
            </p>
          </div>
          <div
            className={`rounded-xl px-4 py-2 font-mono text-lg font-bold ${
              remaining < 60000
                ? "bg-destructive text-destructive-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              {current + 1}
            </span>
            <p className="font-medium leading-relaxed">{q.text}</p>
          </div>
          {q.image_path ? <QuestionImage path={q.image_path} /> : null}

          <div className="mt-6 space-y-3">
            {OPTION_KEYS.map((key) => {
              const label = q[`option_${key}` as const];
              const selected = answers[q.id] === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => pick(q.id, key)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-secondary"
                      : "border-border bg-background hover:bg-accent"
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold uppercase ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {key}
                  </span>
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {questions.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrent(i)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors ${
                i === current
                  ? "border-primary bg-primary text-primary-foreground"
                  : answers[item.id]
                    ? "border-success bg-success/10 text-success"
                    : "border-border bg-card text-muted-foreground hover:bg-accent"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={current === 0}
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            ← Sebelumnya
          </Button>
          {current < questions.length - 1 ? (
            <Button onClick={() => setCurrent((c) => Math.min(questions.length - 1, c + 1))}>
              Berikutnya →
            </Button>
          ) : null}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="bg-success text-success-foreground hover:bg-success/90">
                Kirim Jawaban
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display">Kirim jawaban sekarang?</AlertDialogTitle>
                <AlertDialogDescription>
                  Kamu sudah menjawab {answeredCount} dari {questions.length} soal. Soal yang belum
                  dijawab dihitung salah. Setelah dikirim, skormu langsung muncul.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Periksa lagi</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-success text-success-foreground hover:bg-success/90"
                  onClick={() => doSubmitRef.current(false)}
                >
                  Ya, kirim
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

function QuestionImage({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.storage
      .from("exam-images")
      .createSignedUrl(path, 3600)
      .then(({ data }) => {
        if (active && data?.signedUrl) setUrl(data.signedUrl);
      });
    return () => {
      active = false;
    };
  }, [path]);

  if (!url) return null;
  return (
    <img
      src={url}
      alt="Gambar soal"
      loading="lazy"
      className="mt-4 max-h-72 rounded-xl border border-border"
    />
  );
}
