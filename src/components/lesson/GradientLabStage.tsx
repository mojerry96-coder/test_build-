import { playSound } from "@/lib/sound";
// Step 4 · Do, with Gradient Lab: the simulation team's lab in a same-origin frame (lesson mode), led by Fiti.
// The lab only reports her moves; the server marks every mission. If the lab doesn't say "ready" in time,
// reports an error, or low-data mode is on, the band's built-in board takes over (logged on the server).
import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { simFallbackFn, simHelpFn, simLabFn } from "@/lib/api/lesson.functions";
import { useLowData } from "@/lib/ui-prefs";
import { useLesson } from "./context";
import { useReaction } from "./celebrate";
import { cn } from "@/lib/utils";

const LAB_PATH = "/sims/gradient-lab/index.html";
const LAB_FILES = ["/sims/gradient-lab/app.js", "/sims/gradient-lab/styles.css", "/sims/gradient-lab/lesson-mode.js", "/sims/gradient-lab/math.js",
  "/sims/gradient-lab/graph.js", "/sims/gradient-lab/missions.js", "/sims/gradient-lab/challenges.js", "/sims/gradient-lab/state.js"];

/** Quietly fetches the lab's files during the video, so the simulation step opens fast. */
export function usePreloadLab(on: boolean) {
  useEffect(() => {
    if (!on) return;
    const links = ["/sims/gradient-lab-v2/index.html"].map((href) => {
      const l = document.createElement("link"); l.rel = "prefetch"; l.href = href; document.head.appendChild(l); return l;
    });
    return () => links.forEach((l) => l.remove());
  }, [on]);
}

type Lab = NonNullable<NonNullable<ReturnType<typeof useLesson>["view"]["simulation"]>["lab"]>;
type Msg = { source?: string; type?: string; [k: string]: unknown };

/** Lab address for the stage (level) that holds the current mission. */
export function labUrl(lab: Lab, currentId: string, origin: string, reducedMotion: boolean): string | null {
  const cur = lab.tasks.find((t) => t.id === currentId);
  if (!cur) return null;
  const same = lab.tasks.filter((t) => t.level === cur.level);
  const q = new URLSearchParams({ lesson: "1", level: cur.level, theme: "light", parent: origin, reduced_motion: reducedMotion ? "1" : "0" });
  if (cur.level === "advanced") { q.set("missions", same.map((t) => t.mission).join(",")); q.set("challenges", String(same.length)); }
  else q.set("missions", same.map((t) => t.mission).join(","));
  return `${LAB_PATH}?${q.toString()}`;
}

