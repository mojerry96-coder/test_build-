// Gradient Lab v2 runs unchanged; we only choose its level through its own `?level=` setting.
// Its rule (README, commit 6558d8d): the platform assigns the level, the learner never sees or picks it,
// nothing sent = Beginner, and the lab never reassigns a level itself.
export const LAB_V2_PATH = "/sims/gradient-lab-v2/index.html";
const LEVELS: Record<string, "beginner" | "intermediate" | "advanced"> = {
  beginner: "beginner", intermediate: "intermediate", advanced: "advanced",
  rebuild: "beginner", bridge: "intermediate", stretch: "advanced", extend: "advanced",
};
/** The lab level for a record's level or a band name; unknown → intermediate (the default band). Always sent, so the lab never falls back to Beginner by accident. */
export function labV2Level(levelOrBand: string): "beginner" | "intermediate" | "advanced" {
  return LEVELS[levelOrBand.trim().toLowerCase()] ?? "intermediate";
}
/** Each level's screens, as in the lab's own LEVELS list. */
export const LAB_V2_LEVEL_SCREENS = { beginner: [2, 3, 4, 5, 12, 14], intermediate: [6, 7, 8, 13], advanced: [11, 9] } as const;
/** Lab address: its own ?level= setting, plus its own #N jump back to her saved screen when that screen is in her level. */
export function labV2Url(levelOrBand: string, screen?: number | null): string {
  const lv = labV2Level(levelOrBand);
  const back = screen != null && (LAB_V2_LEVEL_SCREENS[lv] as readonly number[]).includes(screen) ? `#${screen}` : "";
  return `${LAB_V2_PATH}?level=${lv}${back}`;
}
/** v2 report names we save (`gradientlab:<name>`). */
export const LAB_V2_EVENTS = ["attempt", "support-offered", "support", "tutorial", "worksheet", "complete"] as const;
/** Support reports: logged as help used, never marked. */
export const LAB_V2_HELP_EVENTS = ["support-offered", "support", "tutorial", "worksheet"] as const;
/** The lab shows the answer and its working after the last try of a question. */
export function labV2AnswerShown(event: string, detail: Record<string, unknown>): boolean {
  return event === "attempt" && detail["correct"] === false && detail["attemptsLeft"] === 0;
}
