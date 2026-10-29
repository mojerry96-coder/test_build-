import { isLessonPath } from "@/shared/routes";
import { useSyncExternalStore } from "react";

export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "ul-theme";
const EVT = "ul-theme-change";


export function getPref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch { return "system"; }
}
export function setPref(p: ThemePref) {
  try { if (p === "system") localStorage.removeItem(THEME_KEY); else localStorage.setItem(THEME_KEY, p); } catch { /* private mode */ }
  window.dispatchEvent(new Event(EVT));
}
export const resolve = (p: ThemePref): "light" | "dark" => (p === "system" ? "light" : p);

function subscribe(cb: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", cb);
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => { mq.removeEventListener("change", cb); window.removeEventListener(EVT, cb); window.removeEventListener("storage", cb); };
}
const snap = () => `${getPref()}:${resolve(getPref())}`;

export function useTheme() {
  const s = useSyncExternalStore(subscribe, snap, () => "system:light");
  const [pref, resolved] = s.split(":") as [ThemePref, "light" | "dark"];
  return { pref, resolved, setPref };
}

/** Runs in <head> before first paint, so dark mode never flashes. Lesson pages stay light until their dark design exists. */
export const isLightOnlyPath = (path: string) => isLessonPath(path);
export const THEME_BOOT_SCRIPT = `(function(){try{var v=localStorage.getItem("${THEME_KEY}");var d=v==="dark"||false;var g=location.pathname.split("/").filter(Boolean);if(((g.length===4||(g.length===5&&g[4]==="intro"))&&g[0]!=="admin")||g[0]==="lesson")d=false;var h=document.documentElement;h.dataset.theme=d?"dark":"light";h.classList.toggle("dark",d);}catch(e){}})();`;
