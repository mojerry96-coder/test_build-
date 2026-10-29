import { useEffect, useRef, useState } from "react";
import { Link, useBlocker, useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { TopBar } from "@/components/home/HomeParts";
import { LeaderboardTab } from "@/components/leaderboard/LeaderboardTab";
import { meQueryOptions } from "@/routes/_authenticated/route";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  LoaderCircle,
  Check,
  CircleDot,
  Mic,
  Settings2,
  WifiOff,
  X,
} from "lucide-react";
import { LESSON_STEPS, type LessonStep } from "@/shared/contracts/enums";
import { askTutorFn } from "@/lib/api/lesson.functions";
import { useLowData, useNetwork, useTextSize, type TextSize } from "@/lib/ui-prefs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { StudentBubble, TutorBubble } from "@/components/tutor/TutorBubble";
import { TutorAvatar } from "@/components/tutor/TutorAvatar";
import { useLesson } from "./context";
import { CollapsedTutor, TutorChatPanel, useFlip, useIsPhone, type PanelMsg } from "./TutorChatPanel";
import { PREVIEW_MS, collapseKey, newSince, previewLine } from "@/shared/tutor-collapse";
import { looksRaw } from "@/shared/contracts/chat-safety";
import { askLocked, askPlaceholder } from "@/shared/lesson-ask";
import { SimulationStage } from "./stages-a";
import { VideoStage } from "./VideoStage";
import { HookStage } from "./HookStage";
import { WarmupStage } from "./WarmupStage";
import { WarmupShell } from "./mcq/WarmupShell";
import { ExitStage, ReflectStage, WorksheetStage } from "./stages-b";
import { ProveStage } from "./ProveStage";

export const SHORT: Record<LessonStep, string> = {
  readiness: "Ready",
  hook: "Hook",
  video: "See",
  simulation: "Do",
  worksheet: "Practise",
  guided: "Guided",
  exit_ticket: "Exit ticket",
  reflection: "Reflect",
};
const TITLE: Record<LessonStep, string> = {
  readiness: "Warm-up",
  hook: "The puzzle",
  video: "See it",
  simulation: "Do it",
  worksheet: "Practise",
  guided: "Prove it (guided)",
  exit_ticket: "Exit ticket",
  reflection: "Reflect and close",
};

function StepBar({ current, onOpen }: { current: number; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="interactive flex min-h-11 w-full flex-col justify-center"
      aria-label={`Step ${current + 1} of 8. Open the step map`}
    >
      <div className="flex w-full gap-1">
        {LESSON_STEPS.map((s, i) => (
          <span
            key={s}
            className={cn(
              "h-1 flex-1 rounded-[2px]",
              i < current ? "bg-step-done" : i === current ? "bg-step-current" : "bg-step-todo",
            )}
          />
        ))}
      </div>
      <div className="mt-1 hidden gap-1 text-[0.7rem] font-semibold text-muted-foreground lg:flex">
        {LESSON_STEPS.map((s, i) => (
          <span
            key={s}
            className={cn("flex-1 text-left", i === current && "text-accent-foreground")}
          >
            {SHORT[s]}
          </span>
        ))}
      </div>
    </button>
  );
}

function StepList({ current }: { current: number }) {
  return (
    <ol className="space-y-1">
      {LESSON_STEPS.map((s, i) => (
        <li
          key={s}
          className={cn(
            "interactive flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm",
            i === current
              ? "bg-accent font-bold text-accent-foreground"
              : i < current
                ? "text-foreground"
                : "text-muted-foreground",
          )}
        >
          {i < current ? (
            <Check className="h-4 w-4 text-success" aria-label="Done" />
          ) : i === current ? (
            <CircleDot className="h-4 w-4" aria-label="You are here" />
          ) : (
            <span
              className="h-4 w-4 rounded-full border border-border"
              aria-label="Still to come"
            />
          )}
          <span className="min-w-0 flex-1">
            {i + 1} · {TITLE[s]}
          </span>
          {i === current && <span className="text-xs">You are here</span>}
        </li>
      ))}
    </ol>
  );
}


