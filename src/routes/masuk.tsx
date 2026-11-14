import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SignInView, type SignInMode } from "@/components/account/sign-in-view";
import { AppShell } from "@/components/app-shell";
import { readGuest, type Guest } from "@/lib/exam-session";
import { registerAccount, signIn } from "@/lib/participant-api";

export const Route = createFileRoute("/masuk")({
  validateSearch: (search: Record<string, unknown>): { mode?: SignInMode } =>
    search["mode"] === "daftar" ? { mode: "daftar" } : {},
  head: () => ({
    meta: [
      { title: "Masuk — lulustes" },
      {
        name: "description",
        content: "Masuk atau buat akun lulustes untuk melihat hari beruntun dan skor harianmu.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasukPage,
});

function MasukPage() {
  const { mode = "masuk" } = Route.useSearch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => setGuest(readGuest()), []);

  function setMode(next: SignInMode) {
    navigate({ to: "/masuk", search: next === "daftar" ? { mode: "daftar" } : {}, replace: true });
  }

  function done() {
    // Everything personal was read as someone else (or no one). Each page
    // mounts its own shell, so the bar reads the new participant on arrival.
    void queryClient.invalidateQueries();
    navigate({ to: "/profil", replace: true });
  }

  return (
    <AppShell pathname={pathname}>
      <SignInView
        mode={mode}
        onModeChange={setMode}
        guest={guest}
        onSignIn={signIn}
        onRegister={registerAccount}
        onDone={done}
      />
    </AppShell>
  );
}
