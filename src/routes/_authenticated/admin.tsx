import { TestDataCard } from "@/components/TestDataCard";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { checkAdminFn } from "@/lib/api/me.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin · uLesson Tutor" },
      { name: "description", content: "Admin tools for uLesson AI Tutor." },
      { property: "og:title", content: "Admin | uLesson AI Tutor" },
      { property: "og:description", content: "Admin tools for uLesson AI Tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { data, isLoading } = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdminFn() });
  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!data?.isAdmin) {
    return <main className="mx-auto max-w-md px-5 py-12 text-center"><h1 className="text-2xl font-bold">Not available</h1></main>;
  }
  return (
    <main className="mx-auto max-w-2xl px-5 py-8">
      <h1 className="text-3xl font-bold">Admin</h1>
      <Link to="/admin/sim-preview" className="mt-6 block rounded-2xl border border-border p-6 hover:bg-muted">
        <span className="font-semibold">Gradient Lab v2 preview</span>
      </Link>
      <Link to="/admin/content-import" className="mt-6 block rounded-2xl border border-border p-6 hover:bg-muted">
        <span className="font-semibold">Content import</span>
        <span className="block text-sm text-muted-foreground">Check and import lesson content packs, and see past imports.</span>
      </Link>
      <Link to="/admin/settings" className="mt-4 block rounded-2xl border border-border p-6 hover:bg-muted">
        <span className="font-semibold">Settings</span>
        <span className="block text-sm text-muted-foreground">Admin tools switch for testing.</span>
      </Link>
      <TestDataCard />
    </main>
  );
}
