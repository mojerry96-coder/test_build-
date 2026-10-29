// Mirrors the database enums. Keep in sync with migrations.
export const LESSON_STEPS = ["readiness", "hook", "video", "simulation", "worksheet", "guided", "exit_ticket", "reflection"] as const;
export type LessonStep = (typeof LESSON_STEPS)[number];

export const ITEM_KINDS = ["mcq", "numeric", "structured", "line_work", "theory", "prediction"] as const;
export type ItemKind = (typeof ITEM_KINDS)[number];

export type AppRole = "student" | "instructor" | "parent" | "admin";
export type Band = "rebuild" | "bridge" | "stretch";
export type SessionMode = "autopilot" | "override";
export type SessionStatus = "active" | "paused" | "completed" | "abandoned";
export type ClassStatus = "open" | "live" | "paused" | "closed";
export type Controller = "ai" | "instructor";
export type Channel = "voice" | "text";
export type SkillRole = "prerequisite" | "taught";
export type Confidence = "sure" | "think_so" | "guessing";
export type EvidenceStrength = "strong" | "moderate" | "weak" | "none";
export type HookType = "prediction" | "puzzling_question" | "real_life" | "surprising_fact";
export type ConsentScope = "learning_data" | "voice" | "transcript";
export type AiProvider = "mock" | "lovable_ai" | "ai_team";
export type VoiceProvider = "mock" | "elevenlabs";
