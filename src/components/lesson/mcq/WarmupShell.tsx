// Warm-up (multiple-choice) screen in the Fiti design: the student shell, progress line + stop strip,
// Hint / Ask Fiti at the bottom left, the parrot with its speech bubble at the bottom right.
import sadClip from "@/assets/video-lesson/mascot-sad.webm.asset.json";
import sadStill from "@/assets/video-lesson/sad-still.webp.asset.json";
import celClip from "@/assets/video-lesson/mascot-celebrate.webm.asset.json";
import celStill from "@/assets/video-lesson/celebrate-still.webp.asset.json";
import { useLowData } from "@/lib/ui-prefs";
import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Lightbulb, X } from "lucide-react";
import { useRouter } from "@tanstack/react-router";
import glasses from "@/assets/tutor/parrot-think-glasses.png.asset.json";
import qmark from "@/assets/tutor/question-mark.png.asset.json";
import { FitilaShell } from "@/components/home/FitilaShell";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LiveTutor } from "@/components/tutor/LiveTutor";
import { useHomeData } from "@/routes/_authenticated/index";
import { askTutorFn } from "@/lib/api/lesson.functions";
import { useTheme } from "@/lib/theme";
import { looksRaw } from "@/shared/contracts/chat-safety";
import type { Script } from "@/shared/contracts/script";
import { cn } from "@/lib/utils";
import { useLesson } from "../context";
import { useIsPhone } from "../TutorChatPanel";
import think from "@/assets/path/parrot-think.png.asset.json";
import thumbs from "@/assets/home/parrot-thumbs.png.asset.json";
import wave from "@/assets/home/parrot-wave-full.png.asset.json";
import bird from "@/assets/path/bird.png.asset.json";

const tipKey = (s: string, i: string) => `tip:${s}:${i}`;

