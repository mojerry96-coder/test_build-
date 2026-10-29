import { playSound } from "@/lib/sound";
// Step 3 · See with real clips (Dave's player, see SOURCE.md): a clip plays, then our check card opens.
// Which clip plays next comes from the clip record's `flow`; wrong-try clips are picked by try number only.
// Marking, evidence and the band stay on the server (checkAnswerFn / useAdvance).
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Maximize2, Minimize2, Pause, Play, RotateCcw } from "lucide-react";
import { checkAnswerFn } from "@/lib/api/lesson.functions";
import type { Confidence } from "@/shared/contracts/enums";
import type { Script } from "@/shared/contracts/script";
import type { VideoFlow } from "@/shared/contracts/content-pack";
import { cn } from "@/lib/utils";
import { useLesson } from "@/components/lesson/context";
import { useAdvance } from "@/components/lesson/stages-a";
import { WarmupOptions } from "@/components/lesson/WarmupStage";
import { WarmupPopup } from "@/components/lesson/WarmupPopup";
import { ConfidencePicker } from "@/components/lesson/parts";
import { useReaction } from "@/components/lesson/celebrate";
import { useLowData } from "@/lib/ui-prefs";
import { ParallaxBackground } from "./ParallaxBackground";
import { CircledWord } from "./CircledWord";
import { VideoIntro } from "./VideoIntro";
import { say as speak } from "@/lib/voice";
import { nextAfterClip, firstPhase, wrongClip, clampSeek, type FlowPhase } from "./flow";
import clapping from "@/assets/video-lesson/mascot-celebrate.webm.asset.json";
import confused from "@/assets/video-lesson/mascot-sad.webm.asset.json";
import thumbsup from "@/assets/video-lesson/mascot-celebrate.webm.asset.json";

const REACTIONS = { clapping: clapping.url, confused: confused.url, thumbsup: thumbsup.url } as const;

type Card = { kind: "ask" } | { kind: "right"; lines: Script } | { kind: "reveal"; lines: Script; ask: string | null };

