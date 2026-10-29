import type { LessonStep } from "./enums";

export const STEP_LABELS: Record<LessonStep, string> = {
  readiness: "Warm-up",
  hook: "The puzzle",
  video: "Video",
  simulation: "Your simulation",
  worksheet: "Practise",
  guided: "Prove it",
  exit_ticket: "On your own",
  reflection: "Wrap-up",
};

export function topicButtonLabel(topicName: string, activeStep: LessonStep | null): string {
  return activeStep ? `Continue: ${topicName}, ${STEP_LABELS[activeStep]}` : "Start";
}
