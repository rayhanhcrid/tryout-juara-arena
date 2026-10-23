import { createFileRoute, redirect } from "@tanstack/react-router";

// There is no overall leaderboard: each catalog has its own. Old `/peringkat?exam=…`
// links go to that catalog's board; a bare `/peringkat` goes to the catalog.
export const Route = createFileRoute("/peringkat/")({
  validateSearch: (search: Record<string, unknown>): { exam?: string } =>
    typeof search["exam"] === "string" && search["exam"] ? { exam: search["exam"] } : {},
  beforeLoad: ({ search }) => {
    if (search.exam) {
      throw redirect({ to: "/peringkat/$examId", params: { examId: search.exam }, replace: true });
    }
    throw redirect({ to: "/katalog", replace: true });
  },
});