function LessonTutor({ onClose, className, grow, onCollapse, since, opener }: { onClose: () => void; className?: string; grow?: boolean; onCollapse?: () => void; since?: number | undefined; opener?: string | undefined }) {
  const { run, sessionId, say, studentSaid, tagLastStudent, busy, view, chat } = useLesson();
  const ask = useServerFn(askTutorFn);
  const state = view as typeof view & { status?: string; session?: { status?: string } };
  const status = state.session?.status ?? state.status;
  const step = view.position.step;
  const locked = askLocked(step, status);
  const fallback = view.chatFallback;
  const fallbackText =
    typeof fallback === "string" ? fallback : (fallback ?? []).map((l) => l.text).join(" ");
  const safe = (t: string) => (looksRaw(t) ? fallbackText : t);
  // Ask card during a question: a clean chat for this question (approved opener, then only this question's messages).
  const firstAsk = since == null ? -1 : chat.findIndex((c) => c.from === "student" && (c.at ?? 0) >= since);
  const shownChat = since == null ? chat : firstAsk < 0 ? [] : chat.slice(firstAsk);
  const openerMsgs: PanelMsg[] = since != null && opener ? [{ from: "tutor", text: opener, at: since }] : [];
  const messages: PanelMsg[] = [...openerMsgs, ...shownChat.flatMap((c): PanelMsg[] => {
    const text = safe(c.lines.map((l) => l.text).join(" "));
    const out: PanelMsg[] = c.question ? [{ from: "divider", text: c.question }] : [];
    if (c.block) out.push({ from: "tutor", text: c.block.title, at: c.at, block: { ...c.block, lines: c.block.lines.map(safe) } });
    else if (text)
      out.push({
        from: c.from,
        at: c.at,
        text,
        note: c.queued && !navigator.onLine ? "Will send when online" : c.diag,
        // Voice: one clip per line, in its speakable form; a blocked message speaks the fallback it shows.
        voice: c.from === "tutor" ? (text === fallbackText ? [fallbackText] : c.lines.map((l) => l.speakable ?? l.text)) : undefined,
      });
    return out;
  })];
  const send = async (t: string) => {
    if (busy || locked) return;
    studentSaid(t);
    const r = await run(() => ask({ data: { sessionId, text: t } }));
    if (r) {
      const d = (r as { diag?: { category: string; source: string; ms: number | null } }).diag;
      if (d && typeof window !== "undefined" && window.localStorage.getItem("fiti-debug") === "1") tagLastStudent(`${d.category} · ${d.source === "ai" ? "AI" : "word list"} · ${d.ms ?? 0} ms`);
      say(r.lines, r.kind === "encourage" ? "encouraging" : "speaking");
    }
  };
  const props = {
    name: view.tutorName,
    messages,
    onSend: send,
    busy,
    onClose,
    locked,
    placeholder: since != null ? "Ask about anything...." : askPlaceholder(step, status),
    oneLine: since != null,
    streamCps: view.pace?.cps,
    grow,
    onCollapse,

    className,
  };
  return <TutorChatPanel {...props} />;
}


const titleOf = (slug: string) => slug.split("-").map((w) => (["and", "of", "the"].includes(w) ? w : w[0]!.toUpperCase() + w.slice(1))).join(" ");