export function FlowVideoStage({ flow }: { flow: VideoFlow }) {
  const { view, sessionId, say, run, busy, studentSaid, tutorName } = useLesson() as ReturnType<typeof useLesson> & { tutorName?: string };
  const check = useServerFn(checkAnswerFn);
  const next = useAdvance();
  const react = useReaction();
  const [lowData] = useLowData();
  const reduce = typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const v = view.video!;
  const total = flow.checks.length;

  const [answered, setAnswered] = useState<Set<string>>(() => new Set(Object.keys(view.results).filter((id) => flow.checks.some((c) => c.item_id === id))));
  const [tries, setTries] = useState(v.tries ?? {});
  const [phase, setPhase] = useState<FlowPhase>(() => firstPhase(flow, (id) => answered.has(id), (id) => v.tries?.[id]?.attempts ?? 0));
  const [card, setCard] = useState<Card>({ kind: "ask" });
  const [hint, setHint] = useState<Script>([]);
  const [pick, setPick] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<Confidence | null>(null);
  const [mark, setMark] = useState<"ok" | "warn" | null>(null);
  const [follow, setFollow] = useState("");
  const [followDone, setFollowDone] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reaction, setReaction] = useState<keyof typeof REACTIONS | null>(null);
  // Only one Fiti on screen: the reaction plays in the side Fiti's own box (fiti:clip).
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("fiti:clip", { detail: reaction ? REACTIONS[reaction] : null }));
    return () => { window.dispatchEvent(new CustomEvent("fiti:clip", { detail: null })); };
  }, [reaction]);
  const [announce, setAnnounce] = useState("");
  const vid = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState({ t: 0, d: 0 });
  const maxWatched = useRef(0);
  const returnTo = useRef<FlowPhase | null>(null);
  const qRef = useRef<HTMLHeadingElement>(null);
  const fsBox = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  const [canFs, setCanFs] = useState(false);
  useEffect(() => {
    setCanFs(!!document.fullscreenEnabled || !!(vid.current as any)?.webkitEnterFullscreen);
    const on = () => setFs(document.fullscreenElement === fsBox.current && !!fsBox.current);
    document.addEventListener("fullscreenchange", on);
    return () => { document.removeEventListener("fullscreenchange", on); if (document.fullscreenElement) void document.exitFullscreen().catch(() => {}); };
  }, []);
  const toggleFs = () => {
    if (document.fullscreenElement) { void document.exitFullscreen().catch(() => {}); return; }
    if (document.fullscreenEnabled && fsBox.current) { void fsBox.current.requestFullscreen().catch(() => {}); return; }
    (vid.current as any)?.webkitEnterFullscreen?.();
  };
  const said = useRef(false);
  // Opening screen: once per lesson, only before anything has been watched or answered.
  const introKey = `vl-intro-${sessionId}`;
  const [intro, setIntro] = useState(() => !!v.labels.intro?.["begin"] && answered.size === 0 && !(v.position > 0) && Object.keys(v.tries ?? {}).every((k) => !(v.tries[k]?.attempts)));
  useEffect(() => { if (intro && sessionStorage.getItem(introKey)) setIntro(false); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (!intro) return;
    window.dispatchEvent(new Event("fiti:hide"));
    return () => { window.dispatchEvent(new Event("fiti:show")); };
  }, [intro]);
  const beginVideo = () => {
    sessionStorage.setItem(introKey, "1");
    const el = vid.current;
    if (el) void el.play().then(() => { setPlaying(true); setNeedsTap(false); }).catch(() => setNeedsTap(true));
    const welcome = v.labels.intro?.["welcome"];
    if (welcome) speak([welcome]);
    setIntro(false);
    if (!el) clipFailed();
  };

  const qi = phase.kind === "end" ? -1 : phase.qi;
  const step = qi >= 0 ? flow.checks[qi] : undefined;
  const item = step ? view.items.find((i) => i.id === step.item_id) : undefined;
  const options = useMemo(() => item?.options ?? [], [item]);
  const clipId = phase.kind === "clip" ? phase.clip : null;
  const media = clipId ? flow.media[clipId] : undefined;
  const src = media ? (lowData && media.url_low ? media.url_low : media.url) : undefined;
  // Between clips (question cards) the last clip's final frame stays on screen; no placeholder picture.
  const [held, setHeld] = useState<string | undefined>(undefined);
  useEffect(() => { if (src) setHeld(src); }, [src]);
  const shown = src ?? held;
  const urlOf = (id?: string | null) => { const m = id ? flow.media[id] : undefined; return m ? (lowData && m.url_low ? m.url_low : m.url) : undefined; };
  const upcoming = phase.kind === "question" && qi >= 0 ? [urlOf(flow.checks[qi]?.correct_clip), urlOf(flow.checks[qi]?.wrong_clips[0])].filter((u): u is string => !!u) : [];

  // Intro line once (in the chat; Fiti waits while a clip talks).
  useEffect(() => {
    const fresh = view.tutorLines.filter((l) => !view.chatHistory.some((h) => h.role === "tutor" && h.text === l.text));
    if (!said.current && fresh.length) { said.current = true; say(fresh); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Start each clip; a blocked autoplay shows the Play button.
  useEffect(() => {
    const el = vid.current;
    if (!el || !src) return;
    maxWatched.current = 0; setTime({ t: 0, d: 0 });
    setLoading(true);
    el.load();
    if (intro) return;
    el.play().then(() => { setPlaying(true); setNeedsTap(false); }).catch(() => { setPlaying(false); setNeedsTap(true); });
  }, [src, intro]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase.kind === "question") { setAnnounce(`Question ${phase.qi + 1} of ${total}.`); setTimeout(() => qRef.current?.focus(), 60); }
  }, [phase, total]);

  const clipDone = () => {
    if (phase.kind !== "clip") return;
    setPlaying(false);
    if (returnTo.current) { const back = returnTo.current; returnTo.current = null; setPhase(back); return; }
    const n = nextAfterClip(flow, phase, (id) => answered.has(id));
    if (n.kind === "question" && phase.role === "wrong" && card.kind === "ask" && hint.length) say(hint, "encouraging");
    if (n.kind === "question" && card.kind === "reveal") say(card.lines, "encouraging");
    setPhase(n);
  };

  // Taking the video back: rewind freely, forward only as far as she has watched.
  const seekTo = (target: number) => {
    const el = vid.current;
    if (!el || phase.kind !== "clip") return;
    el.currentTime = clampSeek(target, maxWatched.current, el.duration);
    setTime((s) => ({ ...s, t: el.currentTime }));
  };
  const seekFromPointer = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo(((e.clientX - r.left) / r.width) * (time.d || 0));
  };
  /** Replays an earlier part's clip, then comes back to where she was (answers stay). */
  const replayPart = (i: number) => {
    const c = flow.checks[i];
    if (!c) return;
    if (!returnTo.current) returnTo.current = phase;
    setPhase({ kind: "clip", qi: i, clip: c.after_clip, role: "replay" });
  };
  const clipFailed = () => {
    console.warn("[video] clip failed to load", clipId);
    clipDone(); // poster stays; the question still opens
  };

  const toggle = () => {
    const el = vid.current;
    if (!el) return;
    if (el.paused) { void el.play().then(() => { setPlaying(true); setNeedsTap(false); }).catch(() => setNeedsTap(true)); } else { el.pause(); setPlaying(false); }
  };

  const fiti = (r: keyof typeof REACTIONS) => { setReaction(r); setTimeout(() => setReaction(null), 5200); };

  const settle = (id: string, after: FlowPhase) => {
    setAnswered((a) => new Set([...a, id]));
    setCard({ kind: "ask" }); setHint([]); setPick(null); setConfidence(null); setMark(null); setFollow(""); setFollowDone(false);
    setPhase(after);
  };

  const submit = async () => {
    if (!item || !step || !pick || !confidence || phase.kind !== "question") return;
    const r = await run(() => check({ data: { sessionId, itemId: item.id, response: { optionId: pick }, confidence } }));
    if (!r) return;
    const attempts = r.attempts ?? 1;
    setTries((x) => ({ ...x, [item.id]: { attempts, tried: [...(x[item.id]?.tried ?? []), pick] } }));
    const lines = (r.tutorLines ?? []) as Script;
    const el = document.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]');
    if (r.correct) {
      setMark("ok"); react.small(el); setTimeout(() => react.big(), 300);
      fiti(attempts === 1 ? "clapping" : "thumbsup");
      say(lines, "encouraging");
      setCard({ kind: "right", lines });
      return;
    }
    setMark("warn"); react.notQuite(el); fiti("confused");
    if (attempts >= 3) {
      const last = lines.at(-1)?.text ?? "";
      const ask = last.trim().endsWith("?") ? last : null;
      setCard({ kind: "reveal", lines: ask ? lines.slice(0, -1) : lines, ask });
    } else {
      setHint(lines); if (lines.length) playSound("hint"); setPick(null); setConfidence(null); setMark(null);
    }
    setPhase({ kind: "clip", qi: phase.qi, clip: wrongClip(flow, phase.qi, attempts), role: "wrong" });
  };

  const afterRight = () => {
    if (!step || !item || phase.kind === "end") return;
    settle(item.id, { kind: "clip", qi: phase.qi, clip: step.correct_clip, role: "correct" });
  };
  const afterReveal = () => {
    if (!step || !item || phase.kind === "end") return;
    const n = nextAfterClip(flow, { kind: "clip", qi: phase.qi, clip: step.correct_clip, role: "correct" }, (id) => id === item.id || answered.has(id));
    settle(item.id, n);
  };
  const watchAgain = () => { if (step && phase.kind === "question") setPhase({ kind: "clip", qi: phase.qi, clip: step.after_clip, role: "replay" }); };

  const tr = item ? tries[item.id] : undefined;
  const cardOpen = phase.kind === "question" && !!item;
  const hintText = hint.map((l) => l.text).join(" ");
  const hl = step?.hint_highlight ?? "";

  return (
    <>
    {intro && <VideoIntro words={v.labels.intro ?? {}} count={total} muted={muted} onMute={() => setMuted((m) => !m)} onBegin={beginVideo} still={reduce || lowData} />}
    <div className="@container relative flex h-full flex-col justify-center px-4 pb-24 pt-4 md:px-8 md:pb-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">{!reduce && <ParallaxBackground />}</div>
      <div ref={fsBox} className={cn("mx-auto w-full min-w-0 max-w-[1100px]", fs && "flex max-w-none flex-col justify-center bg-fh-page p-6 [&>div:first-child]:mx-auto [&>div:first-child]:w-[min(100%,calc((100dvh-140px)*16/9))]")}>
        <div className="relative grid grid-cols-[minmax(0,1fr)]">
          <div aria-hidden className="aspect-video w-full [grid-area:1/1]" />
          <div className="relative h-full w-full overflow-hidden rounded-[24px] bg-hub-heading [grid-area:1/1]" data-testid="video-player">
            {upcoming.map((u) => <video key={`pre-${u}`} src={u} preload="auto" muted playsInline aria-hidden className="hidden" />)}
            {shown && (
              <video ref={vid} src={shown} playsInline muted={muted} preload="auto" className="absolute inset-0 h-full w-full bg-transparent object-cover"
                onCanPlay={() => setLoading(false)} onWaiting={() => setLoading(true)} onPlaying={() => setLoading(false)}
                onLoadedMetadata={(e) => { const d = e.currentTarget.duration || 0; setTime((s) => ({ ...s, d })); }}
                onTimeUpdate={(e) => { const t = e.currentTarget.currentTime; maxWatched.current = Math.max(maxWatched.current, t); setTime((s) => ({ ...s, t })); }}
                onEnded={() => { if (src) clipDone(); }} onError={() => { if (src) clipFailed(); }} onClick={toggle}>
                {media?.captions_url && <track kind="captions" src={media.captions_url} srcLang="en" default />}
              </video>
            )}
            {phase.kind === "clip" && loading && !needsTap && <div aria-label="Loading" className="absolute inset-0 grid place-items-center"><span className="h-10 w-10 animate-spin rounded-full border-4 border-card border-t-transparent" /></div>}
            {phase.kind === "clip" && needsTap && (
              <button type="button" onClick={toggle} aria-label="Play" className="interactive absolute inset-0 m-auto grid h-20 w-20 place-items-center rounded-full bg-card/90 text-fh-ink shadow-xl">
                <Play className="h-9 w-9 translate-x-[2px]" fill="currentColor" />
              </button>
            )}
            {cardOpen && <div aria-hidden className="absolute inset-0 hidden bg-video-veil md:block" />}
          </div>

          {cardOpen && item && (
            <div className="relative z-10 mt-4 [grid-area:2/1] md:mt-0 md:grid md:place-items-center md:px-6 md:py-6 md:[grid-area:1/1]">
              <div className={cn("vl-card w-full min-w-0 rounded-[28px] bg-fh-card p-5 pb-6 md:max-w-[560px] md:p-6 md:pb-7", !reduce && "anim-slide-up")} role="region" aria-label={`Question ${qi + 1} of ${total}`}>
                <div className="flex items-center justify-between text-[15px] font-bold md:text-[16px]">
                  <span className="vl-q">Question {qi + 1}</span><span className="vl-count font-semibold">{qi + 1}/{total}</span>
                </div>
                <h3 ref={qRef} tabIndex={-1} className="maths mx-auto mt-4 max-w-[440px] text-center font-hand text-[22px] leading-[1.2] tracking-[0.5px] text-fh-ink [-webkit-text-stroke:0.8px_currentColor] outline-none md:text-[26px] [text-wrap:balance]">
                  {item.prompt.map((p) => p.text).join(" ")}
                </h3>

                {card.kind === "right" && (
                  <div className="mt-5 text-center" aria-live="polite">
                    <p className="text-[18px] font-bold text-success">{v.labels.rightTitle || "Good job!"}</p>
                    {card.lines.map((l, i) => <p key={i} className="mt-1 text-[15px] text-fh-ink">{l.text}</p>)}
                    <button type="button" className="vl-cta interactive mx-auto mt-6 flex h-14 w-full max-w-[340px] items-center justify-center rounded-full text-[18px] font-bold" onClick={afterRight}>{v.labels.continue || "Continue"}</button>
                  </div>
                )}

                {card.kind === "reveal" && (
                  <div className="mt-5" aria-live="polite">
                    <p className="vl-q text-[14px] font-bold">Here's the full working</p>
                    <ol className="mt-2 space-y-1 font-hand text-[19px] text-fh-ink [-webkit-text-stroke:0.6px_currentColor]">{card.lines.map((l, i) => <li key={i}>{l.text}</li>)}</ol>
                    {card.ask && !followDone && (
                      <form className="mt-4 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (!follow.trim()) return; studentSaid(follow.trim()); say([{ text: v.labels.followupAck }], "encouraging"); setFollowDone(true); }}>
                        <label className="sr-only" htmlFor="vl-follow">{card.ask}</label>
                        <p className="sr-only">{card.ask}</p>
                        <input id="vl-follow" placeholder={card.ask} value={follow} onChange={(e) => setFollow(e.target.value.slice(0, 60))}
                          className="h-12 min-w-0 flex-1 rounded-[12px] border border-quaternary bg-card px-3 text-[15px] font-semibold text-brand outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                        <button type="submit" disabled={!follow.trim()} className="vl-cta interactive h-12 rounded-full px-5 font-bold">Send</button>
                      </form>
                    )}
                    {(!card.ask || followDone) && (
                      <button type="button" className="vl-cta interactive mx-auto mt-6 flex h-14 w-full max-w-[340px] items-center justify-center rounded-full text-[18px] font-bold" onClick={afterReveal}>{v.labels.continue || "Continue"}</button>
                    )}
                  </div>
                )}

                {card.kind === "ask" && (
                  <>
                    {hintText && (
                      <p className="mt-3 rounded-[12px] bg-hook-picture px-4 py-2 text-center text-[14px] font-semibold text-hub-heading md:text-[15px]" aria-live="polite">
                        {hl && hintText.includes(hl) ? <>{hintText.split(hl)[0]}<CircledWord>{hl}</CircledWord>{hintText.split(hl).slice(1).join(hl)}</> : hintText}
                      </p>
                    )}
                    <div className="mx-auto mt-5 max-w-[460px]">
                      <WarmupOptions compact options={options} value={pick} onChange={(id) => { setPick(id); setMark(null); }} locked={busy} mark={mark} off={tr?.tried ?? []} />
                    </div>
                    <div className="mt-6"><ConfidencePicker pills value={confidence} onChange={setConfidence} /></div>
                    <button type="button" disabled={busy || !pick || !confidence} onClick={() => void submit()}
                      className="vl-cta interactive mx-auto mt-6 flex h-14 w-full max-w-[340px] items-center justify-center rounded-full text-[18px] font-bold">Check Answer</button>
                    <button type="button" onClick={watchAgain} className="vl-watch interactive mx-auto mt-2 flex h-11 items-center gap-1 rounded-[10px] px-3 text-[12px] font-semibold hover:bg-muted">
                      <RotateCcw className="h-3.5 w-3.5" /> Watch again
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center gap-3 rounded-full border border-chat-card-edge/30 bg-fh-card px-5 py-3 shadow-[0_5px_0_var(--chat-card-edge)] md:px-6 md:py-4">
          <button type="button" onClick={toggle} disabled={phase.kind !== "clip"} aria-label={playing ? "Pause" : "Play"}
            className="interactive grid h-11 w-11 shrink-0 place-items-center rounded-full bg-q-num text-fh-primary-ink disabled:opacity-60">
            {playing ? <Pause className="h-5 w-5" fill="currentColor" /> : <Play className="h-5 w-5 translate-x-[1px]" fill="currentColor" />}
          </button>
          <button type="button" onClick={() => seekTo(time.t - 10)} disabled={phase.kind !== "clip" || time.t < 0.5} aria-label="Back 10 seconds"
            className="interactive grid h-8 w-8 shrink-0 place-items-center rounded-full text-fh-ink disabled:opacity-40">
            <RotateCcw className="h-5 w-5" />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2" aria-label={`Question ${Math.max(qi, 0) + 1} of ${total}`}>
            {flow.checks.map((c, i) => {
              const done = answered.has(c.item_id) || phase.kind === "end";
              const live = i === qi && phase.kind === "clip" && time.d > 0;
              const pct = live ? (time.t / time.d) * 100 : done ? 100 : i === qi ? (phase.kind === "question" ? 100 : 0) : 0;
              const past = !live && (done || (i === qi && phase.kind === "question"));
              return (
                <div key={c.item_id}
                  role={live ? "slider" : past ? "button" : undefined}
                  tabIndex={live || past ? 0 : -1}
                  aria-label={live ? "Video position" : past ? `Watch part ${i + 1} again` : undefined}
                  aria-valuemin={live ? 0 : undefined} aria-valuemax={live ? Math.round(time.d) : undefined} aria-valuenow={live ? Math.round(time.t) : undefined}
                  onPointerDown={live ? (e) => { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); seekFromPointer(e); } : past ? () => replayPart(i) : undefined}
                  onPointerMove={live ? (e) => { if (e.buttons) seekFromPointer(e); } : undefined}
                  onKeyDown={live ? (e) => { if (e.key === "ArrowLeft") { e.preventDefault(); seekTo(time.t - 5); } if (e.key === "ArrowRight") { e.preventDefault(); seekTo(time.t + 5); } } : past ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); replayPart(i); } } : undefined}
                  className={cn("relative flex h-11 flex-1 touch-none items-center", (live || past) && "cursor-pointer")}>
                  <div className="h-2 w-full overflow-hidden rounded-[24px] bg-video-track">
                    <div className={cn("h-full rounded-[24px] bg-q-num", !reduce && !live && "transition-[width] duration-500")} style={{ width: `${pct}%` }} />
                  </div>
                  {live && <span aria-hidden className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fh-card bg-q-num shadow" style={{ left: `${pct}%` }} />}
                </div>
              );
            })}
          </div>
          {canFs && (
            <button type="button" onClick={toggleFs} aria-label={fs ? "Exit full screen" : "Full screen"}
              className="interactive grid h-8 w-8 shrink-0 place-items-center rounded-full text-fh-ink">
              {fs ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
            </button>
          )}
        </div>
        <p className="sr-only" aria-live="polite">{announce}</p>
      </div>

      {/* Upcoming clips load quietly so the next one starts without a wait. */}
      {step && phase.kind === "question" && !lowData && (
        <div hidden>{[step.correct_clip, ...step.wrong_clips].map((id) => flow.media[id] && <video key={id} src={flow.media[id]!.url} preload="auto" muted />)}</div>
      )}

      {phase.kind === "end" && (
        <WarmupPopup correct title={v.labels.endTitle || "Nice Watch!"} lines={[v.labels.end]} button={v.labels.continue || "Continue"} autoClose={false} onButton={() => void next()} />
      )}
    </div>
    </>
  );
}
