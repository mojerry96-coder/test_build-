// Copied from Dave's Landing (UnderlinedWord.tsx); gold -> --vl-highlight, word colour -> --vi-word.
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A word rendered in white with a hand-drawn gold underline
 * swoosh stroked beneath it: a long sweeping stroke that dips and flicks
 * up at the end, plus a shorter accent stroke under it. Both are drawn
 * in with an SVG path animation on load.
 */
export function UnderlinedWord({
  children,
  textClass = "font-semibold",
}: {
  children: ReactNode;
  textClass?: string;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <span className={`relative inline-block px-1 text-vi-word ${textClass}`}>
      {children}
      <svg
        className="pointer-events-none absolute -inset-x-2 top-[0.78em] h-[0.44em] w-[calc(100%+16px)]"
        viewBox="0 0 120 26"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* main sweep: dips under the word, flicks up as it leaves */}
        <motion.path
          d="M 3 7 C 22 17, 48 20, 72 14 C 90 9.5, 105 7, 117 9.5"
          stroke="var(--vl-highlight)"
          strokeWidth="5"
          strokeLinecap="round"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: "easeInOut" }}
        />
        {/* accent stroke: shorter, lighter, sits under the sweep */}
        <motion.path
          d="M 20 16 C 44 24, 72 23, 98 15"
          stroke="var(--vl-highlight)"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.75"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7, delay: 0.95, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
