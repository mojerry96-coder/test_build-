// Fiti, animated: clips copied from the Gradient Lab simulation (see src/assets/fitila/SOURCES.md).
// All clips start and end on the shared rest frame, so swapping clips never jumps.
import { useEffect, useRef, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useLowData } from "@/lib/ui-prefs";
import { cn } from "@/lib/utils";
import { clipEnded, requestClip, useStillOnly, type Clip, type ClipState } from "./clip-controller";
import idleL from "@/assets/fitila/clips/fitila_idle_light.mp4.asset.json";
import idleD from "@/assets/fitila/clips/fitila_idle_dark.mp4.asset.json";
import nodL from "@/assets/fitila/clips/fitila_nod_light.mp4.asset.json";
import nodD from "@/assets/fitila/clips/fitila_nod_dark.mp4.asset.json";
import retryL from "@/assets/fitila/clips/fitila_retry_light.mp4.asset.json";
import retryD from "@/assets/fitila/clips/fitila_retry_dark.mp4.asset.json";
import tapL from "@/assets/fitila/clips/fitila_tap_light.mp4.asset.json";
import tapD from "@/assets/fitila/clips/fitila_tap_dark.mp4.asset.json";
import celL from "@/assets/fitila/clips/fitila_celebrate2_light.mp4.asset.json";
import celD from "@/assets/fitila/clips/fitila_celebrate2_dark.mp4.asset.json";
import greetL from "@/assets/fitila/clips/fitila_greet_light.mp4.asset.json";
import greetD from "@/assets/fitila/clips/fitila_greet_dark.mp4.asset.json";
import sadL from "@/assets/fitila/clips/fitila_sad_light.mp4.asset.json";
import sadD from "@/assets/fitila/clips/fitila_sad_dark.mp4.asset.json";
import sadStillL from "@/assets/fitila/stills/fitila_sad_light.webp.asset.json";
import sadStillD from "@/assets/fitila/stills/fitila_sad_dark.webp.asset.json";
import restL from "@/assets/fitila/stills/fitila_tap_light_rest.webp.asset.json";
import restD from "@/assets/fitila/stills/fitila_tap_dark_rest.webp.asset.json";
import pIdle from "@/assets/fitila/clips/fitila_pointer_idle.mp4.asset.json";
import pPoint from "@/assets/fitila/clips/fitila_pointer_point.mp4.asset.json";
import pIdleD from "@/assets/fitila/clips/fitila_pointer_idle_dark.mp4.asset.json";
import pPointD from "@/assets/fitila/clips/fitila_pointer_point_dark.mp4.asset.json";
import pStill from "@/assets/fitila/stills/fitila_pointer.png.asset.json";
import present from "@/assets/fitila/stills/fitila_present_interim.png.asset.json";

type Set = Record<Exclude<Clip, "point">, string> & { rest: string };
const LIGHT: Set = { idle: idleL.url, nod: nodL.url, retry: retryL.url, tap: tapL.url, celebrate: celL.url, greet: greetL.url, sad: sadL.url, rest: restL.url };
const DARK: Set = { idle: idleD.url, nod: nodD.url, retry: retryD.url, tap: tapD.url, celebrate: celD.url, greet: greetD.url, sad: sadD.url, rest: restD.url };

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => { const m = matchMedia("(prefers-reduced-motion: reduce)"); setR(m.matches); const h = () => setR(m.matches); m.addEventListener("change", h); return () => m.removeEventListener("change", h); }, []);
  return r;
}

