// Tutor voice (POC): plays lines the server has already sent, through one queue so bubbles, popups and
// cards never talk over each other. Audio is optional: any failure leaves the text exactly as it is.
// Typing waits for a line's voice to start (voiceStarted), then paces itself to the clip length.
import { useEffect } from "react";
import { speakFn } from "@/lib/api/voice.functions";
import { onRestart } from "@/lib/restart-epoch";
import { splitSpoken } from "@/shared/spoken-split";

const MUTE_KEY = "ul-fiti-voice";
const MUTE_EVENT = "ul-fiti-voice-change";
/** Fiti's voice only; music and button sounds have their own switches. Remembered on this device. */
export function readVoiceMuted(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(MUTE_KEY) === "off"; } catch { return false; }
}
export function setVoiceMuted(muted: boolean): void {
  try { window.localStorage.setItem(MUTE_KEY, muted ? "off" : "on"); } catch { /* private mode */ }
  if (muted) hush();
  window.dispatchEvent(new Event(MUTE_EVENT));
}
export function onVoiceMuted(fn: () => void): () => void {
  window.addEventListener(MUTE_EVENT, fn);
  return () => window.removeEventListener(MUTE_EVENT, fn);
}

let queue: Promise<void> = Promise.resolve();
const CLIP_WAIT_MS = 10000;
let gen = 0;
let current: HTMLAudioElement | null = null;
const spoken = new Set<string>();

// One fetch per line on this device: Watch again and repeats never ask the server twice.
const clips = new Map<string, Promise<string | null>>();
function fetchClip(text: string): Promise<string | null> {
  let p = clips.get(text);
  if (!p) {
    p = speakFn({ data: { text } }).then((r) => r?.audio ?? null).catch(() => null);
    p.then((a) => { if (!a) clips.delete(text); });
    if (clips.size > 200) clips.delete(clips.keys().next().value!);
    clips.set(text, p);
  }
  return p;
}
/** Start making a line's voice now so it is ready when its turn comes. */
export function prefetchVoice(text: string | undefined): void {
  if (!text?.trim() || readVoiceMuted()) return;
  void fetchClip(text.trim());
}

