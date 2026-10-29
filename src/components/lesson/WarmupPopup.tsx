// One popup for every warm-up answer: "Good job!" (confetti, closes itself) or "You got close!".
import { createContext, useEffect, useRef, useState } from "react";
import celClip from "@/assets/video-lesson/mascot-celebrate.webm.asset.json";
import celStill from "@/assets/video-lesson/celebrate-still.webp.asset.json";
import sadClip from "@/assets/video-lesson/mascot-sad.webm.asset.json";
import sadStill from "@/assets/video-lesson/sad-still.webp.asset.json";
import { useLowData } from "@/lib/ui-prefs";
import { cn } from "@/lib/utils";
import { keepMathsTogether } from "@/shared/chat-groups";
import { useSay } from "@/lib/voice";
import { SPEC } from "@/components/home/WelcomeCard";

/** Avatar files from rule tutor_avatar_assets (only animated ones with a url replace the still). */
export const LessonAssets = createContext<Record<string, { type: "image" | "rive" | "lottie"; url: string }> | null>(null);

export const AUTO_CLOSE_MS = 4000;
const CONFETTI = ["var(--ch-01)", "var(--ch-02)", "var(--ch-03)", "var(--ch-04)", "var(--ch-06)", "var(--warmup-progress)"];

export function WarmupPopup(props: {
  correct: boolean; title: string; lines: string[]; button: string; link?: string | null | undefined;
  onButton: () => void; onLink?: (() => void) | undefined; autoClose: boolean;
  /** Tapping the dim overlay does the same as the button. */
  dismissable?: boolean;
  /** Inside the whiteboard dialog: centred over that screen instead of the page. */
  contained?: boolean;
  /** Spoken (not shown) after the message, e.g. "Let's fix this." */
  spokenAfter?: string | null | undefined;
}) {
  const { correct, title, lines, button, link, onButton, onLink, autoClose, dismissable = false, contained = false, spokenAfter } = props;
  // Voice: the popup reads its title and lines (and any spoken-only closing line) once when it opens.
  const spoken = [title, ...lines, ...(spokenAfter ? [spokenAfter] : [])];
  useSay(spoken, `popup:${spoken.join("\n")}`, true, true);
  const btn = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const [lowData] = useLowData();
  const fired = useRef(false);
  const [pressed, setPressed] = useState(false);
  const once = (fn?: () => void) => () => { if (fired.current || !fn) return; fired.current = true; setPressed(true); fn(); };
  const press = once(onButton);
  const pressLink = once(onLink);
  const [left, setLeft] = useState(AUTO_CLOSE_MS);
  useEffect(() => { btn.current?.focus(); }, []);
  // Auto close after 4 s; the countdown pauses while the tab is hidden.
  useEffect(() => {
    if (!autoClose) return;
    const t = setInterval(() => { if (!document.hidden) setLeft((l) => l - 100); }, 100);
    return () => clearInterval(t);
  }, [autoClose]);
  useEffect(() => { if (autoClose && left <= 0) press(); });
  const trap = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); press(); }
    if (e.key !== "Tab") return;
    const f = card.current?.querySelectorAll<HTMLElement>("button");
    if (!f?.length) return;
    const first = f[0]!, last = f[f.length - 1]!;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className={contained ? "absolute inset-0 z-40 grid place-items-center bg-popup-overlay p-6" : "fixed inset-0 z-50 grid place-items-center bg-popup-overlay px-4"} onKeyDown={trap} onClick={(e) => { if (e.target === e.currentTarget && dismissable) press(); }}>
    {correct && !lowData && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            {Array.from({ length: 28 }, (_, i) => (
              <span key={i} className="confetti-piece" style={{ left: `${(i * 37) % 100}%`, background: CONFETTI[i % CONFETTI.length], animationDelay: `${(i % 7) * 80}ms` }} />
            ))}
          </div>
        )}
      <div ref={card} role="alertdialog" aria-modal="true" aria-labelledby="wp-title" aria-describedby="wp-body"
        className={cn("anim-popup wc-edge relative flex flex-col", SPEC.card, SPEC.edge, contained ? "max-h-[calc(100%-48px)]" : "max-h-[calc(100dvh-32px)]", "text-center shadow-[0_30px_80px_-30px_rgb(2_64_100/0.5)]")}>
        <div className={cn("relative flex min-h-0 flex-col items-center overflow-hidden rounded-[28px] bg-fh-card", SPEC.body)}>
        <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute left-[12%] top-[14%] h-16 w-16 text-fh-page">{[0, 45, 90, 135].map((r) => <ellipse key={r} cx="50" cy="50" rx="12" ry="40" fill="currentColor" transform={`rotate(${r} 50 50)`} />)}</svg>
        <svg aria-hidden viewBox="0 0 120 120" className="pointer-events-none absolute -right-6 -top-4 h-28 w-28 text-fh-page"><path fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" d="M20 30c30-20 60 10 40 30s10 50 40 30" /></svg>
        <svg aria-hidden viewBox="0 0 120 60" className="pointer-events-none absolute bottom-1 right-5 h-10 w-20 text-fh-page"><path fill="currentColor" d="M20 60a20 20 0 0 1 10-38 26 26 0 0 1 48-6 20 20 0 0 1 32 24 14 14 0 0 1-2 20z" /></svg>
        {lowData || matchMedia("(prefers-reduced-motion: reduce)").matches
          ? <img src={correct ? celStill.url : sadStill.url} alt="" className="relative -mt-2 aspect-[110/130] h-[clamp(120px,20vh,180px)] origin-bottom scale-[1.25] object-contain" />
          : <video src={correct ? celClip.url : sadClip.url} poster={correct ? celStill.url : sadStill.url} muted playsInline autoPlay loop
              className="relative -mt-2 aspect-[110/130] h-[clamp(120px,20vh,180px)] origin-bottom scale-[1.25] object-contain" />}
        <h2 id="wp-title" className={cn("relative text-hub-heading [-webkit-text-stroke:1px_var(--hub-heading)]", SPEC.title)}>{title}</h2>
        <div id="wp-body" className={cn("relative min-h-0 overflow-y-auto text-fh-ink", SPEC.line)}>
          {lines.map((l, i) => <p key={i}>{keepMathsTogether(l)}</p>)}
        </div>
        <button ref={btn} type="button" onClick={press}
          className={cn("relative shrink-0 bg-fh-dark-btn text-fh-dark-btn-ink", SPEC.btn, " shadow-[0_6px_0_var(--fh-dark-btn-edge)] transition-[transform,filter,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_3px_0_var(--fh-dark-btn-edge)] motion-reduce:transition-none")}>
          {pressed && <span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
          {button}
          {autoClose && !pressed && (
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4 -rotate-90">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="63" strokeDashoffset={63 * (1 - Math.max(0, left) / AUTO_CLOSE_MS)} />
            </svg>
          )}
        </button>
        {link && onLink && (
          <button type="button" onClick={pressLink} className="relative mt-2 min-h-10 shrink-0 rounded-[8px] px-3 font-body text-[13px] font-semibold text-ink-3 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ans-ring focus-visible:ring-offset-2">{link}</button>
        )}
        </div>
      </div>
    </div>
  );
}
