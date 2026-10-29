import { dressV2 } from "@/components/lesson/lab-v2-reader";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { checkAdminFn } from "@/lib/api/me.functions";
import { LAB_V2_PATH } from "@/shared/lab-v2";

export const Route = createFileRoute("/_authenticated/admin_/sim-preview")({
  head: () => ({
    meta: [
      { title: "Admin · Gradient Lab v2 preview · uLesson Tutor" },
      { name: "description", content: "Gradient Lab v2 exactly as the simulation team built it." },
      { property: "og:title", content: "Admin · Gradient Lab v2 preview · uLesson Tutor" },
      { property: "og:description", content: "Gradient Lab v2 exactly as the simulation team built it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SimPreview,
});

function SimPreview() {
  const { data, isLoading } = useQuery({ queryKey: ["is-admin"], queryFn: () => checkAdminFn() });
  if (isLoading) return <p className="p-6 text-muted-foreground">Loading…</p>;
  if (!data?.isAdmin) return <main className="mx-auto max-w-md px-5 py-12 text-center"><h1 className="text-2xl font-bold">Not available</h1></main>;
  return (
    <main className="flex h-screen flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 text-sm">
        <h1 className="font-semibold">Gradient Lab v2 preview (unchanged copy)</h1>
        <a href={LAB_V2_PATH} target="_blank" rel="noreferrer" className="font-semibold text-primary underline">Open in new tab</a>
      </div>
      <iframe title="Gradient Lab v2" src={LAB_V2_PATH} onLoad={(e) => dressV2(e.currentTarget)} className="w-full flex-1" allow="autoplay" />
    </main>
  );
}
