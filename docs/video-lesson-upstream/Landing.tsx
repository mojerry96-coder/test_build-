import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { lessonMeta } from "@/config/lesson";
import { UnderlinedWord } from "./UnderlinedWord";
import { IdleMascot } from "./IdleMascot";
import { PillButton } from "./PillButton";
import { ParallaxBackground } from "./ParallaxBackground";

interface LandingProps {
  onBegin: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export function Landing({ onBegin, soundOn, onToggleSound }: LandingProps) {
  const [howItWorks, setHowItWorks] = useState(false);

  // Enter key starts the lesson.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onBegin();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBegin]);

  return (
    <div className="relative min-h-dvh overflow-hidden">
      {/* illustrated background whose layers drift with the cursor */}
      <ParallaxBackground className="z-0" />

      {/* back to the page the student arrived from */}
      <button
        type="button"
        onClick={() => window.history.back()}
        aria-label="Back"
        className="btn-3d btn-3d-secondary fixed bottom-5 left-5 z-50 flex h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold text-navy focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back
      </button>

      {/* wordmark + sound toggle */}
      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5">
        <span className="text-sm font-semibold tracking-tight text-navy">
          {lessonMeta.title}
        </span>
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/70 text-navy backdrop-blur transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          {soundOn ? <Volume2 className="h-5 w-5" aria-hidden /> : <VolumeX className="h-5 w-5" aria-hidden />}
        </button>
      </header>

      {/* mascot rises large from the bottom edge, behind the content */}
      <div className="pointer-events-none absolute right-0 bottom-0 left-1/4 z-0 flex h-[52vh] justify-center lg:left-auto lg:h-[80vh] lg:w-[46vw]">
        <IdleMascot className="h-full" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-7xl flex-col justify-center gap-6 px-6 pt-24 pb-12">
        {/* headline, buttons and info cards stacked in one left column */}
        <div className="flex flex-col items-start gap-6">
          <h1 className="font-hand font-bold text-[clamp(3.5rem,7.5vw,8rem)] leading-[1.05] tracking-[-0.01em] text-navy">
            Watch, Choose
            <br />
            <span className="pl-10">{"&\u00a0"}<UnderlinedWord textClass="font-bold">Learn</UnderlinedWord></span>
          </h1>
          <p className="max-w-md text-lg leading-relaxed font-normal text-navy-soft">
            An interactive video lesson that Build understanding, and catch misconceptions early.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <PillButton onClick={onBegin} ariaLabel="Begin the lesson">Begin</PillButton>
            <PillButton variant="secondary" onClick={() => setHowItWorks((v) => !v)} ariaLabel="How it works">
              How it works
            </PillButton>
          </div>

          {/* "How it works" opens in the flow so it never covers the cards */}
          <AnimatePresence initial={false}>
            {howItWorks && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div
                  className="glass-card w-72 p-4 text-sm font-medium text-navy"
                  role="dialog"
                  aria-label="How it works"
                >
                  Watch short scenes → answer 3 checkpoints → get instant
                  feedback from the parrot.
                </div>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </div>
    </div>
  );
}
