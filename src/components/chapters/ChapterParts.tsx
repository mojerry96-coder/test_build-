import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePress } from "@/components/home/SubjectCard";
import { decoFor, type ChapterRow } from "@/shared/chapters-display";
import bannerTutor from "@/assets/tutor/wave.png.asset.json";
import xy from "@/assets/chapters/xy.png.asset.json";
import infinity from "@/assets/chapters/infinity.png.asset.json";
import pir2 from "@/assets/chapters/pir2.png.asset.json";
import triangle from "@/assets/chapters/triangle.png.asset.json";
import sin from "@/assets/chapters/sin.png.asset.json";
import integral from "@/assets/chapters/integral.png.asset.json";

const IMG = { xy, infinity, pir2, triangle, sin, integral } as const;
// Visual sizes so image and text symbols read at the same height (Afacad Bold 28 glyph).
const IMG_SIZE: Record<keyof typeof IMG, [number, number]> = {
  xy: [76, 44], infinity: [30, 20], pir2: [52, 30], triangle: [28, 25], sin: [50, 30], integral: [17, 30],
};

export function Breadcrumb() {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm">
      <Link to="/" className="btn-soft -my-3 inline-flex h-11 items-center text-crumb hover:underline">Home</Link>
      <ChevronRight className="h-4 w-4 text-crumb" aria-hidden />
      <span aria-current="page" className="font-bold text-nav-active">Mathematics</span>
    </nav>
  );
}

export function bannerLine(step: number, topic: string) {
  if (step <= 0) return `Start ${topic}, you're at 0%.`;
  const pct = Math.round(((step - 1) / 8) * 100);
  return pct > 0 ? `You're already ${pct}% through ${topic}.` : `You're on step ${step} of 8 in ${topic}.`;
}

/** step 0 = not started yet: the banner offers Start instead of Continue. */
export function ChapterBanner({ chapter, topic, step, onContinue }: { chapter: string; topic: string; step: number; onContinue: () => void }) {
  const press = usePress(onContinue);
  const fresh = step <= 0;
  return (
    <section aria-label="Continue learning"
      className="ch-banner relative mt-6 flex flex-col gap-4 overflow-hidden rounded-[22px] py-5 pl-[120px] pr-5 shadow-[0_18px_40px_-24px_rgb(2_64_100/0.55)] md:h-[144px] md:flex-row md:items-center md:gap-6 md:py-0 md:pl-[190px] md:pr-[56px]">
      <div className="pointer-events-none absolute bottom-0 left-2 h-[110px] w-[96px] md:left-[18px] md:h-[142px] md:w-[130px]">
        <img src={bannerTutor.url} alt="" width={116} height={151} className="h-full w-full object-cover object-top" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="truncate font-display text-[22px] font-semibold leading-tight text-primary-foreground md:text-[27px]">{fresh ? `Let's start ${chapter}` : `Let's continue ${chapter}`}</h2>
        <p className="truncate text-[13px] text-chapter-banner-sub md:max-w-[420px]">{bannerLine(step, topic)}</p>
      </div>
      <span aria-hidden className="pointer-events-none absolute hidden select-none font-display font-bold text-primary-foreground/10 md:block" style={{ left: "68%", top: 6, fontSize: 30, transform: "rotate(-8deg)" }}>x²</span>
      <span aria-hidden className="pointer-events-none absolute hidden select-none font-display font-bold text-primary-foreground/10 md:block" style={{ left: "76%", top: 44, fontSize: 45, transform: "rotate(10deg)" }}>π</span>
      <span aria-hidden className="pointer-events-none absolute hidden select-none font-display font-bold text-primary-foreground/10 lg:block" style={{ left: "58%", top: 60, fontSize: 25, transform: "rotate(-12deg)" }}>∠</span>
      <button type="button" onClick={press.run} data-pressed={press.pressed || undefined}
        className="btn-cta relative h-12 w-full shrink-0 rounded-full bg-surface-fixed text-[17px] font-bold text-cta-ink shadow-[0_5px_0_var(--hub-cta-edge)] transition-transform hover:-translate-y-0.5 active:translate-y-[2px] motion-reduce:transition-none md:h-[54px] md:w-[204px]">
        I&rsquo;m Ready
      </button>
    </section>
  );
}

export function ChapterCard({ row, onOpen }: { row: ChapterRow; onOpen?: (() => void) | undefined }) {
  const n = String(row.num).padStart(2, "0");
  const [bl, tr] = decoFor(row.num);
  const vars = { "--ch": `var(--ch-${n})`, "--ch-ink": `var(--ch-${n}-ink)` } as CSSProperties;
  const body = (
    <>
      <div className="ch-art relative h-[104px] overflow-hidden rounded-t-[14px]">
        <span className="ch-label absolute left-[18px] top-3 text-[11px] font-extrabold uppercase tracking-[0.6px]">Chapter {n}</span>
        {!row.open && <Lock className="absolute right-3 top-3 h-4 w-4 text-ink-3" aria-hidden />}
        <span className="ch-ring absolute left-1/2 top-1/2 h-[94px] w-[94px] -translate-x-1/2 -translate-y-1/2 rounded-full" aria-hidden />
        <span className="ch-deco absolute bottom-6 left-[64px] text-sm" style={{ transform: "rotate(-17deg)" }} aria-hidden>{bl}</span>
        <span className="ch-deco absolute right-[54px] top-5 text-lg" style={{ transform: "rotate(14deg)" }} aria-hidden>{tr}</span>
        <span className="absolute inset-0 grid place-items-center" aria-hidden><span className="grid place-items-center" style={{ transform: "rotate(-4deg)" }}>
          {row.image
            ? <span className="ch-symbol-img block" style={{ width: IMG_SIZE[row.image][0] * 0.75, height: IMG_SIZE[row.image][1] * 0.75, maskImage: `url(${IMG[row.image].url})`, WebkitMaskImage: `url(${IMG[row.image].url})` }} />
            : <span className="ch-ink font-display text-[28px] font-bold leading-none">{row.symbol}</span>}
        </span></span>
      </div>
      <div className="px-[14px] pb-[14px] pt-3 text-left">
        <div className="flex h-5 items-center justify-between gap-2">
          <span className="text-xs font-bold text-card-meta">{row.open ? `${row.quests} quest${row.quests === 1 ? "" : "s"}` : ""}</span>
          {row.current && <span className="rounded-full bg-badge-bg px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.4px] text-badge-ink">Current</span>}
        </div>
        <p className={cn("mt-1 truncate font-display text-lg font-bold leading-tight", row.current ? "text-current-title" : "text-brand")}>{row.name}</p>
        <p className="mt-1 truncate text-[13px] text-card-desc">{row.description}</p>
      </div>
    </>
  );
  const cls = cn("ch-card block w-full overflow-hidden rounded-[15px] bg-card", row.current && "ch-card-current");
  return row.open && onOpen
    ? <OpenCard className={cls} label={row.name} onOpen={onOpen} style={vars}>{body}</OpenCard>
    : <div role="group" aria-label={`${row.name}, locked`} className={cn(cls, "ch-card-locked")} style={vars}>{body}</div>;
}

function OpenCard({ className, label, onOpen, style, children }: { className: string; label: string; onOpen: () => void; style: CSSProperties; children: React.ReactNode }) {
  const { pressed, run } = usePress(onOpen);
  return <button type="button" onClick={run} aria-label={label} data-pressed={pressed || undefined} className={cn(className, "ch-card-open")} style={style}>{children}</button>;
}
