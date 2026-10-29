// The chat may only show a script segment's words. Anything that looks like raw item data
// (JSON, braces, quoted keys, internal field names or ids) is replaced by an approved fallback line.
import type { Script } from "./script";

const INTERNAL_NAMES = /\b(option_?id|item_?id|across_direction|across_distance|updown_direction|updown_distance|answer_key|accepted_forms|worked_solution|decision_key|skill_ids?|misconception_id)\b/i;
const RAW = /[{}[\]]|"[^"]*"\s*:|\b[a-z]+(?:_[a-z0-9]+)+\b|\b[A-Z]{2,}\d*_[A-Z0-9_]+\b/;

export function looksRaw(text: string): boolean {
  return RAW.test(text) || INTERNAL_NAMES.test(text);
}

/** Lines safe to show in the chat. If any line looks raw, the whole message becomes the fallback. */
export function safeChatLines(lines: Script, fallback: Script, onBlocked?: (text: string) => void): Script {
  const bad = lines.find((l) => looksRaw(l.text));
  if (!bad) return lines;
  onBlocked?.(bad.text);
  return fallback.filter((l) => !looksRaw(l.text));
}

type Opt = { id: string; label: string };
type Field = { id: string; label: string; options?: Opt[] | null };
type Resp = { value?: string | undefined; optionId?: string | undefined; fields?: Record<string, string> | undefined; text?: string | undefined };

/** Plain words for a student's answer, as she saw it on screen (labels, never ids). */
export function answerWords(resp: Resp, item: { options?: Opt[] | null; fields?: Field[] | null }): string {
  if (resp.text) return resp.text;
  if (resp.optionId) return item.options?.find((o) => o.id === resp.optionId)?.label ?? "";
  if (resp.fields) {
    return (item.fields ?? []).map((f) => {
      const v = resp.fields![f.id];
      if (v == null || v === "") return "";
      return `${f.label} ${f.options?.find((o) => o.id === v)?.label ?? v}`;
    }).filter(Boolean).join(", ");
  }
  return resp.value ?? "";
}
