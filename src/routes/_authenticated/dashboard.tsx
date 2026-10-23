import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Katalog Ujian — TryOutKu" },
      { name: "description", content: "Pilih katalog try out yang mau kamu ikuti." },
      { property: "og:title", content: "Katalog Ujian — TryOutKu" },
      { property: "og:description", content: "Pilih katalog try out yang mau kamu ikuti." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

type ExamRow = {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  questions: { count: number }[];
};

function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const [{ data: exams }, { data: attempts }] = await Promise.all([
        supabase
          .from("exams")
          .select("id, title, description, duration_minutes, questions(count)")
          .order("created_at", { ascending: true }),
        supabase.from("attempts").select("exam_id, score, total").eq("user_id", user.id),
      ]);
      return { exams: (exams ?? []) as ExamRow[], attempts: attempts ?? [] };
    },
  });

  const bestByExam = new Map<string, { score: number; total: number }>();
  for (const a of data?.attempts ?? []) {
    const prev = bestByExam.get(a.exam_id);
    if (!prev || a.score > prev.score) bestByExam.set(a.exam_id, { score: a.score, total: a.total });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Katalog Ujian</h1>
        <p className="mt-1 text-muted-foreground">
          Pilih mata ujian yang mau kamu ikuti, lalu kerjakan sebelum waktu habis.
        </p>
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
      ) : !data || data.exams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="text-4xl">🗂️</span>
            <p className="font-medium">Belum ada katalog ujian</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Admin belum membuat katalog. Coba lagi nanti ya.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {data.exams.map((exam) => {
            const count = exam.questions[0]?.count ?? 0;
            const best = bestByExam.get(exam.id);
            return (
              <Card key={exam.id} className="flex flex-col border-border bg-card">
                <CardContent className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant="secondary">⏱️ {exam.duration_minutes} menit</Badge>
                    <Badge variant="secondary">📝 {count} soal</Badge>
                  </div>
                  <h3 className="font-display text-lg font-semibold leading-snug">{exam.title}</h3>
                  {exam.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {exam.description}
                    </p>
                  ) : null}
                  <div className="mt-auto pt-4">
                    {best ? (
                      <p className="mb-3 text-sm">
                        <span className="text-muted-foreground">Skor terbaikmu: </span>
                        <span className="font-semibold text-success">
                          {best.score}/{best.total}
                        </span>
                      </p>
                    ) : (
                      <p className="mb-3 text-sm text-muted-foreground">Belum dikerjakan</p>
                    )}
                    <div className="flex gap-2">
                      <Button asChild className="flex-1">
                        <Link to="/ujian/$examId" params={{ examId: exam.id }}>
                          {best ? "Kerjakan Lagi" : "Mulai Ujian"}
                        </Link>
                      </Button>
                      {best ? (
                        <Button variant="outline" asChild>
                          <Link to="/hasil/$examId" params={{ examId: exam.id }}>
                            Hasil
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
