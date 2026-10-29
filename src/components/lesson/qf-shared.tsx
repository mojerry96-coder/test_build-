// Pieces shared by the quick fix and the Practise step, so both screens use one look (rebuilt from the simulation).
import { keepMathsTogether } from "@/shared/chat-groups";
import { splitNumbers } from "@/shared/question-numbers";

/** Raised primary blue button with the hover bounce. */
export const QF_PRIMARY = "hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish h-[50px] flex-1 rounded-full bg-fh-primary text-[16px] font-semibold text-fh-primary-ink shadow-[0_5px_0_var(--fh-primary-edge)] hover:bg-fh-primary hover:brightness-105 active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-primary-edge)]";
/** Outlined blue pill with the same bounce. */
export const QF_OUTLINE = "hdr-bounce [--bounce-edge:var(--fh-primary-edge)] squish rounded-full border-2 border-fh-primary bg-fh-card font-semibold text-fh-heading shadow-[0_4px_0_var(--fh-primary-edge)] active:translate-y-[3px] active:shadow-[0_1px_0_var(--fh-primary-edge)] disabled:opacity-60";

/** Text with its numbers in the question colour. */
export function QfNums({ text }: { text: string }) {
  return <>{splitNumbers(keepMathsTogether(text)).map((p, i) => p.num ? <span key={i} className="text-q-num">{p.text}</span> : <span key={i}>{p.text}</span>)}</>;
}

/** The two points named in a question, e.g. "(0, 1) and (2, 7)"; null unless exactly two are there. */
export function twoPoints(text: string): [[number, number], [number, number]] | null {
  const m = [...text.matchAll(/\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/g)].map((x) => [Number(x[1]), Number(x[2])] as [number, number]);
  return m.length === 2 ? [m[0]!, m[1]!] : null;
}
