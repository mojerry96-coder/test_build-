// One shared reaction for every checked answer: small win, big win, not quite.
// Effects are transform/opacity only, skipped with reduced motion; sounds follow src/lib/sound.ts rules.
// Marking never happens here: callers react only to the server's right / not-quite result.
import { useRef } from "react";
import { playSound } from "@/lib/sound";
import { musicLift } from "@/lib/music";
import { nextPraise } from "@/shared/praise";
import { useOptionalLesson } from "./context";

const COLOURS = ["var(--celebrate-orange)", "var(--celebrate-yellow)", "var(--celebrate-blue)"];
const reduced = () => typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** 6–8 tiny stars burst 30–50 px out of `el` and fade in 600 ms. */
export function sparkleAt(el: Element | null) {
  if (!el || reduced() || typeof document === "undefined") return;
  const r = el.getBoundingClientRect();
  const n = 6 + Math.floor(Math.random() * 3);
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.4;
    const d = 30 + Math.random() * 20;
    s.className = "cel-star";
    s.textContent = "★";
    s.style.left = `${r.left + r.width / 2}px`;
    s.style.top = `${r.top + r.height / 2}px`;
    s.style.color = COLOURS[i % COLOURS.length]!;
    s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    s.style.setProperty("--dy", `${Math.sin(a) * d}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }
}

/** Light confetti from the top for about 2 s: 60–80 pieces in our colours. */
export function confetti() {
  if (reduced() || typeof document === "undefined") return;
  const box = document.createElement("div");
  box.className = "cel-confetti";
  box.setAttribute("aria-hidden", "true");
  const n = 60 + Math.floor(Math.random() * 21);
  for (let i = 0; i < n; i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.background = COLOURS[i % COLOURS.length]!;
    p.style.animationDelay = `${Math.random() * 500}ms`;
    p.style.setProperty("--rot", `${Math.random() * 720 - 360}deg`);
    p.style.setProperty("--drift", `${Math.random() * 80 - 40}px`);
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}

/** A small confetti burst (14 pieces) out of `el`, like Gradient Lab's success. */
export function confettiAt(el: Element | null) {
  if (!el || reduced() || typeof document === "undefined") return;
  const r = el.getBoundingClientRect();
  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    const a = (i / 14) * Math.PI * 2 + Math.random() * 0.5;
    const d = 40 + Math.random() * 40;
    s.className = "cel-star cel-bit";
    s.style.left = `${r.left + r.width / 2}px`;
    s.style.top = `${r.top + r.height / 2}px`;
    s.style.background = COLOURS[i % COLOURS.length]!;
    s.style.setProperty("--dx", `${Math.cos(a) * d}px`);
    s.style.setProperty("--dy", `${Math.sin(a) * d}px`);
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 700);
  }
}

/** Gentle shake + amber outline on `el`. */
export function notQuiteAt(el: Element | null) {
  if (!el) return;
  el.classList.remove("cel-warn");
  void (el as HTMLElement).offsetWidth;
  el.classList.add("cel-warn");
  setTimeout(() => el.classList.remove("cel-warn"), 1200);
}

/** small(el) for a right step/item, big() for a whole question/fix/task done, notQuite(el) otherwise.
 *  Returns the praise word for small wins so the caller can bounce it in. */
export function useReaction() {
  const lesson = useOptionalLesson();
  const last = useRef<string | null>(null);
  const count = useRef(0);
  const list = lesson?.view.praise?.length ? lesson.view.praise : [];
  return {
    small(el: Element | null, strategy?: string | null): string {
      sparkleAt(el); playSound("small_win"); if (typeof window !== "undefined") window.dispatchEvent(new Event("fiti:cheer")); lesson?.setMood("celebrate");
      const w = nextPraise(last.current, list, { strategy: strategy ?? null, count: count.current++ });
      last.current = w.split(" ")[0] ?? w;
      return w;
    },
    big() { confetti(); playSound("big_win"); if (typeof window !== "undefined") window.dispatchEvent(new Event("fiti:cheer")); musicLift(); lesson?.setMood("celebrate"); },
    notQuite(el: Element | null) { notQuiteAt(el); playSound("not_quite"); if (typeof window !== "undefined") window.dispatchEvent(new Event("fiti:sad")); lesson?.setMood("encouraging"); },
    tap() { playSound("tap"); },
  };
}
