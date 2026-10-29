import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { answerVideoIds, lessonMeta, lessonQuestions, lessonVideos } from "@/config/lesson";
import { initialLessonState, lessonReducer } from "@/lib/lesson-machine";
import { burstFromElement } from "./ConfettiLayer";
import { CompleteScreen } from "./CompleteScreen";
import { DebugPanel } from "./DebugPanel";
import { DecisionBar } from "./DecisionBar";
import { MascotReaction } from "./MascotReaction";
import { QuestionCard } from "./QuestionCard";
import { VideoStage } from "./VideoStage";
import { ParallaxBackground } from "./ParallaxBackground";
import type { MascotMood } from "@/config/lesson";

interface LessonPlayerProps {
  onExit: () => void;
  soundOn: boolean;
}

export function LessonPlayer({ onExit, soundOn }: LessonPlayerProps) {
  // The player only mounts after "Begin", so start straight in the playing
  // phase — otherwise VIDEO_ENDED is ignored and the question never shows.
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState, (s) =>
    lessonReducer(s, { type: "BEGIN" }),
  );
  const reduceMotion = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { phase } = state;
  // Developer test mode (?debug=1). The player only mounts after a user
  // click, so reading the URL here is client-only and hydration-safe.
  const [debugMode] = useState(
    () => new URLSearchParams(window.location.search).get("debug") === "1",
  );

  // Soft UI sounds (off by default).
  const playTone = useCallback(
    (freq: number) => {
      if (!soundOn) return;
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain).connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } catch {
        /* audio unavailable */
      }
    },
    [soundOn],
  );

  // After a pick: celebrate (1.8 s) or shake (1.2 s / hint beat), then advance.
  useEffect(() => {
    if (phase.kind !== "question" || phase.pickedCorrect === null) return;
    const delay = 6200; // let the celebrate / sad clip + sound finish
    const t = window.setTimeout(() => dispatch({ type: "FEEDBACK_DONE" }), delay);
    return () => window.clearTimeout(t);
  }, [phase]);

  const handleSelect = useCallback(
    (label: string, el: HTMLElement | null) => {
      if (phase.kind !== "question") return;
      const correct = label === phase.question.correctLabel;
      dispatch({ type: "SELECT_OPTION", label });
      if (correct) {
        burstFromElement(el, reduceMotion);
        playTone(880);
      } else {
        playTone(220);
      }
    },
    [phase, reduceMotion, playTone],
  );

  // Preload the likely next videos while a question is on screen.
  useEffect(() => {
    if (phase.kind !== "question") return;
    const preload = [phase.question.correctVideo, phase.question.wrongVideos[0]];
    const links = preload.map((id) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "video";
      link.href = lessonVideos[id]!.url;
      document.head.appendChild(link);
      return link;
    });
    return () => links.forEach((l) => l.remove());
  }, [phase]);

  const currentVideoId = phase.kind === "playing" ? phase.videoId : null;
  const lastVideoRef = useRef(lessonQuestions[0]!.shownAfterVideo);
  if (currentVideoId) lastVideoRef.current = currentVideoId;

  const showMascot =
    phase.kind === "question" ||
    phase.kind === "decision" ||
    phase.kind === "complete" ||
    (phase.kind === "playing" && answerVideoIds.has(phase.videoId));

  const activeCheckpoint = Math.min(state.completedCheckpoints.length + 1, 3);

  // Animate the pose and speech independently: the character settles first,
  // then speaks; on departure the bubble leaves before the character.
  const companionVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: reduceMotion ? 0 : 0.16 } },
    leaving: { transition: { staggerChildren: reduceMotion ? 0 : 0.07, staggerDirection: -1 } },
  };
  const poseVariants: Variants = reduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.12 } }, leaving: { opacity: 0, transition: { duration: 0.12 } } }
    : {
        hidden: { opacity: 0, x: 12, y: -16, scale: 0.94, rotate: 1.2 },
        visible: {
          opacity: [0, 1, 1], x: [12, 0, 0], y: [-16, -2, 0],
          scale: [0.94, 1.012, 1], rotate: [1.2, -0.25, 0],
          transition: { duration: 0.68, times: [0, 0.65, 1], ease: [0.22, 1, 0.36, 1] },
        },
        leaving: {
          opacity: 0, x: 10, y: -8, scale: 0.97, rotate: 0.8,
          transition: { duration: 0.32, ease: [0.4, 0, 0.7, 0.2] },
        },
      };
  const bubbleVariants: Variants = {
    hidden: { opacity: 0, y: reduceMotion ? 0 : 6, scale: reduceMotion ? 1 : 0.97 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: reduceMotion ? 0.12 : 0.36, delay: reduceMotion ? 0 : 0.24, ease: [0.22, 1, 0.36, 1] } },
    leaving: { opacity: 0, y: reduceMotion ? 0 : -4, scale: reduceMotion ? 1 : 0.98, transition: { duration: reduceMotion ? 0.12 : 0.18 } },
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden">
      {/* illustrated background that drifts with the cursor */}
      <ParallaxBackground className="z-0" />

      {/* back to the start page */}
      <button
        type="button"
        onClick={onExit}
        aria-label="Back to start"
        className="btn-3d btn-3d-secondary fixed bottom-5 left-5 z-50 flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {/* lesson title bar */}
      {/* the lesson column is as wide as the video can be while still fitting
          the screen height, so the stage fills the page instead of floating
          in a narrow 896px column */}
      <div className="relative z-20 mx-auto mt-5 flex w-full max-w-[min(1568px,calc((100dvh_-_200px)*16/9_+_108px))] sm:max-w-[min(1820px,calc((100dvh_-_200px)*16/9_+_360px))] items-center justify-between gap-3 px-4">

        <h1 className="text-base font-semibold tracking-tight text-navy sm:text-lg">
          {lessonMeta.lessonTitle}
        </h1>
        <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-navy backdrop-blur">
          Checkpoint {activeCheckpoint} of 3
        </span>
      </div>

      {/* progress bar with checkpoint diamonds */}
      <div className="relative z-20 mx-auto mt-4 w-full max-w-2xl px-6">
        <div className="relative h-1 rounded-full bg-navy/15">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full bg-gold"
            animate={{ width: `${(state.completedCheckpoints.length / 3) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
          <div className="absolute inset-x-0 -top-1.5 flex justify-between">
            {lessonQuestions.map((q) => (
              <span
                key={q.id}
                aria-label={`Checkpoint ${q.checkpoint}${state.completedCheckpoints.includes(q.checkpoint) ? " completed" : ""}`}
                className={`h-4 w-4 rotate-45 rounded-[4px] border-2 border-gold transition-colors ${
                  state.completedCheckpoints.includes(q.checkpoint) ? "bg-gold" : "bg-white/70"
                }`}
              />
            ))}
          </div>
          <div className="absolute inset-x-0 top-3 flex justify-between" aria-hidden>
            {lessonQuestions.map((q) => (
              <span
                key={q.id}
                className={`text-xs font-semibold transition-colors ${
                  state.completedCheckpoints.includes(q.checkpoint) ? "text-navy" : "text-navy/60"
                }`}
              >
                Q{q.checkpoint}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* video stage */}
      <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center px-4 py-5">
        <div className="grid w-full max-w-[min(1568px,calc((100dvh_-_200px)*16/9_+_108px))] grid-cols-[minmax(0,1fr)_96px] items-end gap-3 sm:max-w-[min(1820px,calc((100dvh_-_200px)*16/9_+_360px))] sm:grid-cols-[160px_minmax(0,1fr)_160px] sm:gap-5">
        {/* empty left column mirrors the mascot column so the video sits dead-center */}
        <div aria-hidden className="hidden sm:block" />
        <div className="relative min-w-0">
        <VideoStage
          videoId={currentVideoId ?? lastVideoRef.current}
          videoRef={videoRef}
          dimmed={phase.kind === "question" || phase.kind === "decision"}
          onEnded={() => dispatch({ type: "VIDEO_ENDED" })}
        />

        {/* question card overlays the dimmed video (bottom sheet on phones) */}
        <AnimatePresence>
          {phase.kind === "question" && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-4 sm:inset-0 sm:items-center sm:pb-0">
              <QuestionCard
                question={phase.question}
                attempt={phase.attempt}
                locked={phase.locked}
                showHint={phase.showHint}
                finalAttempt={phase.finalAttempt}
                picked={phase.picked}
                pickedCorrect={phase.pickedCorrect}
                onSelect={handleSelect}
              />
            </div>
          )}
          {phase.kind === "decision" && (
            <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 px-3 pb-6">
              {phase.reveal && (
                <QuestionCard
                  question={phase.question}
                  attempt={3}
                  locked={phase.question.options.map((o) => o.label).filter((l) => l !== phase.question.correctLabel)}
                  showHint={false}
                  finalAttempt={false}
                  picked={null}
                  pickedCorrect={null}
                  revealMode
                  onSelect={() => {}}
                />
              )}
              <DecisionBar
                onContinue={() => dispatch({ type: "CONTINUE" })}
                onRetry={() => dispatch({ type: "RETRY" })}
              />
            </div>
          )}
        </AnimatePresence>

        {/* complete screen */}
        <AnimatePresence>
          {phase.kind === "complete" && (
            <CompleteScreen
              firstTryCorrect={state.firstTryCorrect}
              onReplay={() => dispatch({ type: "REPLAY" })}
              onBackToStart={onExit}
            />
          )}
        </AnimatePresence>

        {/* developer test panel (?debug=1 only) */}
        {debugMode && (
          <DebugPanel
            state={phase}
            videoId={currentVideoId ?? lastVideoRef.current}
            videoRef={videoRef}
          />
        )}
        </div>

        {/* A reserved side column keeps the companion off the video in every phase.
            The nudge shifts it further right without moving the centred video. */}
        <div className="relative flex min-w-0 translate-x-2 flex-col items-center sm:translate-x-10">

          <AnimatePresence>
            {showMascot && (
              <motion.div
                key="lesson-companion"
                variants={companionVariants}
                initial="hidden"
                animate="visible"
                exit="leaving"
                className="flex w-full origin-bottom flex-col items-center"
              >
                <motion.div variants={poseVariants} className="order-2 flex w-full origin-bottom justify-center">
                  {/* larger than its column; overflows sideways without widening the grid */}
                  <MascotReaction mood={phase.kind === "complete" ? "clapping" : (state.mascot.mood as MascotMood) ?? "idle"} className="pointer-events-none h-36 w-36 shrink-0 sm:h-80 sm:w-80" />
                </motion.div>
                {state.mascot.bubble && phase.kind !== "complete" && (
                  <motion.div
                    variants={bubbleVariants}
                    className="order-1 mb-2 w-full origin-bottom rounded-lg bg-card px-3 py-2 text-center text-xs font-semibold text-navy shadow-md"
                    role="status"
                  >
                    {state.mascot.bubble}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        </div>
        <div data-testid="player-baseline" className="relative z-40 mt-1 h-0.5 w-full shrink-0 bg-navy/60" aria-hidden="true" />
      </div>
    </div>
  );
}