/** `want` is the latest clip request (bump `beat` to re-request); `presenting` shows the presenting still. */
/** Pointer Fiti (whiteboard only): idle loop + point tap; nod/retry/celebrate play as a head bob or shake on the idle clip. */
function PointerFiti({ want, beat, onTap, className, stillOnly }: { want: Clip; beat: number; onTap?: () => void; className?: string; stillOnly?: boolean }) {
  const [low] = useLowData();
  const still = useStillOnly(useReducedMotion(), low) || !!stillOnly;
  const [s, setS] = useState<ClipState>({ playing: "idle" });
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { setS((p) => requestClip(p, want)); }, [want, beat]);
  const pointing = s.playing === "tap" || s.playing === "point" || s.playing === "greet";
  const dark = useTheme().resolved === "dark";
  const sad = s.playing === "sad";
  const src = sad ? (dark ? sadD.url : sadL.url) : pointing ? (dark ? pPointD.url : pPoint.url) : (dark ? pIdleD.url : pIdle.url);
  const stillSrc = sad ? (dark ? sadStillD.url : sadStillL.url) : pStill.url;
  // Pointer clips are cut off at the left, so the whole see-through still plays every pose; pointing is a short bob.
  const fx = s.playing === "nod" || s.playing === "celebrate" || (pointing && !still) ? "fiti-bob" : s.playing === "retry" ? "anim-shake" : "";
  useEffect(() => { const v = ref.current; if (v && !still) { v.currentTime = 0; void v.play().catch(() => {}); } }, [s.playing, still]);
  useEffect(() => { if (!sad && s.playing !== "idle") { const t = setTimeout(() => setS(clipEnded), pointing ? 1400 : 900); return () => clearTimeout(t); } return undefined; }, [s.playing, pointing]);
  return (
    <button type="button" onClick={() => { setS((p) => requestClip(p, "tap")); onTap?.(); }} aria-label="Fiti" className={className}>
      <div key={`${s.playing}${beat}`} className={cn("h-full w-full", fx)}>
        {sad ? (still ? <img src={stillSrc} alt="" onLoad={() => setTimeout(() => setS(clipEnded), 2200)} className="h-full w-full object-contain object-bottom" />
          : <video key={src} src={src} poster={stillSrc} muted playsInline autoPlay preload="auto" onEnded={() => setS(clipEnded)} onError={() => setS({ playing: "retry" })} className={cn("h-full w-full object-contain object-bottom", dark ? "mix-blend-lighten" : "mix-blend-multiply")} />)
        : <img src={pStill.url} alt="" className="h-full w-full object-contain object-bottom" />}
      </div>
    </button>
  );
}

export function FitiClips({ variant, ...p }: { variant?: "pointer"; want: Clip; beat: number; presenting?: boolean; onTap?: () => void; className?: string; stillOnly?: boolean }) {
  return variant === "pointer" ? <PointerFiti {...p} /> : <ClassicFiti {...p} />;
}
function ClassicFiti({ want, beat, presenting, onTap, className }: { want: Clip; beat: number; presenting?: boolean; onTap?: () => void; className?: string }) {
  const { resolved } = useTheme();
  const set = resolved === "dark" ? DARK : LIGHT;
  const [low] = useLowData();
  const still = useStillOnly(useReducedMotion(), low);
  const [s, setS] = useState<ClipState>({ playing: "greet" });
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => { setS((p) => requestClip(p, want)); }, [want, beat]);
  // "point" has no clip yet: the presenting still fills that slot.
  const showPresent = presenting || s.playing === "point";
  const src = s.playing === "point" ? set.idle : set[s.playing];
  useEffect(() => { const v = ref.current; if (v && !still) { v.currentTime = 0; void v.play().catch(() => {}); } }, [src, still]);
  return (
    <button type="button" onClick={() => { setS((p) => requestClip(p, "tap")); onTap?.(); }} aria-label="Fiti" className={className}>
      {still || showPresent ? (
        <img src={showPresent ? present.url : set.rest} alt="" className="h-full w-full object-contain" />
      ) : (
        <video ref={ref} key={src} src={src} poster={set.rest} muted playsInline autoPlay preload="auto" loop={s.playing === "idle"}
          onEnded={() => setS(clipEnded)} onError={() => s.playing === "sad" && setS({ playing: "retry" })} className="h-full w-full object-contain" />
      )}
    </button>
  );
}
