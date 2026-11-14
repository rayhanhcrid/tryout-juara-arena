import { createFileRoute, redirect } from "@tanstack/react-router";

// The participant's dashboard is the profile now; keep old dashboard links working.
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/profil", replace: true });
  },
});
