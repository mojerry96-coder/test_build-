import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: the Meet your tutor page was removed; send visitors Home.
export const Route = createFileRoute("/meet-your-tutor")({
  beforeLoad: () => { throw redirect({ to: "/", statusCode: 301 }); },
});
