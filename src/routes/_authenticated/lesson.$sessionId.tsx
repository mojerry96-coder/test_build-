import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { lessonPathForSessionFn } from "@/lib/api/lesson-open.functions";
import { PageSkeleton } from "@/components/learn/PageStates";

// Old address: forwards to the owner's readable lesson address, or Home for anyone else.
export const Route = createFileRoute("/_authenticated/lesson/$sessionId")({
  head: () => ({ meta: [{ title: "Lesson · uLesson Tutor" }, { name: "robots", content: "noindex" }] }),
  component: OldLesson,
});

function OldLesson() {
  const { sessionId } = Route.useParams();
  const navigate = useNavigate();
  const find = useServerFn(lessonPathForSessionFn);
  useEffect(() => {
    const ok = /^[0-9a-f-]{36}$/i.test(sessionId);
    (ok ? find({ data: { sessionId } }) : Promise.resolve(null))
      .then((r) => r ? navigate({ to: "/$subject/$chapter/$quest/$topic", params: r.to, search: r.search, replace: true }) : navigate({ to: "/", replace: true }))
      .catch(() => navigate({ to: "/", replace: true }));
  }, [sessionId, find, navigate]);
  return <PageSkeleton rows={4} />;
}
