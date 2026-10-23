import { createFileRoute, Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CatalogBoardSkeleton, CatalogBoardView } from "@/components/ranking/ranking-view";
import { buttonVariants } from "@/components/ui/button";
import { getResults } from "@/lib/exam.functions";
import { readGuest } from "@/lib/exam-session";

export const Route = createFileRoute("/peringkat/$examId")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Peringkat — TryOutKu" },
      { name: "description", content: "Papan peringkat satu mata pelajaran di TryOutKu." },
      { property: "og:title", content: "Peringkat — TryOutKu" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: PeringkatPage,
});

function PeringkatPage() {
  const { examId } = Route.useParams();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [token] = useState(() => readGuest()?.token ?? null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["hasil", examId, token],
    queryFn: () => getResults({ data: { examId, guestToken: token } }),
  });

  return (
    <AppShell pathname={pathname}>
      {isLoading ? (
        <CatalogBoardSkeleton />
      ) : isError || !data?.exam ? (
        <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-card text-muted-foreground shadow-[var(--shadow-card)]">
            <FileQuestion className="h-7 w-7" />
          </span>
          <h1 className="type-title-3 mt-6">Peringkat tidak bisa dimuat.</h1>
          <p className="type-callout mt-2 text-muted-foreground">
            Katalognya mungkin sudah dihapus, atau server sedang tidak bisa membaca database.
          </p>
          <Link
            to="/katalog"
            className={buttonVariants({ variant: "secondary", className: "mt-8" })}
          >
            Kembali ke katalog
          </Link>
        </div>
      ) : (
        <CatalogBoardView exam={data.exam} entries={data.leaderboard} meId={data.meId} />
      )}
    </AppShell>
  );
}
