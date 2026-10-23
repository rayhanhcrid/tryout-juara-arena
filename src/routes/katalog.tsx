import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell, useGuestName } from "@/components/app-shell";
import { CatalogView, type SessionBanner } from "@/components/catalog/catalog-view";
import { fetchCatalog, type CatalogEntry } from "@/lib/participant-api";
import { deviceId, readGuest, readSession, sessionKeys, type Guest } from "@/lib/exam-session";

export const Route = createFileRoute("/katalog")({
  loader: async (): Promise<{ exams: CatalogEntry[]; failed: boolean }> => {
    try {
      const exams = await fetchCatalog(null);
      return { exams, failed: false };
    } catch {
      return { exams: [], failed: true };
    }
  },
  head: () => ({
    meta: [
      { title: "Katalog — TryOutKu" },
      { name: "description", content: "Pilih mata pelajaran, tulis namamu, lalu mulai try out." },
      { property: "og:title", content: "Katalog — TryOutKu" },
      {
        property: "og:description",
        content: "Pilih mata pelajaran, tulis namamu, lalu mulai try out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KatalogPage,
});

function KatalogPage() {
  const loaded = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const guestName = useGuestName();

  // undefined until read on the client; null when this browser has no guest yet.
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => setGuest(readGuest()), []);

  const personal = useQuery({
    queryKey: ["catalog", guest?.id ?? null],
    enabled: !!guest,
    queryFn: async () => ({ exams: await fetchCatalog(guest ?? null) }),
  });
  const exams = personal.data?.exams ?? loaded.exams;

  // Attempts left running (or timed out) in this browser.
  const [sessions, setSessions] = useState<SessionBanner[]>([]);
  useEffect(() => {
    const owner = deviceId();
    const found: SessionBanner[] = [];
    for (const exam of exams) {
      const state = readSession(sessionKeys(owner, exam.id), exam.duration_minutes);
      if (state.status === "running" || (state.status === "expired" && state.hasAnswers)) {
        found.push({
          examId: exam.id,
          title: exam.title,
          durationMinutes: exam.duration_minutes,
          status: state.status,
          deadline: state.deadline,
        });
      }
    }
    setSessions(found);
  }, [exams]);

  return (
    <AppShell pathname={pathname}>
      <CatalogView
        name={guestName}
        items={exams}
        sessions={sessions}
        loading={false}
        failed={loaded.failed && !personal.data}
      />
    </AppShell>
  );
}
