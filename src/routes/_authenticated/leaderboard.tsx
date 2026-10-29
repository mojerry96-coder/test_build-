import { createFileRoute, redirect } from "@tanstack/react-router";

// Redirect-only: the Leaderboard now lives as a side tab on lesson steps.
export const Route = createFileRoute("/_authenticated/leaderboard")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
});
