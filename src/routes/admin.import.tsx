import { createFileRoute, redirect } from "@tanstack/react-router";

// Old address: permanently moved to /admin/content-import.
export const Route = createFileRoute("/admin/import")({
  beforeLoad: () => { throw redirect({ to: "/admin/content-import", statusCode: 301 }); },
});
