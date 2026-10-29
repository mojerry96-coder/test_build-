// Praise words for a right step: rotate through the approved list, never the same word twice in a row.
// Now and then (every `every`-th win) a step with a named strategy gets it added: "Nice! You multiplied first."
export function nextPraise(last: string | null, list: string[], opts: { strategy?: string | null; count?: number; every?: number; pick?: number } = {}): string {
  const pool = list.filter((w) => w && w !== last);
  const from = pool.length ? pool : list;
  if (!from.length) return "";
  const i = Math.floor((opts.pick ?? Math.random()) * from.length) % from.length;
  const word = from[i]!;
  const every = opts.every ?? 3;
  return opts.strategy && (opts.count ?? 0) % every === every - 1 ? `${word} ${opts.strategy}` : word;
}
