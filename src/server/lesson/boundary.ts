/** Which word to echo back in the personal-boundary line ("I can't be anyone's {role}"). */
export function boundaryRole(text: string): string {
  const m = text.toLowerCase().match(/\b(wife|husband|girlfriend|boyfriend|lover|bae|babe|friend)\b/);
  return m?.[1] ?? "friend";
}
