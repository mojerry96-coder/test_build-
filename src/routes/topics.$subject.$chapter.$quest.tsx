import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: permanently moved to /[subject]/[chapter]/[quest].
export const Route = createFileRoute("/topics/$subject/$chapter/$quest")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject/$chapter/$quest", params, statusCode: 301 }); },
});
