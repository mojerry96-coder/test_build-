import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { FitilaShell } from "@/components/home/FitilaShell";
import { planLabel } from "@/components/home/FitilaAgent";
import { PageSkeleton } from "@/components/learn/PageStates";
import { useHomeData } from "./index";

export const Route = createFileRoute("/_authenticated/my-plan")({
  head: () => ({
    meta: [
      { title: "My plan | uLesson AI Tutor" },
      { name: "description", content: "Everything in your study plan: lessons, reviews and work from your teacher." },
      { property: "og:title", content: "My plan | uLesson AI Tutor" },
      { property: "og:description", content: "Your study plan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MyPlan,
});

const SOURCE = { own: "Your plan", parent: "From your parent", teacher: "From your teacher" } as const;

function MyPlan() {
  const { me, home, tutorName } = useHomeData();
  if (me.isLoading || home.isLoading || !home.data) return <PageSkeleton rows={3} />;
  const h = home.data;
  const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { weekday: "short", hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" }) : "Tonight");
  return (
    <FitilaShell initials={h.initials} streak={h.streak} tutorName={tutorName} isAdmin={!!me.data?.isAdmin}>
      <main className="mx-auto w-full max-w-[740px] px-4 pb-28 pt-28">
        <h1 className="font-kalam text-4xl text-fh-heading">My plan</h1>
        <ul className="mt-6 space-y-3">
          {h.allPlan.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-[16px] bg-fh-card px-5 py-4">
              <span className="w-24 shrink-0 text-sm font-semibold text-fh-box-edge">{when(p.planned_for ?? p.due_at)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-fh-ink">{planLabel(p)}</span>
                <span className="block text-xs text-fh-sub">{SOURCE[p.source]}</span>
              </span>
              <span className={p.done ? "text-fh-box-edge" : "text-fh-sub"} aria-label={p.done ? "Done" : "Not done"}>{p.done ? <Check className="h-5 w-5" /> : "Not done"}</span>
            </li>
          ))}
          {h.allPlan.length === 0 && <li className="text-fh-sub">Nothing planned yet.</li>}
        </ul>
      </main>
    </FitilaShell>
  );
}
