import { onRestart } from "@/lib/restart-epoch";
import { homeTips, nextTip } from "@/shared/home-tips";
import { hush, useSay } from "@/lib/voice";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChartSpline, LayoutGrid, Lock, MessageSquareText, Music, NotebookText, Volume2, VolumeX, X } from "lucide-react";
import { onMusicPref, readMusicPref, setMusicPref } from "@/lib/music";
import { onSoundPref, playSound, readSoundPref, setSoundPref } from "@/lib/sound";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { InteractiveCard, LockedCard, RootXIcon, SubjectTile, usePress } from "@/components/home/SubjectCard";
import { SearchBox } from "@/components/home/SearchBox";
import { ThemeMenuItems } from "@/components/ThemeMenu";
import { RestartDialog } from "@/components/RestartDialog";

import logo from "@/assets/brand/logo.png.asset.json";
import logoDark from "@/assets/brand/logo-dark.png.asset.json";
import bannerTutor from "@/assets/tutor/banner-glow.png.asset.json";
import waveTutor from "@/assets/tutor/wave.png.asset.json";
import acc from "@/assets/subjects/acc.png.asset.json";
import bio from "@/assets/subjects/bio.png.asset.json";
import chm from "@/assets/subjects/chm.png.asset.json";
import eco from "@/assets/subjects/eco.png.asset.json";
import gov from "@/assets/subjects/gov.png.asset.json";
import lit from "@/assets/subjects/lit.png.asset.json";
import phy from "@/assets/subjects/phy.png.asset.json";
import type { HomeSubjectKey } from "@/lib/subjects";


type NavItem = { label: string; Icon: ComponentType<{ className?: string }>; to: "/" | "/my-learning" | "/progress" };
const NAV: NavItem[] = [
  { label: "Home", Icon: LayoutGrid, to: "/" },
  { label: "My Learning", Icon: NotebookText, to: "/my-learning" },
  { label: "Progress", Icon: ChartSpline, to: "/progress" },
];
/** Home is active everywhere in the learning journey; My Learning and Progress on their own pages. */
function useActiveNav(): NavItem["to"] {
  const path = useRouterState({ select: (s) => s.location.pathname });
  if (path.startsWith("/my-learning")) return "/my-learning";
  if (path.startsWith("/progress")) return "/progress";
  return "/";
}
function useScrolled(px = 8) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(window.scrollY > px);
    f(); window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, [px]);
  return on;
}

