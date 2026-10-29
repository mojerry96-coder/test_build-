import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = readFileSync(`${process.cwd()}/src/styles.css`, "utf8");
const block = css.match(/\n\.dark \{([\s\S]*?)\n\}/)![1]!;
const tok0 = (n: string) => block.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
const rootHex = (n: string) => css.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
const mixHex = (a: string, b: string, p: number) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p)).toString(16).padStart(2, "0")).join("");
// __tileNN = chapter colour at 18% on the dark card (the dark art area).
const tok = (n: string) => (n.startsWith("__tile") ? mixHex(rootHex(`ch-${n.slice(6)}`), tok0("card"), 0.18) : tok0(n));
const lum = (hex: string) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0]! + 0.7152 * c[1]! + 0.0722 * c[2]!;
};
const ratio = (a: string, b: string) => { const x = Math.max(lum(a), lum(b)), y = Math.min(lum(a), lum(b)); return (x + 0.05) / (y + 0.05); };

// [text token, background token, minimum]
const pairs: [string, string, number][] = [];
for (const bg of ["page", "card", "topbar", "search"]) {
  pairs.push(["text-primary", bg, 4.5], ["text-secondary", bg, 4.5], ["text-tertiary", bg, 4.5]);
}
for (const fg of ["heading-dark", "section-heading", "card-meta", "card-desc", "current-title", "crumb"]) pairs.push([fg, "card", 4.5], [fg, "page", 4.5]);
pairs.push(["badge-ink", "badge-bg", 4.5]);
for (let i = 1; i <= 8; i++) {
  const n = String(i).padStart(2, "0");
  pairs.push([`ch-${n}-ink`, `__tile${n}`, 4.5]);
}
pairs.push(["text-primary", "banner", 4.5], ["banner-sub", "banner", 4.5], ["nav-active", "topbar", 4.5], ["muted-foreground", "popover", 4.5], ["muted-foreground", "fh-page", 4.5], ["fh-heading", "fh-card", 4.5], ["fh-heading", "fh-page", 4.5], ["fh-btn-off-ink", "fh-btn-off", 4.5], ["vl-conf-ink", "vl-conf-bg", 4.5], ["vl-conf-on-ink", "vl-conf-on-bg", 4.5], ["vl-cta-ink", "vl-cta", 4.5], ["vl-watch", "fh-card", 4.5], ["vl-q", "fh-card", 4.5], ["fh-ink", "fh-card", 4.5]);

describe("dark mode contrast (WCAG AA)", () => {
  for (const [fg, bg, min] of pairs) {
    it(`${fg} on ${bg} ≥ ${min}`, () => { console.log(`${fg} on ${bg}: ${ratio(tok(fg), tok(bg)).toFixed(2)}:1`); expect(ratio(tok(fg), tok(bg))).toBeGreaterThanOrEqual(min); });
  }
  it("white text on dark primary buttons ≥ 4.5", () => expect(ratio("#FFFFFF", tok("primary"))).toBeGreaterThanOrEqual(4.5));
  it("banner eyebrow on dark banner ≥ 4.5", () => expect(ratio(tok("banner-eyebrow"), tok("banner"))).toBeGreaterThanOrEqual(4.5));
});

const root = css.match(/:root \{([\s\S]*?)\n\}/)![1]!;
const rootTok = (n: string) => root.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
const mix = (a: string, b: string, p: number) => "#" + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * p + parseInt(b.slice(i, i + 2), 16) * (1 - p)).toString(16).padStart(2, "0")).join("");
const SUBJECTS = ["mathematics", "english", "economics", "accounting", "chemistry", "literature", "biology", "government", "physics"];

describe("dark subject icons reach 3:1 on their tile", () => {
  for (const k of SUBJECTS) {
    it(k, () => {
      const base = k === "mathematics" ? rootTok("subject-math") : rootTok(`subject-${k}`);
      const tile = mix(base, tok("card"), 0.18);
      const r = ratio(rootTok(`subject-${k}-icon-dark`), tile);
      console.log(`${k}: ${r.toFixed(2)}:1`);
      expect(r).toBeGreaterThanOrEqual(3);
    });
  }
});