// One reused player, unlocked on her first tap: phones (Safari especially) refuse a new Audio started
// outside a tap, which left Fiti silent in cards that write lines on a timer.
let player: HTMLAudioElement | null = null;
let unlocked = false;
const SILENT = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYoRBqpAAAAAAAAAAAAAAAAAAAA";
function getPlayer(): HTMLAudioElement {
  if (!player) player = new Audio();
  return player;
}
if (typeof window !== "undefined") {
  const unlock = () => {
    unlocked = true;
    const a = getPlayer();
    if (!a.src || a.src === SILENT) { a.src = SILENT; a.play().catch(() => {}); }
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
}

// Start signals: the typing of a line waits for its voice to begin, so words and sound move together.
type Slot = { p: Promise<number | null>; r: (ms: number | null) => void; claimed: boolean; dropped: boolean; started: boolean; at: number };
const slots = new Map<string, Slot>();
function slot(text: string): Slot {
  let s = slots.get(text);
  if (!s) {
    let r!: (ms: number | null) => void;
    const p = new Promise<number | null>((res) => { r = res; });
    const made: Slot = { at: Date.now(), dropped: false, started: false, p, r: (ms) => { r(ms); setTimeout(() => { if (slots.get(text) === made) slots.delete(text); }, 1000); }, claimed: false } as Slot;
    s = made;
    slots.set(text, s);
  }
  return s;
}
const VOICE_START_WAIT_MS = 5000;
/**
 * Resolves with the expected speaking time (ms) when this line's voice starts, or null when it won't play
 * (muted, low data, sound still locked, not voiced, or slower than 3 s) so the words type as usual.
 */
export function voiceStarted(text: string): Promise<number | null> {
  const t = text.trim();
  if (!t || typeof window === "undefined" || !unlocked || readVoiceMuted() || document.documentElement.dataset["lowData"] === "true") return Promise.resolve(null);
  const s = slot(t);
  return Promise.race([
    s.p,
    // Too slow: the words type alone and this line is not spoken late, so the two never drift apart.
    new Promise<null>((r) => setTimeout(() => {
      // Only before he starts: once Fiti is talking he always finishes every piece of the line.
      if (s.started) return;
      s.dropped = true; console.info(`voice: too slow, line skipped`); r(null);
    }, VOICE_START_WAIT_MS)),
    // Nobody asked to voice it shortly after it appeared: not a spoken line.
    new Promise<null>((r) => setTimeout(() => { if (!s.claimed) r(null); }, 400)),
  ]);
}

async function playOne(text: string, g: number, clip: Promise<string | null>, onStart?: (durMs: number) => void): Promise<void> {
  if (g !== gen || readVoiceMuted()) return;
  // A clip that never arrives can't hold up the lines after it.
  const b64 = await Promise.race([clip, new Promise<null>((r) => setTimeout(() => r(null), CLIP_WAIT_MS))]);
  if (!b64) { console.info("voice: no audio for line"); return; }
  if (g !== gen) return;
  await new Promise<void>((done) => {
    const a = getPlayer();
    let settled = false;
    const finish = () => { if (settled) return; settled = true; a.onended = a.onerror = a.onpause = null; if (current === a) current = null; done(); };
    a.onended = a.onerror = a.onpause = finish;
    // Gemini sends WAV ("RIFF" header), the other voices send mp3.
    a.src = `data:${b64.startsWith("UklGR") ? "audio/wav" : "audio/mpeg"};base64,${b64}`;
    current = a;
    // Hard ceiling: a sound that never reports "ended" can't freeze Fiti for the rest of the lesson.
    const ceiling = () => window.setTimeout(() => { if (!settled) { a.pause(); finish(); } }, Number.isFinite(a.duration) && a.duration > 0 ? a.duration * 1000 + 2000 : 15000);
    a.onloadedmetadata = () => ceiling();
    a.onplaying = () => { a.onplaying = null; onStart?.(Number.isFinite(a.duration) ? a.duration * 1000 : 0); };
    a.play().catch(() => {
      console.info("voice: blocked until next tap");
      // Still blocked: try once more on her next tap, but never hold the queue more than a few seconds.
      const go = () => { window.removeEventListener("pointerdown", go); if (g === gen && !settled) a.play().catch(finish); };
      window.addEventListener("pointerdown", go, { once: true });
      setTimeout(() => { if (a.paused) finish(); }, 4000);
    });
  });
}

/** True while one of Fiti's voice clips is playing (game sounds wait). */
export function voiceSpeaking(): boolean { return !!current && !current.paused && !current.ended; }

/** Resolves when everything queued so far has been spoken (or dropped). */
export function voiceIdle(): Promise<void> { return queue; }

/** Queue lines to be spoken in order; empty lines are skipped. */
export function say(lines: string[]): void {
  // Low-data mode: captions only, no voice.
  if (typeof document !== "undefined" && document.documentElement.dataset["lowData"] === "true") { console.info("voice: low data, skipped"); return; }
  if (readVoiceMuted()) { console.info("voice: muted, skipped"); return; }
  // Sound is still locked (no tap yet since load): playing later would be out of step with the words.
  if (!unlocked) { console.info("voice: locked until first tap, skipped"); return; }
  const g = gen;
  for (const l of lines) {
    const t = l.trim();
    if (!t) continue;
    const s = slot(t);
    s.claimed = true;
    const parts = splitSpoken(t);
    // Fetch every part now, in parallel with whatever is playing; the first is asked for first.
    const clipsFor = parts.map((p) => fetchClip(p));
    let started = false;
    parts.forEach((p, i) => {
      queue = queue.then(() => (s.dropped ? undefined : playOne(p, g, clipsFor[i]!, (dur) => {
        if (started) return;
        started = true;
        s.started = true;
        console.info(`voice: start after ${Date.now() - s.at}ms`);
        // Whole line's speaking time, estimated from the first part's share of the words.
        s.r(dur > 0 ? Math.round(dur * (t.length / Math.max(1, p.length))) : null);
      })));
    });
    queue = queue.then(() => { if (!started) s.r(null); });
  }
}

/** Stop the voice now and drop what was queued: the words it belongs to have left the screen. */
export function hush(): void {
  gen++;
  slots.forEach((s) => s.r(null));
  queue = Promise.resolve(); // a new line always starts fresh, never behind a stuck one
  current?.pause();
  current = null;
}

/**
 * Speak lines the first time this appearance renders. `key` names the appearance (defaults to the lines).
 * `replace`: this surface shows one line at a time, so a new line cuts the old clip and may repeat an earlier one.
 */
export function useSay(lines: string[], key?: string, enabled = true, replace = false): void {
  const k = key ?? lines.join("\n");
  useEffect(() => {
    if (!enabled || !k) return;
    if (replace) hush();
    else if (spoken.has(k)) return;
    spoken.add(k);
    say(lines);
  }, [k, enabled]); // eslint-disable-line react-hooks/exhaustive-deps
}


onRestart(() => { hush(); spoken.clear(); });
