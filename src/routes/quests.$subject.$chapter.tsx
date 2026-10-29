import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: permanently moved to /[subject]/[chapter].
export const Route = createFileRoute("/quests/$subject/$chapter")({
  beforeLoad: ({ params }) => { throw redirect({ to: "/$subject/$chapter", params, statusCode: 301 }); },
});
