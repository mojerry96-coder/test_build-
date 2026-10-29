// The student shell from the Home design: white left sidebar (phones: bottom tabs), soft background shapes,
// Dark mode button and the learning streak badge. Colours are fh-* tokens only.
import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Music, Plus, Volume2, VolumeX } from "lucide-react";
import { readVoiceMuted, setVoiceMuted } from "@/lib/voice";
import { onMusicPref, readMusicPref, setMusicPref } from "@/lib/music";
import { onSoundPref, playSound, readSoundPref, setSoundPref } from "@/lib/sound";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { newConversationFn, talkAgainFn } from "@/lib/api/home.functions";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/lib/theme";
import { readLowDataChoice } from "@/lib/ui-prefs";
import { setLowDataFn } from "@/lib/api/prefs.functions";
import { cn } from "@/lib/utils";
import { RestartDialog } from "@/components/RestartDialog";
import moon from "@/assets/home/moon.png.asset.json";
import askIcon from "@/assets/home/la-dove.png.asset.json";
import planet from "@/assets/home/planet.svg.asset.json";
import flask from "@/assets/home/flask-spec.png.asset.json";
import logo from "@/assets/brand/book.png.asset.json";
import headTutor from "@/assets/home/parrot-thumbs.png.asset.json";
import bookOpen from "@/assets/hub/book-open.png.asset.json";

type To = "/" | "/learning-hub" | "/leaderboard";
const NAV: { label: string; to: To; icon: string }[] = [
  { label: "Ask {name}", to: "/", icon: askIcon.url },
  { label: "Learning Hub", to: "/learning-hub", icon: bookOpen.url },
];

/** New Chat: a fresh conversation, then the Ask page. */
function useNewChat() {
  const start = useServerFn(newConversationFn);
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    const { conversationId } = await start();
    qc.setQueryData(["home-history"], { conversationId, msgs: [] });
    navigate({ to: "/" });
  };
}

export function MaskIcon({ url, className }: { url: string; className?: string }) {
  return <span aria-hidden className={cn("inline-block bg-current", className)} style={{ WebkitMask: `url(${url}) center/contain no-repeat`, mask: `url(${url}) center/contain no-repeat` }} />;
}

