// ElevenLabs voice and listening. Called directly (no gateway) with the server-only ELEVENLABS_API_KEY.
// Choice of provider, voice, model and voice settings come from global rules, never from code.

export type VoiceConfig = {
  provider: "mock" | "elevenlabs" | "gemini"; voiceId: string | null; modelId: string; settings: Record<string, unknown> | null;
  geminiVoice: string; geminiStyle: string;
};

const DEFAULT_MODEL = "eleven_turbo_v2_5";
const DEFAULT_GEMINI_VOICE = "Puck";
const DEFAULT_GEMINI_STYLE = "Say in a warm, friendly Nigerian English accent, at a calm, unhurried teaching pace";
let cached: { at: number; cfg: VoiceConfig } | null = null;

/** Pure: rule rows to a voice config. ElevenLabs only when the rule says so and a voice ID is set. */
export function voiceConfigFrom(rows: { key: string; value: unknown }[]): VoiceConfig {
  const get = (k: string) => rows.find((r) => r.key === k)?.value;
  const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
  const p = get("voice_provider");
  const provider = p === "elevenlabs" ? "elevenlabs" : p === "gemini" ? "gemini" : "mock";
  const s = get("elevenlabs_voice_settings");
  return {
    provider,
    voiceId: str(get("elevenlabs_voice_id")),
    modelId: str(get("elevenlabs_model_id")) ?? DEFAULT_MODEL,
    settings: s && typeof s === "object" && !Array.isArray(s) ? (s as Record<string, unknown>) : null,
    geminiVoice: str(get("gemini_voice_name")) ?? DEFAULT_GEMINI_VOICE,
    geminiStyle: str(get("gemini_voice_style")) ?? DEFAULT_GEMINI_STYLE,
  };
}

export async function readVoiceConfig(): Promise<VoiceConfig> {
  if (cached && Date.now() - cached.at < 60_000) return cached.cfg;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.from("rules").select("key, value").is("topic_id", null)
    .in("key", ["voice_provider", "elevenlabs_voice_id", "elevenlabs_model_id", "elevenlabs_voice_settings", "gemini_voice_name", "gemini_voice_style"]);
  const cfg = voiceConfigFrom((data ?? []) as { key: string; value: unknown }[]);
  cached = { at: Date.now(), cfg };
  return cfg;
}

export const elevenKey = (): string | null => process.env["ELEVENLABS_API_KEY"]?.trim() || null;

async function timed(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctl.signal }); } finally { clearTimeout(t); }
}

/** Approved tutor text to mp3 bytes. Throws with the provider's status and body; the caller falls back. */
export async function elevenSpeak(text: string, cfg: VoiceConfig): Promise<Uint8Array> {
  const key = elevenKey();
  if (!key || !cfg.voiceId) throw new Error("ElevenLabs not set up");
  const voiceId = cfg.voiceId;
  const call = () => timed(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: cfg.modelId, ...(cfg.settings ? { voice_settings: cfg.settings } : {}) }),
  }, 12000);
  let res = await call();
  // 409 already_running: a library voice is still being added to the account; retry shortly.
  for (let i = 0; i < 2 && res.status === 409; i++) {
    await new Promise((r) => setTimeout(r, 1200));
    res = await call();
  }
  if (!res.ok) throw new Error(`ElevenLabs TTS [${res.status}]: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  return new Uint8Array(await res.arrayBuffer());
}

/** A short recording to text. Throws with status and body; the caller falls back. */
export async function elevenTranscribe(file: File): Promise<string> {
  const key = elevenKey();
  if (!key) throw new Error("ElevenLabs not set up");
  const body = new FormData();
  body.append("file", file);
  body.append("model_id", "scribe_v2");
  body.append("language_code", "eng");
  body.append("tag_audio_events", "false");
  const res = await timed("https://api.elevenlabs.io/v1/speech-to-text", { method: "POST", headers: { "xi-api-key": key }, body }, 15000);
  if (!res.ok) throw new Error(`ElevenLabs STT [${res.status}]: ${(await res.text().catch(() => "")).slice(0, 300)}`);
  const j = (await res.json()) as { text?: string };
  return (j.text ?? "").trim();
}
