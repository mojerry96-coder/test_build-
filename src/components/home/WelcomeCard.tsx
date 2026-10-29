// Spec card used after picking a new topic ("Great Choice!") and before the warm-up ("Quick Check").
// All words arrive from approved fallback lines; nothing is written here.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSay } from "@/lib/voice";
import { playSound } from "@/lib/sound";
/** Spec pop-up sizes shared by every pop-up card (WelcomeCard, WarmupPopup). */
export const SPEC = {
  card: "w-full max-w-[clamp(340px,34vw,480px)] rounded-[28px]",
  body: "px-6 pt-[clamp(20px,4vh,36px)] pb-[clamp(20px,4vh,32px)]",
  fiti: "h-[clamp(84px,14vh,124px)]",
  title: "mt-3 font-hand text-[clamp(28px,2.5vw,36px)] leading-tight",
  line: "mx-auto mt-2 max-w-[330px] text-[15px] leading-relaxed",
  btn: "mx-auto mt-[clamp(16px,3.5vh,28px)] flex h-[46px] w-[185px] items-center justify-center gap-2 rounded-full text-[16px] font-semibold max-md:min-h-12 max-md:w-full",
  edge: "pb-[10px]",
} as const;
import fiti from "@/assets/tutor/thumbs-glasses.png.asset.json";

export function WelcomeCard({ title, line, button, onGo, onClose }: {
  title: string; line: string; button: string; onGo: () => void; onClose: () => void;
}) {
  const [used, setUsed] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLDivElement>(null);
  useSay([title, line].filter(Boolean), `wc-${title}`);
  useEffect(() => {
    playSound("fiti_message");
    btn.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") { e.preventDefault(); btn.current?.focus(); }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const go = () => { if (used) return; setUsed(true); playSound("tap"); onGo(); };
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center bg-[var(--wc-veil)] p-4" onClick={onClose}>
      <div ref={card} role="dialog" aria-modal="true" aria-labelledby="wc-title" onClick={(e) => e.stopPropagation()}
        className={`wc-pop wc-edge relative ${SPEC.card} ${SPEC.edge}`}>
        <div className={`relative overflow-hidden rounded-[28px] bg-[var(--wc-card)] text-center text-[var(--wc-ink)] ${SPEC.body}`}>
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -right-6 -top-4 h-28 w-28 text-[var(--wc-deco)]">
            <path d="M40 30c40-20 80 0 70 40s-60 40-40 80 70 20 90 40" fill="none" stroke="currentColor" strokeWidth="26" strokeLinecap="round" />
          </svg>
          <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute left-[12%] top-[14%] h-16 w-16 text-[var(--wc-deco)]">
            {[0, 45, 90, 135].map((r) => <ellipse key={r} cx="50" cy="50" rx="12" ry="40" fill="currentColor" transform={`rotate(${r} 50 50)`} />)}
          </svg>
          <svg aria-hidden viewBox="0 0 120 70" className="pointer-events-none absolute bottom-1 right-5 h-10 w-20 text-[var(--wc-deco)]">
            <path d="M10 70a20 20 0 0 1 18-26 26 26 0 0 1 48-12 22 22 0 0 1 34 38Z" fill="currentColor" />
          </svg>
          <div className={`relative mx-auto aspect-[390/360] ${SPEC.fiti} overflow-hidden rounded-b-full`}>
            <img src={fiti.url} alt="" className="h-full w-full object-contain" />
          </div>
          <h2 id="wc-title" className={`relative font-bold ${SPEC.title}`}>{title}</h2>
          <p className={`relative opacity-85 ${SPEC.line}`}>{line}</p>
          <button ref={btn} type="button" onClick={go} disabled={used}
            className={`hdr-bounce relative ${SPEC.btn} bg-[var(--wc-btn)] text-[var(--wc-btn-ink)] shadow-[0_6px_0_var(--wc-btn-edge)] transition-transform active:translate-y-[4px] active:shadow-[0_2px_0_var(--wc-btn-edge)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--wc-btn-edge)] disabled:opacity-90 motion-reduce:transition-none`}>
            {button}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
