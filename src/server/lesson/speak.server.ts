// Speaks one line of tutor text the student has already been sent (see voice-ledger). Audio is a layer on
// top of text: voice off, unknown text or a synthesis failure all return null and the line stays text.
import { synthesizeMp3, ttsVoice } from "@/server/providers/tts.server";
import { elevenKey, elevenSpeak, readVoiceConfig } from "@/server/providers/elevenlabs.server";
import { geminiSpeak } from "@/server/providers/gemini-tts.server";
import { spokenForm } from "@/shared/spoken-form";
import { hashText, wasShown } from "@/server/providers/voice-ledger.server";

// ponytail: process-local cache keyed by voice + text; a hash-keyed bucket replaces it when audio is pre-generated at import.
const cache = new Map<string, string>();
const CACHE_MAX = 300;

export async function speak(userId: string, text: string): Promise<{ audio: string | null }> {
  // Settings and the shown-line check run together: every ms here delays Fiti's first word.
  const [cfg, shown] = await Promise.all([readVoiceConfig().catch(() => null), wasShown(userId, text)]);
  const gemini = cfg?.provider === "gemini" && !!process.env["LOVABLE_API_KEY"] ? cfg : null;
  const eleven = cfg?.provider === "elevenlabs" && !!cfg.voiceId && !!elevenKey() ? cfg : null;
  const edge = ttsVoice();
  if (!gemini && !eleven && !edge) { console.warn("voice skipped: voice off"); return { audio: null }; }
  if (!shown) { console.warn("voice skipped: line not shown to this student"); return { audio: null }; }
  const line = text.trim();
  const key = `${gemini ? `gm:${gemini.geminiVoice}:${gemini.geminiStyle}` : eleven ? `el:${eleven.voiceId}:${eleven.modelId}` : edge}\n${line}`;
  const hit = cache.get(key);
  if (hit) return { audio: hit };
  // Saved clips are shared by every student and survive restarts: lines everyone hears play at once.
  const clipKey = hashText(key);
  const db = (await import("@/integrations/supabase/client.server")).supabaseAdmin;
  const saved = await db.from("voice_clips").select("audio_b64").eq("clip_key", clipKey).maybeSingle().then((r) => r.data?.audio_b64 ?? null, () => null);
  if (saved) { remember(key, saved); return { audio: saved }; }
  let audio: string | null = null;
  let main = false;
  if (gemini) {
    try { audio = Buffer.from(await geminiSpeak(spokenForm(line), gemini)).toString("base64"); main = true; }
    catch (e) { console.error("gemini voice failed, using backup", e instanceof Error ? e.message : e); }
  }
  if (eleven) {
    try { audio = Buffer.from(await elevenSpeak(spokenForm(line), eleven)).toString("base64"); main = true; }
    catch (e) { console.error("elevenlabs voice failed, using backup", e instanceof Error ? e.message : e); }
  }
  if (!audio && edge) {
    try { audio = (await synthesizeMp3(spokenForm(line), edge)).toString("base64"); }
    catch (e) { console.error("tts failed", e instanceof Error ? e.message : e); }
  }
  if (!audio) return { audio: null };
  remember(key, audio);
  // Only the main voice is saved; a backup-voice clip must not replace it for everyone.
  if (main) {
    const { error } = await db.from("voice_clips").upsert({ clip_key: clipKey, audio_b64: audio }, { onConflict: "clip_key" });
    if (error) console.warn("voice clip save failed", error.message);
  }
  return { audio };
}

function remember(key: string, audio: string): void {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, audio);
}
