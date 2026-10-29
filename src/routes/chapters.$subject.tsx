import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: permanently moved to /[subject].
export const Route = createFileRoute("/chapters/$subject")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject", params, statusCode: 301 }); },
});
