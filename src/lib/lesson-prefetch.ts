// Starts opening a lesson before the page changes, so the lesson page finds it ready (same query keys as the topic page).
import type { QueryClient } from "@tanstack/react-query";
import { getLessonFn } from "@/lib/api/lesson.functions";
import { openLessonFn } from "@/lib/api/lesson-open.functions";

export type TopicParams = { subject: string; chapter: string; quest: string; topic: string };

export function lessonOpenKey(params: TopicParams, search: { attempt?: number; preview?: 1 } = {}) {
  return ["lesson-open", params, search] as const;
}

export async function prefetchLesson(qc: QueryClient, params: TopicParams) {
  try {
    const r = await qc.fetchQuery({
      queryKey: lessonOpenKey(params),
      queryFn: () => openLessonFn({ data: { ...params, preview: false } }),
      staleTime: Infinity,
    });
    if (r?.kind === "session") {
      await qc.prefetchQuery({ queryKey: ["lesson", r.sessionId], queryFn: () => getLessonFn({ data: { sessionId: r.sessionId } }), staleTime: Infinity });
    }
  } catch { /* the lesson page retries on its own */ }
}
