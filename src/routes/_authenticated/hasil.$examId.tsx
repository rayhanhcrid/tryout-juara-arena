import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/exam.functions";

export const Route = createFileRoute("/_authenticated/hasil/$examId")({
  head: () => ({
    meta: [
      { title: "Hasil & Leaderboard — TryOutKu" },
      { name: "description", content: "Lihat skor try out kamu dan papan peringkatnya." },
      { property: "og:title", content: "Hasil & Leaderboard — TryOutKu" },
      { property: "og:description", content: "Lihat skor try out kamu dan papan peringkatnya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HasilPage,
});

type AttemptRow = {
  id: string;
  score: number;
  total: number;
  submitted_at: string;
};

function HasilPage() {
  const { examId } = Route.useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hasil", examId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi tidak ditemukan");
      const [{ data: exam }, { data: attempts }, board] = await Promise.all([
        supabase.from("exams").select("*").eq("id", examId).maybeSingle(),
        supabase
          .from("attempts")
          .select("id, score, total, submitted_at")
          .eq("exam_id", examId)
          .eq("user_id", user.id)
          .order("submitted_at", { ascending: false }),
        getLeaderboard({ data: { examId } }),
      ]);
      if (!exam) throw new Error("Katalog ujian tidak ditemukan");
      return {
        exam,
        myAttempts: (attempts ?? []) as AttemptRow[],
        leaderboard: board.leaderboard as LeaderboardEntry[],
        myRank: board.myRank as LeaderboardEntry | null,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardContent className="py-12 text-center">
          <p className="font-medium">Hasil tidak ditemukan.</p>
          <Button className="mt-4" variant="outline" onClick={() => navigate({ to: "/dashboard" })}>
            Kembali ke katalog
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { exam, myAttempts, leaderboard, myRank } = data;

  if (myAttempts.length === 0) {
    return (
      <Card className="mx-auto max-w-xl border-dashed">
        <CardContent className="py-12 text-center">
          <p className="font-medium">Kamu belum mengerjakan ujian ini.</p>
          <Button className="mt-4" asChild>
            <Link to="/ujian/$examId" params={{ examId }}>
              Kerjakan sekarang
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const best = myAttempts.reduce((a, b) => (b.score > a.score ? b : a));
  const percent = best.total > 0 ? Math.round((best.score / best.total) * 100) : 0;
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate({ to: "/dashboard" })}>
          ← Kembali ke katalog
        </Button>
        <h1 className="font-display text-3xl font-bold tracking-tight">{exam.title}</h1>
      </div>

      {/* Score card */}
      <Card className="ink-shadow overflow-hidden">
        <CardContent className="p-8 text-center">
          <Badge variant="secondary" className="mb-4">Skor terbaikmu</Badge>
          <div className="font-display text-6xl font-bold tracking-tight">
            {best.score}
            <span className="text-2xl text-muted-foreground">/{best.total}</span>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="secondary">📊 {percent}% benar</Badge>
            {myRank ? (
              <Badge variant="secondary">
                🏆 Peringkat #{myRank.rank} dari {leaderboard.length} peserta
              </Badge>
            ) : null}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Total {myAttempts.length}x pengerjaan • hasil terbaru otomatis masuk leaderboard.
          </p>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Belum ada peserta.</p>
          ) : (
            <ol className="divide-y divide-border">
              {leaderboard.map((entry) => {
                const isMe = myRank?.user_id === entry.user_id;
                return (
                  <li
                    key={entry.user_id}
                    className={`flex items-center gap-4 px-2 py-3 ${
                      isMe ? "rounded-xl bg-secondary" : ""
                    }`}
                  >
                    <span className="w-10 text-center text-lg font-bold">
                      {entry.rank <= 3 ? medals[entry.rank - 1] : entry.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {entry.nama || entry.username}
                        {isMe ? <span className="ml-2 text-xs text-muted-foreground">(kamu)</span> : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(entry.submitted_at).toLocaleString("id-ID", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <span className="font-display text-xl font-bold">
                      {entry.score}
                      <span className="text-sm text-muted-foreground">/{entry.total}</span>
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      {/* My attempts history */}
      <Card>
        <CardHeader>
          <CardTitle className="font-display text-xl">Riwayat pengerjaanmu</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {myAttempts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3"
              >
                <span className="text-sm text-muted-foreground">
                  {new Date(a.submitted_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
                <span className="font-semibold">
                  {a.score}/{a.total}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
