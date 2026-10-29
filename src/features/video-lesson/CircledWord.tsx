import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * A word rendered bold in brand blue with a hand-drawn gold ellipse
 * stroked around it, drawn in with an SVG path animation on load.
 */
export function CircledWord({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  return (
    <span className="relative inline-block px-1 font-semibold text-brand">
      {children}
      <svg
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 h-[calc(100%+16px)] w-[calc(100%+24px)]"
        viewBox="0 0 120 60"
        fill="none"
        preserveAspectRatio="none"
        aria-hidden
      >
        <motion.path
          d="M 12 32 C 10 14, 55 4, 86 8 C 112 11, 116 26, 108 40 C 98 56, 45 58, 22 50 C 8 45, 8 30, 20 20"
          stroke="var(--vl-highlight)"
          strokeWidth="4"
          strokeLinecap="round"
          initial={reduceMotion ? { pathLength: 1 } : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
}
