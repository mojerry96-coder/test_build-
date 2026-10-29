// When the simulation help prompt may fire: no meaningful action for idleS seconds, or the same wrong
// answer `repeats` times; at most once per task and never twice within the cooldown.
export type HelpState = { idleMs: number; repeats: number; prompted: boolean; lastPrompt: number };
export const SIM_HELP_COOLDOWN_MS = 120_000;

export function shouldPromptSimHelp(s: HelpState, now: number, idleS = 30, repeats = 2, paused = false): boolean {
  if (paused || s.prompted || now - s.lastPrompt < SIM_HELP_COOLDOWN_MS) return false;
  return s.idleMs >= idleS * 1000 || s.repeats >= repeats;
}
