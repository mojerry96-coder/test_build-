// Short-lived cache (60 s per server copy) for rarely-changing reads: rules, approved fallback lines, practice item ids.
// Cleared at once by content import on this copy; other copies pick up new content within a minute.
const TTL_MS = 60_000;
const store = new Map<string, { at: number; v: Promise<unknown> }>();

export function cached<T>(key: string, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.v as Promise<T>;
  const v = load().catch((e) => { store.delete(key); throw e; });
  store.set(key, { at: Date.now(), v });
  return v;
}

export function clearWordingCache(): void { store.clear(); }