export function GradientLabStage({ onFallback }: { onFallback: () => void }) {
  const { view, sessionId, say, refresh, studentSaid } = useLesson();
  const lab = view.simulation!.lab!;
  const msgFn = useServerFn(simLabFn);
  const helpFn = useServerFn(simHelpFn);
  const fallbackFn = useServerFn(simFallbackFn);
  const react = useReaction();
  const [lowData] = useLowData();
  const paused = (view as { paused?: boolean }).paused === true || (view as { controller?: string }).controller === "instructor";
  const frame = useRef<HTMLIFrameElement | null>(null);
  const [height, setHeight] = useState(620);
  const [ready, setReady] = useState(false);
  const fellBack = useRef(false);
  const current = view.simTasks.find((t) => !view.simCompleted.includes(t.id));
  const currentId = current?.id ?? "";
  const cur = lab.tasks.find((t) => t.id === currentId);
  const index = lab.tasks.findIndex((t) => t.id === currentId);
  const [origin, setOrigin] = useState("");
  const [reduced, setReduced] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  const src = origin && currentId ? labUrl(lab, currentId, origin, reduced) : null;
  const idleSaid = useRef<string | null>(null);
  const failures = useRef(0);

  const send = useCallback((m: Record<string, unknown>) => {
    frame.current?.contentWindow?.postMessage(m, window.location.origin);
  }, []);
  const log = useCallback((type: string, detail?: Record<string, unknown>) => {
    void msgFn({ data: { sessionId, msg: { type, task_id: currentId || undefined, detail } as never } }).catch(() => undefined);
  }, [msgFn, sessionId, currentId]);

  const fallBack = useCallback(async (reason: "timeout" | "error" | "frame_error" | "low_data") => {
    if (fellBack.current) return;
    fellBack.current = true;
    await fallbackFn({ data: { sessionId, reason } }).catch(() => undefined);
    onFallback();
  }, [fallbackFn, sessionId, onFallback]);

  // Low-data mode: the built-in board, so nothing heavy downloads.
  useEffect(() => { if (lowData && lab.fallback) void fallBack("low_data"); }, [lowData, lab.fallback, fallBack]);

  // Wait for "ready" (rule sim_load_timeout_ms); otherwise the built-in board for the same band.
  useEffect(() => {
    if (!src || ready || lowData) return;
    const t = setTimeout(() => void fallBack("timeout"), lab.timeoutMs);
    return () => clearTimeout(t);
  }, [src, ready, lowData, lab.timeoutMs, fallBack]);

  // A new stage (level) reloads the frame: wait for "ready" again.
  const lastSrc = useRef<string | null>(null);
  useEffect(() => { if (src && lastSrc.current && lastSrc.current !== src) setReady(false); lastSrc.current = src; }, [src]);

  const showMission = useCallback(() => {
    if (!cur) return;
    send({ type: "next_task", mission_id: cur.mission });
    const saved = lab.progress[currentId];
    if (saved) send({ type: "set", target: "state", value: saved });
    if (current?.goal) say([{ text: current.goal }]);
    failures.current = 0; idleSaid.current = null;
  }, [cur, send, lab.progress, currentId, current?.goal, say]);

  // Once ready, or when the next mission opens in the same stage, show it.
  const shown = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !cur || shown.current === currentId) return;
    shown.current = currentId;
    showMission();
  }, [ready, cur, currentId, showMission]);

  // Teacher takeover locks the lab; hand-back unlocks it.
  useEffect(() => { if (ready) send({ type: paused ? "lock" : "unlock" }); }, [paused, ready, send]);

  const askHelp = useCallback(async (why: "asked" | "idle" | "failed") => {
    if (why === "asked") studentSaid("Can I have a hint?");
    playSound("hint");
    const h = await helpFn({ data: { sessionId } }).catch(() => null);
    if (!h) return;
    const cue = h.lab;
    if (cue?.set) {
      send({ type: "lock" });
      send({ type: "set", target: cue.set.target, value: cue.set.value });
    }
    if (cue?.highlight) send({ type: "highlight", target: cue.highlight });
    say(h.lines, "encouraging");
    if (cue?.set) {
      setTimeout(() => {
        send({ type: "reset" });
        send({ type: "unlock" });
        if (cue.yourTurn) say([{ text: cue.yourTurn }]);
      }, 3500);
    }
  }, [helpFn, sessionId, send, say, studentSaid]);

  useEffect(() => {
    const onMsg = async (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      const d = (e.data ?? {}) as Msg;
      if (d.source !== "gradient-lab" || typeof d.type !== "string") return;
      if (d.type === "ready") { setReady(true); log("ready", { contract: String(d["contract"] ?? ""), source_commit: String(d["source_commit"] ?? "") }); return; }
      if (d.type === "resize") { const h = Number(d["height"]); if (h > 300 && h < 2000) setHeight(Math.round(h)); return; }
      if (d.type === "error") { log("ready", { error: String(d["message"] ?? "") }); void fallBack("error"); return; }
      if (!cur || String(d["mission_id"]) !== cur.mission) return;
      if (d.type === "help_requested") { log("help_requested"); void askHelp("asked"); return; }
      if (d.type === "changed") {
        void msgFn({ data: { sessionId, msg: { type: "changed", task_id: currentId, state: d["state"] as never } } }).catch(() => undefined);
        return;
      }
      if (d.type === "activity") {
        const idle = Number(d["idle_ms"]) || 0;
        void msgFn({ data: { sessionId, msg: { type: "activity", task_id: currentId, idle_ms: Math.min(idle, 86_400_000), moves: Number(d["moves"]) || 0 } } }).catch(() => undefined);
        if (!paused && idle >= (view.simulation?.helpIdleS ?? 30) * 1000 && idleSaid.current !== currentId) { idleSaid.current = currentId; void askHelp("idle"); }
        return;
      }
      if (d.type === "task_result") {
        const r = await msgFn({ data: { sessionId, msg: { type: "task_result", task_id: currentId, state: d["state"] as never, passed: d["passed"] === true } } }).catch(() => null);
        if (!r) return;
        if (r.done) {
          react.small(frame.current);
          say(r.lines, "celebrate");
          setTimeout(() => void refresh(), 1800);
        } else {
          failures.current += 1;
          react.notQuite(frame.current);
          if (r.lines.length) say(r.lines, "encouraging");
          if (failures.current >= (view.simulation?.helpRepeats ?? 2)) { failures.current = 0; void askHelp("failed"); }
        }
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [cur, currentId, sessionId, msgFn, log, fallBack, askHelp, say, refresh, react, paused, view.simulation?.helpIdleS, view.simulation?.helpRepeats]);

  if (!src || lowData) return null;
  const total = lab.tasks.length;
  return (
    <div className="px-3 pb-6 pt-5 md:px-[30px] md:pt-7">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[12px] font-bold uppercase tracking-[0.4px] text-sim-label">Hands-on · Mission {index + 1} of {total}</p>
        <ol className="flex gap-1.5" aria-label={`${view.simCompleted.length} of ${total} missions done`}>
          {lab.tasks.map((t, i) => (
            <li key={t.id} className={cn("h-2.5 w-2.5 rounded-full", view.simCompleted.includes(t.id) ? "bg-step-done" : i === index ? "bg-step-current" : "bg-step-todo")} />
          ))}
        </ol>
      </div>
      <div className="relative overflow-hidden rounded-[18px] border border-sim-grid bg-surface-fixed shadow-sm">
        {!ready && (
          <div className="absolute inset-0 grid place-items-center bg-surface-fixed" aria-hidden>
            <div className="h-2 w-40 overflow-hidden rounded-full bg-sim-fill"><div className="h-full w-1/2 animate-pulse rounded-full bg-sim-line" /></div>
          </div>
        )}
        <iframe ref={frame} key={src} title="Gradient Lab, hands-on activity" src={src}
          sandbox="allow-scripts allow-same-origin" allow="autoplay 'none'"
          onError={() => void fallBack("frame_error")}
          style={{ height }} className={cn("block w-full transition-opacity duration-300", ready ? "opacity-100" : "opacity-0")} />
      </div>
    </div>
  );
}
