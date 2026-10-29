// Pure rules for the background music (tested). The player lives in src/lib/music.ts.
export type MusicMood = "explore" | "focus" | "off";

export const MUSIC_GAIN = 0.12;
export const DUCK = { voice: 0.3, sfx: 0.5, downS: 0.3, upS: 1, sfxHoldS: 0.6 } as const;
export const FADE_IN_S = 0.6;
export const CROSSFADE_S = 2;
export const LIFT_S = 4;
export const IDLE_STOP_MS = 120_000;

const SILENT_STEPS = new Set(["video", "worksheet", "exit_ticket", "reflection", "close"]);
const QUIET_PATHS = [/^\/admin/, /^\/parent/, /^\/teacher/, /^\/sign-in/, /^\/sign-up/, /^\/auth/];

/** Which loop a page plays: lesson steps are focus (or silent), other student pages explore. */
export function musicMood(path: string, step: string | null): MusicMood {
  if (QUIET_PATHS.some((r) => r.test(path))) return "off";
  if (step) return SILENT_STEPS.has(step) ? "off" : "focus";
  return "explore";
}

export function musicShouldPlay(s: { on: boolean; mood: MusicMood; hidden: boolean; lowData: boolean; override: boolean; videoPlaying: boolean; idle: boolean }): boolean {
  return s.on && s.mood !== "off" && !s.hidden && !s.lowData && !s.override && !s.videoPlaying && !s.idle;
}

/** Duck level: Fiti's (or the lab's) voice wins over a sound effect. */
export function duckLevel(s: { speaking: boolean; sfx: boolean }): number {
  return s.speaking ? DUCK.voice : s.sfx ? DUCK.sfx : 1;
}
