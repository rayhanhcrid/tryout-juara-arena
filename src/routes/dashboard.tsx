import { createFileRoute, redirect } from "@tanstack/react-router";

// The routine's home is Hari ini now; keep old dashboard links working.
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/hari-ini", replace: true });
  },
});
