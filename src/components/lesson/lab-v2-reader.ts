import { noteActivity } from "@/lib/music";
// Reads Gradient Lab v2's screen from outside (same-origin frame). Never changes the lab.
export type V2Read = { screen: number; fields: Record<string, string>; sliders: { m?: number; c?: number }; choice: number | null };

export function v2Screen(win: Window | null | undefined): number {
  try { return Number(win?.location.hash.slice(1)) || 0; } catch { return 0; }
}

/** Her answer as shown on the lab's screen. `choice` is the last option she tapped (the lab clears it after a wrong check). */
export function readV2(frame: HTMLIFrameElement | null, lastChoice: number | null): V2Read | null {
  try {
    const doc = frame?.contentDocument; if (!doc) return null;
    const fields: Record<string, string> = {};
    doc.querySelectorAll<HTMLInputElement>("input[type=text]").forEach((i) => { if (i.id) fields[i.id.slice(0, 20)] = i.value.slice(0, 20); });
    const sliders: V2Read["sliders"] = {};
    doc.querySelectorAll<HTMLInputElement>("input[type=range]").forEach((i) => {
      const l = i.getAttribute("aria-label") ?? "";
      if (l.startsWith("Gradient")) sliders.m = Number(i.value); else if (l.startsWith("Y-intercept")) sliders.c = Number(i.value);
    });
    const sel = [...doc.querySelectorAll(".choice")].findIndex((b) => b.classList.contains("selected"));
    return { screen: v2Screen(frame?.contentWindow), fields, sliders, choice: sel >= 0 ? sel : lastChoice };
  } catch { return null; }
}

/** Remembers the option she tapped, by listening on the lab's document (no lab code is touched). */
export function watchV2Choices(frame: HTMLIFrameElement | null, onPick: (i: number) => void): () => void {
  try {
    const doc = frame?.contentDocument; if (!doc) return () => undefined;
    const h = (e: Event) => {
      const b = (e.target as Element | null)?.closest?.(".choice"); if (!b) return;
      onPick([...doc.querySelectorAll(".choice")].indexOf(b));
    };
    const act = () => noteActivity();
    doc.addEventListener("click", h, true);
    const evs = ["pointerdown", "pointerup", "click", "touchend", "keydown"];
    evs.forEach((e) => doc.addEventListener(e, act, true));
    return () => { doc.removeEventListener("click", h, true); evs.forEach((e) => doc.removeEventListener(e, act, true)); };
  } catch { return () => undefined; }
}

/** Our page already shows the logo, and a tap outside the "Leave" box closes it (via the lab's own Escape). Applied from outside; lab files untouched. */
export function dressV2(frame: HTMLIFrameElement | null): () => void {
  try {
    const doc = frame?.contentDocument; if (!doc) return () => undefined;
    if (!doc.getElementById("ul-dress")) {
      const s = doc.createElement("style"); s.id = "ul-dress";
      // Our one X replaces its exit button.
      s.textContent = ".header .brand, .header .divider, #exit { display: none !important; }";
      doc.head.append(s);
    }
    const h = (e: Event) => {
      if ((e.target as Element | null)?.id !== "scrim") return;
      if (doc.querySelector(".modal #modal-title")?.textContent?.trim() !== "Leave Gradient Lab?") return;
      doc.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    };
    const act = () => noteActivity();
    doc.addEventListener("click", h, true);
    const evs = ["pointerdown", "pointerup", "click", "touchend", "keydown"];
    evs.forEach((e) => doc.addEventListener(e, act, true));
    return () => { doc.removeEventListener("click", h, true); evs.forEach((e) => doc.removeEventListener(e, act, true)); };
  } catch { return () => undefined; }
}

/** Calls back once each time the lab opens its own "You got it!" box (a modal with the success line). */
export function watchV2Wins(frame: HTMLIFrameElement | null, onWin: () => void): () => void {
  try {
    const doc = frame?.contentDocument; if (!doc) return () => undefined;
    const seen = new WeakSet<Element>();
    const o = new MutationObserver(() => {
      const m = doc.querySelector(".modal");
      if (m && !seen.has(m) && m.querySelector("p.success")) { seen.add(m); onWin(); }
    });
    o.observe(doc.body, { childList: true });
    return () => o.disconnect();
  } catch { return () => undefined; }
}
