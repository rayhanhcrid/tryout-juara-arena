import { createFileRoute, Outlet } from "@tanstack/react-router";

// Parent of the per-catalog boards (/peringkat/$examId) and the /peringkat redirect.
export const Route = createFileRoute("/peringkat")({
  component: Outlet,
});
