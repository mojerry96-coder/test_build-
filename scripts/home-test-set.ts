// Runs Fitila's Home test set against the real engine and prints intent, action and reply for each.
// Usage: bun ./scripts/home-test-set.ts <student-user-id>
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../src/integrations/supabase/types";
import { handleHome, ensureConversation } from "../src/server/home/agent.server";

const admin = createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_SERVICE_ROLE_KEY"]!, { auth: { persistSession: false } });
const userId = process.argv[2]!;
const SET: [string, "tutor" | "quiz"][] = [
  ["teach me gradient", "tutor"], ["quiz me", "quiz"], ["quiz me on graphs", "tutor"],
  ["solve this: find the gradient of (1, 4) and (5, 12)", "tutor"], ["I can't study tomorrow", "tutor"],
  ["add more algebra to my plan", "tutor"], ["how am I doing?", "tutor"], ["what is a gradient?", "tutor"],
  ["teach me chemistry", "tutor"], ["how far", "tutor"], ["who won the match", "tutor"], ["asdfgh", "tutor"], ["I want to learn maths", "tutor"],
];
const conv = await ensureConversation(admin, userId, null, "test set");
for (const [text, mode] of SET) {
  const t0 = Date.now();
  const r = await handleHome(admin, userId, false, { kind: "text", text, mode }, conv);
  console.log(JSON.stringify({ text, mode, intent: r.intent, by: r.source, action: r.actionType, outcome: r.outcome, reply: r.lines.join(" "), buttons: r.buttons.map((b) => b.label), opens: r.navigate?.to ?? null, options: r.options?.map((o) => `${o.num} ${o.title}${o.available ? "" : " (soon)"}`), ms: Date.now() - t0 }));
}
try { await handleHome(admin, userId, false, { kind: "option", num: 2 }, conv); console.log("option 2 WRONGLY opened"); } catch (e) { console.log("option 2 refused:", (e as Error).message); }
const opt = await handleHome(admin, userId, false, { kind: "option", num: 1 }, conv);
console.log(JSON.stringify({ tap: "option 1", reply: opt.lines.join(" "), opens: opt.navigate }));
