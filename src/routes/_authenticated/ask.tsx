import { createFileRoute, redirect } from "@tanstack/react-router";

// The Ask chat now lives on the start page; old links land there.
export const Route = createFileRoute("/_authenticated/ask")({
  beforeLoad: () => { throw redirect({ to: "/" }); },
});
