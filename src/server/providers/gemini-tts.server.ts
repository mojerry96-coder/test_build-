// Gemini voice through the Lovable AI Gateway. Voice name and accent/pace wording come from rules
// (gemini_voice_name, gemini_voice_style); the style wording is sent as steering and is never captioned.
import type { VoiceConfig } from "./elevenlabs.server";

const MODEL = "google/gemini-3.1-flash-tts-preview";
const URL = "https://ai.gateway.lovable.dev/v1/audio/speech";

/** Pure: the text Gemini receives — style instruction, then the approved line. */
export function geminiPrompt(line: string, style: string): string {
  return `${style.trim().replace(/:\s*$/, "")}: ${line}`;
}

async function once(body: string, key: string): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 8000);
  try {
    return await fetch(URL, { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body, signal: ctl.signal });
  } finally { clearTimeout(t); }
}

/** Approved tutor text to WAV bytes. Throws on failure; the caller plays the backup voice. */
export async function geminiSpeak(text: string, cfg: VoiceConfig): Promise<Uint8Array> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("Gemini voice not set up");
  const body = JSON.stringify({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: geminiPrompt(text, cfg.geminiStyle) }] }],
    generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: cfg.geminiVoice } } } },
  });
  let res = await once(body, key);
  // Only rate limits and server errors are worth one more try; 402/403 go straight to the backup voice.
  if (res.status === 429 || res.status >= 500) {
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 400));
    res = await once(body, key);
  }
  if (!res.ok) throw new Error(`Gemini TTS [${res.status}]: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const wav = new Uint8Array(await res.arrayBuffer());
  // About 8x smaller for slow networks; if shrinking fails she still hears the WAV.
  try { return await wavToMp3(wav); } catch (e) { console.warn("mp3 shrink failed, sending wav", e instanceof Error ? e.message : e); return wav; }
}

/** 16-bit mono WAV to a 48 kbps mp3 (pure JS, Worker-safe). */
export async function wavToMp3(wav: Uint8Array): Promise<Uint8Array> {
  const v = new DataView(wav.buffer, wav.byteOffset, wav.byteLength);
  if (v.getUint32(0, false) !== 0x52494646) throw new Error("not wav");
  let off = 12, rate = 24000, data: Int16Array | null = null;
  while (off + 8 <= wav.byteLength) {
    const id = v.getUint32(off, false), size = v.getUint32(off + 4, true);
    if (id === 0x666d7420) rate = v.getUint32(off + 12, true);
    if (id === 0x64617461) {
      const len = Math.min(size, wav.byteLength - off - 8) >> 1;
      const copy = wav.slice(off + 8, off + 8 + len * 2);
      data = new Int16Array(copy.buffer, 0, len);
      break;
    }
    off += 8 + size + (size & 1);
  }
  if (!data) throw new Error("no audio data");
  const { Mp3Encoder } = await import("@breezystack/lamejs");
  const enc = new Mp3Encoder(1, rate, 48);
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < data.length; i += 1152) {
    const b = enc.encodeBuffer(data.subarray(i, i + 1152));
    if (b.length) chunks.push(new Uint8Array(b));
  }
  const end = enc.flush();
  if (end.length) chunks.push(new Uint8Array(end));
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let p = 0;
  for (const c of chunks) { out.set(c, p); p += c.length; }
  return out;
}
