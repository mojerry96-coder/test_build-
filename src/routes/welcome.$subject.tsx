import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: the subject welcome page was removed; forwards to Choose a chapter.
export const Route = createFileRoute("/welcome/$subject")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject", params, statusCode: 301 }); },
});
