// App-open splash: Fiti waves, the tutor's name springs in, the underline fills with real loading, then a staged close (bar, letters, Fiti, backdrop).
import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import wave from "@/assets/tutor/splash-wave.png";
import waveBlink from "@/assets/tutor/splash-wave-blink.png";
import { getTutorNameFn } from "@/lib/api/settings.functions";
import { playSound } from "@/lib/sound";
import { exitPlan, lagosDay, mayClose, splashPlan, type SplashPlan } from "@/shared/splash-plan";
import { cn } from "@/lib/utils";

const DAY_KEY = "ul.splashDay";

export function Splash() {
  const routing = useRouterState({ select: (s) => s.status === "pending" || s.isLoading });
  const [plan, setPlan] = useState<SplashPlan | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [nameReady, setNameReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"show" | "closing" | "gone">("show");
  const [slow, setSlow] = useState(false);
  const [exit, setExit] = useState<ReturnType<typeof exitPlan> | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);
  const skipped = useRef(false);
  const [idle, setIdle] = useState(false);
  const [blink, setBlink] = useState(false);
  const played = useRef(false);
  const nameAt = useRef(0);
  const readySince = useRef(0);
  const start = useRef(0);

  // Pick the plan on the client (first open today? reduced motion?).
  useEffect(() => {
    start.current = performance.now();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Full splash on every open of the link (in-app navigation never remounts this).
    setPlan(splashPlan(true, reduce));
    getTutorNameFn().then((r) => setName(r.name)).catch(() => setName(null)).finally(() => { nameAt.current = performance.now() - start.current; setNameReady(true); });
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const img = new Image(); img.src = wave;
    const imgReady = img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
    void Promise.all([fonts, imgReady]).then(() => setAssetsReady(true));
    const t = setTimeout(() => setSlow(true), 8000);
    const hard = setTimeout(() => { skipped.current = true; }, 12000); // never stuck
    return () => { clearTimeout(t); clearTimeout(hard); };
  }, []);

  const loaded = assetsReady && nameReady && !routing;

  // Underline: creeps while loading, completes when loaded (after its start + minimum fill).
  useEffect(() => {
    if (!plan || phase !== "show") return;
    const id = setInterval(() => {
      const el = performance.now() - start.current;
      const since = el - plan.fillStart;
      if (since < 0) return;
      const target = loaded ? Math.min(1, since / plan.minFill) : Math.min(0.85, 0.85 * (1 - Math.exp(-since / 1500)));
      setProgress((p) => Math.max(p, target));
      if (!loaded && el > plan.minShow + 300) setIdle(true);
      const pageReady = !document.querySelector("[data-skeleton], .animate-pulse");
      if (loaded && !readySince.current) readySince.current = el;
      const waited = readySince.current ? el - readySince.current : 0;
      if (mayClose(plan, el - (plan.letters ? Math.max(0, nameAt.current - 800) : 0), loaded, skipped.current, pageReady, waited)) {
        setExit(exitPlan(plan.reduce, skipped.current));
        setProgress(1); setPhase("closing");
        if (plan.letters && !played.current) { played.current = true; playSound("splash"); }
      }
    }, 60);
    return () => clearInterval(id);
  }, [plan, loaded, phase]);

  // Ta-dum with the light sweep (only when sound is allowed; browsers may block it before a tap).
  useEffect(() => {
    if (!plan?.letters) return;
    const t = setTimeout(() => { playSound("splash"); played.current = true; }, 1200);
    return () => clearTimeout(t);
  }, [plan]);

  // Closing: reveal the page underneath, unmount when the backdrop is done (timer is the fallback).
  useEffect(() => {
    if (phase !== "closing" || !exit) return;
    document.body.dataset["splash"] = "reveal";
    const t = setTimeout(() => setPhase("gone"), exit.total + 50);
    return () => clearTimeout(t);
  }, [phase, exit]);
  useEffect(() => {
    if (phase !== "gone") return;
    const t = setTimeout(() => { delete document.body.dataset["splash"]; }, 700);
    return () => clearTimeout(t);
  }, [phase]);

  // Blink every 3–4 s while idling (not with reduced motion).
  useEffect(() => {
    if (!idle || !plan || (!plan.letters && plan.fillStart === 300)) return;
    let alive = true; let t: ReturnType<typeof setTimeout>;
    const loop = () => { t = setTimeout(() => { if (!alive) return; setBlink(true); setTimeout(() => setBlink(false), 120); loop(); }, 3000 + Math.random() * 1000); };
    loop();
    return () => { alive = false; clearTimeout(t); };
  }, [idle, plan]);

  if (phase === "gone") return null;
  const word = name ?? "Your tutor";
  const reduce = !!plan?.reduce;
  const animate = !!plan?.letters;
  const closing = phase === "closing" && !!exit;
  const cv = (delay: number, dur?: number) => (closing ? ({ "--sd": `${delay}ms`, ...(dur ? { "--sl": `${dur}ms` } : {}) } as React.CSSProperties) : undefined);

  return (
    <div role="status" aria-label={`Loading ${word}`} onPointerDown={() => { skipped.current = true; if (plan?.letters && !played.current) { played.current = true; playSound("splash"); } }}
      onKeyDown={() => { skipped.current = true; }} tabIndex={-1}
      style={closing ? cv(exit!.backdrop, exit!.backdropDur) : undefined}
      onAnimationEnd={(e) => { if (closing && e.target === e.currentTarget) setPhase("gone"); }}
      className={cn("splash fixed inset-0 z-[100] grid place-items-center overflow-hidden", closing && "splash-backdrop-out")}>
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[38, 56, 74, 92].map((s, i) => (
          <span key={s} className={cn("splash-ring absolute left-1/2 top-1/2 rounded-full", animate && "splash-ripple")}
            style={{ width: `${s}vmax`, height: `${s}vmax`, animationDelay: `${i * 90}ms` }} />
        ))}
        <span className="splash-arc absolute left-1/2 top-[80%] h-[60vmax] w-[100vmax] rounded-full" /><span className="splash-arc absolute left-1/2 top-[87%] h-[60vmax] w-[80vmax] rounded-full" />
      </div>

      <div aria-hidden className="relative flex items-center gap-2 sm:gap-4">
        <div className={cn("relative", idle && !reduce && !closing && "splash-idle", closing && !reduce && "splash-fiti-out")} style={closing ? cv(exit!.fiti, exit!.fitiDur) : undefined}>
          <img src={wave} alt="" draggable={false}
            className={cn("h-[34vmin] max-h-[400px] min-h-[150px] w-auto select-none", animate ? "splash-fiti-in" : reduce ? "splash-fade-in" : "")} />
          <img src={waveBlink} alt="" draggable={false} className={cn("absolute inset-0 h-full w-full select-none", blink ? "opacity-100" : "opacity-0")} />
        </div>
        <div className="flex flex-col">
          <p className="splash-word relative overflow-hidden font-splash font-black leading-none tracking-[-0.03em] text-splash-ink text-[clamp(56px,13vmin,150px)]">
            {nameReady && word.split("").map((ch, i) => (
              <span key={i} className={cn("inline-block whitespace-pre", closing && !reduce ? "splash-letter-out" : animate ? "splash-letter" : reduce ? "splash-fade-in" : "")}
                style={closing ? cv(exit!.letters + i * exit!.letterGap) : animate ? { animationDelay: `${Math.max(0, 800 - nameAt.current) + i * 80}ms` } : undefined}>{ch}</span>
            ))}
            {animate && nameReady && !closing && <span className="splash-sweep pointer-events-none absolute inset-0" />}
          </p>
          <div className={cn("mt-[2.5vmin] h-[5px] w-full overflow-hidden rounded-full bg-splash-track", closing && !reduce && "splash-bar-out")}>
            <div className="splash-bar h-full w-full origin-left rounded-full" style={{ transform: `scaleX(${progress})` }} />
          </div>
          <p className={cn("mt-3 text-[14px] font-semibold text-splash-sub transition-opacity", slow && phase === "show" ? "opacity-100" : "opacity-0")}>Still loading…</p>
        </div>
      </div>
    </div>
  );
}
