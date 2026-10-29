// Background game music: two produced loops (explore / focus), one player for the whole app.
// Mood comes from the page (setMusicMood); rules are in src/shared/music-plan.ts.
import { voiceSpeaking } from "@/lib/voice";
import { audioCtx, onAudioUnlock, unlockAudio } from "@/lib/sound";
import exploreAsset from "@/assets/music/music-explore.mp3.asset.json";
import focusAsset from "@/assets/music/music-focus.mp3.asset.json";
import { CROSSFADE_S, DUCK, FADE_IN_S, IDLE_STOP_MS, LIFT_S, MUSIC_GAIN, duckLevel, musicShouldPlay, type MusicMood } from "@/shared/music-plan";

const KEY = "ul-music";
const EVENT = "ul-music-change";
export function readMusicPref(): boolean {
  if (typeof window === "undefined") return false;
  try { return window.localStorage.getItem(KEY) !== "off"; } catch { return true; }
}
export function setMusicPref(on: boolean) {
  try { window.localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* private mode */ }
  window.dispatchEvent(new Event(EVENT));
}
export function onMusicPref(fn: () => void) { window.addEventListener(EVENT, fn); return () => window.removeEventListener(EVENT, fn); }

type Track = "explore" | "focus";
const URLS: Record<Track, string> = { explore: exploreAsset.url, focus: focusAsset.url };
const bytes: Partial<Record<Track, Promise<ArrayBuffer | null>>> = {};
const decoded: Partial<Record<Track, AudioBuffer>> = {};
const decoding: Partial<Record<Track, boolean>> = {};

let mood: MusicMood = "off";
let out: GainNode | null = null; // master music gain (fade, lift)
let duck: GainNode | null = null;
const lanes: Partial<Record<Track, { src: AudioBufferSourceNode; gain: GainNode }>> = {};
let playingTrack: Track | null = null;
let timer = 0;
let lastTap = Date.now();
let sfxUntil = 0;
let liftUntil = 0;

const lowData = () => typeof document !== "undefined" && document.documentElement.dataset["lowData"] === "true";
/** Download a loop once (never in low-data mode); a failed download is retried later. */
function fetchTrack(t: Track) {
  if (lowData() || bytes[t]) return;
  bytes[t] = fetch(URLS[t]).then((r) => (r.ok ? r.arrayBuffer() : null)).catch(() => null)
    .then((b) => { if (!b) delete bytes[t]; return b; });
}
function decodeTrack(c: AudioContext, t: Track) {
  if (decoded[t] || decoding[t]) return;
  fetchTrack(t);
  const p = bytes[t]; if (!p) return;
  decoding[t] = true;
  void p.then((b) => (b ? c.decodeAudioData(b.slice(0)) : null)).then((buf) => { if (buf) decoded[t] = buf; }, () => undefined)
    .finally(() => { decoding[t] = false; });
}

/** A tap or key press we cannot hear directly (the lab frame). */
export function noteActivity() { lastTap = Date.now(); unlockAudio(); ensureLoop(); }
export function setMusicMood(m: MusicMood) {
  mood = m;
  if (m !== "off") fetchTrack(m);
  ensureLoop();
}
/** Sound effects call this so the music dips briefly. */
export function musicSfx() { sfxUntil = performance.now() + DUCK.sfxHoldS * 1000; }
/** Big wins: lift the music for a few seconds. */
export function musicLift() { liftUntil = performance.now() + LIFT_S * 1000; }

function labSpeaking(): boolean {
  try {
    return [...document.querySelectorAll("iframe")].some((f) => (f.contentWindow as (Window & { speechSynthesis?: SpeechSynthesis }) | null)?.speechSynthesis?.speaking);
  } catch { return false; }
}
function wanted(): boolean {
  const d = document.documentElement.dataset;
  return musicShouldPlay({
    on: readMusicPref(), mood, hidden: document.hidden,
    lowData: d["lowData"] === "true", override: d["override"] === "true",
    videoPlaying: [...document.querySelectorAll("video")].some((v) => !v.paused && !v.muted),
    idle: Date.now() - lastTap > IDLE_STOP_MS,
  });
}

function startLane(c: AudioContext, t: Track, fadeS: number) {
  const buf = decoded[t]!;
  const gain = c.createGain(); gain.gain.value = 0; gain.connect(duck!);
  const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
  src.loopStart = 0; src.loopEnd = buf.duration;
  src.connect(gain); src.start();
  gain.gain.setValueAtTime(0, c.currentTime); gain.gain.linearRampToValueAtTime(1, c.currentTime + fadeS);
  lanes[t] = { src, gain };
}
function stopLane(c: AudioContext, t: Track, fadeS: number) {
  const l = lanes[t]; if (!l) return;
  delete lanes[t];
  l.gain.gain.setTargetAtTime(0, c.currentTime, fadeS / 3);
  window.setTimeout(() => { try { l.src.stop(); l.gain.disconnect(); } catch { /* gone */ } }, fadeS * 1000 + 500);
}
function stopAll() {
  const c = audioCtx();
  if (c) (Object.keys(lanes) as Track[]).forEach((t) => stopLane(c, t, 0.4));
  playingTrack = null;
}

function tick() {
  const c = audioCtx();
  if (!c) return;
  if (!wanted()) { stopAll(); if (mood === "off") { window.clearInterval(timer); timer = 0; } return; }
  const want: Track = mood === "focus" ? "focus" : "explore";
  if (!decoded[want]) { decodeTrack(c, want); return; }
  if (!out) { out = c.createGain(); out.gain.value = MUSIC_GAIN; out.connect(c.destination); duck = c.createGain(); duck.connect(out); }
  if (playingTrack !== want) {
    const first = playingTrack === null;
    if (playingTrack) stopLane(c, playingTrack, CROSSFADE_S);
    startLane(c, want, first ? FADE_IN_S : CROSSFADE_S);
    playingTrack = want;
  }
  const now = performance.now();
  const lift = now < liftUntil ? 1.3 : 1;
  const speaking = voiceSpeaking() || labSpeaking();
  duck!.gain.setTargetAtTime(duckLevel({ speaking, sfx: now < sfxUntil }) * lift, c.currentTime, speaking ? DUCK.downS / 3 : DUCK.upS / 3);
}

function ensureLoop() {
  if (typeof window === "undefined" || timer || mood === "off") return;
  timer = window.setInterval(tick, 100);
}

if (typeof window !== "undefined") {
  const tap = () => { lastTap = Date.now(); ensureLoop(); };
  for (const ev of ["pointerdown", "keydown"]) window.addEventListener(ev, tap, { capture: true });
  onAudioUnlock(ensureLoop);
  window.addEventListener("ul-sfx", musicSfx);
  window.addEventListener(EVENT, () => { if (!readMusicPref()) stopAll(); ensureLoop(); });
  // Get the current area's loop ready before her first tap.
  const idle = (window as Window & { requestIdleCallback?: (f: () => void) => void }).requestIdleCallback ?? ((f: () => void) => window.setTimeout(f, 1500));
  window.addEventListener("load", () => idle(() => { if (mood !== "off") fetchTrack(mood); }));
}
