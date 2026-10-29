import { createFileRoute, redirect } from "@tanstack/react-router";

// The subject welcome page was removed; this address forwards permanently to Choose a chapter.
export const Route = createFileRoute("/_authenticated/$subject/welcome")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject", params: { subject: params.subject }, statusCode: 301 }); },
});
