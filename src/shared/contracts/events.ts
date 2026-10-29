import type { LessonStep } from "./enums";

export const EVENT_TYPES = [
  "answer_submitted", "confidence_set", "option_changed", "step_written", "step_erased", "wrong_path_alert",
  "hint_opened", "opted_out", "help_requested", "help_prompt_shown", "help_prompt_dismissed", "question_asked",
  "prediction_made", "repair_started", "repair_skipped", "repair_completed", "simulation_changed",
  "simulation_activity", "simulation_task_result", "video_played", "video_seeked", "video_replayed_segment",
  "check_reached", "idle", "app_backgrounded", "app_resumed", "channel_switched", "network_changed",
  "worksheet_mode_changed", "reflection_answered", "instructor_paused", "instructor_took_over",
  "instructor_handed_back", "instructor_disconnected", "auto_hand_back", "session_started", "session_resumed",
  "session_closed", "popup_shown", "popup_continue", "popup_fix", "popup_skip", "working_shown", "working_skipped", "line_submitted", "teach_me_opened", "sim_task_settled", "step_advanced", "reflection_submitted",
  "repair_slip_shown", "repair_watch_done", "repair_watch_skipped", "repair_step", "repair_practice_answered",
  "band_defaulted", "sim_fallback", "sim_low_data", "sim_result_disagrees", "sim_v2_attempt", "sim_v2_marked", "sim_v2_read_failed", "sim_v2_support-offered", "sim_v2_support", "sim_v2_tutorial", "sim_v2_complete", "sim_msg_ready", "sim_msg_changed", "sim_msg_activity", "sim_msg_task_result",
  "sim_msg_resize", "sim_msg_lock", "sim_msg_unlock", "sim_msg_highlight", "sim_msg_set", "sim_msg_next_task", "sim_msg_help_requested",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

/** Instructor actions are logged only and never start a tutor turn by themselves. */
export const LOG_ONLY_INSTRUCTOR_EVENTS: EventType[] = [
  "instructor_paused", "instructor_took_over", "instructor_disconnected",
];

export interface LessonEvent {
  seq: number;
  actor: "student" | "instructor" | "system";
  type: EventType;
  step: LessonStep | null;
  payload: Record<string, unknown>;
  client_ts: string;
}

export interface EventBatch {
  session_id: string;
  events: LessonEvent[];
}

export interface EventBatchResult {
  last_accepted_seq: number;
  rejected: { seq: number; reason: "gap" | "duplicate" }[];
}
