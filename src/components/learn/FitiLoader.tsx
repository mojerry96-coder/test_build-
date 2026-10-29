import { useEffect, useRef, useState } from "react";
import waveFallback from "@/assets/tutor/splash-wave.png";
import waveClip from "@/assets/fitila/fitila_wave_loader.webm.asset.json";
import waveStill from "@/assets/fitila/fitila_wave_loader.webp.asset.json";

const wave = waveStill.url;
/** Moving waving Fiti only when it can show see-through and motion is welcome. */
export function canPlayClip() {
  if (typeof document === "undefined") return false;
  if (document.documentElement.dataset["lowData"] === "true") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const v = document.createElement("video");
  const ua = navigator.userAgent;
  if (/iPhone|iPad|Safari/.test(ua) && !/Chrome|Chromium|Android/.test(ua)) return false;
  return v.canPlayType('video/webm; codecs="vp9"') !== "";
}
import { LOADER_FADE_MS, LOADER_FINISH_MS, LOADER_SHOW_DELAY_MS, LOADER_SLOW_MS, finishPlan, loaderProgress } from "@/shared/loader-timing";

const IMG = "fiti-loader-wave h-[clamp(160px,30vh,260px)] w-auto select-none object-contain";
const TRACK = "mt-[clamp(20px,4vh,36px)] h-[4px] w-[clamp(220px,26vw,340px)] overflow-hidden rounded-full bg-splash-track shadow-[0_6px_14px_-4px_rgb(60_90_130/0.25)]";

/** After the page is ready: a copy of the loader runs the line to the end, then fades to reveal the page. */
function playFinish(box: DOMRect, from: number) {
  if (document.body.dataset["splash"] || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.className = "pointer-events-none fixed z-40 flex flex-col items-center justify-center bg-fh-page";
  Object.assign(el.style, { left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`, transition: `opacity ${LOADER_FADE_MS}ms ease` });
  const media = canPlayClip() ? `<video src="${waveClip.url}" poster="${wave}" autoplay muted loop playsinline class="${IMG}"></video>` : `<img src="${wave}" alt="" class="${IMG}"/>`;
  el.innerHTML = `${media}<div class="${TRACK}"><div class="splash-bar h-full w-full origin-left rounded-full" style="transform:scaleX(${from});transition:transform ${LOADER_FINISH_MS}ms ease-out"></div></div>`;
  document.body.appendChild(el);
  const remove = () => { el.remove(); window.removeEventListener("pointerdown", remove, true); };
  window.addEventListener("pointerdown", remove, true); // never delays a tap
  requestAnimationFrame(() => {
    (el.querySelector(".splash-bar") as HTMLElement).style.transform = "scaleX(1)";
    setTimeout(() => { el.style.opacity = "0"; setTimeout(remove, LOADER_FADE_MS); }, LOADER_FINISH_MS);
  });
}

/** Page loader: waving Fiti with glasses and a loading line that fills gradually. */
export function FitiLoader({ label = "Loading", delayMs = LOADER_SHOW_DELAY_MS }: { label?: string; delayMs?: number }) {
  const [show, setShow] = useState(false);
  const [p, setP] = useState(0);
  const [slow, setSlow] = useState(false);
  const start = useRef(0);
  const root = useRef<HTMLDivElement>(null);
  const live = useRef({ shown: false, p: 0 });
  const [clip, setClip] = useState(false);
  const [src, setSrc] = useState(wave);
  useEffect(() => {
    start.current = performance.now();
    setClip(canPlayClip());
    const t = setTimeout(() => { setShow(true); live.current.shown = true; }, delayMs);
    const s = setTimeout(() => setSlow(true), LOADER_SLOW_MS);
    let raf = 0;
    const tick = () => { const v = loaderProgress(performance.now() - start.current); live.current.p = v; setP(v); raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    const node = root.current;
    return () => {
      clearTimeout(t); clearTimeout(s); cancelAnimationFrame(raf);
      if (node && finishPlan(live.current.shown).finish) playFinish(node.getBoundingClientRect(), live.current.p);
    };
  }, []);
  return (
    <div ref={root} role="status" aria-label={label} className="flex min-h-[70vh] w-full items-center justify-center px-5">
      <link rel="preload" as="image" href={wave} />
      {show && (
        <div aria-hidden className="fiti-loader-in flex flex-col items-center">
          {clip
            ? <video src={waveClip.url} poster={wave} autoPlay muted loop playsInline className={IMG} onError={() => setClip(false)} />
            : <img src={src} alt="" draggable={false} className={IMG} onError={() => setSrc(waveFallback)} />}
          <div className={TRACK}>
            <div className="splash-bar h-full w-full origin-left rounded-full" style={{ transform: `scaleX(${p})`, transition: "none" }} />
          </div>
          <p className={`mt-3 text-[14px] font-semibold text-muted-foreground transition-opacity ${slow ? "opacity-100" : "opacity-0"}`}>Still loading…</p>
        </div>
      )}
    </div>
  );
}
