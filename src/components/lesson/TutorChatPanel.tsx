import { playSound } from "@/lib/sound";
import { StreamingBubbleText } from "./StreamingText";
import { say } from "@/lib/voice";
import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { ChevronDown, Mic } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { looksRaw } from "@/shared/contracts/chat-safety";
import { groupStarts, keepMathsTogether } from "@/shared/chat-groups";
import { badgeText } from "@/shared/tutor-collapse";
import { LiveTutor } from "@/components/tutor/LiveTutor";
import head from "@/assets/tutor/head.png.asset.json";
import messenger from "@/assets/tutor/messenger.png.asset.json";
import minIcon from "@/assets/lesson/tutor-minimise.svg.asset.json";
import closeIcon from "@/assets/lesson/tutor-close.svg.asset.json";
import micIcon from "@/assets/lesson/tutor-mic.svg.asset.json";
import sendIcon from "@/assets/lesson/tutor-send.svg.asset.json";
import speaker from "@/assets/lesson/tutor-voice.svg.asset.json";
import wave from "@/assets/tutor/wave.png.asset.json";
import thinking from "@/assets/tutor/thinking.png.asset.json";

const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Phone: the chat as a bottom sheet with a grab handle. Swipe down past a third, tap the dim, Escape or back to close. */
function PhoneSheet({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  const sheet = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const [dy, setDy] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const done = useRef(false);
  const shut = () => {
    if (done.current) return;
    done.current = true;
    if (history.state?.tutorSheet) history.back();
    setLeaving(true);
    setTimeout(() => { onClose(); document.getElementById("tutor-strip")?.focus({ preventScroll: true }); }, reduced() ? 150 : 240);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && shut();
    if (!history.state?.tutorSheet) history.pushState({ ...(history.state ?? {}), tutorSheet: true }, "");
    const back = () => { if (!history.state?.tutorSheet) shut(); };
    window.addEventListener("keydown", key);
    window.addEventListener("popstate", back);
    return () => {
      window.removeEventListener("keydown", key);
      window.removeEventListener("popstate", back);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const h = () => sheet.current?.getBoundingClientRect().height ?? 600;
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Tutor chat">
      <div className={cn("absolute inset-0 bg-overlay-dim transition-opacity duration-200", leaving ? "opacity-0" : "tp-fade")} onClick={shut} />
      <div ref={sheet}
        className={cn("absolute inset-x-0 bottom-0 flex h-[80vh] flex-col overflow-hidden rounded-t-2xl bg-surface-fixed", !leaving && dy === 0 && !drag.current && "tp-sheet-in")}
        style={{ transform: leaving ? "translateY(100%)" : dy ? `translateY(${dy}px)` : undefined, transition: drag.current ? "none" : "transform 240ms cubic-bezier(0.2, 0.8, 0.2, 1)" }}>
        <div className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center"
          onPointerDown={(e) => { drag.current = { y: e.clientY, dy: 0 }; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
          onPointerMove={(e) => { if (!drag.current) return; drag.current.dy = Math.max(0, e.clientY - drag.current.y); setDy(drag.current.dy); }}
          onPointerUp={() => { const d = drag.current?.dy ?? 0; drag.current = null; if (d > h() / 3) shut(); else setDy(0); }}
          onPointerCancel={() => { drag.current = null; setDy(0); }}>
          <span aria-hidden className="h-1.5 w-10 rounded-full bg-line-fixed" />
          <span className="sr-only">Drag down to close</span>
        </div>
        <div className="min-h-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

/** Collapsed tutor: the parrot in the main card's bottom-right corner, "Ask {name}" pill at its feet,
 *  "Need help?" bubble on its left with the new-message badge; a new message previews in the bubble for 4 s. */
export function CollapsedTutor({ name, count, preview, onOpen, phone = false }: {
  name: string | null; count: number; preview: string | null; onOpen: () => void; phone?: boolean;
}) {
  const badge = badgeText(count);
  const [popped, setPopped] = useState(false);
  useEffect(() => { const t = setTimeout(() => setPopped(true), 1100); return () => clearTimeout(t); }, []);
  const label = `Open tutor, ${count} new message${count === 1 ? "" : "s"}`;
  const bubble = (
    <span className={cn("tc-bubble-tail relative block rounded-[16px] border border-tc-line bg-surface-fixed text-left font-sans font-semibold text-tc-ink shadow-sm",
      phone ? "max-w-[220px] px-3 py-2 text-[13px]" : "max-w-[260px] px-4 py-2.5 text-[16px]")}>
      <span key={preview ?? "help"} className="tp-fade block">{preview ?? "Need help?"}</span>
      {badge && (
        <span key={`b${count}`} aria-hidden className="tc-badge-pop absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-tc-badge px-1 text-[12px] font-bold leading-none text-tc-pill-ink">{badge}</span>
      )}
    </span>
  );
  return (
    <button id="tutor-pill" type="button" onClick={onOpen} aria-label={label} aria-expanded={false}
      className="tc-pop group flex items-center gap-2 text-left outline-none focus-visible:rounded-[16px] focus-visible:ring-2 focus-visible:ring-ring">
      {bubble}
      {phone ? (
        <span className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-tutor-ring shadow-lg">
          <img key={`n${count}`} src={head.url} alt="" className={cn("h-12 w-12 object-cover", count > 0 && "tc-nod")} />
        </span>
      ) : (
        <span className="relative flex shrink-0 flex-col items-center pb-3">
          <span key={`n${count}`} className={cn("block", count > 0 ? "tc-nod" : popped ? "tc-idle" : "tc-wave")}>
            <img src={wave.url} alt="" width={80} height={110} className="h-[110px] w-auto object-contain" />
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-tc-pill px-3 py-1 font-sans text-[12px] font-bold leading-4 text-tc-pill-ink shadow-md">
            Ask {name ?? "your tutor"}
          </span>
        </span>
      )}
      <span className="sr-only" aria-live="polite">{badge ? `${count} new message${count === 1 ? "" : "s"}` : ""}</span>
    </button>
  );
}

/** FLIP: after the element changes size or position (e.g. the tutor panel closes), animate from the old box to the new one. */
export function useFlip(ref: RefObject<HTMLElement | null>, dep: unknown) {
  const last = useRef<DOMRect | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const now = el.getBoundingClientRect();
    const prev = last.current;
    last.current = now;
    if (!prev || reduced() || !el.animate || !now.width) return;
    const dw = now.width - prev.width, dx = prev.left - now.left;
    if (Math.abs(dw) < 1 && Math.abs(dx) < 1) return;
    // Reveal/clip the edge instead of scaling, so the content never stretches.
    const from = dw > 0 ? `inset(0 ${dw}px 0 0 round 16px)` : "inset(0 0 0 0 round 16px)";
    const to = dw > 0 ? "inset(0 0 0 0 round 16px)" : `inset(0 0 0 0 round 16px)`;
    el.animate([{ clipPath: from, transform: `translateX(${dx}px)` }, { clipPath: to, transform: "none" }], { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
  }, [dep]); // eslint-disable-line react-hooks/exhaustive-deps
}

export type PanelMsg = {
  from: "tutor" | "student" | "divider";
  text: string;
  note?: string | undefined;
  at?: number | undefined;
  /** Lines to speak for this message (speakable forms); defaults to the text. */
  voice?: string[] | undefined;
  /** A worked example: title plus lines; folds to its title once done. */
  block?: { id: string; title: string; lines: string[]; done: boolean; total?: number | undefined } | undefined;
};

/** Worked example in the chat: lines fill in with the stage, then it folds to its title; tap to reopen. */
function ChatBlock({ block, first }: { block: NonNullable<PanelMsg["block"]>; first: boolean }) {
  const [open, setOpen] = useState<boolean | null>(null);
  const expanded = open ?? !block.done;
  const count = block.total ?? block.lines.length;
  const title = `${block.title} · ${count} step${count === 1 ? "" : "s"}`;
  return (
    <div className={cn("rounded-[16px] bg-tutor-bubble px-3 py-[9px] text-[13px] font-medium text-brand", first ? "tutor-tail rounded-tl-none" : "")}>
      <button type="button" aria-expanded={expanded} aria-label={`${title}, ${expanded ? "collapse" : "expand"}`}
        className="flex w-full items-center justify-between gap-2 text-left font-semibold" onClick={() => setOpen(!expanded)}>
        <span>{title}</span>
        <ChevronDown aria-hidden className={cn("h-4 w-4 shrink-0 transition-transform duration-200", expanded && "rotate-180")} />
      </button>
      {expanded && (
        <ol className="mt-1 space-y-1">
          {block.lines.map((l, i) => <li key={i} className="tp-msg-up">{keepMathsTogether(l)}</li>)}
        </ol>
      )}
    </div>
  );
}
export const INPUT_PLACEHOLDER = "Ask about anything…";

type Props = {
  name: string | null;
  messages: PanelMsg[];
  onSend: (t: string) => void;
  busy?: boolean;
  onClose: () => void;
  className?: string | undefined;
  /** Ask box disabled (exit ticket, teacher pause). */
  locked?: boolean;
  placeholder?: string | undefined;
  /** Typing speed for fresh tutor messages (rule chat_stream_chars_per_s). */
  streamCps?: number | undefined;
  suggestions?: string[];
  /** When set, tapping a suggestion sends it straight away (intro quick replies). */
  onChip?: ((t: string) => void) | undefined;
  /** Extra lift for the phone strip when a tab bar sits under it. */
  stripClassName?: string;
  /** Reopened from the collapsed parrot: grow out of its corner. */
  grow?: boolean | undefined;
  /** Ask card on a question: name only in the header (no subtitle). */
  oneLine?: boolean | undefined;
  /** Phone: hide the bottom strip (collapse into the round parrot button). */
  onCollapse?: (() => void) | undefined;
};

/** Below tablet width the panel becomes a bottom strip that opens a sheet. */
export function useIsPhone() {
  const [phone, setPhone] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const u = () => setPhone(m.matches);
    u();
    m.addEventListener("change", u);
    return () => m.removeEventListener("change", u);
  }, []);
  return phone;
}

/** Tutor panel from the lesson design. Shared by the intro and every lesson step. */
export function TutorChatPanel(props: Props) {
  const phone = useIsPhone();
  // Reopened from the phone parrot button: go straight to the chat sheet.
  const [open, setOpen] = useState(!!props.grow);
  if (!phone) return <PanelBody {...props} />;
  const last = [...props.messages].reverse().find((m) => m.from === "tutor" && !looksRaw(m.text));
  return (
    <>
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-line-fixed bg-surface-fixed px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
          props.stripClassName,
        )}
      >
        <div className="flex items-center gap-3">
          <button
            id="tutor-strip"
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open tutor"
            aria-expanded={open}
            className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
          >
            <LiveTutor src={head.url} circle="bg-tutor-ring" mood={props.busy ? "thinking" : "idle"} className="h-10 w-10" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-display text-base font-semibold text-ink-fixed">
                {props.name ?? "Your tutor"}
              </span>
              <span key={last?.text ?? ""} className="tp-fade line-clamp-2 text-xs text-ink-2-fixed">
                {last?.text ?? "AI tutor"}
              </span>
            </span>
          </button>
          <button
            type="button"
            aria-label="Talk by voice"
            onClick={() => toast("Voice is coming soon. Type for now.")}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-bg-secondary text-ink-fixed"
          >
            <Mic className="h-5 w-5" />
          </button>
          {props.onCollapse && (
            <button type="button" aria-label="Hide tutor" onClick={props.onCollapse}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-fixed">
              <span aria-hidden className="tutor-icon h-4 w-4" style={{ ["--icon" as string]: `url(${closeIcon.url})` }} />
            </button>
          )}
        </div>
      </div>
      {open && <PhoneSheet onClose={() => setOpen(false)}>
        <PanelBody {...props} grow={false} className="h-full rounded-none" onClose={() => setOpen(false)} hideMin />
      </PhoneSheet>}
    </>
  );
}

function PanelBody({
  oneLine,
  name,
  messages,
  onSend,
  busy,
  onClose,
  className,
  locked,
  placeholder,
  suggestions,
  onChip,
  hideMin,
  streamCps,
  grow,
}: Props & { hideMin?: boolean }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"text" | "voice">("text");
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const atBottom = useRef(true);
  const [newChip, setNewChip] = useState(false);
  const firstCount = useRef(messages.length);
  const shown = messages.filter((m) => m.block || !looksRaw(m.text));
  const starts = groupStarts(shown);
  // Fresh tutor lines type one after another: nothing after a still-typing line is shown yet.
  const [typed, setTyped] = useState<Set<number>>(() => new Set());
  let gate = shown.length - 1;
  for (let i = firstCount.current; i < shown.length; i++) {
    const m = shown[i]!;
    if (m.from === "tutor" && !m.block && !typed.has(i)) { gate = i; break; }
  }
  // Voice POC: each fresh tutor message is spoken once, in order (src/lib/voice.ts queues it). Failure leaves the text.
  const spoken = useRef<Set<number>>(new Set());
  useEffect(() => {
    for (let i = firstCount.current; i < shown.length; i++) {
      const m = shown[i]!;
      if (m.from !== "tutor" || m.block || spoken.current.has(i)) continue;
      spoken.current.add(i);
      playSound("fiti_message");
      say(m.voice ?? [m.text]);
    }
  }, [shown.length]); // eslint-disable-line react-hooks/exhaustive-deps
  // Opening: focus the ask box (desktop and the phone sheet).
  useEffect(() => { document.getElementById("tutor-ask")?.focus({ preventScroll: true }); }, []);
  // Reopening from the parrot: the panel grows out of the parrot's corner, then the messages fade in at the newest one.
  useLayoutEffect(() => {
    const el = root.current;
    if (!grow || !el?.animate) return;
    list.current?.scrollTo({ top: list.current.scrollHeight });
    if (reduced()) { el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: "ease-out" }); return; }
    const a = el.getBoundingClientRect();
    const b = document.querySelector<HTMLElement>("[data-tutor-pill-anchor]")?.getBoundingClientRect();
    const dx = b ? b.right - 70 - a.left : 0, dy = b ? b.bottom - 60 - a.bottom : 0;
    el.style.transformOrigin = "bottom left";
    el.animate([{ transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    list.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: 260, fill: "backwards" });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    if (atBottom.current) el.scrollTo({ top: el.scrollHeight, behavior: reduced() ? "auto" : "smooth" });
    else setNewChip(true);
  }, [messages.length, busy]);
  const onScroll = () => {
    const el = list.current;
    if (!el) return;
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    if (atBottom.current) setNewChip(false);
  };
  const toBottom = () => { list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" }); setNewChip(false); };
  const close = () => {
    const el = root.current;
    const pill = document.querySelector<HTMLElement>("[data-tutor-pill-anchor]");
    if (!el || hideMin || !el.animate) return onClose();
    const a = el.getBoundingClientRect();
    const b = pill?.getBoundingClientRect();
    // Fold towards the parrot's spot at the main card's bottom-right corner.
    const dx = b ? b.right - 70 - a.left : 0, dy = b ? b.bottom - 60 - a.bottom : 0;
    el.style.transformOrigin = "bottom left";
    const anim = reduced()
      ? el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, easing: "ease-out", fill: "forwards" })
      : el.animate([{ transform: "none", opacity: 1 }, { transform: `translate(${dx}px, ${dy}px) scale(0.15)`, opacity: 0 }], { duration: 300, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" });
    anim.onfinish = () => { onClose(); setTimeout(() => document.getElementById("tutor-pill")?.focus({ preventScroll: true }), 0); };
  };
  const send = () => {
    const t = text.trim();
    if (!t || busy || locked) return;
    setText("");
    onSend(t);
  };
  return (
    <section
      ref={root}
      aria-label="Tutor"
      className={cn(
        "@container flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] bg-surface-fixed", !hideMin && !grow && "tp-panel-in",
        className,
      )}
    >
      <header className="flex items-center gap-2 border-b border-line-fixed px-4 py-4">
        <LiveTutor src={head.url} circle="bg-tutor-ring" mood={busy ? "thinking" : "idle"} className="h-10 w-10" />
        <div className="min-w-0 flex-1 leading-tight">
          <p title={(name ?? "Your tutor").length > 18 ? name ?? undefined : undefined}
            className="truncate font-display text-xl font-semibold text-ink-fixed">
            {(name ?? "Your tutor").length > 18 ? `${(name ?? "").slice(0, 18)}…` : name ?? "Your tutor"}
          </p>
          {!oneLine && <p className="text-[11px] font-semibold text-ink-2-fixed">AI tutor</p>}
        </div>
        <div
          className="relative hidden shrink-0 rounded-lg bg-bg-secondary p-0.5 @[330px]:flex"
          role="group"
          aria-label="Tutor mode"
        >
          <span aria-hidden className="absolute left-0.5 top-0.5 h-10 w-10 rounded-md bg-surface-fixed shadow-sm transition-transform duration-[180ms] ease-[var(--ease-open)]" style={{ transform: mode === "voice" ? "translateX(40px)" : "translateX(0)" }} />
          <button
            type="button"
            aria-pressed={mode === "text"}
            aria-label="Text mode"
            onClick={() => setMode("text")}
            className={cn("relative grid h-10 w-10 place-items-center rounded-md transition-colors duration-[180ms]", mode === "text" ? "text-ink-fixed" : "text-ink-3")}
          >
            <span aria-hidden className="tutor-icon h-5 w-5" style={{ ["--icon" as string]: `url(${messenger.url})` }} />
          </button>
          <button
            type="button"
            aria-pressed={mode === "voice"}
            aria-label="Voice mode"
            onClick={() => { setMode("voice"); toast("Voice is coming soon"); setTimeout(() => setMode("text"), 900); }}
            className={cn("relative grid h-10 w-10 place-items-center rounded-md transition-colors duration-[180ms]", mode === "voice" ? "text-ink-fixed" : "text-ink-3")}
          >
            <span aria-hidden className="tutor-icon h-5 w-5" style={{ ["--icon" as string]: `url(${speaker.url})` }} />
          </button>
        </div>
        {!hideMin && (
          <button type="button" onClick={(e) => { e.stopPropagation(); close(); }} aria-label="Minimise tutor"
            className="grid h-9 w-9 shrink-0 place-items-center text-ink-fixed">
            <span aria-hidden className="tutor-icon h-4 w-4" style={{ ["--icon" as string]: `url(${minIcon.url})` }} />
          </button>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); close(); }}
          aria-label="Close tutor"
          aria-expanded="true"
          className="grid h-9 w-9 shrink-0 place-items-center text-ink-fixed"
        >
          <span aria-hidden className="tutor-icon h-4 w-4" style={{ ["--icon" as string]: `url(${closeIcon.url})` }} />
        </button>
      </header>
      {(
        <div className={cn("relative flex min-h-0 flex-1 flex-col origin-top", !grow && "tp-unfold")}>
          <div ref={list} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto p-4" aria-live="polite">
            {shown
              .slice(0, gate + 1)
              .map((m, i) => {
                const fresh = i >= firstCount.current;
                const stagger = !fresh && i >= shown.length - 5;
                const first = !!starts[i];
                const cls = fresh ? (m.from === "student" ? "tp-msg-right" : m.from === "tutor" ? "tp-msg-left" : "tp-msg-up") : stagger ? "tp-msg-up" : "";
                return (
                <div key={i} className={cn(cls, i > 0 && (first ? "mt-3" : "mt-1"))} style={stagger ? { animationDelay: `${280 + (i - (shown.length - 5)) * 30}ms` } : undefined}>
                  {m.from === "divider" ? (
                    <p className="border-t border-line-fixed pt-3 text-center text-[11px] font-semibold text-ink-3">
                      {m.text}
                    </p>
                  ) : m.from === "tutor" ? (
                    <div className="flex items-start gap-2">
                      {first ? <LiveTutor src={wave.url} className="h-12 w-10" fit="contain" /> : <span aria-hidden className="w-10 shrink-0" />}
                      {m.block ? <div className="min-w-0 flex-1"><ChatBlock block={m.block} first={first} /></div> : (
                        <p className={cn("rounded-[16px] bg-tutor-bubble px-3 py-[9px] text-[13px] font-medium text-brand", first && "tutor-tail rounded-tl-none")}>
                          {fresh ? <StreamingBubbleText text={m.text} cps={streamCps} live onState={(typing) => { if (!typing) setTyped((s) => (s.has(i) ? s : new Set(s).add(i))); }} /> : keepMathsTogether(m.text)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className={cn("ml-auto w-fit max-w-[85%] rounded-[16px] bg-student-bubble px-3 py-[9px] text-[13px] font-medium text-brand", first && "rounded-tr-none")}>
                      {keepMathsTogether(m.text)}
                    </p>
                  )}
                  {m.note && <p className="mt-1 text-right text-[11px] text-ink-3">{m.note}</p>}
                </div>
                );
              })}
            {busy && (
              <div role="status" aria-label="The tutor is thinking" className="tp-msg-left flex items-start gap-2">
                <LiveTutor src={thinking.url} mood="thinking" className="h-12 w-10" fit="contain" />
                <p className="tutor-tail flex gap-1 rounded-[16px] rounded-tl-none bg-tutor-bubble px-4 py-[13px]">
                  {[0, 1, 2].map((d) => <span key={d} className="tp-dot h-1.5 w-1.5 rounded-full bg-brand" style={{ animationDelay: `${d * 150}ms` }} />)}
                </p>
              </div>
            )}
          </div>
          {newChip && (
            <button type="button" onClick={toBottom} className="tp-pill-in absolute bottom-[92px] left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md">
              New message ↓
            </button>
          )}
          <div className="border-t border-line-fixed p-3">
            {!locked && suggestions && suggestions.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={busy}
                    onClick={() => (onChip ? onChip(s) : setText(s))}
                    className={onChip ? "interactive min-h-9 rounded-full border border-line-fixed bg-surface-fixed px-3 text-[13px] font-semibold text-brand hover:bg-bg-secondary" : "interactive min-h-9 rounded-full border border-line-fixed px-3 text-xs text-ink-fixed"}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="tutor-pill flex h-[52px] items-center gap-2 rounded-full bg-bg-secondary pl-5 pr-2">
              <label htmlFor="tutor-ask" className="sr-only">
                Ask {name ?? "your tutor"}
              </label>
              <input
                id="tutor-ask"
                value={text}
                disabled={locked}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                maxLength={500}
                placeholder={placeholder ?? (name ? `Ask ${name} a question...` : "Ask your tutor a question...")}
                className="tutor-input h-full min-w-0 flex-1 bg-transparent outline-none focus:outline-none focus-visible:outline-none text-[13px] font-medium text-ink-fixed placeholder:text-ink-3"
              />
              <button
                type="button"
                aria-label="Talk by voice"
                disabled={locked}
                onClick={() => toast("Voice is coming soon. Type for now.")}
                className="grid h-9 w-9 place-items-center text-ink-fixed"
              >
                <span aria-hidden className="tutor-icon h-4 w-4" style={{ ["--icon" as string]: `url(${micIcon.url})` }} />
              </button>
              <button
                type="button"
                aria-label="Send"
                onClick={send}
                disabled={!text.trim() || busy || locked}
                className="btn-ready grid h-9 w-9 place-items-center rounded-full"
              >
                <span aria-hidden className="tutor-icon h-4 w-4 -rotate-90" style={{ ["--icon" as string]: `url(${sendIcon.url})` }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
