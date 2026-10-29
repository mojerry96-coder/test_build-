// Opening screen of the video step ("Watch, Choose & Learn"), rebuilt from Dave's updated Landing.tsx (see SOURCE.md).
// All words come from fallback lines video_intro_*; "{count}" in how_body is the flow's real number of checks.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Volume2, VolumeX } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import { UnderlinedWord } from "./UnderlinedWord";
import { ParallaxBackground } from "./ParallaxBackground";
import { canPlayClip } from "@/components/learn/FitiLoader";
import idleClip from "@/assets/video-lesson/fiti-idle-hd.webm.asset.json";
import idleStill from "@/assets/video-lesson/fiti-idle-hd-still.webp.asset.json";

const mapHref = () => window.location.pathname.replace(/\/+$/, "").replace(/\/path$/, "") + "/path";

/** Large Fiti: idle loop (loaded after first paint) with a gentle tilt toward the pointer; still in low-data / reduced motion. */
function IdleFiti({ still }: { still: boolean }) {
  const [clip, setClip] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!still) setClip(canPlayClip()); }, [still]);
  useEffect(() => {
    if (still) return;
    const move = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect(); if (!r) return;
      const c = (v: number) => Math.max(-0.5, Math.min(0.5, v));
      setTilt({ x: c((e.clientX - r.left - r.width / 2) / r.width), y: c((e.clientY - r.top - r.height / 2) / r.height) });
    };
    window.addEventListener("pointermove", move); return () => window.removeEventListener("pointermove", move);
  }, [still]);
  return (
    <div ref={ref} aria-hidden className="h-full" style={{ perspective: 900 }}>
      <div className="h-full transition-transform duration-300 ease-out" style={{ transform: `rotateY(${tilt.x * 12}deg) rotateX(${-tilt.y * 8}deg)` }}>
        {clip
          ? <video src={idleClip.url} poster={idleStill.url} autoPlay muted loop playsInline preload="none" onError={() => setClip(false)} className="h-full w-full object-contain object-bottom" />
          : <img src={idleStill.url} alt="" draggable={false} className="h-full w-full object-contain object-bottom" />}
      </div>
    </div>
  );
}

export function VideoIntro({ words, count, muted, onMute, onBegin, still }: {
  words: Record<string, string>; count: number; muted: boolean; onMute: () => void; onBegin: () => void; still: boolean;
}) {
  const router = useRouter();
  const [how, setHow] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const w = (k: string) => words[k] ?? "";
  const go = () => { if (busyRef.current) return; busyRef.current = true; setBusy(true); onBegin(); };
  // Enter starts the lesson, but only when nothing else has focus.
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const a = document.activeElement;
      if (e.key === "Enter" && (!a || a === document.body)) { e.preventDefault(); go(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });

  return (
    <section aria-label={`${w("title")} ${w("word")}`} className="vi-root fixed inset-0 z-40 overflow-y-auto">
      {!still && <div aria-hidden className="pointer-events-none absolute inset-0"><ParallaxBackground /></div>}

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:pl-[calc(clamp(132px,8vw,148px)+24px)]">
        <span className="text-[14px] font-semibold tracking-tight text-vi-ink">{w("kicker")}</span>
        <button type="button" onClick={onMute} aria-label={muted ? "Turn video sound on" : "Turn video sound off"} aria-pressed={!muted}
          className="interactive grid h-11 w-11 place-items-center rounded-full bg-vi-chip/70 text-vi-ink backdrop-blur hover:bg-vi-chip">
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </header>

      <button type="button" onClick={() => void router.navigate({ href: mapHref() })} aria-label="Back"
        className="vi-pill vi-pill-secondary fixed bottom-5 left-5 z-50 flex h-11 items-center gap-2 px-4 text-[14px] font-semibold md:left-[calc(clamp(132px,8vw,148px)+20px)]">
        <ArrowLeft className="h-4 w-4" aria-hidden />Back
      </button>

      {/* Fiti rises large from the bottom edge, behind the words */}
      <div className="pointer-events-none absolute bottom-0 right-0 z-0 flex h-[38vh] w-[70vw] justify-end sm:h-[48vh] lg:h-[80vh] lg:w-[46vw]">
        <IdleFiti still={still} />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-7xl flex-col justify-center gap-6 px-6 pb-[40vh] pt-24 sm:pb-[50vh] md:pl-[calc(clamp(132px,8vw,148px)+4%)] lg:pb-12">
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-hand text-[clamp(3rem,7.5vw,8rem)] font-bold leading-[1.05] tracking-[-0.01em] text-vi-ink">
            {w("title")}<br />
            <span className="pl-10">{"&\u00a0"}<UnderlinedWord textClass="font-bold">{w("word")}</UnderlinedWord></span>
          </h1>
          <p className="max-w-md text-[18px] leading-relaxed text-vi-soft">{w("line")}</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={go} disabled={busy} aria-label={w("begin")}
              className="vi-pill vi-pill-primary inline-flex h-14 items-center gap-3 pl-7 pr-2 text-[18px] font-bold">
              {w("begin")}
              <span className="grid h-10 w-10 place-items-center rounded-full bg-vi-chip text-vi-cta">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}</span>
            </button>
            <button type="button" onClick={() => setHow((v) => !v)} aria-expanded={how}
              className="vi-pill vi-pill-secondary h-14 px-7 text-[18px] font-bold">{w("how")}</button>
          </div>
          <AnimatePresence initial={false}>
            {how && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                <div role="note" aria-label={w("how")} className="vi-glass w-72 rounded-[20px] p-4 text-[14px] font-medium text-vi-ink">
                  {w("how_body").replace("{count}", String(count))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
