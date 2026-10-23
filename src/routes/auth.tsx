import { createFileRoute, redirect } from "@tanstack/react-router";

// Participants no longer need an account; old sign-in links land on the catalog.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/katalog", replace: true });
  },
});
