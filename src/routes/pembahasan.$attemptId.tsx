import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ReviewView } from "@/components/review/review-view";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { readGuest } from "@/lib/exam-session";
import { fetchAttemptReview, fetchResults } from "@/lib/participant-api";

export const Route = createFileRoute("/pembahasan/$attemptId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Pembahasan — lulustes" },
      { name: "description", content: "Kunci, pembahasan, dan laporan satu percobaan." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PembahasanPage,
});

function PembahasanPage() {
  const { attemptId } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [guest] = useState(() => readGuest());

  const review = useQuery({
    queryKey: ["pembahasan", attemptId, guest?.id ?? null],
    queryFn: () => fetchAttemptReview(attemptId, guest),
  });
  const examId = review.data?.exam.id ?? null;
  const results = useQuery({
    queryKey: ["hasil", examId, guest?.id ?? null],
    enabled: !!examId,
    queryFn: () => fetchResults(examId!, guest),
  });

  const mine = results.data?.meId
    ? results.data.leaderboard.find((e) => e.user_id === results.data.meId)
    : undefined;
  const rank = mine ? { rank: mine.rank, participants: results.data!.leaderboard.length } : null;

  return (
    <AppShell pathname={pathname}>
      {review.isLoading ? (
        <div className="mx-auto max-w-3xl">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="mt-4 h-12 w-2/3" />
          <Skeleton className="mt-3 h-5 w-1/2" />
          <Skeleton className="mt-10 h-56 rounded-[28px]" />
          <Skeleton className="mt-14 h-80 rounded-[28px]" />
        </div>
      ) : review.isError || !review.data ? (
        <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground shadow-[var(--shadow-card)]">
            <FileQuestion className="h-7 w-7" />
          </span>
          <h1 className="type-title-3 mt-6">
            {review.isError ? "Pembahasan tidak bisa dimuat." : "Pembahasan ini tidak ditemukan."}
          </h1>
          <p className="type-callout mt-2 text-muted-foreground">
            {review.isError
              ? "Server sedang tidak bisa membaca database. Coba muat ulang halaman sebentar lagi."
              : "Pembahasan hanya bisa dibuka dari perangkat dan nama yang dipakai saat mengerjakan."}
          </p>
          <Link
            to="/hari-ini"
            className={buttonVariants({ variant: "secondary", className: "mt-8" })}
          >
            Ke Hari ini
          </Link>
        </div>
      ) : (
        <ReviewView review={review.data} rank={review.data.attempt.number === 1 ? rank : null} />
      )}
    </AppShell>
  );
}
