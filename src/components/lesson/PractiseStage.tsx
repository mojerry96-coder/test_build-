// 5 · Practise (worksheet) in the simulation / quick fix look. Only the look is new: every rule (line checks,
// Teach me modes, hints, help timers) is the same server logic as before.
import { afterRevealLine, type AfterReveal } from "@/shared/after-reveal";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, Delete, Keyboard, LineChart, Lightbulb, X } from "lucide-react";
import type { LineResult } from "@/shared/contracts/lesson";
import type { Script } from "@/shared/contracts/script";
import { checkLinesFn, hintFn, teachMeFn, worksheetModeFn } from "@/lib/api/lesson.functions";
import { tapHintNudge, tapHintPill } from "@/shared/idle-hint";
import { hush, useSay, voiceSpeaking } from "@/lib/voice";
import { playSound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { PRACTISE_NUM_KEYS, PRACTISE_SYM_KEYS, keyLabel } from "@/shared/practise-keys";
import { useReaction } from "./celebrate";
import { WhiteboardDialog } from "./whiteboard/WhiteboardDialog";
import { FitiClips } from "./whiteboard/FitiClips";
import type { Clip } from "./whiteboard/clip-controller";
import { GotItCard, qfBurst } from "./whiteboard/QfCards";
import { QF_OUTLINE, QF_PRIMARY, QfNums, twoPoints } from "./qf-shared";
import { useIsPhone } from "./TutorChatPanel";

type Line = { text: string; status: "ok" | "check" | "pending"; message?: string | null; label?: string | null };

/** The two points from the question on the quick fix grid, joined by the line. */
export function TwoPointGraph({ pts }: { pts: [[number, number], [number, number]] }) {
  // Drawn at the box's real pixel size, so text sizes are true pixels and the grid squares stay square.
  const box = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 560, h: 420 });
  useEffect(() => {
    const el = box.current; if (!el) return;
    const ro = new ResizeObserver(([e]) => { const r = e!.contentRect; if (r.width > 0) setSize({ w: Math.round(r.width), h: Math.round(Math.max(260, r.height)) }); });
    ro.observe(el); return () => ro.disconnect();
  }, []);
  const xs = [0, pts[0][0], pts[1][0]], ys = [0, pts[0][1], pts[1][1]];
  const x0 = Math.min(...xs), y0 = Math.min(...ys);
  const bx1 = Math.max(...xs) + 1, by1 = Math.max(...ys) + 1;
  const padL = 44, padB = 44, padT = 30, padR = 28;
  const aw = size.w - padL - padR, ah = size.h - padT - padB;
  const step = Math.max(10, Math.min(aw / (bx1 - x0), ah / (by1 - y0)));
  // Fill the box: add blank whole squares across / up (squares stay square; points stay put).
  const x1 = Math.max(bx1, x0 + Math.floor(aw / step)), y1 = Math.max(by1, y0 + Math.floor(ah / step));
  const fs = Math.round(Math.min(28, Math.max(18, step / 3.2)));
  const gw = step * (x1 - x0), gh = step * (y1 - y0);
  const ox = padL + (size.w - padL - padR - gw) / 2, oy = padT + (size.h - padT - padB - gh) / 2;
  const sx = (x: number) => ox + (x - x0) * step;
  const sy = (y: number) => oy + gh - (y - y0) * step;
  const hand = { fontFamily: '"Patrick Hand", cursive' };
  const len = Math.hypot(sx(pts[1][0]) - sx(pts[0][0]), sy(pts[1][1]) - sy(pts[0][1]));
  // The lower point's label sits below-right of its dot, the upper one above-left/right, so neither crosses the line.
  const lowIdx = pts[0][1] <= pts[1][1] ? 0 : 1;
  return (
    <figure ref={box} className="anim-spring-in h-full min-h-[260px] w-full">
      <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`} className="block" role="img" aria-label={`Graph with the points (${pts[0].join(", ")}) and (${pts[1].join(", ")})`}>
        {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((x) => <line key={`x${x}`} x1={sx(x)} x2={sx(x)} y1={sy(y0)} y2={sy(y1)} stroke={x === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={x === 0 ? 2.5 : 1.25} />)}
        {Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).map((y) => <line key={`y${y}`} y1={sy(y)} y2={sy(y)} x1={sx(x0)} x2={sx(x1)} stroke={y === 0 ? "var(--board-axis)" : "var(--board-line)"} strokeWidth={y === 0 ? 2.5 : 1.25} />)}
        <line x1={sx(pts[0][0])} y1={sy(pts[0][1])} x2={sx(pts[1][0])} y2={sy(pts[1][1])} stroke="var(--color-board-path)" strokeWidth={Math.max(4, step / 12)} strokeLinecap="round" className="board-draw" style={{ ["--len" as string]: `${len}` }} />
        {Array.from({ length: x1 - x0 + 1 }, (_, i) => x0 + i).map((x) => <text key={`tx${x}`} x={sx(x)} y={sy(y0) + fs + 8} textAnchor="middle" fontSize={fs} fill="var(--hub-heading)" style={hand}>{x}</text>)}
        {Array.from({ length: y1 - y0 + 1 }, (_, i) => y0 + i).filter((y) => y !== y0 || x0 !== 0).map((y) => <text key={`ty${y}`} x={sx(x0) - 12} y={sy(y) + fs / 3} textAnchor="end" fontSize={fs} fill="var(--hub-heading)" style={hand}>{y}</text>)}
        {pts.map(([x, y], i) => (
          <g key={i} className="anim-note-pop" style={{ ["--d" as string]: `${300 + i * 250}ms` }}>
            <circle cx={sx(x)} cy={sy(y)} r={Math.max(8, step / 9)} fill="var(--q-num)" />
            <text x={sx(x) + 14} y={i === lowIdx ? sy(y) + fs + 10 : sy(y) - 14} fontSize={fs + 2} fill="var(--hub-heading)" className="board-halo" style={hand}>({x}, {y})</text>
          </g>
        ))}
      </svg>
    </figure>
  );
}

export function WorksheetStage() {
  const { view, busy, run, sessionId, say } = useLesson();
  const item = view.items[view.position.index];
  const lineFn = useServerFn(checkLinesFn);
  const teach = useServerFn(teachMeFn);
  const worksheetMode = useServerFn(worksheetModeFn);
  const hint = useServerFn(hintFn);
  const next = useAdvance();
  const react = useReaction();
  const phone = useIsPhone();
  // Laptop (lg+): the Check button sits inside the working card so everything fits one screen.
  const [wide, setWide] = useState(false);
  // Laptop: the two cards run from where they start to the bottom of the screen (no page scroll).
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridH, setGridH] = useState(0);
  useEffect(() => {
    if (!wide) return;
    const fit = () => { const el = gridRef.current; if (el) setGridH(Math.max(520, Math.floor(window.innerHeight - (el.getBoundingClientRect().top + window.scrollY) - 28))); };
    fit(); window.addEventListener("resize", fit); return () => window.removeEventListener("resize", fit);
  }, [wide]);
  useEffect(() => { const m = window.matchMedia("(min-width: 1024px)"); const f = () => setWide(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  const [mode, setMode] = useState<"teach" | "alone">("alone");
  const [teachLines, setTeachLines] = useState<Script>([]);
  const [boardOpen, setBoardOpen] = useState(false);
  // Problem 1 plays on the board, which says each line as it writes it; later problems speak the "Worked together" lines once.
  const [boardRun, setBoardRun] = useState(0);
  // After the try limit the server sends the approved worked solution; it plays on the board with his voice.
  const [reveal, setReveal] = useState<Script>([]);
  const [revealOpen, setRevealOpen] = useState(false);
  useSay(teachLines.map((l) => l.speakable ?? l.text), `teach:${teachLines.map((l) => l.text).join("\n")}`, teachLines.length > 0 && view.position.index !== 0);
  // Her saved working comes back after a reload; the server only kept the text, so old lines show without marks.
  const [lines, setLines] = useState<Line[]>(() => (view.workLines ?? []).map((text) => ({ text, status: "pending" as const })));
  const [selected, setSelected] = useState<number | null>(null);
  const [alerts, setAlerts] = useState(0);
  const [draft, setDraft] = useState("");
  const [solved, setSolved] = useState(false);
  const [showEarlier, setShowEarlier] = useState(true);
  const [graphOpen, setGraphOpen] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [hintCard, setHintCard] = useState<string | null>(null);
  const [got, setGot] = useState(false);
  const [hintSeen, setHintSeen] = useState(false);
  const [phoneKeys, setPhoneKeys] = useState(false);
  const hintRef = useRef<HTMLDivElement>(null);
  const hintKey = `pr-hint:${sessionId}:${item?.id ?? ""}`;
  // The hint she already saw comes back after a reload; tapping again reshows it without asking again.
  const [savedHint, setSavedHint] = useState<string | null>(null);
  useEffect(() => { const v = sessionStorage.getItem(hintKey); setSavedHint(v); setHintSeen(!!v); setHintCard(null); }, [hintKey]);
  const closeHint = () => { setHintCard(null); setSelected(null); hush(); };
  useSay(hintCard ? [hintCard] : [], hintCard ? `pr-hint:${hintCard}` : undefined, !!hintCard, true);
  // Tapping anywhere outside the hint closes it.
  useEffect(() => {
    if (!hintCard) return;
    const out = (e: PointerEvent) => { if (hintRef.current && !hintRef.current.contains(e.target as Node)) closeHint(); };
    const t = window.setTimeout(() => document.addEventListener("pointerdown", out, true), 0);
    return () => { window.clearTimeout(t); document.removeEventListener("pointerdown", out, true); };
  }, [hintCard]);
  const [clip, setClip] = useState<{ c: Clip; b: number }>({ c: "point", b: 0 });
  const want = (c: Clip) => setClip((p) => ({ c, b: p.b + 1 }));
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLOListElement>(null);
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => { setSlot(document.getElementById("practise-fiti")); }, []);
  useSay(bubble ? [bubble] : [], bubble ? `pr-bubble:${bubble}` : undefined, !!bubble, true);
  // The problem after a reveal opens with the approved "on your own" line, once.
  useEffect(() => {
    const k = `pr-after:${sessionId}`;
    let saved: AfterReveal | null = null;
    try { saved = JSON.parse(sessionStorage.getItem(k) ?? "null"); } catch { saved = null; }
    const t = afterRevealLine(saved, item?.id);
    if (t) { sessionStorage.removeItem(k); setBubble(t); }
  }, [sessionId, item?.id]);

  const paused = (view as { paused?: boolean }).paused === true;
  const revealed = reveal.length > 0 || (!!item && !!view.results[item.id]?.revealed);
  const isSolved = solved || revealed || (!!item && !!view.results[item.id]?.correct);
  // Stillness, for the lab-style "Tap me for a hint!" hop (same rule as the quick fix).
  const [still, setStill] = useState(0);
  useEffect(() => {
    if (isSolved || paused) return;
    let last = Date.now();
    const reset = () => { last = Date.now(); setStill(0); };
    const evs = ["pointerdown", "keydown", "input"];
    evs.forEach((e) => window.addEventListener(e, reset, true));
    const t = window.setInterval(() => setStill(Date.now() - last), 250);
    return () => { evs.forEach((e) => window.removeEventListener(e, reset, true)); window.clearInterval(t); };
  }, [isSolved, paused]);
  if (!item) return null;

  const idx = view.position.index;
  const stage = mode === "teach" ? (idx === 0 ? "I do" : "We do") : "You do";
  const question = item.prompt.map((p) => p.text).join(" ");
  const pts = twoPoints(question);
  const tapLine = view.boardLines?.tapHint || "";
  const idleMs = view.boardLines?.idleHintMs ?? (view.helpIdleSeconds * 1000);
  const needsHelp = alerts >= view.helpAlertCount;
  const showTag = !isSolved && !paused && tapHintPill({ stepOpen: true, hasHint: !!tapLine, seen: hintSeen, cardOpen: !!hintCard || got });
  const nudge = showTag && (needsHelp || tapHintNudge(still, idleMs, { paused, speaking: voiceSpeaking() }));
  const locked = busy || paused || isSolved;

  const openTeach = async () => {
    const s = await run(async () => {
      await worksheetMode({ data: { sessionId, mode: "teach_me" } });
      return teach({ data: { sessionId, itemId: item.id, mode: idx === 0 ? "model" : "together" } });
    });
    if (s) { react.tap(); setMode("teach"); setTeachLines(s); setBoardOpen(true); }
  };
  const tryAlone = async () => { const r = await run(() => worksheetMode({ data: { sessionId, mode: "independent" } })); if (r) { react.tap(); setMode("alone"); } };
  const submitLine = async () => {
    const text = draft.trim();
    if (!text || locked) return;
    if (hintCard) closeHint();
    const all = [...lines.map((l) => l.text), text];
    const r: LineResult | null = await run(() => lineFn({ data: { sessionId, itemId: item.id, lines: all } }));
    if (!r) return;
    setLines([...lines, { text, status: r.status, message: r.message, label: r.misconceptionLabel }]);
    setDraft("");
    if (r.status === "check") { setAlerts((a) => a + 1); react.notQuite(rowRef.current?.lastElementChild ?? null); want("sad"); }
    else if (!r.solved) { playSound("tap"); want("nod"); }
    if (r.reveal?.length) {
      hush(); if (hintCard) closeHint(); setBubble(null);
      setReveal(r.reveal); setRevealOpen(true); want("greet");
      const after = (r.afterReveal ?? []).map((l) => l.text).join(" ");
      if (after) sessionStorage.setItem(`pr-after:${sessionId}`, JSON.stringify({ from: item.id, text: after }));
      return;
    }
    if (r.message) { say([{ text: r.message }]); setBubble(r.message); }
    if (!r.solved && r.tutorLines.length) { const t = r.tutorLines.map((l) => l.text).join(" "); say(r.tutorLines); setBubble(t); }
    if (r.solved) {
      setSolved(true); say(r.tutorLines, "encouraging");
      qfBurst(); react.big(); want("celebrate"); setGot(true);
    }
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };
  const showHint = async () => {
    if (busy || paused || isSolved) return;
    if (hintCard) { closeHint(); return; }
    hush();
    if (savedHint && selected === null) { setHintCard(savedHint); want("tap"); return; }
    const r = await run(() => hint({ data: { sessionId, itemId: item.id } }));
    if (r?.lines.length) {
      const text = r.lines.map((l) => l.text).join(" ");
      sessionStorage.setItem(hintKey, text); setSavedHint(text);
      setHintCard(text); setHintSeen(true); want("tap"); playSound("hint");
    } else { const fb = (view as { chatFallback?: string | { text: string }[] }).chatFallback; const t = typeof fb === "string" ? fb : (fb ?? []).map((l) => l.text).join(" "); if (t) { setBubble(t); want("retry"); } }
  };
  const askAbout = async (i: number) => { setSelected(i); await showHint(); };
  const insert = (k: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? draft.length, end = el?.selectionEnd ?? draft.length;
    const v = k === "a/b" ? "()/()" : k === "√" ? "√()" : k;
    if (hintCard) closeHint();
    setDraft(draft.slice(0, start) + v + draft.slice(end));
    requestAnimationFrame(() => { el?.focus(); el?.setSelectionRange(start + v.length, start + v.length); });
  };

  const KEY = "squish grid min-h-11 lg:h-[clamp(44px,4.4vh,52px)] place-items-center rounded-[12px] border-2 border-fh-box-line bg-fh-card text-[20px] font-semibold text-fh-heading shadow-[0_3px_0_var(--fh-box-line)] active:translate-y-[2px] active:shadow-none active:bg-fh-nav-on disabled:opacity-60";
  const shown = showEarlier ? lines : lines.slice(-1);
  useEffect(() => { const el = rowRef.current; if (el) el.scrollTop = el.scrollHeight; }, [lines.length]);
  const ctaBlock = (
    <div className="mx-auto w-full max-w-[340px]">
          {isSolved
            ? <button type="button" className="vl-cta interactive flex h-14 w-full items-center justify-center rounded-full text-[18px] font-bold" disabled={busy} onClick={next}>Next</button>
            : <button type="button" className="vl-cta interactive flex h-14 w-full items-center justify-center rounded-full text-[18px] font-bold disabled:cursor-not-allowed" disabled={locked || !draft.trim()} onClick={() => void submitLine()}>{busy ? "Checking…" : "Check this line"}</button>}
          {!isSolved && !draft.trim() && <p role="status" className="mt-2 text-center text-[14px] font-medium text-fh-sub lg:sr-only">Write the next line first</p>}
        </div>
  );

  const hintBox = hintCard && (
    <div ref={hintRef} role="status" aria-live="polite" className="qf-say anim-note-pop rounded-[22px] bg-fh-card px-5 py-4 shadow-lg ring-1 ring-fh-box-line/60">
      <div className="flex items-start gap-3">
        <Lightbulb className="mt-1 h-5 w-5 shrink-0 fill-current text-mcq-hint" aria-hidden />
        <p className="min-w-0 flex-1 font-hand text-[clamp(18px,1.4vw,22px)] leading-snug" style={{ color: "var(--wb-navy)" }}><QfNums text={hintCard} /></p>
        <button type="button" onClick={closeHint} aria-label="Close hint" className="shrink-0 rounded-full p-1 text-fh-sub focus-visible:outline-2"><X className="h-5 w-5" /></button>
      </div>
    </div>
  );

  const fiti = (
    <div className={cn("pr-scope relative flex flex-col items-center", phone ? "w-[96px]" : "w-[clamp(110px,9vw,150px)]")}>
      {bubble && !phone && <p key={bubble} role="status" className="qf-say mb-2 w-[min(300px,24vw)] rounded-[22px] bg-fh-card px-5 py-3 text-center font-hand text-[clamp(17px,1.4vw,22px)] leading-snug shadow-md line-clamp-4" style={{ color: "var(--wb-navy)" }}>{bubble}</p>}
      <div className="relative w-full">
        <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); e.preventDefault(); void showHint(); }} disabled={locked} aria-label={tip(showTag, tapLine)} className={cn("qf-hop block w-full rounded-[40%] outline-none focus-visible:outline-2 focus-visible:outline-fh-box-edge", nudge && "qf-hey")}>
          <FitiClips variant="pointer" stillOnly want={clip.c} beat={clip.b} className="fiti-sway aspect-[748/1065] w-full" />
        </button>
        {showTag && !hintCard && <span role="status" className="qf-avatar-tip">{tapLine}</span>}
        {hintCard && !phone && <div className="absolute bottom-[18%] left-[88%] z-30 w-[min(340px,26vw)]">{hintBox}</div>}
      </div>
    </div>
  );

  return (
    <div className="pr-scope relative space-y-5" data-lesson-step="worksheet">
      {slot && !phone && createPortal(fiti, slot)}
      {phone && <div className="fixed right-3 top-[64px] z-20">{fiti}</div>}

      {/* One row: Teach me / I'll try alone, then problem dots */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-3" role="tablist" aria-label="How do you want to do this one?">
        {([["teach", "Teach me", openTeach], ["alone", "I'll try alone", tryAlone]] as const).map(([m, label, go]) => (
          <button key={m} role="tab" type="button" aria-selected={mode === m} disabled={busy || paused} onClick={() => void go()}
            className={cn("relative h-12 min-w-[150px] px-6 text-[16px]", mode === m ? cn(QF_PRIMARY, "flex-none") : QF_OUTLINE)}>
            {mode === m && <Check aria-hidden className="absolute -right-1 -top-1 h-6 w-6 rounded-full bg-fh-card p-1 text-fh-primary shadow" />}
            {label}
          </button>
        ))}
      </div>

      <div className="flex flex-col items-start gap-1 font-body sm:items-end text-[14px] font-semibold" style={{ color: "var(--wb-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="mr-1">Problem {idx + 1} of {view.items.length}</span>
          {view.items.map((it, i) => <span key={it.id} aria-hidden className="qf-dot" data-state={view.results[it.id]?.revealed || (i === idx && revealed) ? "shown" : view.results[it.id]?.correct || (i === idx && isSolved) ? "done" : i === idx ? "now" : "todo"} />)}
        </span>
        {mode === "teach" && <span>{["I do", "We do", "You do"].map((s) => <span key={s} className={s === stage ? "text-fh-primary" : ""}>{s}{s !== "You do" ? " · " : ""}</span>)}</span>}
      </div>

      </div>

      {paused && <p role="status" className="flex items-center gap-2 rounded-2xl bg-ans-warn-bg px-4 py-3 font-semibold text-fh-ink"><AlertTriangle className="h-5 w-5 text-ans-warn-border" aria-hidden />Your teacher paused the lesson</p>}

      <div ref={gridRef} style={wide && gridH ? { height: gridH } : undefined} className="grid gap-5 lg:grid-cols-[11fr_9fr] lg:items-stretch lg:min-h-[520px]">
      {/* Question card: white with the orange lower edge, like the quick fix */}
      <section className="relative flex h-full min-h-0 flex-col rounded-[28px] border-2 border-[var(--hook-board-edge)] bg-fh-card px-[clamp(18px,3vw,36px)] pb-7 pt-6 shadow-[0_8px_0_var(--hook-board-edge)]">
        <h2 className="font-hand text-[clamp(22px,2.2vw,32px)] leading-snug" style={{ color: "var(--wb-navy)" }}><QfNums text={question} /></h2>
        {pts && (phone && !graphOpen
          ? <button type="button" onClick={() => setGraphOpen(true)} className={cn(QF_OUTLINE, "mt-3 flex h-11 items-center gap-2 px-5 text-[15px]")}><LineChart className="h-5 w-5" aria-hidden />Show graph</button>
          : <div className="mt-4 h-[min(440px,46vh)] min-h-[280px] w-full lg:h-auto lg:min-h-0 lg:flex-1"><TwoPointGraph pts={pts} /></div>)}

        {mode === "teach" && teachLines.length > 0 && idx !== 0 && (
          <div className="mt-5 rounded-[18px] border border-fh-box-line/60 p-4">
            <p className="font-body text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--wb-muted)" }}>Worked together</p>
            {teachLines.map((l, i) => <p key={i} className="maths mt-1 font-hand text-[20px]" style={{ color: "var(--wb-navy)" }}><QfNums text={l.text} /></p>)}
          </div>
        )}
        {mode === "teach" && idx === 0 && teachLines.length > 0 && !boardOpen && (
          <button type="button" onClick={() => { setBoardRun((n) => n + 1); setBoardOpen(true); }} className={cn(QF_OUTLINE, "mt-4 h-11 px-5 text-[15px]")}>Watch Fiti work it out</button>
        )}
      </section>
      {mode === "teach" && idx === 0 && teachLines.length > 0 && (
        <WhiteboardDialog open={boardOpen} onClose={() => setBoardOpen(false)} title="Watch Fiti work it out"
          lines={teachLines.map((l) => l.text)} resumeKey={`${sessionId}:teach:${item.id}:${boardRun}`} followTurn />
      )}

      {reveal.length > 0 && (
        <WhiteboardDialog open={revealOpen && !paused} onClose={() => { hush(); setRevealOpen(false); }} title="Let's work it out together"
          lines={reveal.map((l) => l.text)} resumeKey={`${sessionId}:reveal:${item.id}`} />
      )}

      {/* Working */}
      <section aria-label="Your working" className="flex h-full min-h-0 flex-col rounded-[24px] bg-fh-card p-[clamp(14px,2vw,24px)] shadow-[0_6px_0_var(--fh-box-line)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-body text-[13px] font-semibold uppercase tracking-wide" style={{ color: "var(--wb-muted)" }}>Your working{lines.length > 0 && " · tap a line to ask about it"}</p>
          {!isSolved && <div className="flex gap-2">
            <button type="button" className={cn(QF_OUTLINE, "h-10 px-4 text-[14px]")} disabled={locked || !lines.length} onClick={() => setLines(lines.slice(0, -1))}>Undo</button>
            <button type="button" className={cn(QF_OUTLINE, "h-10 px-4 text-[14px]")} disabled={locked || !lines.length} onClick={() => setLines([])}>Clear</button>
          </div>}
        </div>
        {lines.length > 1 && <button type="button" onClick={() => setShowEarlier((s) => !s)} className="mt-1 self-start min-h-9 text-[14px] font-semibold text-fh-box-edge underline-offset-2 hover:underline">{showEarlier ? "Hide earlier working" : "Show earlier working"}</button>}
        <ol ref={rowRef} className="mt-4 space-y-3 lg:min-h-[120px] lg:flex-1 lg:overflow-y-auto" aria-live="polite">
          {lines.length === 0 && view.workGuide && <li className="rounded-[14px] bg-muted px-4 py-3 text-[15px] font-medium leading-snug text-fh-ink">{view.workGuide}</li>}
          {shown.map((l) => {
            const i = lines.indexOf(l);
            return (
              <li key={i} className="anim-popup">
                <button type="button" onClick={() => void askAbout(i)} disabled={busy || paused}
                  className={cn("maths flex min-h-12 w-full items-center justify-between gap-3 rounded-[14px] border-2 px-4 py-2.5 text-left font-hand text-[clamp(18px,1.6vw,24px)]",
                    selected === i && "ring-2 ring-ans-ring", l.status === "check" ? "border-transparent bg-ans-warn-bg" : "border-fh-box-line bg-[var(--qf-input-bg)]")}
                  style={{ color: "var(--wb-navy)" }}>
                  <span className="min-w-0 break-words"><QfNums text={l.text} /></span>
                  {l.status === "ok" ? <Check className="h-6 w-6 shrink-0 text-ans-right" aria-label="Line checked" />
                    : l.status === "check" ? <span className="flex shrink-0 items-center gap-1 font-body text-[14px] font-semibold text-fh-ink"><AlertTriangle className="h-5 w-5 text-ans-warn-border" aria-hidden />Check this line</span> : null}
                </button>
                {l.status === "check" && (l.message || l.label) && <p className="mt-2 px-4 text-[15px] font-medium leading-snug text-fh-ink">{l.message ?? `Possible slip: ${l.label}`}</p>}
              </li>
            );
          })}
        </ol>

        {!isSolved && (
          <div className="mt-3 shrink-0 space-y-2">
            <label htmlFor="pr-line" className="sr-only">Next line</label>
            <input id="pr-line" ref={inputRef} value={draft} onChange={(e) => { if (hintCard) closeHint(); setDraft(e.target.value); }} disabled={paused} autoComplete="off" inputMode={phone && !phoneKeys ? "none" : "text"}
              placeholder="Write the next line…" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); void submitLine(); } }}
              className="maths h-14 lg:h-[clamp(48px,6vh,60px)] w-full rounded-[14px] border-2 border-fh-box-line bg-[var(--qf-input-bg)] px-4 text-[20px] lg:text-[22px] font-semibold text-[color:var(--qf-input-ink)] outline-none placeholder:text-[16px] placeholder:font-medium placeholder:text-[color:var(--qf-placeholder)] focus-visible:border-ans-ring focus-visible:ring-2 focus-visible:ring-ans-ring" />
            {phone && hintBox}
            {phone && <button type="button" onClick={() => { setPhoneKeys((v) => !v); requestAnimationFrame(() => inputRef.current?.focus()); }} className="flex min-h-11 items-center gap-2 text-[14px] font-semibold text-fh-box-edge"><Keyboard className="h-5 w-5" aria-hidden />{phoneKeys ? "Use maths keys only" : "Type with phone keyboard"}</button>}
            <div className="grid gap-3 sm:grid-cols-[3fr_4fr]" aria-label="Maths keyboard">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Numbers">
                {PRACTISE_NUM_KEYS.map((k) => <button key={k} type="button" disabled={paused} onClick={() => insert(k)} aria-label={keyLabel(k)} className={cn(KEY, "maths", k === "0" && "col-span-2")}>{k}</button>)}
              </div>
              <div className="grid grid-cols-4 gap-2" role="group" aria-label="Letters and symbols">
                {PRACTISE_SYM_KEYS.map((k) => <button key={k} type="button" disabled={paused} onClick={() => insert(k)} aria-label={keyLabel(k)} className={cn(KEY, "maths")}>{k}</button>)}
                <button type="button" disabled={paused} onClick={() => { if (hintCard) closeHint(); setDraft(draft.slice(0, -1)); }} aria-label="Delete" className={cn(KEY, "col-span-4")}><Delete className="h-5 w-5" aria-hidden /></button>
              </div>
            </div>
          </div>
        )}
        {wide && <div className="mt-3 shrink-0">{ctaBlock}</div>}
      </section>
      </div>

      {!wide && ctaBlock}

      {got && createPortal(
        <div className="fixed inset-0 z-50">
          {<GotItCard title={view.boardLines?.gotIt || "You got it!"} body="" action="Continue" onContinue={() => setGot(false)} />}
        </div>, document.body)}
    </div>
  );
}

function tip(show: boolean, line: string) { return show && line ? line : "Hint"; }
