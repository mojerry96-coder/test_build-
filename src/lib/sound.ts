import { voiceSpeaking } from "@/lib/voice";
// Balafon game sounds made in the browser with Web Audio (no files, almost no data).
// One sound at a time; nothing plays while the tab is hidden or when she turned sounds off.

const KEY = "ul-sound";
const EVENT = "ul-sound-change";

/** Saved setting: on unless she turned it off. */
export function soundsOn(stored: string | null): boolean {
  return stored !== "off";
}

export function readSoundPref(): boolean {
  if (typeof window === "undefined") return false;
  try { return soundsOn(window.localStorage.getItem(KEY)); } catch { return true; }
}

export function setSoundPref(on: boolean) {
  if (!on && master && ctx) { try { master.gain.setValueAtTime(0, ctx.currentTime); } catch { /* no audio */ } fullUntil = 0; }
  try { window.localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
  window.dispatchEvent(new Event(EVENT));
}

export function onSoundPref(fn: () => void) {
  window.addEventListener(EVENT, fn);
  return () => window.removeEventListener(EVENT, fn);
}

// Balafon set: wooden notes (sine + octave, click, fast decay, 3 kHz low-pass), talking drum, shaker.
export type Voice =
  | { kind: "bal"; f: number; at: number; decay: number; gain?: number }
  | { kind: "drum"; from: number; to: number; at: number; gain?: number }
  | { kind: "shaker"; at: number; gain?: number };
export const MASTER_GAIN = 0.08;
export const FITI_MESSAGE_SILENCE_MS = 3000;
export const N = { G4: 392, C5: 523.3, D5: 587.3, E5: 659.3, G5: 784, A5: 880, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 } as const;
const bigWin: Voice[] = [
  { kind: "bal", f: N.C5, at: 0, decay: 0.3 }, { kind: "bal", f: N.E5, at: 0.09, decay: 0.3 },
  { kind: "bal", f: N.G5, at: 0.18, decay: 0.3 }, { kind: "bal", f: N.C6, at: 0.27, decay: 0.6 },
  { kind: "drum", from: 140, to: 90, at: 0.27, gain: 0.5 },
];
export const SOUNDS = {
  splash: [{ kind: "drum", from: 110, to: 70, at: 0 }, { kind: "drum", from: 150, to: 100, at: 0.18 }, { kind: "bal", f: N.C6, at: 0.18, decay: 0.6 }],
  tap: [{ kind: "shaker", at: 0, gain: 0.03 / MASTER_GAIN }],
  small_win: [{ kind: "bal", f: N.E5, at: 0, decay: 0.35 }, { kind: "bal", f: N.A5, at: 0.11, decay: 0.45 }],
  big_win: bigWin,
  not_quite: [{ kind: "bal", f: N.G4, at: 0, decay: 0.18, gain: 0.05 / MASTER_GAIN }],
  hint: [{ kind: "bal", f: N.A5, at: 0, decay: 0.35, gain: 0.04 / MASTER_GAIN }],
  snap: [{ kind: "bal", f: N.C6, at: 0, decay: 0.05, gain: 0.03 / MASTER_GAIN }],
  stop_done: [{ kind: "bal", f: N.G5, at: 0, decay: 0.3 }, { kind: "bal", f: N.C6, at: 0.12, decay: 0.5 }, { kind: "shaker", at: 0.12, gain: 0.6 }],
  feather: [...bigWin, { kind: "bal", f: N.E6, at: 0.75, decay: 0.25, gain: 0.35 }, { kind: "bal", f: N.G6, at: 0.83, decay: 0.25, gain: 0.35 }, { kind: "bal", f: N.C7, at: 0.91, decay: 0.4, gain: 0.35 }],
  streak: [{ kind: "drum", from: 140, to: 90, at: 0, gain: 0.7 }, { kind: "drum", from: 140, to: 90, at: 0.14, gain: 0.7 }],
  fiti_message: [{ kind: "bal", f: N.D5, at: 0, decay: 0.3, gain: 0.35 }],
} satisfies Record<string, Voice[]>;
export type SoundName = keyof typeof SOUNDS;

/** Exact pitch every time, so a sound is always the same. */
export function jitter(f: number, _rand?: () => number): number {
  return f;
}
/** Tunes that finish even when another sound starts. */
export const FULL_SOUNDS: readonly SoundName[] = ["feather", "stop_done", "big_win"];
export const DEDUP_MS = 300;
export const PENDING_MS = 2000;
export const DUCK_UNDER_VOICE = 0.4;
/** The same sound asked for twice within 300 ms plays once. */
export function isDuplicate(name: string, now: number, last: Record<string, number>): boolean {
  return now - (last[name] ?? -Infinity) < DEDUP_MS;
}
/** A sound asked for before the first tap plays on that tap only if it's under 2 s old. */
export function pendingFresh(askedAt: number, now: number): boolean {
  return now - askedAt <= PENDING_MS;
}
/** Fiti's message pluck only after 3 s without any other sound. */
export function fitiMessageAllowed(now: number, lastSoundAt: number): boolean {
  return now - lastSoundAt >= FITI_MESSAGE_SILENCE_MS;
}

/** Sounds play only when on, and never in low-data mode or a classroom (Override) session. Over Fiti's voice they play quieter. */
export function soundAllowed(s: { on: boolean; lowData: boolean; override: boolean; speaking?: boolean }): boolean {
  return s.on && !s.lowData && !s.override;
}

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let current: GainNode | null = null;
let unlocked = false;
let lastSoundAt = -Infinity;
const lastByName: Record<string, number> = {};
let pending: { name: SoundName; at: number } | null = null;
let fullUntil = 0;

// Browsers allow audio only after a tap: create the context on the first one.
let unlockImpl: () => void = () => undefined;
/** Taps inside a same-origin frame (Gradient Lab) don't reach us; the frame wrapper calls this. */
export function unlockAudio() { unlockImpl(); }
if (typeof window !== "undefined") {
  // Safari only wakes sound inside a real tap/click/key, so try on every one until it is running.
  const unlock = () => {
    if (unlocked && ctx?.state === "running") return;
    try {
      ctx ??= new AudioContext();
      const b = ctx.createBuffer(1, 1, 22050), src = ctx.createBufferSource();
      src.buffer = b; src.connect(ctx.destination); src.start(0);
      const done = () => { if (ctx?.state !== "running" || unlocked) return; unlocked = true; unlockFns.splice(0).forEach((f) => f()); const p = pending; pending = null; if (p && pendingFresh(p.at, performance.now())) playSound(p.name); };
      if (ctx.state !== "running") void ctx.resume().then(done, () => undefined); else done();
      ctx.onstatechange = done;
    } catch { /* no audio */ }
  };
  unlockImpl = unlock;
  for (const ev of ["pointerdown", "pointerup", "click", "touchend", "keydown"]) window.addEventListener(ev, unlock, { capture: true });
}

function noise(c: AudioContext, secs: number): AudioBufferSourceNode {
  const b = c.createBuffer(1, Math.max(1, Math.floor(c.sampleRate * secs)), c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  const s = c.createBufferSource(); s.buffer = b; return s;
}
function env(c: AudioContext, g: GainNode, t: number, peak: number, decay: number) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.005 + decay);
}
function voice(c: AudioContext, out: AudioNode, v: Voice, t0: number) {
  const t = t0 + v.at, gain = v.gain ?? 1;
  if (v.kind === "bal") {
    const f = jitter(v.f);
    const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 3000; lp.connect(out);
    for (const [mul, lvl] of [[1, 1], [2, 0.3]] as const) {
      const o = c.createOscillator(), g = c.createGain();
      o.type = "sine"; o.frequency.value = f * mul; env(c, g, t, gain * lvl, v.decay);
      o.connect(g).connect(lp); o.start(t); o.stop(t + v.decay + 0.05);
    }
    const n = noise(c, 0.002), ng = c.createGain(); ng.gain.value = gain * 0.4;
    n.connect(ng).connect(lp); n.start(t);
  } else if (v.kind === "drum") {
    const o = c.createOscillator(), g = c.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(jitter(v.from), t); o.frequency.exponentialRampToValueAtTime(v.to, t + 0.2);
    env(c, g, t, gain, 0.25); o.connect(g).connect(out); o.start(t); o.stop(t + 0.3);
    const n = noise(c, 0.04), lp = c.createBiquadFilter(), ng = c.createGain();
    lp.type = "lowpass"; lp.frequency.value = 400; env(c, ng, t, gain * 0.3, 0.04);
    n.connect(lp).connect(ng).connect(out); n.start(t);
  } else {
    const n = noise(c, 0.05), bp = c.createBiquadFilter(), g = c.createGain();
    bp.type = "bandpass"; bp.frequency.value = 6000; bp.Q.value = 1.2; env(c, g, t, gain, 0.045);
    n.connect(bp).connect(g).connect(out); n.start(t);
  }
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined" || document.hidden) return;
  const d = document.documentElement.dataset;
  if (!soundAllowed({ on: readSoundPref(), lowData: d["lowData"] === "true", override: d["override"] === "true" })) return;
  if ([...document.querySelectorAll("video")].some((v) => !v.paused && !v.muted)) return;
  const now = performance.now();
  if (!unlocked) { pending = { name, at: now }; return; }
  if (isDuplicate(name, now, lastByName)) return;
  if (name === "fiti_message" && !fitiMessageAllowed(now, lastSoundAt)) return;
  const full = FULL_SOUNDS.includes(name);
  // One tune at a time: a second tune while one is still playing is skipped.
  if (full && now < fullUntil) return;
  lastByName[name] = now;
  try {
    if (!ctx) return;
    if (ctx.state !== "running") void ctx.resume();
    if (!master) { master = ctx.createGain(); master.gain.value = MASTER_GAIN; master.connect(ctx.destination); }
    master.gain.value = MASTER_GAIN;
    // A tune keeps playing; short sounds play over it and only replace other short sounds.
    if (current && now >= fullUntil) { try { current.disconnect(); } catch { /* already gone */ } }
    const out = ctx.createGain(); out.gain.value = voiceSpeaking() ? DUCK_UNDER_VOICE : 1; out.connect(master);
    if (full) { const len = Math.max(...(SOUNDS[name] as Voice[]).map((v) => v.at + ("decay" in v ? v.decay : 0.3))); fullUntil = now + len * 1000 + 100; }
    else current = out;
    lastSoundAt = now;
    window.dispatchEvent(new Event("ul-sfx"));
    const t0 = ctx.currentTime + 0.01;
    for (const v of SOUNDS[name] as Voice[]) voice(ctx, out, v, t0);
  } catch { /* no audio on this device */ }
}

// Shared with the background music (src/lib/music.ts).
export function audioCtx(): AudioContext | null { return ctx && ctx.state === "running" ? ctx : null; }
export function audioUnlocked(): boolean { return unlocked; }
const unlockFns: (() => void)[] = [];
export function onAudioUnlock(fn: () => void) { if (unlocked) fn(); else unlockFns.push(fn); }
