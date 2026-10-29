import { cameFromChat, markChatOpen } from "@/lib/chat-open";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "lucide-react";
import { meQueryOptions } from "./route";
import { NavCard, SecureChip, StatusChip } from "@/components/learn/NavCard";
import { EmptyState, FriendlyError, PageHeader, PageSkeleton } from "@/components/learn/PageStates";
import { BackLink } from "@/components/learn/BackLink";
import { Button } from "@/components/ui/button";
import { slug, topicStatus, topicsFor } from "@/lib/subjects";
import { useStartTopic } from "@/lib/use-start-topic";
import { STEP_LABELS } from "@/shared/contracts/step-labels";

export const Route = createFileRoute("/_authenticated/$subject/$chapter/$quest/")({
  head: () => ({
    meta: [
      { title: "Lines and Their Steepness · uLesson Tutor" },
      { name: "description", content: "Each topic is one 30-minute session in 8 steps." },
      { property: "og:title", content: "Topics | uLesson AI Tutor" },
      { property: "og:description", content: "Each topic is one 30-minute session in 8 steps." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Topics,
});

function Topics() {
  const { subject, chapter, quest } = Route.useParams();
  const { data: me, isLoading, isError, refetch } = useQuery(meQueryOptions);
  const { open, busy, error } = useStartTopic();
  const router = useRouter();
  if (isLoading) return <PageSkeleton />;
  if (isError || !me) return <FriendlyError onRetry={() => refetch()} />;
  const topics = topicsFor(me.topics, subject).filter((t) => slug(t.chapter ?? "General") === chapter && slug(t.quest ?? "Quest") === quest);
  const questName = topics[0]?.quest ?? "Topics";
  const next = topics.find((t) => !t.secure);
  return (
    <main className="mx-auto max-w-2xl px-5 pb-12 pt-4">
      <BackLink to="/$subject/$chapter" params={{ subject, chapter }} label="Quests" onClick={(e) => { if (cameFromChat()) { e.preventDefault(); markChatOpen(); void router.navigate({ to: "/" }); } }} />
      <PageHeader eyebrow={questName} title="Topics" subtitle="Each topic is one session of about 30 minutes." />
      {error && <p className="mb-4 rounded-xl bg-warning px-4 py-3 text-warning-foreground" role="alert">{error}</p>}
      <div className="space-y-3">
        {topics.length === 0 && <EmptyState title="No lessons loaded yet" />}
        {topics.map((t, i) => {
          const st = topicStatus(t);
          const isNext = t === next;
          return (
            <NavCard key={t.id} title={`${i + 1} · ${t.displayName}`} highlight={isNext}
              icon={<Feather className={`h-6 w-6 ${t.secure ? "text-reward" : ""}`} aria-hidden />}
              chip={t.activeSessionId ? <StatusChip tone="progress">Continue{t.activeStep ? ` · ${STEP_LABELS[t.activeStep]}` : ""}</StatusChip> : st === "secure" ? <SecureChip /> : st === "in_progress" ? <StatusChip tone="progress">In progress{t.activeStep ? ` · ${STEP_LABELS[t.activeStep]}` : ""}</StatusChip> : <StatusChip tone={isNext ? "next" : "neutral"}>{isNext ? "Recommended next · Not started" : "Not started"}</StatusChip>}>
              {isNext && (
                <>
                  <p className="mt-3 text-sm text-muted-foreground">8 steps: warm-up, hook, video, simulation, practice, guided questions, exit ticket, reflect.</p>
                  <Button size="lg" className="mt-4 h-13 w-full rounded-xl text-base" disabled={busy === t.id} onClick={() => open(t)}>
                    {busy === t.id ? "Opening…" : t.activeSessionId ? `Continue ${t.displayName}` : `Start ${t.displayName}`}
                  </Button>
                </>
              )}
              {!isNext && (
                <Button variant="outline" className="mt-3 h-11 w-full rounded-xl" disabled={busy === t.id} onClick={() => open(t)}>
                  {t.activeSessionId ? "Continue" : t.secure ? "Review" : "Start"}
                </Button>
              )}
            </NavCard>
          );
        })}
      </div>
    </main>
  );
}
