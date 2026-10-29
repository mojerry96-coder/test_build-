// Leaderboard side tab on lesson steps: her own progress (steps, stars, correct answers). Styled like the lab's Worksheet tab.
import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Star, Target, Trophy } from "lucide-react";
import { SideTab } from "@/components/side-tab/SideTab";
import { progressFn } from "@/lib/api/progress.functions";
import { LESSON_STEPS, type LessonStep } from "@/shared/contracts/enums";
import { cn } from "@/lib/utils";

export function LeaderboardTab({ sessionId, step, finished, titles, evidenceCount }: { sessionId: string; step: LessonStep; finished: boolean; titles: Record<LessonStep, string>; evidenceCount: number }) {
  const [open, setOpen] = useState(false);
  const idx = LESSON_STEPS.indexOf(step);
  const done = finished ? 8 : Math.max(0, idx);
  const get = useServerFn(progressFn);
  const q = useQuery({ queryKey: ["progress", sessionId, done, evidenceCount], queryFn: () => get({ data: { sessionId, done } }), staleTime: 15_000 });
  const paused = useRef<HTMLVideoElement | null>(null);

  const change = (o: boolean) => {
    if (o) {
      const v = document.querySelector<HTMLVideoElement>('[data-testid="video-player"] video');
      if (v && !v.paused) { v.pause(); paused.current = v; }
      void q.refetch();
    } else if (paused.current) { void paused.current.play().catch(() => {}); paused.current = null; }
    setOpen(o);
  };

  const d = q.data;
  return (
    <SideTab label="Leaderboard" ariaLabel="Leaderboard: see your progress" icon={<Trophy className="h-4 w-4" />}
      tabClass={cn(step === "simulation" ? "top-[66%]" : "top-[42%]", "max-md:top-auto max-md:bottom-[200px]")}
      title={<><Trophy className="h-5 w-5" aria-hidden />Leaderboard</>} description={d?.fitiLine || "Your progress in this lesson."}
      open={open} onOpenChange={change}>
          {q.isError && <p className="mt-4 text-sm">We couldn't load your progress. <button className="underline" onClick={() => void q.refetch()}>Try again</button></p>}
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[16px] border border-fh-box-line p-3">
              <p className="flex items-center gap-1 text-[13px] font-semibold"><Star className="h-4 w-4 fill-current text-hub-flame" aria-hidden />Stars</p>
              <p className="mt-1 text-[26px] font-bold text-hub-heading">{d?.stars ?? "–"}</p>
              <p className="text-[12px]">{d ? `${d.topicStars} in this topic` : " "}</p>
            </div>
            <div className="rounded-[16px] border border-fh-box-line p-3">
              <p className="flex items-center gap-1 text-[13px] font-semibold"><Target className="h-4 w-4" aria-hidden />Correct</p>
              <p className="mt-1 text-[26px] font-bold text-hub-heading">{d ? `${d.correct}/${d.tried}` : "–"}</p>
              <p className="text-[12px]">answers right</p>
            </div>
          </div>
          <h3 className="mt-6 text-[15px] font-bold text-hub-heading">{done === 0 ? "No steps yet" : `${done} of 8 steps`}</h3>
          <ol className="mt-2 space-y-2">
            {LESSON_STEPS.map((s, i) => {
              const st = i < done ? "done" : i === idx && !finished ? "current" : "todo";
              return (
                <li key={s} className={cn("flex items-center gap-3 rounded-[12px] border px-3 py-2 text-[14px]", st === "current" ? "border-fh-box-edge font-bold" : "border-fh-box-line", st === "todo" && "opacity-70")}>
                  <span aria-hidden className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12px] font-bold", st === "done" ? "bg-step-done text-primary-foreground" : st === "current" ? "bg-step-current text-primary-foreground" : "bg-step-todo")}>
                    {st === "done" ? <Check className="h-4 w-4" /> : i + 1}
                  </span>
                  {titles[s]}<span className="sr-only">{st === "done" ? " (done)" : st === "current" ? " (you are here)" : " (not yet)"}</span>
                </li>
              );
            })}
          </ol>
    </SideTab>
  );
}