export function LessonScreen() {
  useEffect(() => () => { delete document.documentElement.dataset["lessonStep"]; }, []);
  const { view, error, clearError, setMood, chat } = useLesson();
  const navigate = useNavigate();
  const net = useNetwork();
  const [low, , lowAuto] = useLowData();
  useEffect(() => {
    document.documentElement.dataset["lowData"] = String(low);
  }, [low]);
  // The "turned on by itself" notice shows once per session.
  const [lowNote, setLowNote] = useState(false);
  useEffect(() => {
    if (!lowAuto) return;
    try { if (sessionStorage.getItem("ul.lowNote")) return; sessionStorage.setItem("ul.lowNote", "1"); } catch { /* none */ }
    setLowNote(true);
  }, [lowAuto]);
  useEffect(() => {
    if (error)
      toast(error, { icon: <AlertTriangle className="h-4 w-4 text-warning-foreground" /> });
  }, [error]);
  const wasOnline = useRef(net.online);
  useEffect(() => {
    if (wasOnline.current !== net.online)
      toast(net.online ? "Back online" : "You’re offline. Will send when online", {
        icon: net.online ? <Check /> : <WifiOff />,
      });
    wasOnline.current = net.online;
  }, [net.online]);
  const [mapOpen, setMapOpen] = useState(false);
  // Collapsed tutor, remembered for this lesson session (stays collapsed across steps until she reopens it).
  const [panelOpen, setPanelOpenRaw] = useState(true);
  const [grow, setGrow] = useState(false);
  useEffect(() => { if (sessionStorage.getItem(collapseKey(view.sessionId)) === "1") setPanelOpenRaw(false); }, [view.sessionId]);
  const setPanelOpen = (o: boolean) => {
    sessionStorage.setItem(collapseKey(view.sessionId), o ? "0" : "1");
    setGrow(o);
    setPanelOpenRaw(o);
  };
  const mainRef = useRef<HTMLElement>(null);
  useFlip(mainRef, panelOpen);
  const phone = useIsPhone();
  // Badge: tutor messages posted since the panel collapsed; the newest one previews in the bubble for 4 s.
  const tutorMsgs = chat.filter((c) => c.from === "tutor");
  const tutorCount = tutorMsgs.length;
  const seenTutor = useRef(tutorCount);
  if (panelOpen) seenTutor.current = tutorCount;
  const newCount = panelOpen ? 0 : newSince(tutorCount, seenTutor.current);
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => {
    if (panelOpen || newCount === 0) { setPreview(null); return; }
    const last = tutorMsgs.at(-1);
    const text = last ? (last.block?.title ?? last.lines.map((l) => l.text).join(" ")) : "";
    if (!text || looksRaw(text)) return;
    setPreview(previewLine(text));
    const t = setTimeout(() => setPreview(null), PREVIEW_MS);
    return () => clearTimeout(t);
  }, [newCount, panelOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const [leaving, setLeaving] = useState(false);
  const allowLeave = useRef(false);
  const step = view.position.step;
  const current = LESSON_STEPS.indexOf(step);
  const warm = step === "readiness" || step === "hook" || step === "video" || step === "simulation";
  // The lab brings its own Fitila and help, so our Ask Fiti steps aside while it is on screen (back on fallback).
  const labOn = step === "simulation" && view.simulation?.engine === "gradient-lab-v2" && view.simTasks.some((t) => !view.simCompleted.includes(t.id));
  useEffect(() => { document.documentElement.dataset["lessonStep"] = step; }, [step]);
  const noTutor = step === "exit_ticket" || labOn;
  const { data: me } = useQuery(meQueryOptions);
  const rp = useParams({ strict: false }) as { subject?: string; chapter?: string; quest?: string };
  const finished = view.completed;
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      toast("Step complete — keep going!", {
        icon: <Check className={low ? "text-success" : "anim-ok text-success"} />,
      });
      setMood("encouraging");
      previousStep.current = step;
    }
  }, [step, low, setMood]);
  const state = view as typeof view & {
    controller?: string;
    status?: string;
    session?: { controller?: string; status?: string };
  };
  const guidedByTeacher =
    (state.session?.controller ?? state.controller) === "instructor" ||
    (state.session?.status ?? state.status) === "paused";

  const blocker = useBlocker({
    shouldBlockFn: () => false,
    enableBeforeUnload: false,
    withResolver: true,
  });
  const leave = () => {
    allowLeave.current = true;
    setLeaving(false);
    if (blocker.status === "blocked") blocker.proceed();
    else navigate({ to: "/" });
  };

  const Stage = {
    readiness: WarmupStage,
    hook: HookStage,
    video: VideoStage,
    simulation: SimulationStage,
    worksheet: WorksheetStage,
    guided: ProveStage,
    exit_ticket: ExitStage,
    reflection: ReflectStage,
  }[step];
  const tab = <LeaderboardTab sessionId={view.sessionId} step={step} finished={finished} titles={TITLE} evidenceCount={view.position.index * 1000 + chat.length} />;

  if (step === "readiness" && !finished) return (<>
    <WarmupShell chat={(close, since, opener) => <LessonTutor onClose={close} className="h-full" since={since} opener={opener} />}>
      <Stage key={`${step}:${view.position.index}`} />
    </WarmupShell>{tab}</>
  );

  if (step === "worksheet" && !finished) return (<>
    <WarmupShell noHint fitiLeft fiti={<div id="practise-fiti" className="relative" />} chat={(close, since, opener) => <LessonTutor onClose={close} className="h-full" since={since} opener={opener} />}>
      <Stage key={`${step}:${view.position.index}`} />
    </WarmupShell>{tab}</>
  );

  if (step === "video" && !finished) return (<>
    <WarmupShell noHint noAsk noReact chat={(close, since, opener) => <LessonTutor onClose={close} className="h-full" since={since} opener={opener} />}>
      <Stage key={step} />
    </WarmupShell>{tab}</>
  );

  // Simulation finished: the bare "Time to practice" card, same shell as the hook and video.
  const simDone = step === "simulation" && !view.simTasks.some((t) => !view.simCompleted.includes(t.id));
  if (simDone && !finished) return (<>
    <WarmupShell noHint noParrot chat={(close, since, opener) => <LessonTutor onClose={close} className="h-full" since={since} opener={opener} />}>
      <Stage key={`${step}:done`} />
    </WarmupShell>{tab}</>
  );

  if (step === "hook" && !finished) return (<>
    <WarmupShell noHint chat={(close, since, opener) => <LessonTutor onClose={close} className="h-full" since={since} opener={opener} />}>
      <Stage key={step} />
    </WarmupShell>{tab}</>
  );

  return (
    <div className="page-glow min-h-screen">
      {tab}
      <TopBar firstName={me?.firstName ?? null} isAdmin={!!me?.isAdmin} />
      {warm && (
          <div className="lesson-container page-top">
            <div className="flex items-start justify-between gap-3">
              <nav aria-label="Breadcrumb" className="flex min-w-0 flex-wrap items-center gap-1 text-sm">
                <Link to="/" className="btn-soft text-crumb hover:underline">Home</Link><ChevronRight className="h-4 w-4 text-crumb" aria-hidden />
                {rp.subject && <><Link to="/$subject" params={{ subject: rp.subject }} className="btn-soft text-crumb hover:underline">{titleOf(rp.subject)}</Link><ChevronRight className="h-4 w-4 text-crumb" aria-hidden /></>}
                {rp.subject && rp.chapter && <><Link to="/$subject/$chapter" params={{ subject: rp.subject, chapter: rp.chapter }} className="btn-soft text-crumb hover:underline">{titleOf(rp.chapter)}</Link><ChevronRight className="h-4 w-4 text-crumb" aria-hidden /></>}
                <span aria-current="page" className="truncate font-bold text-nav-active">{rp.quest ? titleOf(rp.quest) : view.topicName}</span>
              </nav>
            </div>
            <h1 className="mt-2 font-display text-[30px] font-bold leading-[1.04] tracking-[-1.2px] text-heading-dark md:text-[40px] md:leading-[41.4px] md:tracking-[-1.6px]">Welcome to {view.topicName}</h1>
          </div>
      )}

      {guidedByTeacher && (
        <p
          className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-warning px-4 py-1.5 text-sm text-warning-foreground"
          role="status"
        >
          <AlertTriangle className="h-4 w-4" />
          Your teacher is guiding now
        </p>
      )}
      {!net.online && (
        <p
          className="mx-auto mt-3 flex w-fit items-center gap-2 rounded-full bg-warning px-4 py-1.5 text-sm font-semibold text-warning-foreground"
          role="status"
        >
          <WifiOff className="h-4 w-4" aria-hidden />
          You're offline. Your answers will send when you're back.
        </p>
      )}
      {net.online && lowNote && (
        <p
          className="mx-auto mt-3 w-fit rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-accent-foreground"
          role="status"
        >
          Low-data mode is on because your connection is slow.
        </p>
      )}

      <div
        className={cn(
          "lesson-container grid gap-3 pb-32 md:pb-6",
          warm ? "pt-5 md:pt-7" : "page-top",
          panelOpen && !noTutor && "lesson-grid-panel",
        )}
      >
        <main ref={mainRef} data-tutor-pill-anchor data-tutor-collapsed={!panelOpen || undefined} className={cn("relative min-w-0 rounded-[16px] bg-surface-fixed", warm ? "overflow-hidden md:min-h-[690px]" : "p-5 md:p-8", !panelOpen && !noTutor && "md:pb-[150px]")}>
          {!warm && (
            <h1 className="mb-4 font-display text-[1.6rem] font-bold leading-tight text-heading-dark">
              {TITLE[step]}
            </h1>
          )}
          <Stage key={`${step}:${view.position.index}`} />
          {!panelOpen && !noTutor && !phone && (
            <div className="absolute bottom-4 right-4 z-10">
              <CollapsedTutor name={view.tutorName} count={newCount} preview={preview} onOpen={() => setPanelOpen(true)} />
            </div>
          )}
        </main>
        {!panelOpen && !noTutor && phone && (
          <div className="fixed bottom-24 right-4 z-40">
            <CollapsedTutor phone name={view.tutorName} count={newCount} preview={preview} onOpen={() => setPanelOpen(true)} />
          </div>
        )}
        {panelOpen && !noTutor && (
          <div className="md:sticky md:top-32 md:h-[calc(100dvh-9rem)] md:max-h-[760px] md:self-start">
            <LessonTutor onClose={() => setPanelOpen(false)} onCollapse={() => setPanelOpen(false)} grow={grow} className="md:h-full" />
          </div>
        )}
      </div>

      <Sheet open={mapOpen} onOpenChange={setMapOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>Your 8 steps</SheetTitle>
          </SheetHeader>
          <div className="px-4 pb-6">
            <StepList current={current} />
            <p className="mt-3 text-xs text-muted-foreground">
              Steps open in order. Your place is saved.
            </p>
          </div>
        </SheetContent>
      </Sheet>
      <AlertDialog
        open={leaving || blocker.status === "blocked"}
        onOpenChange={(o) => {
          if (!o) {
            setLeaving(false);
            if (blocker.status === "blocked") blocker.reset();
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave the lesson?</AlertDialogTitle>
            <AlertDialogDescription>
              Your place is saved. You'll come back to this step.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11">Keep learning</AlertDialogCancel>
            <AlertDialogAction className="h-11" onClick={leave}>
              Leave now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