export function FitilaShell({ children, initials, streak, tutorName, isAdmin, hideFab, bare, name, hideDecor, plainBg, compactHeader }: { compactHeader?: boolean; hideDecor?: boolean; /** No background shapes at all (video step). */ plainBg?: boolean; bare?: boolean; name?: string; hideFab?: boolean; children: ReactNode; initials: string; streak: number; tutorName: string; isAdmin: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const { resolved, setPref } = useTheme();
  const short = tutorName;
  const newChat = useNewChat();
  // Streak on Home: two drum taps once per visit (dropped silently before her first tap).
  useEffect(() => { if (path === "/" && streak > 0) playSound("streak"); }, [path === "/" && streak > 0]); // eslint-disable-line react-hooks/exhaustive-deps
  const isOn = (to: To) => (to === "/" ? path === "/" : path.startsWith(to));
  return (
    <div className="fh-motion relative min-h-screen overflow-x-hidden bg-fh-page text-fh-ink">
      {!plainBg && <Backdrop hideDecor={hideDecor} />}
      {bare && (
        <Link to="/" aria-label="uLesson home" className="absolute left-4 top-4 z-20 flex items-center gap-2 md:left-[6vw] md:top-8">
          <img src={logo.url} alt="" className="h-9 w-auto object-contain md:h-11" />
          <span className="text-[26px] font-bold tracking-tight text-fh-heading md:text-[34px]">uLesson</span>
        </Link>
      )}
      <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-[clamp(132px,8vw,148px)] flex-col items-center bg-fh-side pb-[clamp(16px,3.5vh,40px)] pt-[clamp(20px,3.5vh,38px)]", bare ? "md:hidden" : "md:flex")} aria-label="Main">
        <Link to="/" aria-label="uLesson home"><img src={logo.url} alt="uLesson" width={113} height={97} className="h-[clamp(56px,8vh,80px)] w-auto object-contain" /></Link>
        <button type="button" onClick={newChat}
          className="mt-[clamp(16px,3.5vh,36px)] flex h-12 shrink-0 w-[calc(100%-20px)] items-center justify-center gap-1.5 hdr-bounce [--bounce-edge:var(--fh-dark-btn-edge)] rounded-2xl bg-fh-dark-btn text-[15px] font-semibold text-fh-dark-btn-ink shadow-[0_6px_0_var(--fh-dark-btn-edge)] transition-[transform,filter,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_3px_0_var(--fh-dark-btn-edge)] motion-reduce:transition-none">
          <Plus className="h-5 w-5" strokeWidth={2.2} />New Chat
        </button>
        <nav className="mt-[clamp(20px,7vh,80px)] flex w-full flex-col items-center gap-[clamp(8px,2.4vh,28px)] px-2">
          {NAV.map(({ label, to, icon }) => {
            const on = isOn(to);
            return (
              <Link key={to} to={to} aria-current={on ? "page" : undefined}
                className={cn("flex w-[min(112px,calc(100%-8px))] flex-col items-center gap-1.5 rounded-2xl px-1 py-[clamp(10px,2vh,16px)] text-center text-[16px] leading-tight transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-fh-box-edge motion-reduce:transition-none", on ? "bg-fh-nav-on text-fh-box-edge" : "text-fh-nav-ink hover:bg-fh-nav-on/70 hover:text-fh-box-edge")}>
                <MaskIcon url={icon} className="h-[28px] w-[28px]" />
                <span className={label.startsWith("Ask") ? "whitespace-nowrap" : undefined}>{label.replace("{name}", short)}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <ProfileMenu initials={initials} isAdmin={isAdmin} onSignOut={async () => { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); }} />
        </div>
      </aside>

      <div aria-hidden className={cn("pointer-events-none fixed inset-x-0 top-0 z-20 h-24 bg-gradient-to-b from-fh-page via-fh-page/85 to-transparent md:h-32", !bare && "md:left-[clamp(132px,8vw,148px)]")} />
      <div className={cn("fixed right-4 top-4 z-20 flex items-center gap-3 md:right-[60px] md:top-8", compactHeader && "hdr-compact md:right-[clamp(24px,3vw,52px)] md:top-6")}>
        <VoiceButton />
        <MusicButton />
        <SoundButton />
        <button type="button" onClick={() => setPref(resolved === "dark" ? "light" : "dark")}
          className="hdr-bounce group flex h-12 items-center gap-2 rounded-full bg-fh-dark-btn px-4 text-[17px] font-semibold text-fh-dark-btn-ink shadow-[0_5px_0_var(--fh-dark-btn-edge)] transition-[transform,filter,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-dark-btn-edge)] motion-reduce:transition-none max-md:h-10 max-md:px-3 max-md:text-sm">
          <MaskIcon url={moon.url} className="h-5 w-5" />{resolved === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {bare ? (
          <ProfileMenu compact name={name} initials={initials} isAdmin={isAdmin} onSignOut={async () => { await supabase.auth.signOut(); navigate({ to: "/sign-in" }); }} />
        ) : <div className="flex h-[66px] items-center gap-3 rounded-[18px] border-2 border-dashed border-fh-streak-line bg-fh-streak pl-3 pr-3 max-md:h-12" aria-label={`Learning streak: ${streak} days in a row`}>
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-fh-flame text-[19px] max-md:h-8 max-md:w-8" aria-hidden>🔥</span>
          <span className="leading-tight">
            <span className="block text-[10px] font-semibold tracking-wide text-fh-streak-eyebrow">Learning Streak</span>
            <span className="block text-[14px] font-semibold text-fh-streak-ink max-md:text-xs">{streak} {streak === 1 ? "day" : "days"} in a row</span>
          </span>
          <img src={headTutor.url} alt="" className="ml-3 h-[52px] w-auto object-contain max-md:h-9" />
        </div>}
      </div>

      <div className={cn("relative z-10", !bare && "md:pl-[clamp(132px,8vw,148px)]")}>{children}</div>

      {!hideFab && <button type="button" onClick={newChat} aria-label="New Chat"
        className="fixed bottom-[84px] right-4 z-30 grid h-14 w-14 place-items-center hdr-bounce [--bounce-edge:var(--fh-dark-btn-edge)] rounded-full bg-fh-dark-btn text-fh-dark-btn-ink shadow-[0_5px_0_var(--fh-dark-btn-edge)] md:hidden">
        <Plus className="h-6 w-6" strokeWidth={2.4} />
      </button>}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t border-fh-leaf bg-fh-side pb-[env(safe-area-inset-bottom)] md:hidden" aria-label="Main">
        {NAV.map(({ label, to, icon }) => {
          const on = isOn(to);
          return (
            <Link key={to} to={to} aria-current={on ? "page" : undefined} className={cn("flex h-16 flex-col items-center justify-center gap-1 text-xs font-bold", on ? "text-fh-box-edge" : "text-fh-nav-ink")}>
              <MaskIcon url={icon} className="h-6 w-6" /><span className={label.startsWith("Ask") ? "whitespace-nowrap" : undefined}>{label.replace("{name}", short)}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function ProfileMenu({ initials, isAdmin, onSignOut, compact, name }: { compact?: boolean; name?: string | undefined; initials: string; isAdmin: boolean; onSignOut: () => void }) {
  const navigate = useNavigate();
  const again = useServerFn(talkAgainFn);
  const newChat = useNewChat();
  const [restart, setRestart] = useState(false);
  const music = useMusicOn();
  const saveLow = useServerFn(setLowDataFn);
  // Low-data switch removed: clear any saved choice once, so only the slow-connection fallback remains.
  useEffect(() => { if (readLowDataChoice() !== null) { try { localStorage.removeItem("ul.lowData"); } catch { /* none */ } window.dispatchEvent(new Event("ul-pref")); void saveLow({ data: { on: false } }).catch(() => {}); } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {compact ? (
          <button type="button" aria-label="Account" className="ml-6 flex items-center gap-3 rounded-full pr-2 text-[15px] font-medium text-fh-ink hover:bg-fh-chip/60 focus-visible:outline-2 focus-visible:outline-fh-box-edge max-md:ml-1">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-fh-chip text-[13px] font-semibold text-fh-chip-ink" aria-hidden>{initials}</span><span className="max-md:hidden">{name}</span>
          </button>
        ) : <button type="button" aria-label="Account" className="grid h-14 w-14 place-items-center rounded-full bg-fh-chip text-xl font-medium text-fh-heading">{initials}</button>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top">
        {isAdmin && <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}>Admin</DropdownMenuItem>}
        <DropdownMenuItem onSelect={async () => { await again(); await newChat(); }}>Talk to me again</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setRestart(true)}>Start again</DropdownMenuItem>
        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setMusicPref(!music); }} role="menuitemcheckbox" aria-checked={music}>
          Music<span className="ml-auto pl-4 text-xs font-semibold">{music ? "On" : "Off"}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onSignOut}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
      <RestartDialog open={restart} onOpenChange={setRestart} admin={isAdmin} />
    </DropdownMenu>
  );
}

/** Background from the spec, drawn on a 1920 x 1200 canvas that scales with the screen (covering it), so every
 *  shape keeps its spec position: outlined planet with moon and star, soft left shape, big flower right, flask. */
export function Backdrop({ hideDecor, variant }: { hideDecor?: boolean | undefined; variant?: "open" | undefined }) {
  const petals = [0, 60, 120, 180, 240, 300];
  if (variant === "open") return (
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" viewBox="0 0 1920 1200" preserveAspectRatio="xMidYMid slice">
      <g className="text-fh-flower" fill="currentColor" opacity="0.5" transform="translate(1700 580)">
        {petals.map((a) => <ellipse key={a} cx="0" cy="-310" rx="170" ry="370" transform={`rotate(${a + 18})`} />)}
        <circle r="200" />
      </g>
      <ellipse fill="var(--cp-dome)" cx="1300" cy="1330" rx="420" ry="350" />
      <ellipse fill="var(--cp-dome)" cx="1050" cy="955" rx="55" ry="72" transform="rotate(25 1050 955)" />
      <ellipse fill="var(--cp-dome)" cx="1535" cy="968" rx="58" ry="72" transform="rotate(30 1535 968)" />
      <path fill="var(--cp-blob)" d="M0 150C200 140 470 190 525 260c50 70-160 130-260 210-120 95-140 200-30 240 140 50 200 70 160 110-80 90-300 110-395 80z" />
      <path fill="var(--cp-swoosh)" d="M0 330C120 300 230 285 330 282 230 300 110 340 0 385z" />
      {!hideDecor && <image href={flask.url} x="-110" y="870" width="290" height="290" />}
    </svg>
  );
  return (
    <>
    <svg aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" viewBox="0 0 1920 1200" preserveAspectRatio="xMidYMin slice">
      <g className="text-fh-flower" fill="currentColor" opacity="0.9" transform="translate(1720 620)">
        {petals.map((a) => <ellipse key={a} cx="0" cy="-300" rx="170" ry="360" transform={`rotate(${a + 18})`} />)}
        <circle r="190" />
      </g>
      <ellipse className="text-fh-side" fill="currentColor" opacity="0.7" cx="1050" cy="950" rx="55" ry="70" transform="rotate(25 1050 950)" />
      <image href={planet.url} x="1140" y="-40" width="300" height="166" className="planet-art" />
      <ellipse className="text-fh-side" fill="currentColor" opacity="0.6" cx="1780" cy="1120" rx="70" ry="48" transform="rotate(-20 1780 1120)" />
    </svg>
    {/* Left shape + flask pinned to the side bar's edge so no gap opens on wide screens. */}
    <svg aria-hidden className="pointer-events-none fixed top-0 z-0 hidden h-screen md:block" style={{ left: "clamp(132px,8vw,148px)", aspectRatio: "700 / 1200" }} viewBox="180 0 700 1200" preserveAspectRatio="xMinYMin meet">
      <path className="text-fh-side" fill="currentColor" opacity="0.55"
        d="M180 150c120-10 290 40 340 110 40 60-30 100-190 110 120 40 150 120 120 210-30 90-60 150-60 230-90 20-160-10-210-40z" />
      {!hideDecor && <image href={flask.url} x="210" y="760" width="300" height="300" />}
    </svg>
    </>
  );
}

function useMusicOn() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(readMusicPref()); return onMusicPref(() => setOn(readMusicPref())); }, []);
  return on;
}
/** Background music on/off, separate from sound effects; remembered on this device. */
function MusicButton() {
  const on = useMusicOn();
  return (
    <button type="button" aria-pressed={on} aria-label={on ? "Music on" : "Music off"} title={on ? "Music on" : "Music off"}
      onClick={() => setMusicPref(!on)}
      className="hdr-bounce group squish relative grid h-12 w-12 place-items-center rounded-full bg-fh-dark-btn text-fh-dark-btn-ink shadow-[0_5px_0_var(--fh-dark-btn-edge)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-dark-btn-edge)] max-md:h-10 max-md:w-10">
      <Music className="h-5 w-5" />
      {!on && <span aria-hidden className="absolute h-[2px] w-6 rotate-45 rounded bg-current" />}
    </button>
  );
}

/** Sounds on/off; her choice is remembered on this device. */
function SoundButton() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(readSoundPref()); return onSoundPref(() => setOn(readSoundPref())); }, []);
  return (
    <button type="button" aria-pressed={on} aria-label={on ? "Sounds on" : "Sounds off"} title={on ? "Sounds on" : "Sounds off"}
      onClick={() => { setSoundPref(!on); if (!on) window.setTimeout(() => playSound("tap"), 0); }}
      className="hdr-bounce group squish grid h-12 w-12 place-items-center rounded-full bg-fh-dark-btn text-fh-dark-btn-ink shadow-[0_5px_0_var(--fh-dark-btn-edge)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-dark-btn-edge)] max-md:h-10 max-md:w-10">
      {on ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </button>
  );
}

/** The voice on/off button was removed; clear any saved "voice off" so nobody stays muted with no way back. */
function VoiceButton() {
  useEffect(() => { if (readVoiceMuted()) setVoiceMuted(false); }, []);
  return null;
}
