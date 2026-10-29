import { cameFromChat, markChatOpen } from "@/lib/chat-open";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { FitilaShell } from "@/components/home/FitilaShell";
import { PageHeading } from "@/components/path/PageHeading";
import { GreatChoiceDialog } from "@/components/path/GreatChoiceDialog";
import { QuestCard } from "@/components/quests/QuestParts";
import { getTopicIntroFn } from "@/lib/api/topic-intro.functions";
import { useHomeData } from "./index";
import type { TopicPath } from "@/shared/routes";
import parrot from "@/assets/home/parrot-wave-full.png.asset.json";
import { slug, topicsFor } from "@/lib/subjects";
import { questRows } from "@/shared/quests-display";

export const Route = createFileRoute("/_authenticated/$subject/$chapter/")({
  head: () => ({
    meta: [
      { title: "Choose a quest · uLesson Tutor" },
      { name: "description", content: "Each quest is a short learning journey made of connected topics." },
      { property: "og:title", content: "Choose a quest | uLesson AI Tutor" },
      { property: "og:description", content: "Each quest is a short learning journey made of connected topics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Quests,
});

function Quests() {
  const { subject, chapter } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getIntro = useServerFn(getTopicIntroFn);
  const { me, home, tutorName } = useHomeData();
  const [pick, setPick] = useState<{ path: TopicPath; line: string | null } | null>(null);
  if (me.isLoading || home.isLoading) return <PageSkeleton />;
  if (me.isError || home.isError || !me.data || !home.data) return <FriendlyError onRetry={() => { void me.refetch(); void home.refetch(); }} />;
  const topics = topicsFor(me.data.topics, subject).filter((t) => t.path.chapter === chapter);
  const chapterName = topics[0]?.chapter ?? "Chapter";
  const rows = questRows(chapterName, topics);
  // One topic: the Great Choice popup, then its map. Two or more: the Topics list.
  const go = (q: string) => () => {
    const qs = topics.filter((t) => t.quest === q);
    const t = qs[0];
    if (qs.length === 1 && t) {
      setPick({ path: t.path, line: null });
      void qc.fetchQuery({ queryKey: ["topic-intro", t.path], queryFn: () => getIntro({ data: t.path }), staleTime: 60_000 })
        .then((r) => setPick((p) => (p && r.kind === "intro" ? { ...p, line: r.pathLines["path_popup"]?.[0] ?? null } : p)))
        .catch(() => undefined);
    } else void navigate({ to: "/$subject/$chapter/$quest", params: { subject, chapter, quest: t?.path.quest ?? slug(q) } });
  };

  return (
    <FitilaShell initials={home.data.initials} streak={home.data.streak} tutorName={tutorName} isAdmin={me.data.isAdmin}>
      <main className="mx-auto w-full max-w-[1536px] px-4 pb-28 pt-24 md:px-[clamp(32px,5vw,94px)] md:pb-12 md:pt-[clamp(110px,14vh,150px)]">
        <PageHeading onBack={() => { if (cameFromChat()) { markChatOpen(); void navigate({ to: "/" }); } else void navigate({ to: "/$subject", params: { subject } }); }}>Choose a quest</PageHeading>
        <section id="quests" aria-label="Quests" className="relative mt-8 md:mt-12 xl:pr-[200px]">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {rows.map((r) => <QuestCard key={r.num} row={r} onOpen={r.open && r.dbName ? go(r.dbName) : undefined} />)}
          </div>
        </section>
        <img src={parrot.url} alt="" aria-hidden className="pointer-events-none fixed bottom-6 right-[clamp(16px,3vw,64px)] z-0 hidden h-[clamp(200px,30vh,320px)] w-auto object-contain xl:block" />
      </main>
      <GreatChoiceDialog open={!!pick} line={pick?.line ?? null} onClose={() => setPick(null)}
        onContinue={() => { if (pick) void navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: pick.path }); }} />
    </FitilaShell>
  );
}
