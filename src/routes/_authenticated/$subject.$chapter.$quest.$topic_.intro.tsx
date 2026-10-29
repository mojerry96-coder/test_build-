import { createFileRoute, redirect } from "@tanstack/react-router";

// Old topic intro address: the intro now lives in Fiti's chat on the "Let's Begin" map.
export const Route = createFileRoute("/_authenticated/$subject/$chapter/$quest/$topic_/intro")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject/$chapter/$quest/$topic/path", params, replace: true }); },
});
