import { useEffect, useRef, useState } from "react";
import { mascotClips, mascotFallback, mascotIdleClip, type MascotMood } from "@/config/lesson";
import mascotAsset from "@/assets/mascot.png.asset.json";

interface MascotReactionProps {
  mood: MascotMood;
  className?: string;
}

/**
 * Loops the silent idle clip by default; reaction clips play once over it,
 * hold the last frame for 1 s, then cross-fade back to the idle loop.
 * Falls back to the still PNG when the idle clip can't play.
 */
export function MascotReaction({ mood, className = "" }: MascotReactionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [showClip, setShowClip] = useState(false);
  const [idleFailed, setIdleFailed] = useState(false);

  const resolved: MascotMood = mood === "idle" ? "idle" : resolveMood(mood);
  const clip = resolved === "idle" ? null : mascotClips[resolved as Exclude<MascotMood, "idle">];

  useEffect(() => {
    setFailed(false);
    setShowClip(false);
    if (!clip) return;
    const v = videoRef.current;
    if (!v) return;
    setShowClip(true);
    v.currentTime = 0;
    // Only the wrong-answer (sad) clip keeps its sound.
    v.muted = !(resolved === "sad" || resolved === "celebrate");
    v.play().catch(() => {
      v.muted = true;
      v.play().catch(() => setFailed(true));
    });
  }, [mood, clip, resolved]);

  // Preload all mascot clips once.
  useEffect(() => {
    for (const c of Object.values(mascotClips)) {
      if (c.webm) {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "video";
        link.href = c.webm;
        document.head.appendChild(link);
      }
    }
  }, []);

  const showVideo = clip && !failed && showClip;

  return (
    <div className={`relative ${className}`} aria-hidden>
      <img
        src={mascotAsset.url}
        alt=""
        className={`h-full w-full object-contain object-bottom transition-opacity duration-300 ${showVideo || !idleFailed ? "opacity-0" : "opacity-100"}`}
        draggable={false}
      />
      {!idleFailed && (
        <video
          src={mascotIdleClip}
          muted
          loop
          playsInline
          autoPlay
          onError={() => setIdleFailed(true)}
          className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-300 ${showVideo ? "opacity-0" : "opacity-100"}`}
        />
      )}
      {clip && !failed && (
        <video
          key={resolved}
          ref={videoRef}
          src={clip.webm ?? clip.mov ?? undefined}
          muted={!(resolved === "sad" || resolved === "celebrate")}
          playsInline
          autoPlay
          onEnded={() => {
            // Hold the last frame for 1 s, then cross-fade to the still pose.
            const v = videoRef.current;
            if (v) v.pause();
            window.setTimeout(() => setShowClip(false), 1000);
          }}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-contain object-bottom transition-opacity duration-300 ${showVideo ? "opacity-100" : "opacity-0"}`}
        />
      )}
    </div>
  );
}

function resolveMood(mood: MascotMood): MascotMood {
  if (mood === "idle") return "idle";
  const clip = mascotClips[mood];
  if (clip.webm || clip.mov) return mood;
  const fallback = mascotFallback[mood];
  if (fallback === "idle") return "idle";
  const fb = mascotClips[fallback as Exclude<MascotMood, "idle">];
  return fb.webm || fb.mov ? fallback : "idle";
}
