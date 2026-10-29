import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import mascotAsset from "@/assets/mascot.png.asset.json";
import { mascotIdleHdClip } from "@/config/lesson";

/**
 * The hero mascot: plays the silent idle loop (still PNG as fallback) with a
 * spring-smoothed 3D tilt toward the cursor.
 */
export function IdleMascot({ className = "" }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // onPlaying can fire before hydration; catch an already-playing clip.
  useEffect(() => {
    const v = videoRef.current;
    if (v && !v.paused && v.readyState >= 3) setPlaying(true);
  }, []);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-6, 6]), { stiffness: 120, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), { stiffness: 120, damping: 18 });

  useEffect(() => {
    if (reduceMotion) return;
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      mx.set(Math.max(-0.5, Math.min(0.5, (e.clientX - cx) / rect.width)));
      my.set(Math.max(-0.5, Math.min(0.5, (e.clientY - cy) / rect.height)));
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my, reduceMotion]);

  return (
    <div ref={ref} className={`pointer-events-none select-none ${className}`} style={{ perspective: 900 }}>
      <motion.div
        style={reduceMotion ? {} : { rotateX, rotateY, transformStyle: "preserve-3d" as const }}
        animate={reduceMotion ? {} : { scaleY: [1, 1.015, 1], rotate: [0, 0.6, 0, -0.6, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="relative h-full origin-bottom"
      >
        {/* Zoomed close-up: scale up from the top edge so the head stays put
            and the lower body runs off the bottom of the screen. */}
        <div
          className="relative h-full"
          style={{ transform: "scale(1.45)", transformOrigin: "top center" }}
        >
          <img
            src={mascotAsset.url}
            alt="Koko, the African Grey parrot tutor"
            className={`h-full w-full object-contain object-bottom transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}
            draggable={false}
          />
          {!reduceMotion && !videoFailed && (
            // The idle clip's parrot fills ~72% of its frame height, so the video
            // is scaled up and bottom-anchored to match the still picture.
            <video
              ref={videoRef}
              src={mascotIdleHdClip}
              muted
              loop
              playsInline
              autoPlay
              aria-hidden
              onPlaying={() => setPlaying(true)}
              onError={() => setVideoFailed(true)}
              className={`absolute left-1/2 aspect-square h-[138%] max-w-none -translate-x-1/2 transition-opacity duration-500 ${playing ? "opacity-100" : "opacity-0"}`}
              style={{ bottom: "-3.4%" }}
            />
          )}
        </div>

      </motion.div>
    </div>
  );
}
