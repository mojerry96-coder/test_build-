import { FINAL_VIDEO_ID, lessonQuestions, type LessonQuestion } from "@/config/lesson";

/**
 * Lesson flow state machine:
 * landing → playing(video) → question → (feedback video) → decision → … → complete
 */

export type VideoRole = "intro" | "correct" | "wrong" | "next";

export type Phase =
  | { kind: "landing" }
  | { kind: "playing"; videoId: string; role: VideoRole }
  | {
      kind: "question";
      question: LessonQuestion;
      attempt: number; // wrong attempts so far (0–2 while answering)
      locked: string[]; // option labels disabled after wrong picks
      showHint: boolean;
      finalAttempt: boolean;
      picked: string | null; // option currently animating (press/correct/wrong)
      pickedCorrect: boolean | null;
    }
  | { kind: "decision"; question: LessonQuestion; reveal: boolean }
  | { kind: "complete" };

export interface LessonState {
  phase: Phase;
  /** Checkpoints answered correctly on the first try. */
  firstTryCorrect: number;
  /** Checkpoints completed (decision → Continue). */
  completedCheckpoints: number[];
  /** Mascot mood + speech bubble for the current beat. */
  mascot: { mood: string; bubble: string | null };
  /** Locked options / attempt count carried across a wrong-answer video. */
  carry: { locked: string[]; attempt: number };
}

export type LessonEvent =
  | { type: "BEGIN" }
  | { type: "VIDEO_ENDED" }
  | { type: "SELECT_OPTION"; label: string }
  | { type: "FEEDBACK_DONE" } // after the correct-celebration / wrong-shake pause
  | { type: "CONTINUE" }
  | { type: "RETRY" }
  | { type: "REPLAY" }
  | { type: "BACK_TO_START" };

export const initialLessonState: LessonState = {
  phase: { kind: "landing" },
  firstTryCorrect: 0,
  completedCheckpoints: [],
  mascot: { mood: "idle", bubble: null },
  carry: { locked: [], attempt: 0 },
};

export function questionForVideo(videoId: string): LessonQuestion | undefined {
  return lessonQuestions.find((q) => q.shownAfterVideo === videoId);
}

const wrongBubbles = [
  "Hmm, not quite…",
  "Let's look at another example.",
  "No worries — let's see it together.",
];

function freshQuestion(question: LessonQuestion): Phase {
  return {
    kind: "question",
    question,
    attempt: 0,
    locked: [],
    showHint: false,
    finalAttempt: false,
    picked: null,
    pickedCorrect: null,
  };
}

export function lessonReducer(state: LessonState, event: LessonEvent): LessonState {
  const { phase } = state;

  switch (event.type) {
    case "BEGIN":
      return {
        ...state,
        phase: { kind: "playing", videoId: lessonQuestions[0]!.shownAfterVideo, role: "intro" },
        mascot: { mood: "idle", bubble: null },
      };

    case "VIDEO_ENDED": {
      if (phase.kind !== "playing") return state;
      const { videoId, role } = phase;

      if (videoId === FINAL_VIDEO_ID) {
        return {
          ...state,
          phase: { kind: "complete" },
          mascot: { mood: "clapping", bubble: "You did it!" },
        };
      }

      if (role === "intro" || role === "next") {
        const question = questionForVideo(videoId);
        if (!question) return state;
        return {
          ...state,
          phase: freshQuestion(question),
          carry: { locked: [], attempt: 0 },
          mascot: { mood: "thinking", bubble: null },
        };
      }

      if (role === "correct") {
        const question = lessonQuestions.find((q) => q.correctVideo === videoId);
        if (!question) return state;
        return {
          ...state,
          phase: { kind: "decision", question, reveal: false },
          mascot: { mood: "idle", bubble: null },
        };
      }

      // role === "wrong": return to the question that owns this wrong video.
      const question = lessonQuestions.find((q) => q.wrongVideos.includes(videoId));
      if (!question) return state;
      const wrongIndex = question.wrongVideos.indexOf(videoId); // 0-based
      if (wrongIndex === 2) {
        return {
          ...state,
          phase: { kind: "decision", question, reveal: true },
          mascot: { mood: "idle", bubble: null },
        };
      }
      return {
        ...state,
        phase: {
          kind: "question",
          question,
          attempt: state.carry.attempt,
          locked: state.carry.locked,
          showHint: true,
          finalAttempt: wrongIndex === 1,
          picked: null,
          pickedCorrect: null,
        },
        mascot: { mood: "thinking", bubble: null },
      };
    }

    case "SELECT_OPTION": {
      if (phase.kind !== "question" || phase.picked) return state;
      if (phase.locked.includes(event.label)) return state;
      const correct = event.label === phase.question.correctLabel;
      return {
        ...state,
        phase: { ...phase, picked: event.label, pickedCorrect: correct },
        mascot: correct
          ? { mood: "celebrate", bubble: "Yes! Well done!" }
          : {
              mood: "sad",
              bubble: wrongBubbles[Math.min(phase.attempt, 2)]!,
            },
      };
    }

    case "FEEDBACK_DONE": {
      if (phase.kind !== "question" || phase.pickedCorrect === null) return state;
      const { question, picked, pickedCorrect, attempt, locked } = phase;

      if (pickedCorrect) {
        return {
          ...state,
          firstTryCorrect: attempt === 0 ? state.firstTryCorrect + 1 : state.firstTryCorrect,
          carry: { locked: [], attempt: 0 },
          phase: { kind: "playing", videoId: question.correctVideo, role: "correct" },
          mascot: { mood: "idle", bubble: null },
        };
      }

      const newAttempt = attempt + 1;
      const newLocked = picked ? [...locked, picked] : locked;
      return {
        ...state,
        carry: { locked: newLocked, attempt: newAttempt },
        phase: {
          kind: "playing",
          videoId: question.wrongVideos[Math.min(newAttempt - 1, 2)]!,
          role: "wrong",
        },
        mascot: { mood: "idle", bubble: null },
      };
    }

    case "CONTINUE": {
      if (phase.kind !== "decision") return state;
      const { question } = phase;
      return {
        ...state,
        completedCheckpoints: [...state.completedCheckpoints, question.checkpoint],
        carry: { locked: [], attempt: 0 },
        phase: { kind: "playing", videoId: question.nextVideo, role: "next" },
        mascot: { mood: "idle", bubble: null },
      };
    }

    case "RETRY": {
      if (phase.kind !== "decision") return state;
      return {
        ...state,
        carry: { locked: [], attempt: 0 },
        phase: freshQuestion(phase.question),
        mascot: { mood: "thinking", bubble: null },
      };
    }

    case "REPLAY":
      return {
        ...initialLessonState,
        phase: { kind: "playing", videoId: lessonQuestions[0]!.shownAfterVideo, role: "intro" },
      };

    case "BACK_TO_START":
      return initialLessonState;

    default:
      return state;
  }
}
