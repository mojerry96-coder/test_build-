import confetti from "canvas-confetti";

const COLOURS = ["#F2B42A", "#0A66D2", "#FFFFFF", "#16A34A", "#E3262B"];

/** Confetti burst from a specific element, plus smaller bursts from both bottom corners. */
export function burstFromElement(el: HTMLElement | null, reducedMotion: boolean) {
  if (reducedMotion) return;
  let origin = { x: 0.5, y: 0.5 };
  if (el) {
    const r = el.getBoundingClientRect();
    origin = {
      x: (r.left + r.width / 2) / window.innerWidth,
      y: (r.top + r.height / 2) / window.innerHeight,
    };
  }
  confetti({ particleCount: 150, spread: 75, origin, colors: COLOURS });
  confetti({ particleCount: 40, angle: 60, spread: 55, origin: { x: 0, y: 1 }, colors: COLOURS });
  confetti({ particleCount: 40, angle: 120, spread: 55, origin: { x: 1, y: 1 }, colors: COLOURS });
}

/** Big celebratory shower for the complete screen. */
export function bigShower(reducedMotion: boolean) {
  if (reducedMotion) return;
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({ particleCount: 6, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors: COLOURS });
    confetti({ particleCount: 6, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors: COLOURS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}
