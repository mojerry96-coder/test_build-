import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePress } from "@/components/home/SubjectCard";
import type { QuestRow } from "@/shared/quests-display";
import m from "@/assets/quests/m.png.asset.json";
import d from "@/assets/quests/d.png.asset.json";
import half from "@/assets/quests/half.png.asset.json";

const IMG = { m: [m, 33, 23], d: [d, 22, 32], half: [half, 30, 23] } as const;

export function QuestBreadcrumb({ subject, chapter }: { subject: string; chapter: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      <Link to="/" className="btn-soft -my-3 inline-flex h-11 shrink-0 items-center text-crumb hover:underline">Home</Link>
      <ChevronRight className="h-4 w-4 shrink-0 text-crumb" aria-hidden />
      <Link to="/$subject" params={{ subject }} className="btn-soft -my-3 inline-flex h-11 shrink-0 items-center text-crumb hover:underline">Mathematics</Link>
      <ChevronRight className="h-4 w-4 shrink-0 text-crumb" aria-hidden />
      <span aria-current="page" className="truncate font-bold text-nav-active">{chapter}</span>
    </nav>
  );
}

export function QuestCard({ row, onOpen }: { row: QuestRow; onOpen?: (() => void) | undefined }) {
  const n = String(Math.min(row.num, 4)).padStart(2, "0");
  const num = String(row.num).padStart(2, "0");
  const vars = { "--q": `var(--q-${n})`, "--q-ink": `var(--q-${n}-ink)` } as CSSProperties;
  const press = usePress(onOpen ?? (() => {}));
  const open = row.open && !!onOpen;
  return (
    <article style={vars} aria-label={open ? row.name : `${row.name}, locked`}
      className={cn("q-card flex min-h-[176px] overflow-hidden rounded-[16px] bg-card", open ? "q-card-open" : "q-card-locked")}>
      <div className="q-art relative w-[112px] shrink-0 sm:w-[148px]" aria-hidden>
        <span className="q-ink absolute left-3 top-3 font-display text-sm font-bold">{num}°</span>
        {!row.open && <span className="absolute right-2.5 top-2.5 grid h-7 w-7 place-items-center rounded-full bg-card"><Lock className="h-3.5 w-3.5 text-ink-3" /></span>}
        <span className="q-ring absolute left-1/2 top-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <span className="q-dot absolute left-[calc(50%+42px)] top-[calc(50%-34px)] h-1.5 w-1.5 rounded-full" />
        <svg className="q-path absolute bottom-3 left-3 h-8 w-[110px]" viewBox="0 0 110 32" fill="none"><path d="M2 30 C 30 10, 60 32, 108 4" strokeDasharray="2 4" /></svg>
        <span className="q-tile absolute left-1/2 top-1/2 grid h-[64px] w-[64px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[16px] sm:h-[72px] sm:w-[72px]">
          {row.glyph === "xy"
            ? <span className="font-display text-2xl font-bold text-surface-fixed">xy</span>
            : <span className="q-glyph block" style={{ width: IMG[row.glyph][1], height: IMG[row.glyph][2], maskImage: `url(${IMG[row.glyph][0].url})`, WebkitMaskImage: `url(${IMG[row.glyph][0].url})` }} />}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4 sm:px-5 sm:pb-[18px] sm:pt-5">
        <p className="q-ink text-[11px] font-extrabold uppercase tracking-[0.6px]">Quest {num}</p>
        <h2 className="mt-1 truncate font-display text-lg font-semibold leading-tight text-brand">{row.name}</h2>
        <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-ink-2">{row.description}</p>
        <div className="mt-auto pt-4">
          {open
            ? <button type="button" onClick={press.run} data-pressed={press.pressed || undefined}
                className="q-enter h-11 w-full rounded-[10px] text-[13px] font-bold text-primary-foreground">Enter Quest</button>
            : <div className="grid h-10 w-full place-items-center rounded-[10px] border border-line text-[11px] font-semibold uppercase tracking-[0.6px] text-ink-3">Locked</div>}
        </div>
      </div>
    </article>
  );
}
