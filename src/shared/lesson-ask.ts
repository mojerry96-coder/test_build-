import type { LessonStep } from "@/shared/contracts/enums";

/** The student can't ask the tutor during the exit ticket or while a teacher has paused the lesson. */
export function askLocked(step: LessonStep, status?: string | null): boolean {
  return status === "paused" || step === "exit_ticket";
}

export function askPlaceholder(step: LessonStep, status?: string | null): string | undefined {
  if (status === "paused") return "Lesson paused by your teacher";
  if (step === "exit_ticket") return "On your own now";
  return undefined;
}
