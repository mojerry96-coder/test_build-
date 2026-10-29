import { motion } from "framer-motion";
import { Check, Lightbulb, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import katex from "katex";
import type { LessonQuestion } from "@/config/lesson";

export function Katex({ tex, className = "" }: { tex: string; className?: string }) {
  const html = useMemo(() => katex.renderToString(tex, { throwOnError: false }), [tex]);
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}

interface QuestionCardProps {
  question: LessonQuestion;
  attempt: number;
  locked: string[];
  showHint: boolean;
  finalAttempt: boolean;
  picked: string | null;
  pickedCorrect: boolean | null;
  revealMode?: boolean; // decision after 3rd wrong: highlight correct + working box
  onSelect: (label: string, el: HTMLElement | null) => void;
}

export function QuestionCard({
  question,
  attempt,
  locked,
  showHint,
  finalAttempt,
  picked,
  pickedCorrect,
  revealMode = false,
  onSelect,
}: QuestionCardProps) {
  const optionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Keyboard: A–D or 1–4 select; arrow keys move focus.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const labels = question.options.map((o) => o.label);
      const upper = e.key.toUpperCase();
      let idx = labels.indexOf(upper);
      if (idx === -1 && ["1", "2", "3", "4"].includes(e.key)) idx = Number(e.key) - 1;
      if (idx >= 0 && idx < labels.length) {
        const label = labels[idx]!;
        if (!locked.includes(label)) onSelect(label, optionRefs.current[label] ?? null);
        return;
      }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const active = document.activeElement;
        const current = labels.findIndex((l) => optionRefs.current[l] === active);
        const next =
          e.key === "ArrowDown"
            ? (current + 1) % labels.length
            : (current - 1 + labels.length) % labels.length;
        optionRefs.current[labels[next]!]?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [question, locked, onSelect]);

  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="glass-card w-full max-w-2xl p-6 text-navy"
      role="group"
      aria-label={`Checkpoint ${question.checkpoint} of 3`}
    >
      <span className="inline-block rounded-full bg-white px-3 py-1 text-xs font-semibold text-navy">
        {finalAttempt ? "Final attempt" : `Checkpoint ${question.checkpoint} of 3`}
      </span>
      <h2 className="mt-3 text-xl leading-snug font-medium tracking-tight sm:text-2xl">
        {question.prompt}
      </h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {question.options.map((opt, i) => {
          const isLocked = locked.includes(opt.label);
          const isPicked = picked === opt.label;
          const isCorrect = opt.label === question.correctLabel;
          const showCorrect = (isPicked && pickedCorrect === true) || (revealMode && isCorrect);
          const showWrong = isPicked && pickedCorrect === false;
          const faded = (pickedCorrect === true && !isPicked) || (revealMode && !isCorrect);

          return (
            <motion.button
              key={opt.label}
              ref={(el) => {
                optionRefs.current[opt.label] = el;
              }}
              type="button"
              disabled={isLocked || !!picked || revealMode}
              onClick={() => onSelect(opt.label, optionRefs.current[opt.label] ?? null)}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: faded ? 0.4 : 1,
                x: showWrong ? [0, -8, 8, -6, 6, 0] : 0,
              }}
              transition={{
                delay: picked ? 0 : i * 0.08,
                type: "spring",
                stiffness: 320,
                damping: 20,
                x: { duration: 0.4 },
              }}
                            className={`flex min-h-14 cursor-pointer items-center gap-3 btn-3d p-3 pr-5 text-left text-base font-bold text-white focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                showCorrect
                  ? "edge-correct bg-correct"
                  : showWrong
                    ? "edge-wrong bg-tail-red"
                    : isLocked
                      ? "btn-3d-primary cursor-not-allowed opacity-50"
                      : "btn-3d-primary"
              }`}
              aria-label={`Option ${opt.label}: ${opt.text}`}
            >
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                  showCorrect || showWrong ? "bg-white/25 text-white" : "bg-white text-btn3d-edge"
                }`}
              >
                {showCorrect ? (
                  <motion.span initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}>
                    <Check className="h-5 w-5" aria-hidden />
                  </motion.span>
                ) : showWrong ? (
                  <X className="h-5 w-5" aria-hidden />
                ) : (
                  opt.label
                )}
              </span>
              {opt.katex ? <Katex tex={opt.text} /> : <span>{opt.text}</span>}
            </motion.button>
          );
        })}
      </div>

      {showHint && !revealMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-start gap-3 rounded-2xl border-l-4 border-gold bg-white/70 p-4 backdrop-blur"
          role="note"
        >
          <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden />
          <p className="text-sm leading-relaxed font-medium text-navy">
            {question.hintKatex ? (
              <Katex tex={question.hint} />
            ) : question.hintHighlight && question.hint.includes(question.hintHighlight) ? (
              <>
                {question.hint.split(question.hintHighlight)[0]}
                <span className="highlight-swipe font-semibold">{question.hintHighlight}</span>
                {question.hint.split(question.hintHighlight)[1]}
              </>
            ) : (
              question.hint
            )}
          </p>
        </motion.div>
      )}

      {revealMode && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur"
          role="note"
          aria-label="Worked answer"
        >
          <p className="text-sm leading-relaxed font-medium text-navy">
            {question.revealKatex ? <Katex tex={question.reveal} /> : question.reveal}
          </p>
        </motion.div>
      )}

      {/* screen-reader announcements */}
      <div aria-live="polite" className="sr-only">
        {pickedCorrect === true && "Correct! Well done."}
        {pickedCorrect === false && `Not quite. Attempt ${attempt + 1} of 3.`}
      </div>
    </motion.div>
  );
}
