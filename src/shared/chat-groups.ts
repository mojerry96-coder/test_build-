// Chat display helpers: grouping consecutive messages and keeping maths on one line.
export const GROUP_GAP_MS = 60_000;

export type Groupable = { from: "tutor" | "student" | "divider"; at?: number | undefined };

/** For each message: is it the first of its group (shows the avatar and tail)? */
export function groupStarts<T extends Groupable>(msgs: T[], gap = GROUP_GAP_MS): boolean[] {
  return msgs.map((m, i) => {
    if (m.from === "divider") return true;
    const p = msgs[i - 1];
    if (!p || p.from !== m.from) return true;
    if (m.at != null && p.at != null && m.at - p.at > gap) return true;
    return false;
  });
}

const NB = "\u00A0";
const OPS = "=+−×÷<>≤≥";

/**
 * Glue maths expressions together with non-breaking spaces so they never wrap mid-expression:
 * spaces next to an operator, and between a number/bracket and an operator.
 */
export function keepMathsTogether(text: string): string {
  return text
    .replace(new RegExp(` ([${OPS}]|-(?= )) `, "g"), `${NB}$1${NB}`)
    .replace(new RegExp(`([${OPS}])${NB}?\\s(?=[\\d(xy])`, "g"), `$1${NB}`);
}
