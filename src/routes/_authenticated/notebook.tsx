import { createFileRoute } from "@tanstack/react-router";
import { FitilaShell } from "@/components/home/FitilaShell";
import { PageSkeleton } from "@/components/learn/PageStates";
import { useHomeData } from "./index";

export const Route = createFileRoute("/_authenticated/notebook")({
  head: () => ({
    meta: [
      { title: "Notebook | uLesson AI Tutor" },
      { name: "description", content: "Your notebook of worked examples and notes is coming soon." },
      { property: "og:title", content: "Notebook | uLesson AI Tutor" },
      { property: "og:description", content: "Your notebook is coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Notebook,
});

function Notebook() {
  const { me, home, tutorName } = useHomeData();
  if (me.isLoading || home.isLoading) return <PageSkeleton rows={2} />;
  return (
    <FitilaShell initials={home.data?.initials ?? "ME"} streak={home.data?.streak ?? 0} tutorName={tutorName} isAdmin={!!me.data?.isAdmin}>
      <main className="mx-auto w-full max-w-[740px] px-4 pb-28 pt-28 text-center">
        <h1 className="font-kalam text-4xl text-fh-heading">Notebook</h1>
        <p className="mt-4 text-fh-sub">Coming soon.</p>
      </main>
    </FitilaShell>
  );
}
