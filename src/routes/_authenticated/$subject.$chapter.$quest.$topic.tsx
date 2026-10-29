import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getLessonFn } from "@/lib/api/lesson.functions";
import { openLessonFn } from "@/lib/api/lesson-open.functions";
import { LessonProvider } from "@/components/lesson/context";
import { LessonScreen } from "@/components/lesson/LessonScreen";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { STEP_LABELS } from "@/shared/contracts/step-labels";
import { pageTitle } from "@/shared/routes";

export const Route = createFileRoute("/_authenticated/$subject/$chapter/$quest/$topic")({
  validateSearch: z.object({
    attempt: z.coerce.number().int().positive().optional().catch(undefined),
    preview: z.union([z.literal(1), z.literal("1").transform(() => 1 as const)]).optional().catch(undefined),
  }),
  head: () => ({
    meta: [
      { title: pageTitle("Gradient of a line") },
      { name: "description", content: "Your 8-step maths lesson with your AI tutor." },
      { property: "og:title", content: pageTitle("Lesson") },
      { property: "og:description", content: "Your 8-step maths lesson with your AI tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LessonPage,
});

function LessonPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const open = useServerFn(openLessonFn);
  const get = useServerFn(getLessonFn);
  const opened = useQuery({
    queryKey: ["lesson-open", params, search],
    queryFn: () => open({ data: { ...params, ...(search.attempt ? { attempt: search.attempt } : {}), preview: search.preview === 1 } }),
    staleTime: Infinity, retry: 1,
  });
  const r = opened.data;
  useEffect(() => {
    if (r?.kind === "redirect") navigate({ to: "/$subject/$chapter/$quest/$topic", params: r.to, search: r.search, replace: true });
    if (r?.kind === "locked") navigate({ to: "/$subject", params: { subject: r.subject }, replace: true });
  }, [r, navigate]);
  const sessionId = r?.kind === "session" ? r.sessionId : null;
  const lesson = useQuery({
    queryKey: ["lesson", sessionId],
    queryFn: () => get({ data: { sessionId: sessionId! } }),
    enabled: !!sessionId, staleTime: Infinity, retry: 1,
  });
  useEffect(() => {
    if (lesson.data) {
      document.title = pageTitle(lesson.data.topicName, STEP_LABELS[lesson.data.position.step]);
      document.documentElement.dataset["sessionId"] = lesson.data.sessionId;
      document.documentElement.dataset["lessonStep"] = lesson.data.position.step;
    }
    return () => { delete document.documentElement.dataset["sessionId"]; delete document.documentElement.dataset["lessonStep"]; };
  }, [lesson.data]);

  if (opened.isLoading || r?.kind === "redirect" || r?.kind === "locked" || (sessionId && lesson.isLoading)) return <PageSkeleton rows={4} />;
  if (opened.isError) return <FriendlyError onRetry={() => opened.refetch()} />;
  if (r?.kind === "notfound") return <FriendlyError message="We couldn't find that lesson." />;
  if (r?.kind === "error") return <FriendlyError message={r.message} onRetry={() => opened.refetch()} />;
  if (lesson.isError || !lesson.data) return <FriendlyError message={lesson.error instanceof Error ? lesson.error.message : undefined} onRetry={() => lesson.refetch()} />;
  return (
    <LessonProvider view={lesson.data}>
      <LessonScreen />
    </LessonProvider>
  );
}
