// Step 4 · Do, with Gradient Lab v2, copied unchanged from the simulation team (public/sims/gradient-lab-v2).
// We never edit or drive the lab: its level comes from its own ?level= setting, its reports are marked/logged by us,
// it fills the whole screen with one X to leave, a teacher pause covers it from outside, and no load in time / low-data opens the built-in board.
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { X } from "lucide-react";
import { simFallbackFn, simLabFn } from "@/lib/api/lesson.functions";
import { useLowData } from "@/lib/ui-prefs";
import { LAB_V2_EVENTS, labV2Url } from "@/shared/lab-v2";
import { onSoundPref, playSound, readSoundPref } from "@/lib/sound";
import { voiceSpeaking } from "@/lib/voice";
import { dressV2, readV2, v2Screen, watchV2Choices, watchV2Wins } from "./lab-v2-reader";
import { musicLift } from "@/lib/music";
import { meQueryOptions } from "@/routes/_authenticated/route";
import { useLesson } from "./context";
import { useReaction } from "./celebrate";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function GradientLabV2Stage({ onFallback }: { onFallback: () => void }) {
  const { view, sessionId, say, refresh } = useLesson();
  const lab = view.simulation!.lab!;
  const msgFn = useServerFn(simLabFn);
  const fallbackFn = useServerFn(simFallbackFn);
  const react = useReaction();
  const router = useRouter();
  const { data: me } = useQuery(meQueryOptions);
  const [lowData] = useLowData();
  const paused = (view as { paused?: boolean }).paused === true || (view as { controller?: string }).controller === "instructor";
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [ready, setReady] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const fellBack = useRef(false);
  const current = view.simTasks.find((t) => !view.simCompleted.includes(t.id));
  const taskId = current?.id ?? "";
  const task = lab.tasks.find((t) => t.id === taskId) ?? lab.tasks[0];
  // Opened once at her saved screen (the lab's own #N jump); later screen changes don't reload the frame.
  const [startScreen] = useState(() => lab.v2Screen ?? null);
  const src = task ? labV2Url(task.level, startScreen) : null;
  const lastChoice = useRef<number | null>(null);
  const savedScreen = useRef<number | null>(startScreen);

  const fallBack = useCallback(async (reason: "timeout" | "error" | "frame_error" | "low_data") => {
    if (fellBack.current || !lab.fallback) return;
    fellBack.current = true;
    await fallbackFn({ data: { sessionId, reason } }).catch(() => undefined);
    onFallback();
  }, [fallbackFn, sessionId, onFallback, lab.fallback]);

  useEffect(() => { if (lowData) void fallBack("low_data"); }, [lowData, fallBack]);
  useEffect(() => {
    if (!src || ready || lowData) return;
    const t = setTimeout(() => void fallBack("timeout"), lab.timeoutMs);
    return () => clearTimeout(t);
  }, [src, ready, lowData, lab.timeoutMs, fallBack]);

  // Its Admin tab only for real admins (decided by our server); students get no role at all.
  useEffect(() => {
    if (!ready || !me?.isAdmin || !task) return;
    try { frame.current?.contentWindow?.dispatchEvent(new CustomEvent("gradientlab:config", { detail: { role: "admin" } })); } catch { /* frame gone */ }
  }, [ready, me?.isAdmin, task]);

  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow || !taskId) return;
      const d = (e.data ?? {}) as Record<string, unknown>;
      const type = typeof d["type"] === "string" ? d["type"] : "";
      if (!type.startsWith("gradientlab:")) return;
      setReady(true);
      const event = type.slice("gradientlab:".length) as (typeof LAB_V2_EVENTS)[number];
      if (!LAB_V2_EVENTS.includes(event)) return;
      const detail: Record<string, string | number | boolean | null> = {};
      for (const [k, v] of Object.entries(d)) {
        if (k === "type") continue;
        if (typeof v === "number" || typeof v === "boolean" || v === null) detail[k] = v;
        else if (typeof v === "string") detail[k] = v.slice(0, 80);
      }
      const read = event === "attempt" ? readV2(frame.current, lastChoice.current) : null;
      const screen = v2Screen(frame.current?.contentWindow) || undefined;
      const answer = read ? { fields: read.fields, sliders: read.sliders, choice: read.choice } : undefined;
      const r = await msgFn({ data: { sessionId, msg: { type: "v2_event", task_id: taskId, event, screen, answer, detail } } }).catch(() => null);
      if (event === "attempt") lastChoice.current = null;
      if (r?.done) { react.big(); say(r.lines, "celebrate"); setTimeout(() => void refresh(), 1500); return; }
      if (r?.reaction === "retry") playSound("not_quite");
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [taskId, sessionId, msgFn, react, say, refresh]);

  // Save her screen whenever the lab changes it (it updates its own address, which fires no event).
  useEffect(() => {
    if (!ready || !taskId) return;
    const id = window.setInterval(() => {
      const s = v2Screen(frame.current?.contentWindow);
      if (s && s !== savedScreen.current) {
        savedScreen.current = s;
        void msgFn({ data: { sessionId, msg: { type: "v2_event", task_id: taskId, event: "screen", screen: s } } }).catch(() => undefined);
      }
    }, 700);
    return () => window.clearInterval(id);
  }, [ready, taskId, sessionId, msgFn]);

  // Remember the option she taps (the lab clears it after a wrong check, before its report reaches us).
  useEffect(() => (ready ? dressV2(frame.current) : undefined), [ready, src]);
  useEffect(() => (ready ? watchV2Wins(frame.current, () => { if (!paused) { playSound("big_win"); musicLift(); } }) : undefined), [ready, src, paused]);
  useEffect(() => (ready ? watchV2Choices(frame.current, (i) => { lastChoice.current = i; }) : undefined), [ready, src]);

  // The lab's read-aloud stops whenever Fiti speaks, a teacher pauses, our sound is off or low data is on.
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => { setSoundOn(readSoundPref()); return onSoundPref(() => setSoundOn(readSoundPref())); }, []);
  useEffect(() => {
    if (!ready) return;
    const id = window.setInterval(() => {
      try {
        const w = frame.current?.contentWindow as (Window & { speechSynthesis?: SpeechSynthesis }) | null;
        if (w?.speechSynthesis?.speaking && (paused || !soundOn || lowData || voiceSpeaking())) w.speechSynthesis.cancel();
      } catch { /* frame gone */ }
    }, 300);
    return () => window.clearInterval(id);
  }, [ready, paused, soundOn, lowData]);

  // Escape works like the X (unless the lab has its own box open, which Escape closes itself).
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setLeaving(true); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const leave = () => {
    setLeaving(false);
    if (window.history.length > 1) router.history.back(); else void router.navigate({ to: "/" });
  };

  if (!src || lowData) return null;
  return (
    <div className="fixed inset-0 z-40 bg-surface-fixed">
      <iframe ref={frame} key={src} title="Gradient Lab, hands-on activity" src={src}
        sandbox="allow-scripts allow-same-origin" allow="autoplay"
        onLoad={() => setReady(true)} onError={() => void fallBack("frame_error")}
        className={cn("block h-[100dvh] w-full transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")} />
      {paused && <div className="absolute inset-0 z-[41] cursor-not-allowed bg-surface-fixed/30" aria-label="Paused by your teacher" />}
      <button type="button" aria-label="Close Gradient Lab" onClick={() => setLeaving(true)}
        className="squish absolute bottom-4 right-4 z-[42] grid h-12 w-12 place-items-center rounded-full bg-fh-card text-hub-heading shadow-[0_4px_0_var(--fh-primary-edge)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2">
        <X className="h-6 w-6" aria-hidden />
      </button>
      <AlertDialog open={leaving} onOpenChange={setLeaving}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave Gradient Lab?</AlertDialogTitle>
            <AlertDialogDescription>Your place is saved. You can come back to this screen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={leave}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
