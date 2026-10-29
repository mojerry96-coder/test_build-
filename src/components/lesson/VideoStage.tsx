// Step 3 · See: the video with embedded checks, confidence first, and the three-try escalation (PRD STU-10..15, 15.2).
import { useReaction } from "./celebrate";
import { WhiteboardDialog } from "./whiteboard/WhiteboardDialog";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Captions, Pause, Play, RotateCcw } from "lucide-react";
import { checkAnswerFn, videoPositionFn } from "@/lib/api/lesson.functions";
import { LESSON_STEPS } from "@/shared/contracts/enums";
import type { Confidence } from "@/shared/contracts/enums";
import type { Script } from "@/shared/contracts/script";
import { clampSeek, seekLimit, segmentAt } from "@/shared/video";
import { cn } from "@/lib/utils";
import { splitNumbers } from "@/shared/question-numbers";
import { Button } from "@/components/ui/button";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { WarmupOptions } from "./WarmupStage";
import { WarmupPopup } from "./WarmupPopup";
import { ConfidencePicker } from "./parts";
import poster1x from "@/assets/lesson/video-poster.webp.asset.json";
import poster2x from "@/assets/lesson/video-poster@2x.webp.asset.json";
import { usePreloadLab } from "./GradientLabStage";
import { useLowData } from "@/lib/ui-prefs";
import { FlowVideoStage } from "@/features/video-lesson/FlowVideoStage";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function StepHeader() {
  return null;
}

type Phase =
  | { kind: "ask" }
  | { kind: "right"; lines: Script }
  | { kind: "close"; lines: Script }
  | { kind: "demo"; lines: Script; shown: number; full: boolean; lucky?: boolean };

/** Opens a worked example on Fiti's whiteboard dialog. */
function useLinePlayer(setPhase: (fn: (p: Phase) => Phase) => void) {
  return useCallback((lines: Script, full: boolean, _reduce?: boolean) => {
    setPhase(() => ({ kind: "demo", lines, shown: 0, full }));
  }, [setPhase]);
}

export function VideoStage() {
  const { view } = useLesson();
  const flow = view.video?.flow;
  return flow ? <FlowVideoStage flow={flow} /> : <PlaceholderVideoStage />;
}

