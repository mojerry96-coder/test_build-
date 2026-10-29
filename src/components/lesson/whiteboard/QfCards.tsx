// Gradient Lab–style cards for the quick fix: the hint card (tap Fiti) and the "You got it!" card (right step).
// Rebuilt as our own components; the lab itself is never touched.
import { useEffect, useRef } from "react";
import { hush, useSay } from "@/lib/voice";
import thinking from "@/assets/tutor/thinking.png.asset.json";
import celebrate from "@/assets/video-lesson/celebrate-still.webp.asset.json";
import celClip from "@/assets/video-lesson/mascot-celebrate.webm.asset.json";

const BURST = ["#FE6011", "#7A4BD8", "#12AA75", "#F5C400", "#3EA9EC"];

/** The lab's success burst: 36 pieces radiating from the middle of the screen. */
export function qfBurst() {
  if (typeof document === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const host = document.createElement("div");
  host.className = "qf-burst";
  host.style.left = `${window.innerWidth / 2}px`;
  host.style.top = `${window.innerHeight * 0.45}px`;
  for (let i = 0; i < 36; i++) {
    const a = (Math.PI * 2 * i) / 36 + Math.random() * 0.4, r = 160 + Math.random() * 260;
    const p = document.createElement("i");
    p.style.background = BURST[i % 5]!;
    p.style.setProperty("--dx", `${Math.cos(a) * r}px`);
    p.style.setProperty("--dy", `${Math.sin(a) * r * 0.8 + 140}px`);
    p.style.setProperty("--r", `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 120}ms`;
    host.append(p);
  }
  document.body.append(host);
  window.setTimeout(() => host.remove(), 1400);
}

function Card({ art, clip, sparkle, title, body, action, onAction }: { art: string; clip?: string; sparkle?: boolean; title: string; body: string; action: string; onAction: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => { btn.current?.focus({ preventScroll: true }); }, []);
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-fh-heading/25 p-4" onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); onAction(); } }}>
      <div role="dialog" aria-modal="true" aria-label={title} className="qf-card relative w-[min(440px,92%)] rounded-[28px] bg-fh-card px-7 pb-7 pt-5 text-center shadow-2xl overlay-edge">
        <div className="relative mx-auto w-[150px]">
          {sparkle && (
            <svg aria-hidden viewBox="0 0 300 190" className="absolute -top-2 left-1/2 w-[220px] -translate-x-1/2" fill="none" strokeLinecap="round" strokeWidth="9">
              <path className="qf-sparkle" d="M38 63l-14-8" stroke="#7A4BD8" /><path className="qf-sparkle" d="M85 22l-6-12" stroke="#F2A12E" />
              <path className="qf-sparkle" d="M228 56l12-9" stroke="#FE6011" /><path className="qf-sparkle" d="M252 100l14-5" stroke="#12AA75" />
            </svg>
          )}
          {clip && !matchMedia("(prefers-reduced-motion: reduce)").matches
            ? <video src={clip} poster={art} muted playsInline autoPlay loop className="relative mx-auto aspect-square h-[clamp(150px,22vh,200px)] origin-bottom scale-[1.25] object-contain" />
            : <img src={art} alt="" className="relative mx-auto h-[clamp(150px,22vh,200px)] w-auto origin-bottom scale-[1.25] object-contain qf-hey" />}
        </div>
        <h2 className="mt-2 font-hand text-[30px] leading-tight text-fh-heading">{title}</h2>
        {body && <p className="mt-2 text-[17px] font-medium leading-snug text-fh-ink">{body}</p>}
        <button ref={btn} type="button" onClick={onAction}
          className="hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish mt-5 h-[50px] rounded-full bg-fh-primary px-10 text-[16px] font-semibold text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] active:translate-y-[3px]">{action}</button>
      </div>
    </div>
  );
}

/** Fiti reads the approved hint once; closing the card stops him. */
export function HintCard(p: { title: string; body: string; onClose: () => void }) {
  // replace: speaks every time it opens (not once per wording) and stops any line still playing.
  useSay([p.body], `qf-hint:${p.body}`, true, true);
  return <Card art={thinking.url} title={p.title} body={p.body} action="Got it" onAction={() => { hush(); p.onClose(); }} />;
}

/** Fiti says the "Got it!" title and line once; moving on stops him. */
export function GotItCard(p: { title: string; body: string; action: string; onContinue: () => void }) {
  useSay([p.title, p.body], `qf-got:${p.title}\n${p.body}`, true, true);
  return <Card art={celebrate.url} clip={celClip.url} sparkle title={p.title} body={p.body} action={p.action} onAction={() => { hush(); p.onContinue(); }} />;
}
