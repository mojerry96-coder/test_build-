import type { Band, Channel, LessonStep } from "./enums";
import type { Script, Segment } from "./script";

export const MOVES = [
  "greet", "ask_item", "confirm_correct", "feedback_attempt1", "parallel_example", "full_explanation",
  "offer_help", "give_hint", "explain_question", "intro_simulation", "sim_guidance", "refuse_answer",
  "redirect_off_topic", "ask_repeat", "close_hook", "ask_reflection", "summary", "safe_response",
] as const;
export type Move = (typeof MOVES)[number];

export interface Decision {
  move: Move;
  item_id?: string | null;
  attempt?: number | null;
  misconception_id?: string | null;
  hint_rung?: number | null;
  band?: Band | null;
  notes?: string | null;
}

/**
 * Backend -> AI provider. Never contains an answer key or a do-not-reveal list.
 * The no-reveal check runs only on the server against item_keys.
 */
export interface TutorRequest {
  session_id: string;
  topic_id: string;
  step: LessonStep;
  student_first_name: string | null;
  channel: Channel;
  decision: Decision;
  approved_script: Script;
  student_work: unknown;
  history: { role: "tutor" | "student"; text: string }[];
  locale: "en-NG";
}

export type WaitFor = "answer" | "tap" | "sim_task" | "none";

export interface TutorReply {
  segments: Segment[];
  wait_for: WaitFor;
}

export const FALLBACK_REASONS = ["format", "cue", "reveal", "length", "number", "banned_word", "timeout"] as const;
export type FallbackReason = (typeof FALLBACK_REASONS)[number];

export type TutorMood = "neutral" | "listening";