describe("dark lesson/shared text pairs (AA)", () => {
  const p: [string, string][] = [["foreground", "background"], ["card-foreground", "card"], ["muted-foreground", "card"], ["muted-foreground", "background"], ["accent-foreground", "accent"], ["secondary-foreground", "secondary"], ["popover-foreground", "popover"]];
  for (const [f, b] of p) it(`${f} on ${b}`, () => expect(ratio(tok(f), tok(b))).toBeGreaterThanOrEqual(4.5));
  it("white on primary", () => expect(ratio("#FFFFFF", tok("primary"))).toBeGreaterThanOrEqual(4.5));
});

describe("cleanup contrast rules", () => {
  it("dark cards stand apart from the page (≥ 1.25:1)", () => expect(ratio(tok("card"), tok("page"))).toBeGreaterThanOrEqual(1.25));
  it("dark card border ≥ 3:1 on page and card", () => {
    expect(ratio(tok("border"), tok("page"))).toBeGreaterThanOrEqual(3);
    expect(ratio(tok("border"), tok("card"))).toBeGreaterThanOrEqual(3);
  });
  it("light CHAPTER 03 and 04 labels ≥ 4.5:1 on white", () => {
    expect(ratio(rootHex("ch-03-ink"), "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
    expect(ratio(rootHex("ch-04-ink"), "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });
  it("light banner small line ≥ 4.5:1 where the text sits (left half of the gradient)", () => {
    expect(ratio(rootHex("chapter-banner-sub"), mixHex(rootHex("chapter-banner-from"), rootHex("chapter-banner-to"), 0.5))).toBeGreaterThanOrEqual(4.5);
  });
});

describe("Learning Hub subject labels ≥ 4.5:1 on their card", () => {
  for (const k of ["math", "eng", "bio", "chm", "eco", "gov", "acc", "lit", "phy"]) {
    it(`light ${k}`, () => expect(ratio(rootHex(`hub-${k}-ink`), rootHex(`hub-${k}`))).toBeGreaterThanOrEqual(4.5));
    it(`dark ${k}`, () => expect(ratio(tok0(`hub-${k}-ink`), tok0(`hub-${k}`))).toBeGreaterThanOrEqual(4.5));
  }
});

describe("quick fix dark mode contrast (WCAG AA)", () => {
  const darkQf = [...css.matchAll(/\n\.dark \{([^}]*--qf-[^}]*)\}/g)].map((m) => m[1]).join(" ");
  const q = (n: string) => (darkQf.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`)) ?? css.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`)))![1]!;
  const qfPairs: [string, string][] = [["wb-navy", "qf-bubble-bg"], ["qf-ctrl-ink", "qf-ctrl-bg"], ["qf-placeholder", "qf-input-bg"], ["qf-input-ink", "qf-input-bg"], ["qf-check-ink", "qf-check-bg"]];
  for (const [fg, bg] of qfPairs) it(`${fg} on ${bg}`, () => { expect(ratio(q(fg), q(bg))).toBeGreaterThanOrEqual(4.5); });
});

describe("quick fix light mode Check button", () => {
  const rootQf = css.match(/\n:root \{ --qf-stage[^}]*\}/)![0];
  const q = (n: string) => rootQf.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
  it("label readable on the button", () => { expect(ratio(q("qf-check-ink"), q("qf-check-bg"))).toBeGreaterThanOrEqual(4.5); });
});

const prLine = css.match(/\n\.dark \{ --rise:[^\n]*/)![0];
const pr = (n: string) => prLine.match(new RegExp(`--${n}: (#[0-9A-Fa-f]{6});`))![1]!;
describe("Practise dark mode (AA)", () => {
  it("question text on dark card ≥ 4.5", () => expect(ratio(pr("pr-ink"), tok("fh-card"))).toBeGreaterThanOrEqual(4.5));
  it("muted labels on dark card ≥ 4.5", () => expect(ratio(pr("pr-muted"), tok("fh-card"))).toBeGreaterThanOrEqual(4.5));
  it("graph axis visible on board card ≥ 3", () => expect(ratio(pr("board-axis"), pr("board-card"))).toBeGreaterThanOrEqual(3));
  it("grid lines visible on board card ≥ 1.8", () => expect(ratio(pr("board-line"), pr("board-card"))).toBeGreaterThanOrEqual(1.8));
});
