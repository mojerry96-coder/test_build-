// The tutor that feels alive: pop-in entrance, breathing, a random head tilt, a glowing circle,
// and mood motions (nod, hop, sway, listening glow, speaking bob). Transform and opacity only.
// Reduced motion or low-data mode: a plain fade-in and instant state changes.
// An animated file (Rive/Lottie) from tutor_avatar_assets replaces the still image and switches the coded motions off.
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLowData } from "@/lib/ui-prefs";
import { cn } from "@/lib/utils";

export type LiveMood = "idle" | "encouraging" | "celebrate" | "thinking" | "speaking" | "listening";
export type AvatarAsset = { type: "image" | "rive" | "lottie"; url: string };

const AnimatedAvatar = lazy(() => import("./AnimatedAvatar"));

function useStill(): boolean {
  const [lowData] = useLowData();
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const m = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    setReduce(!!m?.matches);
    const on = () => setReduce(!!m?.matches);
    m?.addEventListener?.("change", on);
    return () => m?.removeEventListener?.("change", on);
  }, []);
  return lowData || reduce;
}

export function LiveTutor({ src, mood = "idle", circle, className, fit = "cover", asset, level, alt = "" }: {
  src: string;
  mood?: LiveMood;
  /** Background class for the round circle; omit for a cut-out parrot with no circle. */
  circle?: string;
  className?: string;
  fit?: "cover" | "contain";
  /** An animated file for this mood (from tutor_avatar_assets); coded motions turn off. */
  asset?: AvatarAsset | null | undefined;
  /** Voice loudness 0..1 while speaking (drives the bob); undefined = no voice. */
  level?: number | undefined;
  alt?: string;
}) {
  const still = useStill();
  const root = useRef<HTMLSpanElement>(null);
  const [paused, setPaused] = useState(false);
  const [tilt, setTilt] = useState(0);
  // Cross-fade: keep the previous image for 200 ms on top while the new one fades in.
  const [prev, setPrev] = useState<string | null>(null);
  const last = useRef(src);
  useEffect(() => {
    if (last.current === src) return;
    if (!still) setPrev(last.current);
    last.current = src;
    const t = setTimeout(() => setPrev(null), 200);
    return () => clearTimeout(t);
  }, [src, still]);

  // Idle loops run only while on screen and the tab is visible.
  useEffect(() => {
    const el = root.current;
    if (!el || still) return;
    let seen = true;
    const upd = () => setPaused(!seen || document.hidden);
    const io = typeof IntersectionObserver !== "undefined" ? new IntersectionObserver(([e]) => { seen = !!e?.isIntersecting; upd(); }) : null;
    io?.observe(el);
    document.addEventListener("visibilitychange", upd);
    return () => { io?.disconnect(); document.removeEventListener("visibilitychange", upd); };
  }, [still]);

  // A gentle head tilt every 6 to 9 seconds (idle only).
  useEffect(() => {
    if (still || paused || mood !== "idle") return;
    const t = setTimeout(() => setTilt((n) => n + 1), 6000 + Math.random() * 3000);
    return () => clearTimeout(t);
  }, [tilt, still, paused, mood]);

  const animated = !!asset?.url && asset.type !== "image";
  const motion = !still && !animated;
  const img = (u: string, extra?: string) => (
    <img src={u} alt={alt} className={cn("absolute inset-0 h-full w-full", fit === "cover" ? "object-cover" : "object-contain object-bottom", extra)} />
  );
  return (
    <span ref={root} data-mood={mood} data-paused={paused || undefined}
      className={cn("lt relative inline-block shrink-0", motion ? "lt-motion" : "lt-still", className)}>
      {circle && (
        <span aria-hidden className={cn("lt-circle absolute inset-0 rounded-full", circle)}>
          {motion && <span className={cn("lt-glow absolute -inset-1 rounded-full", circle)} />}
        </span>
      )}
      <span className={cn("lt-pop absolute inset-0", circle && "overflow-hidden rounded-full")}>
        <span className="lt-mood absolute inset-0" style={level != null ? { transform: `translateY(${-2 * Math.min(1, Math.max(0, level))}px)` } : undefined}>
          <span key={tilt} className={cn("lt-breathe absolute inset-0", tilt > 0 && mood === "idle" && "lt-tilt")}>
            {animated ? (
              <Suspense fallback={img(src)}><AnimatedAvatar asset={asset!} fallback={src} /></Suspense>
            ) : (
              <>
                {img(src, prev && !still ? "lt-fade-in" : undefined)}
                {prev && img(prev, "lt-fade-out")}
              </>
            )}
          </span>
        </span>
      </span>
    </span>
  );
}