/** The parrot: poses cross-fade, a bounce on every new line, sparkles when celebrating. */
function Parrot({ pose, mood, beat, noReact = false }: { pose: string; mood: string; beat: number; noReact?: boolean }) {
  const [shown, setShown] = useState([pose]);
  // Video step: the clip's own Fiti reacts, so this one hides meanwhile (fiti:hide / fiti:show) and never reacts.
  const [hidden, setHidden] = useState(false);
  // Video step: the clip's reaction plays here, in the side Fiti's own box (fiti:clip, detail = url | null).
  const [ext, setExt] = useState<string | null>(null);
  useEffect(() => { const h = (e: Event) => setExt((e as CustomEvent<string | null>).detail ?? null); window.addEventListener("fiti:clip", h); return () => window.removeEventListener("fiti:clip", h); }, []);
  useEffect(() => { const h = () => setHidden(true), v = () => setHidden(false); window.addEventListener("fiti:hide", h); window.addEventListener("fiti:show", v); return () => { window.removeEventListener("fiti:hide", h); window.removeEventListener("fiti:show", v); }; }, []);
  // Answer reactions (see-through clips, same box as his pose): a wrong answer plays the sad clip and holds its
  // last frame until her next answer; a right answer plays the celebration once, then back to his pose.
  const [react, setReact] = useState<{ kind: "sad" | "cheer"; n: number } | null>(null);
  const [low] = useLowData();
  useEffect(() => {
    let n = 0;
    if (noReact) return;
    const sadF = () => setReact({ kind: "sad", n: ++n });
    const cheerF = () => setReact({ kind: "cheer", n: ++n });
    window.addEventListener("fiti:sad", sadF); window.addEventListener("fiti:cheer", cheerF);
    return () => { window.removeEventListener("fiti:sad", sadF); window.removeEventListener("fiti:cheer", cheerF); };
  }, []);
  useEffect(() => { if (react?.kind !== "cheer") return; const t = setTimeout(() => setReact(null), 3400); return () => clearTimeout(t); }, [react]);
  useEffect(() => { setShown((s) => (s.at(-1) === pose ? s : [s.at(-1)!, pose])); const t = setTimeout(() => setShown([pose]), 220); return () => clearTimeout(t); }, [pose]);
  const live = mood === "celebrate" ? "celebrate" : mood === "encouraging" ? "encouraging" : mood === "speaking" ? "speaking" : "thinking";
  const still = react?.kind === "sad" ? sadStill.url : celStill.url;
  const clip = react?.kind === "sad" ? sadClip.url : celClip.url;
  const stillOnly = low || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  return (
    <div className={cn("relative h-[clamp(200px,32vh,340px)] w-[clamp(140px,12vw,220px)] transition-opacity", hidden && "opacity-0")}>
      {ext && <video key={ext} src={ext} muted playsInline autoPlay aria-hidden className="absolute inset-0 z-10 h-full w-full object-contain object-bottom" />}
      {!ext && react && (stillOnly
        ? <img key={react.n} src={still} alt="" className="absolute inset-0 z-10 h-full w-full object-contain object-bottom" />
        : <video key={react.n} src={clip} muted playsInline autoPlay loop={react.kind === "sad"}
            onEnded={() => { if (react.kind === "cheer") setReact(null); }}
            onError={(e) => { (e.currentTarget as HTMLVideoElement).replaceWith(Object.assign(document.createElement("img"), { src: still, alt: "", className: "absolute inset-0 z-10 h-full w-full object-contain object-bottom" })); }}
            className="absolute inset-0 z-10 h-full w-full object-contain object-bottom" />)}
      <span key={beat} className={cn("lt-shake absolute inset-0 block", (react || ext) && "opacity-0")}>
        {shown.map((src, i) => (
          <span key={src} className={cn("absolute inset-0 transition-opacity duration-200", i === shown.length - 1 ? "opacity-100" : "opacity-0")}>
            <LiveTutor src={src} mood={live} fit="contain" className="h-full w-full" />
          </span>
        ))}
      </span>
      {pose === glasses.url && <img src={qmark.url} alt="" aria-hidden className="anim-note-pop absolute right-[10%] top-[20%] h-[18%] w-auto object-contain" />}
      {mood === "celebrate" && [[10, 20, 0], [80, 8, 120], [92, 45, 240], [4, 55, 360], [55, 0, 180]].map(([x, y, d], i) => (
        <span key={`${beat}-${i}`} aria-hidden className="sparkle absolute h-3 w-3 rotate-45 rounded-[2px] bg-hub-flame" style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${d}ms` }} />
      ))}
    </div>
  );
}

const tipText = (lines: Script) => lines.map((l) => l.text).join(" ");

/** Ask Fiti on desktop: a floating card on the left with the lesson chat inside. */
function ChatCard({ tutorName, children }: { tutorName: string; children: ReactNode }) {
  return (
    <aside aria-label={`Ask ${tutorName}`} className="anim-note-pop fixed left-[clamp(16px,11vw,170px)] top-[clamp(110px,17vh,170px)] bottom-[clamp(40px,7vh,70px)] z-30 flex w-[345px] flex-col overflow-hidden rounded-[28px] border border-fh-box-line bg-fh-card shadow-[0_14px_0_var(--chat-card-edge)]">
      <div className="min-h-0 flex-1">{children}</div>
    </aside>
  );
}

// Back always opens this topic's "Let's Begin" map (the lesson lives at the topic address; the map is its /path).
const mapHref = () => window.location.pathname.replace(/\/+$/, "").replace(/\/path$/, "") + "/path";

export function WarmupShell({ noReact = false, noAsk = false, children, chat, noHint = false, bubble, fiti, fitiLeft = false, noParrot = false }: { /** The page Fiti ignores answer reactions (video step has its own). */ noReact?: boolean; /** Hide the Ask Fiti button (video step). */ noAsk?: boolean; /** Hide the right-side parrot (the screen shows its own Fiti). */ noParrot?: boolean; children: ReactNode; chat: (close: () => void, since?: number, opener?: string) => ReactNode; noHint?: boolean; bubble?: ReactNode; fiti?: ReactNode; /** Fiti sits on top of the Ask button (bottom-left) instead of the right side. */ fitiLeft?: boolean }) {
  const { me, home, tutorName } = useHomeData();
  const { view, mood, sessionId, run, studentSaid, say, busy, chat: lessonChat } = useLesson();
  const [tipBusy, setTipBusy] = useState(false);
  const ask = useServerFn(askTutorFn);
  const phone = useIsPhone();
  const router = useRouter();
  const { resolved } = useTheme();
  const [chatOpen, setChatOpen] = useState(false);
  const item = view.items[view.position.index];
  const itemId = view.warmup?.repair?.practiceItem?.id ?? item?.id ?? (view.position.step === "hook" ? "hook" : "");
  const [tip, setTip] = useState<string | null>(null);
  // When this question began: the Ask card shows only messages from then on, under the approved opener.
  const [since, setSince] = useState<number | undefined>(undefined);
  useEffect(() => {
    if (!itemId) return;
    const k = `ask-since:${sessionId}:${itemId}`;
    const v = Number(sessionStorage.getItem(k)) || Date.now();
    sessionStorage.setItem(k, String(v)); setSince(v);
  }, [sessionId, itemId]);
  const opener = (view.askOpener ?? []).map((l) => l.text).join(" ") || undefined;
  const [tipOpen, setTipOpen] = useState(false);
  useEffect(() => { setTip(itemId ? sessionStorage.getItem(tipKey(sessionId, itemId)) : null); setTipOpen(false); }, [sessionId, itemId]);
  useEffect(() => {
    const h = document.documentElement;
    h.classList.toggle("dark", resolved === "dark");
    return () => { h.classList.remove("dark"); };
  }, [resolved]);

  // Hint: the approved tip plays once per question in the tip pill; afterwards the button reopens the same tip.
  const hint = async () => {
    if (tip) { setTipOpen(true); return; }
    if (busy || tipBusy || !itemId) return;
    const t = "Can I have a tip?";
    studentSaid(t);
    setTipBusy(true);
    const r = await run(() => ask({ data: { sessionId, text: t, intent: "hint" } })).finally(() => setTipBusy(false));
    if (!r) return;
    say(r.lines, "encouraging");
    const raw = tipText(r.lines);
    const fb = view.chatFallback;
    const text = looksRaw(raw) ? (typeof fb === "string" ? fb : (fb ?? []).map((l) => l.text).join(" ")) : raw;
    sessionStorage.setItem(tipKey(sessionId, itemId), text);
    setTip(text); setTipOpen(true);
  };

  const tutorBeat = lessonChat.filter((c) => c.from === "tutor").length;
  const pose = mood === "celebrate" ? wave.url : mood === "encouraging" ? thumbs.url : glasses.url;
  const h = home.data;
  const name = [h?.firstName ?? me.data?.firstName].filter(Boolean).join(" ");

  const btn = "squish flex h-[48px] items-center gap-2 rounded-full border-2 bg-fh-card px-5 text-[18px] font-medium transition-transform hover:-translate-y-px active:translate-y-[3px] max-md:h-12 max-md:flex-1 max-md:justify-center max-md:text-[18px] motion-reduce:transition-none";
  const buttons = (
    <div className="flex flex-col items-start gap-3">
      {tip && tipOpen && (
        <div role="status" aria-live="polite" className="tip-pill anim-note-pop flex max-w-[420px] max-md:w-full max-md:max-w-none [&>span]:max-md:line-clamp-3 items-start gap-3 rounded-[22px] px-5 py-2.5 text-[16px] font-medium leading-snug max-md:text-[15px]">
          <button type="button" onClick={() => setTipOpen(false)} aria-label="Close tip" className="mt-0.5 shrink-0 rounded-full focus-visible:outline-2"><X className="h-5 w-5" /></button>
          <span>{tip}</span>
        </div>
      )}
      <div className="flex gap-3 max-md:w-full">
        {!noHint && <button type="button" onClick={hint} disabled={tipBusy || (busy && !tip)} aria-busy={tipBusy}
          className={cn(btn, "border-mcq-hint text-mcq-hint-ink shadow-[0_4px_0_var(--mcq-hint)] active:shadow-[0_1px_0_var(--mcq-hint)]")}>
          <Lightbulb className={cn("h-6 w-6", tip && "fill-current")} aria-hidden />{tipBusy ? <span className="flex gap-1" aria-label={`${tutorName} is writing a tip`}>{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-current" style={{ animationDelay: `${i * 120}ms` }} />)}</span> : tip ? "Tip shown" : "Hint"}
        </button>}
        {!noAsk && <button type="button" onClick={() => setChatOpen(true)}
          className={cn(btn, "border-mcq-ask text-fh-box-edge shadow-[0_4px_0_var(--mcq-ask)] active:shadow-[0_1px_0_var(--mcq-ask)]")}>
          <span aria-hidden className="inline-block h-6 w-6 bg-current" style={{ WebkitMask: `url(${bird.url}) center/contain no-repeat`, mask: `url(${bird.url}) center/contain no-repeat` }} />Ask {tutorName}
        </button>}
      </div>
    </div>
  );
  const side = chatOpen && !phone;

  return (
    <FitilaShell compactHeader hideFab plainBg={noAsk && noReact} hideDecor={fitiLeft || noParrot} name={name} initials={h?.initials ?? "ME"} streak={h?.streak ?? 0} tutorName={tutorName} isAdmin={!!me.data?.isAdmin}>
      <div className={cn("relative min-h-screen px-4 pb-[230px] pt-16 md:px-10 md:pb-10 md:pt-[clamp(84px,11vh,130px)]", fitiLeft && "lg:min-h-0 lg:pb-6")}>
        <button type="button" onPointerEnter={() => void router.preloadRoute({ href: mapHref() } as never).catch(() => {})} onClick={() => void router.navigate({ href: mapHref() })} className="squish relative z-40 flex min-h-11 items-center gap-2 text-[20px] font-medium text-hub-heading max-md:text-[16px]"><ArrowLeft className="h-6 w-6" aria-hidden />Back</button>
        {phone && !noParrot && <img src={pose} alt="" className="absolute right-4 top-[72px] h-20 w-auto object-contain" />}
        <div className={cn("mt-6 transition-[margin] duration-300 md:mt-0 motion-reduce:transition-none", fitiLeft ? "md:pb-[150px] lg:pb-0" : "md:pb-[150px]", fitiLeft ? "max-w-[1400px]" : "max-w-[1100px]", side ? "warm-side ml-[clamp(380px,calc(11vw+380px),560px)] mr-[clamp(200px,16vw,280px)]" : cn("mx-auto", fiti && !fitiLeft && "min-[1100px]:pr-[clamp(170px,14vw,250px)]", fitiLeft && "min-[1100px]:pl-[clamp(140px,12vw,220px)]"))}>{children}</div>

        {!phone && (
          <>
            {/* Fiti stays mounted while the chat is open (his slot must never be removed), and sits beside the chat card. */}
            {(!side || (fitiLeft && fiti)) && <div className={cn("fixed bottom-[clamp(40px,8vh,90px)] z-20 flex flex-col items-start", side ? "left-[clamp(400px,calc(11vw+400px),580px)]" : "left-[clamp(24px,13vw,210px)]")}>{fitiLeft && fiti && <div className="relative z-30 mb-4 ml-2 max-[1100px]:hidden">{fiti}</div>}{!side && buttons}</div>}
            {(fiti && fitiLeft) || noParrot ? null : fiti ? <div className="fixed bottom-[clamp(40px,8vh,90px)] right-[clamp(16px,4vw,90px)] z-20 max-[1100px]:hidden">{fiti}</div> : <div className="pointer-events-none fixed bottom-[clamp(60px,10vh,110px)] right-[clamp(16px,4vw,90px)] z-20 max-[1100px]:hidden">
              {bubble && <div className="anim-note-pop absolute bottom-[78%] right-[70%] w-[min(320px,24vw)]">{bubble}</div>}
              <div id="warmup-bubble" className="pointer-events-auto absolute bottom-[30%] right-[calc(100%+12px)] w-[min(360px,28vw)] [&>*]:mt-0" />
              <Parrot key={itemId} pose={pose} mood={mood} beat={tutorBeat} noReact={noReact} />
            </div>}
            {side && <ChatCard tutorName={tutorName}>{chat(() => setChatOpen(false), since, opener)}</ChatCard>}
          </>
        )}
        {phone && <div className="fixed inset-x-0 bottom-[136px] z-20 bg-fh-page px-4 pt-2">{buttons}</div>}
      </div>

      {phone && (
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetContent side="bottom" className="flex h-[80dvh] flex-col rounded-t-2xl p-0">
            <SheetHeader className="flex-row items-center gap-2 px-4 pt-4"><img src={think.url} alt="" className="h-9 w-9 rounded-full object-cover object-top" /><SheetTitle>{tutorName}</SheetTitle></SheetHeader>
            <div className="min-h-0 flex-1">{chat(() => setChatOpen(false), since, opener)}</div>
          </SheetContent>
        </Sheet>
      )}
    </FitilaShell>
  );
}
