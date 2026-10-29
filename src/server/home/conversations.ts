// Pure: which chats show in Chat history (tested).
import type { ConversationSummary } from "@/shared/contracts/conversations";
import { DEFAULT_BANNED_WORDS, findBannedWords } from "@/shared/contracts/banned-words";

type Conv = { id: string; title: string | null; updated_at: string; created_at: string };
type Msg = { conversation_id: string | null; role: string; text: string; created_at: string };

// Every chat she wrote in stays listed, even after "Start again" (like ChatGPT/Claude history).
export function summarize(convs: Conv[], msgs: Msg[], max = 50): ConversationSummary[] {
  return convs
    .map((c) => {
      const first = msgs.filter((m) => m.conversation_id === c.id && m.role === "student" && m.text.trim()).sort((a, b) => a.created_at.localeCompare(b.created_at))[0];
      if (!first) return null; // she never typed or tapped in it
      const raw = (c.title?.trim() || titleCase(first.text.trim())).replace(/\s+/g, " ");
      return { id: c.id, title: raw.length > 60 ? `${raw.slice(0, 57)}…` : raw, updatedAt: c.updated_at };
    })
    .filter((x): x is ConversationSummary => !!x)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, max);
}

// ---- Chat titles (short summaries, like ChatGPT/Claude) ----
type TMsg = { role: string; text: string; meta?: Record<string, unknown> | null };
const PLAN = new Set(["start_plan", "view_plan", "change_plan", "edit_plan", "plan_yes"]);
const GREETING = /^(hi+|hey+|hello+|good (morning|afternoon|evening)|how are you|what'?s up|sup|yo)\b[\s,!.?]*(fiti|there|tutor)?[\s,!.?]*(how are you)?[\s,!.?]*$/i;
const SMALL = new Set(["a", "an", "and", "as", "at", "by", "for", "in", "of", "on", "or", "the", "to", "with"]);

export function titleCase(s: string): string {
  return s.trim().replace(/\s+/g, " ").split(" ").map((w, i) => (i > 0 && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
}
const clip = (s: string, n = 48) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);

/** Title from what happened in the chat (newest event wins), or null when nothing named it. */
export function chatTitle(msgs: TMsg[]): string | null {
  let title: string | null = null;
  msgs.forEach((m, i) => {
    if (m.role !== "tutor") return;
    const meta = m.meta ?? {};
    const topic = typeof meta["topicTitle"] === "string" ? (meta["topicTitle"] as string) : null;
    if (meta["outcome"] === "quiz_built") title = `Quiz: ${topic ?? "Practice"}`;
    else if (meta["outcome"] === "opened" && topic) title = topic;
    else if (meta["outcome"] === "opened" && meta["action"] === "open_option") { const s = msgs[i - 1]; if (s?.role === "student" && s.text.trim()) title = s.text.trim(); }
    else if (!title && PLAN.has(String(meta["intent"] ?? ""))) title = "My Study Plan";
    else if (!title && meta["intent"] === "onboard") title = "Getting to Know Fiti";
  });
  return title ? clip(title) : null;
}

/** Her first message that isn't just a greeting, cleaned up; greetings only as a last resort. */
export function firstMessageTitle(msgs: TMsg[]): string | null {
  const said = msgs.filter((m) => m.role === "student" && m.text.trim()).map((m) => m.text.trim());
  const pick = said.find((t) => !GREETING.test(t)) ?? said[0];
  return pick ? clip(titleCase(pick.replace(/[?!.]+$/, ""))) : null;
}

/** An AI-written title is used only when short, clean, and adds no numbers she didn't type. */
export function checkChatTitle(t: string, studentText: string, banned?: readonly string[]): boolean {
  const s = t.trim();
  const words = s.split(/\s+/).filter(Boolean);
  if (!s || words.length < 2 || words.length > 6 || s.length > 48) return false;
  if (/[\n{}<>\[\]"`]/.test(s)) return false;
  if (findBannedWords(s, banned ?? DEFAULT_BANNED_WORDS).length) return false;
  const nums = (x: string) => x.match(/\d+(?:[./]\d+)?/g) ?? [];
  const mine = new Set(nums(studentText));
  return nums(s).every((n) => mine.has(n));
}
