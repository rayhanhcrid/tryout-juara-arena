import { createFileRoute, redirect } from "@tanstack/react-router";

// The catalog moved to /katalog when accounts were dropped; keep old links working.
export const Route = createFileRoute("/dashboard")({
  beforeLoad: () => {
    throw redirect({ to: "/katalog", replace: true });
  },
});
