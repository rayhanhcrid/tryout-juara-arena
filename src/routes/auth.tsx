import { createFileRoute, redirect } from "@tanstack/react-router";

// Old sign-in links land on the (optional) participant sign-in.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/masuk", replace: true });
  },
});