/** Music and sound buttons for the top bar (same settings as Home's). */
function TopBarAudio() {
  const [music, setMusic] = useState(true);
  const [sound, setSound] = useState(true);
  useEffect(() => { setMusic(readMusicPref()); return onMusicPref(() => setMusic(readMusicPref())); }, []);
  useEffect(() => { setSound(readSoundPref()); return onSoundPref(() => setSound(readSoundPref())); }, []);
  const cls = "btn-soft relative grid h-10 w-10 place-items-center rounded-full text-ink-3 hover:bg-line/60";
  return (
    <>
      <button type="button" aria-pressed={music} aria-label={music ? "Music on" : "Music off"} title={music ? "Music on" : "Music off"} onClick={() => setMusicPref(!music)} className={cls}>
        <Music className="h-5 w-5" />{!music && <span aria-hidden className="absolute h-[2px] w-6 rotate-45 rounded bg-current" />}
      </button>
      <button type="button" aria-pressed={sound} aria-label={sound ? "Sounds on" : "Sounds off"} title={sound ? "Sounds on" : "Sounds off"}
        onClick={() => { setSoundPref(!sound); if (!sound) window.setTimeout(() => playSound("tap"), 0); }} className={cls}>
        {sound ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
      </button>
    </>
  );
}

export function TopBar({ firstName, isAdmin }: { firstName: string | null; isAdmin: boolean }) {
  const navigate = useNavigate();
  const active = useActiveNav();
  const scrolled = useScrolled();
  const [restart, setRestart] = useState(false);
  return (
    <header data-scrolled={scrolled || undefined} className="topbar sticky top-0 z-40 border-b border-topbar-line bg-topbar">
      <div className="topbar-row relative flex h-full items-center justify-between">
        <Link to="/" aria-label="uLesson home" className="btn-soft relative z-10 shrink-0 rounded-md">
          <img src={logo.url} alt="uLesson" width={205} height={33} className="topbar-logo w-auto dark:hidden" />
          <img src={logoDark.url} alt="uLesson" width={205} height={33} className="hidden topbar-logo w-auto dark:block" />
        </Link>
        <nav className="absolute inset-y-0 left-1/2 hidden -translate-x-1/2 items-center gap-5 md:flex lg:gap-8" aria-label="Main">
          {NAV.map(({ label, Icon, to }) => {
            const on = active === to;
            return (
              <button key={label} type="button" aria-current={on ? "page" : undefined} onClick={on ? undefined : () => void navigate({ to })}
                className={cn("btn-soft relative flex h-full items-center", on ? "text-nav-active" : "text-ink-3/80")}>
                <span className="flex h-10 items-center gap-2 rounded-lg py-2 text-sm font-semibold"><Icon className="h-5 w-5" />{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="relative z-10 ml-auto mr-2 flex items-center gap-1"><TopBarAudio /></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" aria-label="Account" className="btn-soft relative z-10 flex h-11 shrink-0 items-center gap-2.5 rounded-full py-1 pl-1 pr-1 hover:bg-line/60 lg:pr-3">
              <span aria-hidden className="h-7 w-7 rounded-full bg-line" />
              <span className="hidden max-w-[20ch] truncate text-base font-semibold text-ink lg:inline-block">{firstName}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onCloseAutoFocus={(e) => e.preventDefault()}>
            <ThemeMenuItems />
            {isAdmin && <DropdownMenuItem onSelect={() => setRestart(true)}>Restart lesson</DropdownMenuItem>}
            {isAdmin && <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>Admin</DropdownMenuItem>}
            <DropdownMenuItem onSelect={async () => { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); }}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <RestartDialog open={restart} onOpenChange={setRestart} />
      </div>
    </header>
  );
}

export function BottomTabs() {
  const navigate = useNavigate();
  const active = useActiveNav();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-topbar-line bg-topbar pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
      {NAV.map(({ label, Icon, to }) => {
        const on = active === to;
        return (
          <button key={label} type="button" aria-current={on ? "page" : undefined} onClick={on ? undefined : () => void navigate({ to })}
            className={cn("btn-soft relative flex h-16 flex-col items-center justify-center gap-1 text-xs font-bold", on ? "text-nav-active" : "text-ink-3/80")}>
            <Icon className="h-5 w-5" />{label}
          </button>
        );
      })}
    </nav>
  );
}

// Faint decorative maths in the banner (hidden from screen readers; static, so reduced motion is unaffected).
const BANNER_SYMBOLS: { c: string; l: string; t: number; s: number; r: number; phone?: boolean }[] = [
  { c: "π", l: "47%", t: 14, s: 26, r: -8, phone: true },
  { c: "x²", l: "86%", t: 12, s: 24, r: 8, phone: true },
  { c: "△", l: "77%", t: 92, s: 18, r: -12 },
  { c: "y = mx + c", l: "58%", t: 10, s: 15, r: -4 },
  { c: "m = Δy/Δx", l: "74%", t: 150, s: 14, r: 5 },
  { c: "√x", l: "36%", t: 8, s: 20, r: 10 },
  { c: "÷", l: "71%", t: 40, s: 22, r: 0, phone: true },
  { c: "a/b", l: "93%", t: 150, s: 16, r: -10 },
  { c: "Δy", l: "53%", t: 64, s: 16, r: 12 },
  { c: "(x₂ − x₁)", l: "82%", t: 62, s: 13, r: -6 },
  { c: "∠", l: "97%", t: 40, s: 18, r: 0 },
];

export function ContinueBanner({ topic, subject, chapter, step, onContinue, busy }: {
  topic: string; subject: string | null; chapter: string | null; step: number; onContinue: () => void; busy: boolean;
}) {
  const done = Math.max(0, step - 1); // bar shows completed steps; label shows the current one
  const fresh = step <= 0; // not started yet (e.g. after a Restart)
  const press = usePress(onContinue);
  return (
    <section className="relative mt-8 flex flex-col rounded-2xl bg-banner p-5 pt-[130px] md:mt-[41px] md:h-[189px] md:flex-row md:items-center md:p-0 md:pl-[210px] md:pr-10 lg:pl-[230px]" aria-label={fresh ? "Start learning" : "Continue learning"}>
      <div className="absolute left-3 top-0 h-[132px] w-[150px] overflow-hidden md:bottom-0 md:left-[20px] md:h-full md:w-[180px] lg:w-[218px]">
        <img src={bannerTutor.url} alt="" width={218} height={200}
          className="h-full w-full object-cover object-[30%_top] opacity-95 [mask-image:radial-gradient(75%_80%_at_45%_45%,#000_55%,transparent_100%)]" />
        <span className="absolute right-[22%] top-[58%] h-2.5 w-2.5 rounded-full border-2 border-surface-fixed bg-online" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        {BANNER_SYMBOLS.map((m, k) => (
          <span key={k} aria-hidden className={cn("pointer-events-none absolute select-none whitespace-nowrap font-display font-bold text-primary-foreground/10", m.phone ? "" : "hidden md:block")}
            style={{ left: m.l, top: m.t, fontSize: m.s, transform: `rotate(${m.r}deg)` }}>{m.c}</span>
        ))}
        <p className="text-sm font-bold uppercase tracking-[0.42px] text-banner-eyebrow">{fresh ? "Start learning" : "Continue learning"}</p>
        <h2 className="mt-1 truncate font-display text-[28px] font-bold leading-tight text-primary-foreground md:text-4xl">{topic}</h2>
        <p className="mt-1 flex min-w-0 items-center gap-2 truncate text-sm text-banner-sub">
          {subject}{chapter && <><span className="h-1 w-1 shrink-0 rounded-full bg-banner-sub" aria-hidden /><span className="truncate">{chapter}</span></>}
        </p>
        <div className="mt-6 flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
          <div className="h-2 w-full overflow-hidden rounded-xl bg-track md:w-[428px] md:max-w-[45%] lg:max-w-none" role="progressbar" aria-valuemin={0} aria-valuemax={8} aria-valuenow={done} aria-label="Lesson progress">
            <div className="h-full rounded-xl bg-progress" style={{ width: `${(done / 8) * 100}%` }} />
          </div>
          <p className="shrink-0 text-sm text-primary-foreground">{fresh ? "0% · Not started" : `Step ${done} of 8 completed`}</p>
        </div>
      </div>
      <button type="button" onClick={press.run} disabled={busy} data-pressed={press.pressed || undefined}
        className="btn-cta mt-5 h-11 w-full shrink-0 rounded-full bg-surface-fixed text-sm font-bold text-cta-ink md:mt-0 md:h-10 md:w-[149px]">
        {fresh ? "Start Lesson" : "Continue Lesson"}
      </button>
    </section>
  );
}

const ICON_IMG: Partial<Record<HomeSubjectKey, string>> = {
  economics: eco.url, accounting: acc.url, chemistry: chm.url, literature: lit.url, biology: bio.url, government: gov.url, physics: phy.url,
};
const ICON_SVG: Partial<Record<HomeSubjectKey, ComponentType<{ className?: string }>>> = { mathematics: RootXIcon, english: MessageSquareText };
const TINT: Record<HomeSubjectKey, string> = {
  mathematics: "bg-tint-math", english: "bg-tint-english", economics: "bg-tint-economics", accounting: "bg-tint-accounting",
  chemistry: "bg-tint-chemistry", literature: "bg-tint-literature", biology: "bg-tint-biology", government: "bg-tint-government", physics: "bg-tint-physics",
};
const SVG_TONE: Partial<Record<HomeSubjectKey, string>> = { mathematics: "text-warning-strong", english: "text-nav-active" };

// Subject hover colours; only Mathematics is specified so far — add others as their cards open.
const ACCENT: Partial<Record<HomeSubjectKey, string>> = { mathematics: "var(--subject-math)" };

export function SubjectCard({ k, label, line, locked, onOpen }: { k: HomeSubjectKey; label: string; line: string; locked: boolean; onOpen?: (() => void) | undefined }) {
  const Svg = ICON_SVG[k];
  const body = (
    <>
      <SubjectTile subject={k} tint={TINT[k]} locked={locked} Svg={Svg} svgTone={SVG_TONE[k]} imgUrl={ICON_IMG[k]} />
      <span className="min-w-0">
        <span className="block truncate font-display text-[22px] font-semibold leading-tight text-brand">{label}</span>
        {line && <span className="block text-sm text-ink-2">{line}</span>}
      </span>
    </>
  );
  const cls = "flex w-full items-center gap-3 rounded-2xl bg-card px-5 py-6 text-left";
  return locked || !onOpen
    ? <LockedCard label={label} className={cls}>{body}</LockedCard>
    : <InteractiveCard accent={ACCENT[k] ?? "var(--line)"} onOpen={onOpen} className={cls}>{body}</InteractiveCard>;
}

export function SubjectSearch({ value, onChange, count }: { value: string; onChange: (v: string) => void; count: number }) {
  return <SearchBox value={value} onChange={onChange} count={count} placeholder="Find a subject" label="Search subjects" noun={["subject", "subjects"]} className="md:w-[325px]" />;
}

let bubbleClosedThisVisit = false;
onRestart(() => { bubbleClosedThisVisit = false; });

export function AskPill({ onAsk, className }: { name?: string | null; onAsk: () => void; className?: string }) {
  return (
    <button type="button" onClick={onAsk} className={cn("btn-soft relative grid h-11 min-w-11 place-items-center rounded-full", className)}>
      <span className="rounded-full border-2 border-surface-fixed bg-helper-pill px-3 py-1 text-[10px] font-bold leading-4 text-primary-foreground shadow-[0_4px_12px_-2px_color-mix(in_oklab,var(--helper-pill)_45%,transparent)]">
        Ask your tutor
      </span>
    </button>
  );
}

/** Fixed on the right, level with content. Taps cycle tips; the bubble hides after 8 s or on scroll. */
export function TutorHelper({ tutorName, firstName, hasLesson = false, line: firstLine }: { tutorName: string | null; firstName: string | null; onAsk?: () => void; hasLesson?: boolean; line?: string | undefined; gutter?: boolean }) {
  const [open, setOpen] = useState(!bubbleClosedThisVisit);
  const [tip, setTip] = useState(-1);
  const [nod, setNod] = useState(0);
  const tips = homeTips(hasLesson);
  const close = () => { bubbleClosedThisVisit = true; setOpen(false); };
  const line = tip < 0 ? firstLine ?? `Hello, ${firstName ?? "there"}! What shall we learn today?` : tips[tip];
  useSay(line ? [line] : [], `home:${line ?? ""}`, open && !!line, true);
  // Only stop the voice when this bubble closes, never on first show (it would cut off other cards).
  const wasOpen = useRef(open);
  useEffect(() => { if (wasOpen.current && !open) hush(); wasOpen.current = open; }, [open]);
  const ask = () => { setTip((t) => nextTip(t, tips.length)); if (open) setNod((n) => n + 1); setOpen(true); };
  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => setOpen(false), 8000);
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => { window.clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, [open, tip]);
  useEffect(() => {
    const on = () => document.documentElement.classList.toggle("anim-paused", document.hidden);
    document.addEventListener("visibilitychange", on);
    return () => { document.removeEventListener("visibilitychange", on); document.documentElement.classList.remove("anim-paused"); };
  }, []);
  return (
    <div data-tutor-helper>
      <AskPill onAsk={ask} className="tutor-pill-fixed xl:hidden" />
      <div className="tutor-fixed pointer-events-none hidden h-[200px] w-[130px] items-end xl:flex">
        {open && (
          <div role="status" className="tutor-bubble pointer-events-auto absolute right-[112px] top-[-6px] z-0 w-[268px] rounded-xl border border-line-fixed bg-surface-fixed px-4 py-3 pr-9 shadow-xl">
            <button type="button" onClick={close} aria-label="Close" className="btn-soft absolute right-0.5 top-0.5 grid h-10 w-10 place-items-center text-ink-fixed"><X className="h-4 w-4" /></button>
            <p className="text-xs text-helper">Hi, I'm {tutorName ?? "your tutor"}</p>
            <p key={tip} className="tip-fade mt-1 break-words text-sm font-bold leading-snug text-ink-fixed">{line}</p>
          </div>
        )}
        <button type="button" onClick={ask} aria-label="Show a tip" className="pointer-events-auto relative z-10">
          <img key={nod} src={waveTutor.url} alt="AI tutor" width={130} height={200} loading="lazy" className={cn("h-[200px] w-[130px] object-contain", nod > 0 && "tutor-nod")} />
        </button>
        <AskPill onAsk={ask} className="pointer-events-auto absolute bottom-0 right-[2px] z-20 translate-y-1/3" />
      </div>
    </div>
  );
}
