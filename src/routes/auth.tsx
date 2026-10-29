import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: permanently moved to /sign-in.
export const Route = createFileRoute("/auth")({
  beforeLoad: () => { throw redirect({ to: "/sign-in", statusCode: 301 }); },
});
