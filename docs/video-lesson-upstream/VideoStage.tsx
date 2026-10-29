import { Captions, Maximize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { lessonVideos } from "@/config/lesson";

interface VideoStageProps {
  videoId: string;
  onEnded: () => void;
  dimmed?: boolean;
  /** Called with the underlying video element so the parent can preload etc. */
  videoRef?: React.RefObject<HTMLVideoElement | null>;
}

/**
 * Cinematic 16:9 stage using ONE persistent <video> element (src swaps) so
 * audio stays unlocked on iOS. Students can rewind but cannot seek forward
 * past what they have already watched.
 */
export function VideoStage({ videoId, onEnded, dimmed = false, videoRef: externalRef }: VideoStageProps) {
  const internalRef = useRef<HTMLVideoElement>(null);
  const videoRef = externalRef ?? internalRef;
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [failed, setFailed] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const maxWatched = useRef(0);

  const video = lessonVideos[videoId];
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    console.info(`[Lesson video ${videoId}] URL:`, lessonVideos[videoId]?.url);
    maxWatched.current = 0;
    setFailed(false);
    setBuffering(true);
    const v = videoRef.current;
    if (!v) return;
    // Never loop: the "ended" event drives the lesson flow.
    v.loop = false;
    v.removeAttribute("loop");
    // Re-attach the "ended" listener every time the source changes. The video
    // stays paused on its last frame (we never reset currentTime here).
    const handleEnded = () => {
      setPlaying(false);
      onEndedRef.current();
    };
    v.addEventListener("ended", handleEnded);
    v.play().catch(() => setPlaying(false));
    return () => v.removeEventListener("ended", handleEnded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Block forward seeks past the furthest watched point. Seeks to the very
  // end of the file are always allowed so the debug panel can skip ahead.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const nearEnd = () => Number.isFinite(v.duration) && v.duration > 0 && v.currentTime >= v.duration - 1.5;
    const onTime = () => {
      if (v.currentTime > maxWatched.current + 1.5 && !nearEnd()) {
        v.currentTime = maxWatched.current;
      } else {
        maxWatched.current = Math.max(maxWatched.current, v.currentTime);
      }
    };
    const onSeek = () => {
      if (v.currentTime > maxWatched.current + 1.5 && !nearEnd()) v.currentTime = maxWatched.current;
    };
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("seeking", onSeek);
    return () => {
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("seeking", onSeek);
    };
  }, [videoRef]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const replay10 = () => {
    const v = videoRef.current;
    if (v) v.currentTime = Math.max(0, v.currentTime - 10);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const fullscreen = () => {
    const v = videoRef.current;
    if (v?.requestFullscreen) v.requestFullscreen();
  };

  const controlBtn =
    "flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-white/60 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none";

  return (
    <div
      className="relative aspect-video w-full overflow-hidden rounded-[28px] border border-white/60 bg-navy/10 shadow-[0_30px_80px_-30px_oklch(0.4_0.12_250/0.55)]"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
      onClick={() => setShowControls((s) => !s)}
    >
      <video
        ref={videoRef}
        src={video?.url}
        playsInline
        preload="auto"
        onWaiting={() => setBuffering(true)}
        onPlaying={() => {
          setFailed(false);
          setBuffering(false);
          setPlaying(true);
        }}
        onError={(event) => {
          if (event.currentTarget.error) setFailed(true);
        }}
        className="h-full w-full object-contain"
        aria-label={`Lesson video ${videoId}`}
      >
        {video?.captions && (
          <track kind="captions" src={video.captions} srcLang="en" label="English" default={captionsOn} />
        )}
      </video>

      {/* buffering shimmer */}
      {buffering && !failed && (
        <div className="absolute inset-0 animate-pulse bg-white/30 backdrop-blur-sm" aria-hidden />
      )}

      {/* friendly retry message */}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur">
          <p className="text-base font-medium text-navy">This video couldn't load.</p>
          <button
            type="button"
            onClick={() => {
              setFailed(false);
              videoRef.current?.load();
              videoRef.current?.play().catch(() => {});
            }}
            className="btn-3d btn-3d-primary min-h-11 cursor-pointer px-5 py-2 text-sm font-bold focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            Try again
          </button>
        </div>
      )}

      {/* frosted dim while a question is shown */}
      {dimmed && <div className="absolute inset-0 bg-white/40 backdrop-blur-md" aria-hidden />}

      {/* controls pill */}
      <div
        className={`absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/70 px-2 py-1 backdrop-blur-xl transition-opacity duration-200 ${
          showControls && !dimmed ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className={controlBtn} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-4 w-4" aria-hidden /> : <Play className="h-4 w-4" aria-hidden />}
        </button>
        <button type="button" className={controlBtn} onClick={replay10} aria-label="Replay 10 seconds">
          <RotateCcw className="h-4 w-4" aria-hidden />
        </button>
        <button type="button" className={controlBtn} onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
          {muted ? <VolumeX className="h-4 w-4" aria-hidden /> : <Volume2 className="h-4 w-4" aria-hidden />}
        </button>
        {video?.captions && (
          <button
            type="button"
            className={`${controlBtn} ${captionsOn ? "" : "opacity-50"}`}
            onClick={() => setCaptionsOn((c) => !c)}
            aria-label="Toggle captions"
          >
            <Captions className="h-4 w-4" aria-hidden />
          </button>
        )}
        <button type="button" className={controlBtn} onClick={fullscreen} aria-label="Fullscreen">
          <Maximize className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
