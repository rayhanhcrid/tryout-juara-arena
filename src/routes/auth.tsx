import { createFileRoute, redirect } from "@tanstack/react-router";

// Participants do not need an account; old sign-in links land on Hari ini.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/hari-ini", replace: true });
  },
});
