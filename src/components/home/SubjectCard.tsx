import { useRef, useState, type ComponentType, type CSSProperties, type ReactNode } from "react";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

const PRESS_MS = 100;

/** Shared press: shows the settle state for 100 ms, then runs the action; ignores repeats meanwhile. */
export function usePress(action: () => void) {
  const [pressed, setPressed] = useState(false);
  const busy = useRef(false);
  const run = () => {
    if (busy.current) return;
    busy.current = true;
    setPressed(true);
    window.setTimeout(() => { setPressed(false); busy.current = false; action(); }, PRESS_MS);
  };
  return { pressed, run };
}

/** Shared open-card behaviour (hover/focus lift, press, chevron). Reused by chapter, quest and topic cards. */
export function InteractiveCard({ accent, onOpen, className, children, label }: {
  accent: string; onOpen: () => void; className?: string; children: ReactNode; label?: string;
}) {
  const { pressed, run } = usePress(onOpen);
  return (
    <button type="button" onClick={run} aria-label={label} data-pressed={pressed || undefined}
      style={{ "--accent": accent } as CSSProperties} className={cn("s-card s-card-open", className)}>
      {children}
      <ChevronRight className="s-chev ml-auto h-4 w-4 shrink-0" aria-hidden />
    </button>
  );
}

/** Locked card: the lock alone says "not open yet". Not focusable, no message. */
export function LockedCard({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={`${label}, not available yet`} className={cn("s-card s-card-locked", className)}>
      {children}
    </div>
  );
}

/** Icon tile. Light: pastel tint + icon. Dark: subject colour at 18% + lighter-tint icon (PNG icons are recoloured by mask). */
export function SubjectTile({ subject, tint, locked, imgUrl, Svg, svgTone }: {
  subject: string; tint: string; locked: boolean; imgUrl?: string | undefined; Svg?: ComponentType<{ className?: string }> | undefined; svgTone?: string | undefined;
}) {
  const vars = { "--tile-dark": `var(--subject-${subject}-tile-dark)`, "--icon-dark": `var(--subject-${subject}-icon-dark)` } as CSSProperties;
  return (
    <span className="relative shrink-0" style={vars}>
      <span className={cn("s-tile grid h-[50px] w-[50px] place-items-center rounded-lg", tint, locked && "s-tile-locked")}>
        <span className="s-icon grid place-items-center">
          {Svg ? <Svg className={cn("h-7 w-7", svgTone)} /> : (
            <>
              <img src={imgUrl} alt="" width={30} height={30} className="h-[30px] w-[30px] dark:hidden" />
              <span className="s-icon-mask hidden h-[30px] w-[30px] dark:block" style={{ maskImage: `url(${imgUrl})`, WebkitMaskImage: `url(${imgUrl})` }} aria-hidden />
            </>
          )}
        </span>
      </span>
      {locked && <Lock className="s-lock absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-card p-0.5 text-ink-3" aria-hidden />}
    </span>
  );
}

/** Mathematics "√x" icon (drawn to match the Figma icon until the real export arrives). */
export function RootXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M2 15h3l4 8 5-19h12" />
      <path d="M16 11l7 9M23 11l-7 9" />
    </svg>
  );
}
