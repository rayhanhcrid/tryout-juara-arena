import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell, useGuestName } from "@/components/app-shell";
import { TodayView, type RunningSession } from "@/components/daily/today-view";
import { deviceId, readGuest, readSession, sessionKeys, type Guest } from "@/lib/exam-session";
import { todayWib } from "@/lib/format";
import { fetchDaily, fetchNews, fetchResults, type Daily } from "@/lib/participant-api";

export const Route = createFileRoute("/hari-ini")({
  loader: async (): Promise<{ daily: Daily | null; failed: boolean }> => {
    try {
      return { daily: await fetchDaily(null), failed: false };
    } catch {
      return { daily: null, failed: true };
    }
  },
  head: () => ({
    meta: [
      { title: "Hari ini — lulustes" },
      {
        name: "description",
        content: "Paket soal hari ini, hari beruntunmu, peringkat hari ini, dan berita seleksi.",
      },
      { property: "og:title", content: "Paket hari ini — lulustes" },
      {
        property: "og:description",
        content: "Satu paket soal setiap hari untuk persiapan tes CPNS, BUMN, dan ODP.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: HariIniPage,
});

function HariIniPage() {
  const loaded = Route.useLoaderData();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const guestName = useGuestName();

  // undefined until read on the client; null when this browser has no guest yet.
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => setGuest(readGuest()), []);

  const personal = useQuery({
    queryKey: ["daily", guest?.id ?? null],
    enabled: !!guest,
    queryFn: () => fetchDaily(guest ?? null),
  });
  const daily = personal.data ?? loaded.daily;
  const pkg = daily?.package ?? null;

  const board = useQuery({
    queryKey: ["hasil", pkg?.id ?? null, guest?.id ?? null],
    enabled: !!pkg && guest !== undefined,
    queryFn: () => fetchResults(pkg!.id, guest ?? null),
  });

  const news = useQuery({ queryKey: ["news", 3], queryFn: () => fetchNews(3) });

  // An attempt at today's package left running (or timed out) in this browser.
  const [session, setSession] = useState<RunningSession | null>(null);
  useEffect(() => {
    if (!pkg) return setSession(null);
    const state = readSession(sessionKeys(deviceId(), pkg.id), pkg.duration_minutes);
    setSession(
      state.status === "running" || (state.status === "expired" && state.hasAnswers)
        ? { deadline: state.deadline, durationMinutes: pkg.duration_minutes }
        : null,
    );
  }, [pkg]);

  return (
    <AppShell pathname={pathname}>
      <TodayView
        today={daily?.today ?? todayWib()}
        daily={daily}
        failed={loaded.failed && !personal.data}
        name={guestName}
        session={session}
        board={board.data?.leaderboard ?? (board.isError ? [] : null)}
        meId={board.data?.meId ?? null}
        news={news.data ?? (news.isError ? [] : null)}
      />
    </AppShell>
  );
}
