// Which tutor text each user has already been sent. Every lesson, intro and home response is walked and
// its strings noted; the voice endpoint speaks only a string noted for the caller. So the browser may ask
// for audio of anything on its screen and nothing else, and a hidden line can never be voiced early.
// Stored in the server-only voice_shown table: the live app runs on many server copies, so memory alone
// forgot lines shown by another copy and Fiti went silent.
import { createHash } from "node:crypto";
import { splitSpoken } from "@/shared/spoken-split";

/** The intro fills {greeting} in the browser, so every spoken variant is noted too. */
const GREETINGS = ["Good morning", "Good afternoon", "Good evening"];
const MAX_LEN = 2000;

export const hashText = (t: string) => createHash("sha256").update(t.trim()).digest("hex");

/** Every speakable string inside a response, hashed. Pure. */
export function collectHashes(payload: unknown): Set<string> {
  const out = new Set<string>();
  // Each sentence part is noted too: the browser may voice a long line one sentence at a time.
  const add = (s: string) => {
    if (!s.trim() || s.length > MAX_LEN) return;
    out.add(hashText(s));
    const parts = splitSpoken(s);
    if (parts.length > 1) parts.forEach((p) => out.add(hashText(p)));
  };
  const walk = (v: unknown): void => {
    if (typeof v === "string") {
      add(v);
      if (v.includes("{greeting}")) for (const g of GREETINGS) add(v.replaceAll("{greeting}", g));
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(payload);
  return out;
}

// Small per-copy cache in front of the table.
const local = new Map<string, Set<string>>();
function mem(userId: string): Set<string> {
  let b = local.get(userId);
  if (!b) {
    b = new Set();
    local.set(userId, b);
    if (local.size > 500) local.delete(local.keys().next().value as string);
  }
  if (b.size > 4000) b.clear();
  return b;
}

async function admin() {
  return (await import("@/integrations/supabase/client.server")).supabaseAdmin;
}

/** Note every string inside a response about to be sent to this user. Never throws. */
export async function noteShown(userId: string, payload: unknown): Promise<void> {
  const b = mem(userId);
  const fresh = [...collectHashes(payload)].filter((h) => !b.has(h));
  if (!fresh.length) return;
  fresh.forEach((h) => b.add(h));
  try {
    const db = await admin();
    const now = new Date().toISOString();
    const { error } = await db
      .from("voice_shown")
      .upsert(fresh.map((text_hash) => ({ user_id: userId, text_hash, noted_at: now })), { onConflict: "user_id,text_hash" });
    if (error) console.warn("voice ledger save failed", error.message);
  } catch (e) {
    console.warn("voice ledger save failed", e instanceof Error ? e.message : e);
  }
}

/** True when this exact text (trimmed) was sent to this user. */
export async function wasShown(userId: string, text: string): Promise<boolean> {
  const h = hashText(text);
  if (local.get(userId)?.has(h)) return true;
  try {
    const db = await admin();
    const { data } = await db.from("voice_shown").select("text_hash").eq("user_id", userId).eq("text_hash", h).maybeSingle();
    if (data) mem(userId).add(h);
    return !!data;
  } catch {
    return false;
  }
}
