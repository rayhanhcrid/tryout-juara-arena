import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { AppShell, useGuestName } from "@/components/app-shell";
import { ResultView } from "@/components/result/result-view";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getResults } from "@/lib/exam.functions";
import { readGuest } from "@/lib/exam-session";

type HasilSearch = { baru?: boolean };

export const Route = createFileRoute("/hasil/$examId")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): HasilSearch =>
    search["baru"] === true || search["baru"] === "true" ? { baru: true } : {},
  head: () => ({
    meta: [
      { title: "Hasil & Peringkat — TryOutKu" },
      { name: "description", content: "Skor try out dan papan peringkatnya." },
      { name: "theme-color", content: "#000000" },
    ],
  }),
  component: HasilPage,
});

function HasilPage() {
  const { examId } = Route.useParams();
  const { baru } = Route.useSearch();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const guestName = useGuestName();
  const [token] = useState(() => readGuest()?.token ?? null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hasil", examId, token],
    queryFn: () => getResults({ data: { examId, guestToken: token } }),
  });

  return (
    <AppShell pathname={pathname} tone="dark">
      {isLoading ? (
        <div className="mx-auto flex max-w-4xl flex-col items-center pt-16">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-8 h-[300px] w-[300px] rounded-full" />
          <Skeleton className="mt-10 h-10 w-80" />
        </div>
      ) : isError || !data?.exam ? (
        <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground">
            <FileQuestion className="h-7 w-7" />
          </span>
          <h1 className="type-title-3 mt-6">Hasil tidak ditemukan.</h1>
          <p className="type-callout mt-2 text-muted-foreground">
            Katalognya mungkin sudah dihapus.
          </p>
          <Link
            to="/katalog"
            className={buttonVariants({ variant: "secondary", className: "mt-8" })}
          >
            Kembali ke katalog
          </Link>
        </div>
      ) : (
        <ResultView
          exam={data.exam}
          attempts={data.myAttempts}
          leaderboard={data.leaderboard}
          meId={data.meId}
          fresh={!!baru}
          guestName={guestName}
        />
      )}
    </AppShell>
  );
}
