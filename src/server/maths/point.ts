// Marks a "place the point" answer: her snapped point "x,y" against the hidden answer "x,y". Exact integers only.
export function parsePoint(v: string): [number, number] | null {
  const m = /^\s*\(?\s*(-?\d+)\s*,\s*(-?\d+)\s*\)?\s*$/.exec(v);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

export function pointMatches(value: string, answer: string, grid?: { x_max: number; y_max: number }): boolean {
  const p = parsePoint(value), a = parsePoint(answer);
  if (!p || !a) return false;
  if (grid && (p[0] < 0 || p[1] < 0 || p[0] > grid.x_max || p[1] > grid.y_max)) return false;
  return p[0] === a[0] && p[1] === a[1];
}
