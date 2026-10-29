// Per-device display preferences (no personal data): text size, low-data mode, intro seen.
import { useEffect, useState } from "react";

export type TextSize = "sm" | "md" | "lg";
const SCALE: Record<TextSize, string> = { sm: "0.92", md: "1", lg: "1.15" };

/** Demo: text size and low-data choices are removed from the menu; old saved choices are cleared. */
function clearOld() { try { localStorage.removeItem("ul.textSize"); } catch { /* none */ } }
export function useTextSize() {
  const size: TextSize = "md";
  useEffect(() => { clearOld(); document.documentElement.style.setProperty("--text-scale", SCALE[size]); }, []);
  return [size, (_s: TextSize) => {}] as const;
}

const LOW_KEY = "ul.lowData";
/** Saved choice: "on" | "off" | null (never chosen: follow the connection). */
export function readLowDataChoice(): "on" | "off" | null {
  try { const v = localStorage.getItem(LOW_KEY); return v === "on" || v === "off" ? v : null; } catch { return null; }
}
/** Low-data mode is on when she switched it on, or when she never chose and the connection is slow. */
export function lowDataOn(choice: "on" | "off" | null, weak: boolean): boolean {
  return choice === "on" || (choice === null && weak);
}
export function setLowDataChoice(on: boolean) {
  try { localStorage.setItem(LOW_KEY, on ? "on" : "off"); } catch { /* none */ }
  window.dispatchEvent(new Event("ul-pref"));
}

/** [on, set, auto]: auto = turned on by itself because the connection is slow. */
export function useLowData() {
  const net = useNetwork();
  const [choice, setChoice] = useState<"on" | "off" | null>(null);
  useEffect(() => {
    const u = () => setChoice(readLowDataChoice());
    u(); window.addEventListener("ul-pref", u); return () => window.removeEventListener("ul-pref", u);
  }, []);
  const on = lowDataOn(choice, net.weak);
  return [on, setLowDataChoice, on && choice === null] as const;
}

/** Online status plus a weak-network guess from the browser's connection info. */
export function useNetwork() {
  const [state, setState] = useState<{ online: boolean; weak: boolean }>({ online: true, weak: false });
  useEffect(() => {
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string; saveData?: boolean; addEventListener?: (t: string, f: () => void) => void; removeEventListener?: (t: string, f: () => void) => void } }).connection;
    const update = () => {
      // Admin tools can force a network state for testing (admin preview only).
      let forced: string | null = null;
      try { forced = localStorage.getItem("ul.devNet"); } catch { /* none */ }
      setState({
        online: forced === "offline" ? false : navigator.onLine,
        weak: forced === "weak" || (!!conn && (conn.saveData === true || ["slow-2g", "2g"].includes(conn.effectiveType ?? ""))),
      });
    };
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("ul-pref", update);
    conn?.addEventListener?.("change", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("ul-pref", update);
      conn?.removeEventListener?.("change", update);
    };
  }, []);
  return state;
}
