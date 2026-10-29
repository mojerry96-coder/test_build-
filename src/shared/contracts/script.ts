// Script format shared by content, the tutor reply and fallback lines.
export const ALLOWED_CUES = [
  "board.write",
  "board.plot",
  "board.highlight",
  "board.clear",
  "sim.load",
  "sim.set",
  "sim.lock",
  "sim.unlock",
  "video.play",
  "avatar.emote",
] as const;
export type CueType = (typeof ALLOWED_CUES)[number];

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

export interface Cue {
  at_ms: number;
  type: CueType;
  args?: { [k: string]: JsonValue };
}

export interface Segment {
  /** Shown in captions and text mode. */
  text: string;
  /** Maths written for speech; falls back to text. */
  speakable?: string;
  cues?: Cue[];
}

export type Script = Segment[];

/** Placeholders the engine fills. The AI never invents values. */
export const SCRIPT_PLACEHOLDERS = ["{student_name}", "{count_words}", "{prediction}", "{tutor_name}"] as const;