/** The single placeholder clip (timer-driven), kept as the backup when there is no clip flow. */
function PlaceholderVideoStage() {
  const { view, sessionId, say, run, busy, studentSaid, setMood } = useLesson();
  const check = useServerFn(checkAnswerFn);
  const savePos = useServerFn(videoPositionFn);
  const next = useAdvance();
  const [lowDataForLab] = useLowData();
  usePreloadLab(!lowDataForLab); // the simulation step's lab, fetched quietly while she watches
  const v = view.video;
  const checks = view.videoChecks;
  const duration = v?.durationS ?? 240;
  const reduce = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  const [answered, setAnswered] = useState<Set<string>>(() => new Set(Object.keys(view.results).filter((id) => checks.some((c) => c.itemId === id))));
  const isAnswered = useCallback((id: string) => answered.has(id), [answered]);
  const limit = seekLimit(checks, isAnswered, duration);
  const [t, setT] = useState(() => clampSeek(v?.position ?? 0, limit));
  const [playing, setPlaying] = useState(false);
  // Low-data mode: never autoplay; she taps play.
  const tapOnly = () => v?.startMode === "tap" || (typeof document !== "undefined" && document.documentElement.dataset["lowData"] === "true");
  const [needsTap, setNeedsTap] = useState(v?.startMode === "tap");
  const [cc, setCc] = useState(true);
  const [held, setHeld] = useState(false); // typing / sheet / hidden tab
  const [posterOk, setPosterOk] = useState<boolean | null>(null);
  const [tries, setTries] = useState(v?.tries ?? {});
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [pick, setPick] = useState<string | null>(null);
  const [mark, setMark] = useState<"ok" | "warn" | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: "ask" });
  const [showReplay, setShowReplay] = useState(false);
  const [follow, setFollow] = useState("");
  const [followDone, setFollowDone] = useState(false);
  const [announce, setAnnounce] = useState("");
  const [ended, setEnded] = useState(false);
  const [hoverSeg, setHoverSeg] = useState<string | null>(null);
  const playLines = useLinePlayer(setPhase);
  const said = useRef(false);
  const cardRef = useRef<HTMLHeadingElement>(null);
  const shuffled = useMemo(() => Object.fromEntries(view.items.map((i) => [i.id, i.options ?? []])), [view.items]);

  // The check open now: the first unanswered one she has reached.
  const open = checks.find((c) => !answered.has(c.itemId) && t >= c.atSeconds);
  const item = open ? view.items.find((i) => i.id === open.itemId) : undefined;
  const qNum = open ? checks.indexOf(open) + 1 : 0;

  // Intro line once; autoplay unless the start mode is "tap".
  useEffect(() => {
    const fresh = view.tutorLines.filter((l) => !view.chatHistory.some((h) => h.role === "tutor" && h.text === l.text));
    if (!said.current && fresh.length) { said.current = true; say(fresh); }
    if (!tapOnly()) setPlaying(true); else setNeedsTap(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Typing in the chat, an open sheet or a hidden tab pauses the video.
  useEffect(() => {
    const chk = () => {
      const el = document.activeElement as HTMLInputElement | null;
      const typing = !!el && el.id === "tutor-ask" && !!el.value;
      const sheet = !!document.querySelector('[role="dialog"]');
      const h = typing || sheet || document.hidden;
      setHeld(h);
      if (typing) setPlaying(false);
    };
    const id = setInterval(chk, 250);
    document.addEventListener("visibilitychange", chk);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", chk); };
  }, []);

  // Timer-driven placeholder clip.
  const running = playing && !held && !open && !ended;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setT((x) => Math.min(x + 0.25, limit, duration)), 250);
    return () => clearInterval(id);
  }, [running, limit, duration]);

  // Reaching a check pauses and opens its card; reaching the end shows the closing moment.
  useEffect(() => {
    if (open) { setPlaying(false); setAnnounce(`Video paused. Question ${qNum} of ${checks.length}.`); setTimeout(() => cardRef.current?.focus(), 50); }
  }, [open?.itemId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (t >= duration && !open && !ended && checks.every((c) => answered.has(c.itemId))) {
      setEnded(true); setPlaying(false);
      if (v?.labels.end) say([{ text: v.labels.end }], "encouraging");
    }
  }, [t, duration, open, ended, answered, checks, v, say]);

  // Save the play position every 5 s of play and whenever she pauses.
  const lastSaved = useRef(-10);
  useEffect(() => {
    if (Math.abs(t - lastSaved.current) >= 5 || !playing) {
      if (Math.floor(t) !== Math.floor(lastSaved.current)) { lastSaved.current = t; void savePos({ data: { sessionId, seconds: Math.floor(t), kind: "tick" } }).catch(() => {}); }
    }
  }, [Math.floor(t / 5), playing]); // eslint-disable-line react-hooks/exhaustive-deps

  const seek = (to: number, kind: "seek" | "replay" = "seek") => {
    const c = clampSeek(to, limit);
    setT(c);
    if (to > limit) setAnnounce("Answer the question first to go further.");
    void savePos({ data: { sessionId, seconds: Math.floor(c), kind } }).catch(() => {});
  };
  const toggle = () => { if (open || ended) return; setNeedsTap(false); setPlaying((p) => !p); };

  const resetCard = () => { setPick(null); setConfidence(null); setMark(null); setPhase({ kind: "ask" }); setFollow(""); setFollowDone(false); };
  const settle = (id: string) => {
    setAnswered((a) => new Set([...a, id]));
    resetCard(); setShowReplay(false); setPlaying(true);
  };

  const react = useReaction();
  const submit = async () => {
    if (!item || !pick || !confidence) return;
    const r = await run(() => check({ data: { sessionId, itemId: item.id, response: { optionId: pick }, confidence } }));
    if (!r) return;
    const attempts = r.attempts ?? 1;
    setTries((x) => ({ ...x, [item.id]: { attempts, tried: [...(x[item.id]?.tried ?? []), pick] } }));
    const lines = r.tutorLines ?? [];
    const working = lines.filter((l) => (l as { role?: string }).role === "working");
    // Right + Guessing: the server sends the working; show why before moving on.
    if (r.correct) { react.small(document.querySelector('[role="radio"][aria-checked="true"]')); setTimeout(() => react.big(), 300); } else react.notQuite(document.querySelector('[role="radio"][aria-checked="true"]'));
    if (r.correct && working.length) { setMark("ok"); say(lines.filter((l) => !working.includes(l)), "encouraging"); setPhase({ kind: "demo", lines: working, shown: 0, full: true, lucky: true }); return; }
    if (r.correct) { setMark("ok"); say(lines, "encouraging"); setPhase({ kind: "right", lines }); return; }
    setMark("warn"); setMood("encouraging");
    if (attempts === 1) { say(lines, "encouraging"); setShowReplay(true); setPhase({ kind: "close", lines }); return; }
    playLines(lines, attempts >= 3, reduce);
  };

  const tryAgain = () => { setPick(null); setMark(null); setConfidence(null); setPhase({ kind: "ask" }); };
  const watchAgain = () => {
    if (!open || !v) return;
    const seg = segmentAt(v.segments, Math.max(0, open.atSeconds - 1));
    setPick(null); setMark(null); setConfidence(null); setPhase({ kind: "ask" });
    // Rewind to the segment start: the check is now "behind" her, so it opens again when she reaches it.
    setT(seg?.start ?? 0);
    void savePos({ data: { sessionId, seconds: seg?.start ?? 0, kind: "replay" } }).catch(() => {});
    setPlaying(true);
  };

  const sendFollow = () => {
    if (!follow.trim() || !v) return;
    studentSaid(follow.trim());
    say([{ text: v.labels.followupAck }], "encouraging");
    setFollowDone(true);
  };

  const onKey = (e: KeyboardEvent) => {
    if ((e.target as HTMLElement).closest("input,textarea,[role=radiogroup]")) return;
    if (e.key === " " || e.key === "k") { e.preventDefault(); toggle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); seek(t + 5); }
    if (e.key === "ArrowLeft") { e.preventDefault(); seek(t - 5); }
  };

  const demoKey = phase.kind === "demo" ? `${phase.full}:${phase.lines[0]?.text ?? ""}` : "";
  const [boardClosed, setBoardClosed] = useState(false);
  useEffect(() => { setBoardClosed(false); }, [demoKey]);
  if (!v) return <div className="p-8">The video isn't loaded yet.</div>;
  const caption = v.captions.find((c) => t >= c.start && t < c.end)?.text;
  const seg = segmentAt(v.segments, t);
  const placeholder = !v.urlStandard && !v.urlLow;
  const cardOpen = !!item;
  const tr = item ? tries[item.id] : undefined;
  const demoLast = phase.kind === "demo" ? phase.lines.at(-1)?.text ?? "" : "";
  const hasFollow = phase.kind === "demo" && phase.full && demoLast.trim().endsWith("?");
  const demoDone = phase.kind === "demo" && phase.shown >= phase.lines.length;
  const pct = (x: number) => `${(x / duration) * 100}%`;
  const loading = posterOk === null && !placeholder;
  const bars = v.segments.length ? v.segments : [{ start: 0, end: duration, title: "", summary: "" }];

  return (
    <div className="@container flex h-full flex-col justify-center px-4 pb-24 pt-4 md:px-8 md:pb-28 @[1000px]:pr-[200px]" onKeyDown={onKey}>
      <h2 className="sr-only">{v.title}</h2>

      <div className="mx-auto w-full min-w-0 max-w-[1100px]">
       <div className="relative grid grid-cols-[minmax(0,1fr)]">
        {/* Player and check card share one grid cell from tablet up: the cell grows if the card is taller than the video. */}
        <div aria-hidden className="aspect-[1000/563] w-full [grid-area:1/1]" />
        {/* Player: soft veil while not playing; check card centred over it from tablet up. */}
        <div className="relative h-full w-full cursor-pointer overflow-hidden rounded-[24px] bg-hook-picture [grid-area:1/1]" data-testid="video-player"
          onClick={() => { if (!cardOpen && !ended) toggle(); }}>
          {posterOk === null && <div aria-hidden className="absolute inset-0 bg-video-track" />}
          {posterOk !== false && (
            <img src={poster1x.url} srcSet={`${poster1x.url} 830w, ${poster2x.url} 1660w`} sizes="(min-width: 900px) 1000px, 100vw" alt="The tutor at a chalkboard"
              onLoad={() => setPosterOk(true)} onError={() => setPosterOk(false)} className="absolute inset-0 h-full w-full object-cover" />
          )}
          {posterOk === false && <p className="absolute inset-0 grid place-items-center px-6 text-center text-[15px] font-semibold text-ink-2">{v.labels.unavailable}</p>}
          {!playing && !ended && <div aria-hidden className={cn("absolute inset-0 bg-video-veil", cardOpen && "hidden md:block", !reduce && "anim-fade-in")} />}
          {cc && caption && !cardOpen && (
            <p className="absolute inset-x-0 bottom-3 mx-auto w-fit max-w-[90%] rounded-[6px] bg-video-caption px-3 py-1 text-center text-[13px] font-semibold text-video-caption-ink md:text-[16px]">{caption}</p>
          )}
        </div>

        {/* Check card: centred over the veiled player from tablet up, below it on phones. */}
        {cardOpen && item && (
          <div className="relative z-10 mt-4 [grid-area:2/1] md:mt-0 md:grid md:place-items-center md:px-6 md:py-6 md:[grid-area:1/1]">
          <div className={cn("overlay-edge w-full min-w-0 rounded-[24px] bg-fh-card p-5 pb-8 shadow-xl md:max-w-[700px] md:p-7 md:pb-10", !reduce && "anim-slide-up")}
            role="region" aria-label={`Question ${qNum} of ${checks.length}`}>
            <div className="flex items-center justify-between text-[15px] font-semibold md:text-[17px]">
              <span className="text-video-q">Question {qNum}</span><span className="text-fh-ink">{qNum}/{checks.length}</span>
            </div>
            <h3 ref={cardRef} tabIndex={-1} className="maths mt-3 text-center font-hand text-[22px] leading-[1.25] tracking-[0.5px] text-fh-ink outline-none @[700px]:text-[30px] [text-wrap:balance]">
              {splitNumbers(item.prompt.map((p) => p.text).join(" ")).map((p, i) => p.num ? <span key={i} className="text-q-num">{p.text}</span> : <span key={i}>{p.text}</span>)}
            </h3>

            {phase.kind === "demo" ? (
              <div className="mt-4 rounded-[12px] border border-border bg-hook-picture p-4" aria-live="polite">
                <p className="text-[13px] font-bold text-video-ink">{phase.lucky ? "Here's how it works" : phase.full ? "Here's the full working" : v.labels.demoTitle}</p>
                {/* Fiti works it out on the whiteboard; the card keeps Try again / the explain-back question. */}
                <WhiteboardDialog key={`${phase.full}:${phase.lines[0]?.text ?? ""}`} open={!demoDone || !boardClosed}
                  onClose={() => { setBoardClosed(true); if (!demoDone) setPhase((p) => (p.kind === "demo" ? { ...p, shown: p.lines.length } : p)); }}
                  title={phase.lucky ? "Here's how it works" : phase.full ? "Here's the full working" : v.labels.demoTitle}
                  heading={<span className="text-[0.7em]">{item.prompt.map((p) => p.text).join(" ")}</span>}
                  lines={phase.lines.map((l) => l.text)} pace={view.pace} followTurn={!phase.full || hasFollow}
                  resumeKey={`${sessionId}:video:${item.id}:${phase.full ? "full" : "demo"}`}
                  onDone={() => setPhase((p) => (p.kind === "demo" ? { ...p, shown: p.lines.length } : p))} />
                {demoDone && <ol className="mt-2 space-y-1 font-hand text-[18px] text-brand">{phase.lines.map((l, i) => <li key={i}>{l.text}</li>)}</ol>}
                {demoDone && !phase.full && <Button className="mt-4 h-14 w-full rounded-[16px] bg-sim-cta text-[17px] font-bold text-sim-cta-ink hover:bg-primary-action" onClick={tryAgain}>Try again</Button>}
                {demoDone && phase.full && hasFollow && !followDone && (
                  <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); sendFollow(); }}>
                    <input aria-label={demoLast} value={follow} onChange={(e) => setFollow(e.target.value.slice(0, 40))}
                      className="h-11 min-w-0 flex-1 rounded-[12px] border border-quaternary bg-card px-3 text-[15px] font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    <Button type="submit" className="h-11 rounded-[12px] bg-primary-action font-bold text-primary-action-ink hover:bg-primary-action-hover" disabled={!follow.trim()}>Send</Button>
                  </form>
                )}
                {demoDone && phase.full && (!hasFollow || followDone) && (
                  <Button className="mt-4 h-14 w-full rounded-[16px] bg-sim-cta text-[17px] font-bold text-sim-cta-ink hover:bg-primary-action" onClick={() => settle(item.id)}>{v.labels.continue || "Continue"}</Button>
                )}
              </div>
            ) : (
              <>
                <div className="mt-5">
                  <WarmupOptions options={shuffled[item.id] ?? []} value={pick} onChange={(id) => { setPick(id); setMark(null); }} locked={phase.kind !== "ask" || busy} mark={mark} off={tr?.tried ?? []} />
                </div>
                <p className="mb-3 mt-6 text-[14px] font-medium text-fh-ink md:text-[15px]">How sure are you?</p>
                <ConfidencePicker segmented value={confidence} onChange={setConfidence} />
                <Button className="mt-6 h-14 w-full rounded-[16px] bg-sim-cta text-[17px] font-bold text-sim-cta-ink hover:bg-primary-action disabled:bg-sim-cta disabled:text-sim-cta-ink disabled:opacity-75 dark:disabled:bg-ans-badge dark:disabled:text-fh-ink dark:disabled:opacity-100 md:h-16 md:text-[18px]"
                  disabled={busy || !pick || !confidence || phase.kind !== "ask"} onClick={() => void submit()}>Check Answer</Button>
              </>
            )}
          </div>
          </div>
        )}
       </div>

        {/* Control row: play button · clip parts as bars (checks marked, green once answered) · captions pill. */}
        <div className="mt-3 flex items-center gap-3 rounded-full border border-chat-card-edge/30 bg-fh-card px-5 py-3 shadow-[0_5px_0_var(--chat-card-edge)] md:gap-4 md:px-6 md:py-4">
          <button type="button" onClick={toggle} disabled={!!cardOpen || ended || loading} aria-label={playing || cardOpen ? "Pause" : "Play"}
            className="interactive grid h-8 w-8 shrink-0 place-items-center rounded-full text-fh-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring disabled:opacity-80">
            {playing || cardOpen ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />}
          </button>
          <div className="relative h-[21px] min-w-0 flex-1">
            <div role="slider" tabIndex={0} aria-label="Video position" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={Math.floor(t)} aria-valuetext={`${fmt(t)} of ${fmt(duration)}${seg ? `, ${seg.title}` : ""}`}
              title={hoverSeg ?? undefined}
              onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setHoverSeg(segmentAt(v.segments, ((e.clientX - r.left) / r.width) * duration)?.title ?? null); }}
              onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * duration); }}
              onKeyDown={(e) => { if (e.key === "ArrowRight") { e.preventDefault(); e.stopPropagation(); seek(t + 5); } if (e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); seek(t - 5); } }}
              className="absolute inset-0 flex cursor-pointer items-center gap-2 rounded-[24px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring">
              {bars.map((b) => (
                <div key={b.start} className="h-2 overflow-hidden rounded-[24px] bg-video-track" style={{ flexGrow: b.end - b.start, flexBasis: 0 }}>
                  {!loading && <div className="h-full rounded-[24px] bg-q-num" style={{ width: `${Math.max(0, Math.min(1, (t - b.start) / (b.end - b.start))) * 100}%` }} />}
                </div>
              ))}
            </div>
            {!loading && checks.map((c) => answered.has(c.itemId) ? (
              <button key={c.itemId} type="button" aria-label={`Rewatch from ${fmt(c.atSeconds)}`} onClick={() => seek(c.atSeconds - 1)}
                className="absolute top-[5.5px] h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-success" style={{ left: pct(c.atSeconds) }} />
            ) : (
              <span key={c.itemId} aria-hidden className="absolute top-[3px] h-[15px] w-1 -translate-x-1/2 rounded-[4px] bg-video-marker" style={{ left: pct(c.atSeconds) }} />
            ))}
          </div>
          <button type="button" onClick={() => setCc((c) => !c)} aria-pressed={cc} aria-label={loading ? "Captions (loading)" : `Captions, ${fmt(t)} of ${fmt(duration)}`} disabled={loading}
            className="interactive grid h-9 w-9 shrink-0 place-items-center rounded-[8px] text-fh-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring">
            <Captions className={cn("h-7 w-7", !cc && "opacity-40")} strokeWidth={1.6} aria-hidden />
          </button>
        </div>
        {showReplay && cardOpen && (
          <button type="button" onClick={watchAgain} className="interactive mt-2 inline-flex h-11 items-center gap-1 rounded-[10px] px-3 text-[13px] font-semibold text-video-ink hover:bg-muted"><RotateCcw className="h-4 w-4" /> Watch that part again</button>
        )}
        {needsTap && !playing && <span className="sr-only">Tap play to start the video.</span>}
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>

      {ended && (
        <WarmupPopup correct title={v.labels.endTitle || "Nice Watch!"} lines={[v.labels.end]} button={v.labels.continue || "Continue"} autoClose={false} onButton={() => void next()} />
      )}
      {phase.kind === "right" && item && (
        <WarmupPopup correct title={v.labels.rightTitle || "Good job!"} lines={phase.lines.map((l) => l.text)} button={v.labels.continue || "Continue"} autoClose={!reduce} onButton={() => settle(item.id)} />
      )}
      {phase.kind === "close" && item && (
        <WarmupPopup correct={false} title={v.labels.closeTitle || "You got close!"} lines={phase.lines.map((l) => l.text)} button="Try again" link="Watch that part again"
          autoClose={false} onButton={tryAgain} onLink={watchAgain} />
      )}
    </div>
  );
}
