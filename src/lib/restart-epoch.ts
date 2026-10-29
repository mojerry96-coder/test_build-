// After "Start again" the whole app screen is rebuilt (like a refresh, without reloading), and
// module-level "this visit" settings register a reset here.
import { useSyncExternalStore } from "react";

let epoch = 0;
const listeners = new Set<() => void>();
const resets = new Set<() => void>();

/** Register a reset to run on every Start again. Returns an unregister function. */
export function onRestart(fn: () => void): () => void { resets.add(fn); return () => { resets.delete(fn); }; }

export function getRestartEpoch(): number { return epoch; }

/** Run every registered reset once, then rebuild every screen. */
export function bumpRestartEpoch(): number {
  for (const fn of resets) { try { fn(); } catch { /* one failing reset never blocks the rest */ } }
  epoch += 1;
  for (const l of listeners) l();
  return epoch;
}

export function useRestartEpoch(): number {
  return useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => epoch, () => 0);
}
