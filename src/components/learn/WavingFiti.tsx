// Moving waving Fiti (the loader clip), with the still picture where motion or see-through video isn't possible.
import { useEffect, useState } from "react";
import waveClip from "@/assets/fitila/fitila_wave_loader.webm.asset.json";
import waveStill from "@/assets/fitila/fitila_wave_loader.webp.asset.json";
import { canPlayClip } from "./FitiLoader";

export function WavingFiti({ className }: { className?: string }) {
  const [clip, setClip] = useState(false);
  // Decided after the page is ready, so the clip never slows the first paint.
  useEffect(() => { setClip(canPlayClip()); }, []);
  return clip
    ? <video src={waveClip.url} poster={waveStill.url} autoPlay muted loop playsInline preload="none" aria-hidden className={className} onError={() => setClip(false)} />
    : <img src={waveStill.url} alt="" aria-hidden draggable={false} className={className} />;
}
