/** Only plain sentences reach a student; anything that looks like computer text becomes the friendly line. */
export const FRIENDLY_ERROR = "Something went wrong. Please try again.";
export function friendlyError(msg: string | null | undefined): string {
  const m = (msg ?? "").trim();
  if (!m || m.length > 160 || /[{}[\]"<>=_]|\b(undefined|null|NaN|Error|TypeError|fetch|status|expected)\b/i.test(m)) return FRIENDLY_ERROR;
  return m;
}
