import { createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { ProfileView } from "@/components/profile/profile-view";
import { readGuest, type Guest } from "@/lib/exam-session";
import { fetchProfile, signOut } from "@/lib/participant-api";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — lulustes" },
      {
        name: "description",
        content: "Hari beruntun, skor harian, dan riwayat paket soalmu di lulustes.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfilPage,
});

function ProfilPage() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // undefined until read on the client; null when this browser has no participant.
  const [guest, setGuest] = useState<Guest | null | undefined>(undefined);
  useEffect(() => setGuest(readGuest()), []);

  const profile = useQuery({
    queryKey: ["profil", guest?.id ?? null],
    enabled: !!guest,
    queryFn: () => fetchProfile(guest!),
  });

  const [signingOut, setSigningOut] = useState(false);
  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    queryClient.clear();
    toast.success("Kamu sudah keluar dari akun.");
    navigate({ to: "/hari-ini", replace: true });
  }

  return (
    <AppShell pathname={pathname}>
      <ProfileView
        guest={guest}
        profile={guest ? profile.data : undefined}
        failed={profile.isError}
        onSignOut={() => void handleSignOut()}
        signingOut={signingOut}
      />
    </AppShell>
  );
}
