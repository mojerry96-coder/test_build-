// Pure warm-up helpers: which questions she still needs, and a stable option order.

/** Keep only questions whose skills she has not already shown. */
export function pickWarmup(items: { id: string; skillIds: string[] }[], shown: Set<string>): string[] {
  return items.filter((i) => !i.skillIds.length || i.skillIds.some((s) => !shown.has(s))).map((i) => i.id);
}

function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Same seed, same order; different lessons get different orders. */
export function shuffleFor<T>(seed: string, list: T[]): T[] {
  const out = [...list];
  let h = hash(seed) || 1;
  for (let i = out.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0;
    const j = h % (i + 1);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

export type EvidenceRow = { id: string; skill_id: string | null; correct: boolean | null; strength: string | null; status: string | null;
  created_at: string; session_status: string | null; consent_basis: string | null };

/** Real evidence of a skill: "shown", or a right answer of strong/moderate strength, from a real lesson that wasn't abandoned or restarted. */
export function countsAsShown(e: EvidenceRow, resetAt: string | null): boolean {
  if (!e.skill_id) return false;
  if (e.consent_basis === "admin_preview" || e.session_status === "abandoned") return false;
  if (resetAt && e.created_at < resetAt) return false;
  return e.status === "shown" || (e.correct === true && (e.strength === "strong" || e.strength === "moderate"));
}

export type LeadKey = "doc" | "first" | "middle" | "last" | "only";
/** Which lead-in fits her real position among the questions she actually gets. */
export function leadKey(asked: string[], all: string[], index: number): LeadKey {
  if (asked.length === all.length && asked.every((id, i) => id === all[i])) return "doc";
  if (asked.length === 1) return "only";
  if (index === 0) return "first";
  return index === asked.length - 1 ? "last" : "middle";
}
