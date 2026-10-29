import { cameFromChat, markChatOpen } from "@/lib/chat-open";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { FitilaShell } from "@/components/home/FitilaShell";
import { PageHeading } from "@/components/path/PageHeading";
import { SearchBox } from "@/components/home/SearchBox";
import { ChapterBanner, ChapterCard } from "@/components/chapters/ChapterParts";
import { useHomeData } from "./index";
import { slug, topicsFor } from "@/lib/subjects";
import { chapterRows } from "@/shared/chapters-display";
import { LESSON_STEPS } from "@/shared/contracts/enums";

export const Route = createFileRoute("/_authenticated/$subject/")({
  head: () => ({
    meta: [
      { title: "Mathematics · uLesson Tutor" },
      { name: "description", content: "Your WAEC learning path, organised into focused chapters." },
      { property: "og:title", content: "Choose a chapter | uLesson AI Tutor" },
      { property: "og:description", content: "Your WAEC learning path, organised into focused chapters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Chapters,
});

function Chapters() {
  const { subject } = Route.useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const { me, home, tutorName } = useHomeData();
  if (me.isLoading || home.isLoading) return <PageSkeleton />;
  if (me.isError || home.isError || !me.data || !home.data) return <FriendlyError onRetry={() => { void me.refetch(); void home.refetch(); }} />;

  const topics = topicsFor(me.data.topics, subject);
  const all = chapterRows(topics);
  const rows = all.filter((r) => r.name.toLowerCase().includes(q.trim().toLowerCase()));
  // Banner always shows: the lesson in progress, else the first unfinished topic at 0%.
  const active = topics.find((t) => t.activeSessionId) ?? topics.find((t) => !t.secure) ?? topics[0];
  const openLesson = () => active && navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: active.path });

  return (
    <FitilaShell initials={home.data.initials} streak={home.data.streak} tutorName={tutorName} isAdmin={me.data.isAdmin}>
      <main className="mx-auto w-full max-w-[1536px] px-4 pb-28 pt-24 md:px-[clamp(32px,5vw,94px)] md:pb-12 md:pt-[clamp(110px,14vh,150px)]">
        <PageHeading onBack={() => { if (cameFromChat()) { markChatOpen(); void navigate({ to: "/" }); } else void navigate({ to: "/learning-hub" }); }}>Choose a chapter</PageHeading>

        {active && (
          <ChapterBanner chapter={active.chapter ?? ""} topic={active.displayName}
            step={!active.resumeLesson ? 0 : active.activeSessionId ? (active.activeStep ? LESSON_STEPS.indexOf(active.activeStep) + 1 : 1) : 0} onContinue={openLesson} />
        )}

        <section id="chapters" aria-label="Chapters" className={"relative " + (active ? "mt-10 md:mt-[56px]" : "mt-8 md:mt-10")}>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h2 className="font-display text-2xl font-bold leading-tight text-fh-heading md:text-[27px]">Explore the maths universe</h2>
              <p className="mt-1 text-[14px] text-fh-sub">Every chapter is a new world of ideas to unlock.</p>
            </div>
            <SearchBox value={q} onChange={setQ} count={rows.length} placeholder="Find a chapter" label="Search chapters" noun={["chapter", "chapters"]} className="md:w-[420px]" />
          </div>
          {rows.length === 0
            ? <p className="mt-6 text-center text-fh-sub">No chapters match</p>
            : (
              <div className="mt-[28px] grid grid-cols-1 gap-x-[16px] gap-y-[24px] md:grid-cols-2 xl:grid-cols-4">
                {rows.map((r) => (
                  <ChapterCard key={r.num} row={r} onOpen={r.open ? () => void navigate({ to: "/$subject/$chapter", params: { subject, chapter: slug(r.dbName ?? r.name) } }) : undefined} />
                ))}
              </div>
            )}
        </section>
      </main>
    </FitilaShell>
  );
}
