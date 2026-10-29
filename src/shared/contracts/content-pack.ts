import type { Band, HookType, ItemKind, LessonStep, SkillRole } from "./enums";
import type { Script } from "./script";

export interface VideoManifest {
  id: string;
  url_low: string | null;
  url_standard: string | null;
  captions_url: string | null;
  poster_url: string | null;
  checks: { at_seconds: number; item_id: string }[];
  skill_ids: string[];
  misconception_ids: string[];
  /** Shown above the player. */
  title?: string | null;
  duration_s?: number | null;
  /** Parts of the clip; the summary is what the tutor repeats when asked what the video said (never answers). */
  segments?: { start: number; end: number; title: string; summary: string }[];
  /** Caption lines used while there is no captions file. */
  captions?: { start: number; end: number; text: string }[];
  /** Clip-per-moment lesson (Dave's player): which clip plays before, after a right answer and after each wrong try. */
  flow?: VideoFlow | null;
}

export interface VideoFlow {
  status?: string;
  checks: { item_id: string; after_clip: string; correct_clip: string; wrong_clips: [string, string, string]; next_clip: string | null; hint_highlight?: string | null }[];
  media: Record<string, { url: string; url_low: string | null; captions_url: string | null }>;
}

export type ItemKey =
  | { kind: "mcq"; correct_option_id: string }
  | { kind: "numeric"; value: string; accepted_forms: string[] }
  | { kind: "structured"; fields: Record<string, string | number> }
  | { kind: "line_work"; final: string; worked_solution: string[]; accepted_methods: string[][] }
  | { kind: "theory"; final: string; worked_solution: string[]; marking_guide: { step: string; marks: number; accept: string[] }[] };

export interface PackItem {
  id: string;
  step: LessonStep;
  kind: ItemKind;
  sequence: number;
  skill_ids: string[];
  tags: { bloom?: string; difficulty?: string; exam?: string; component?: string };
  prompt: Script;
  options?: { id: string; label: string }[];
  fields?: { id: string; label: string; type: string }[];
  key?: ItemKey; // absent only for prediction
  feedback?: { trigger: string; misconception_id: string | null; script: Script }[];
  escalation?: { attempt_2: Script; attempt_3: Script };
  hints?: { rung: 1 | 2 | 3 | 4; script: Script }[];
  explanation?: Script;
  teach_me?: { model: Script; together: Script };
  config?: Record<string, unknown>;
}

export interface ContentPack {
  pack_version: string;
  topic: { id: string; display_name: string; subject: string; chapter: string; quest: string };
  skills: { id: string; name: string; description?: string }[];
  topic_skills: { skill_id: string; role: SkillRole }[];
  misconceptions: { id: string; skill_id: string | null; label: string; plain_words: string }[];
  items: PackItem[];
  repairs: { id: string; skill_id: string; micro_lesson: Script | { clip_id: string }; practice_item_id: string }[];
  hooks: {
    id: string; type: HookType; script: Script; asset_url: string | null;
    prediction: { options: { id: string; label: string }[]; number_boxes: boolean; timeout_s?: number } | null;
    answered_by: string | null; close_script: Script; is_active: boolean;
  }[];
  clips: VideoManifest[];
  simulations: {
    id: string; band: Band; url: string | null;
    init: { level?: string; state?: Record<string, unknown> };
    tasks: { id: string; sequence: number; goal: string; hint_script: Script; completion_script: Script; required: boolean }[];
    opening_lines: { misconception_id: string | "default"; script: Script }[];
    /** did_well[0] = "{tasks} right first time", did_well[1] = none right first time; watch_by keyed by misconception id, watch = default. */
    closing: { did_well: Script; watch: Script; hook_link: Script; closing_line?: Script; watch_by?: Record<string, Script> };
  }[];
  fallback_lines: { id: string; step: LessonStep | null; decision_key: string; script: Script; audio_url?: string | null }[];
  rules: { key: RuleKey; value: unknown; description?: string }[];
}

export const RULE_KEYS = [
  "routing_bands", "default_band", "sim_band_levels", "sim_required_tasks", "sim_advanced_challenges", "sim_own_feedback",
  "sim_show_scores", "sim_load_timeout_ms", "help_video_idle_s", "help_video_option_changes", "help_sim_idle_s",
  "help_sim_repeats", "help_board_idle_s", "help_board_erases", "help_board_alerts", "help_guided_idle_s",
  "help_replay_count", "help_cooldown_s", "ai_timeout_ms", "ai_classify_timeout_ms", "hook_prediction_timeout_s", "video_start_mode",
  "mastery_close_rule", "tutor_display_name", "ai_provider", "voice_provider", "elevenlabs_voice_id",
  "elevenlabs_model_id", "elevenlabs_voice_settings", "override_disconnect_timeout_s", "dev_open_access", "allowed_email_domains",
] as const;
export type RuleKey = (typeof RULE_KEYS)[number];
