// "Let's Begin": the lesson path map. Fiti starts the lesson through the chat beside the parrot (no Start button).
// Every line is an approved path_* fallback line; typed messages go through the Ask Fiti agent rules.
import { prefetchVoice } from "@/lib/voice";
import { splitSpoken } from "@/shared/spoken-split";
import { createFileRoute, Link, useCanGoBack, useNavigate, useRouter } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { cameFromChat, markChatOpen } from "@/lib/chat-open";
import { backTarget } from "@/shared/back-target";
import { toast } from "sonner";
import { FitilaShell } from "@/components/home/FitilaShell";
import { AskBox, Conversation } from "@/components/home/FitilaAgent";
import { PathMap } from "@/components/path/PathMap";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { useIsPhone } from "@/components/lesson/TutorChatPanel";
import { getTopicIntroFn } from "@/lib/api/topic-intro.functions";
import { homeSendFn } from "@/lib/api/home.functions";
import { useHomeData } from "./index";
import { GO_WORDS, lockedMessage, PATH_STOPS, rewindTarget, stopStates } from "@/shared/path-stops";
import { GoBackDialog } from "@/components/path/GoBackDialog";
import { rewindStepFn } from "@/lib/api/lesson.functions";
import { openLessonFn } from "@/lib/api/lesson-open.functions";
import { pageTitle } from "@/shared/routes";
import type { HomeButton, HomeChatMsg } from "@/shared/contracts/home";
import parrot from "@/assets/path/parrot-think.png.asset.json";
import bird from "@/assets/path/bird.png.asset.json";
import { playSound } from "@/lib/sound";
import { prefetchLesson } from "@/lib/lesson-prefetch";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { LiveTutor, type LiveMood } from "@/components/tutor/LiveTutor";
import { useLowData } from "@/lib/ui-prefs";
import lookClip from "@/assets/fitila/fitila_looking_around.webm.asset.json";
import lookStill from "@/assets/fitila/fitila_looking_around.webp.asset.json";

export const Route = createFileRoute("/_authenticated/$subject/$chapter/$quest/$topic_/path")({
  head: () => ({
    meta: [
      { title: pageTitle("Let's Begin") },
      { name: "description", content: "Your lesson path tonight: six stops, with your tutor beside you." },
      { property: "og:title", content: "Let's Begin | uLesson AI Tutor" },
      { property: "og:description", content: "Your lesson path tonight: six stops, with your tutor beside you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { from?: "chat" } => (s["from"] === "chat" ? { from: "chat" } : {}),
  component: PathPage,
});

type Msg = HomeChatMsg & { live?: boolean };
const GO = "Let's go!", WHAT = "What's a warm-up?", NOT_NOW = "Not now", RECAP = "Recap where I was",
  TOMORROW = "Move it to tomorrow", HUB = "Back to Learning Hub", RECAP_DONE = "Recap";
const NUDGE_MS = 20_000;
const chips = (...l: string[]): HomeButton[] => l.map((label) => ({ label }));

function PathPage() {
  const params = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const router = useRouter();
  const canGoBack = useCanGoBack();
  // Read after hydration: the trip note lives in this tab's storage.
  const [trail, setTrail] = useState(false);
  useEffect(() => { setTrail(cameFromChat()); }, []);
  const qc = useQueryClient();
  const get = useServerFn(getTopicIntroFn);
  const send = useServerFn(homeSendFn);
  const { me, home, tutorName } = useHomeData();
  const q = useQuery({ queryKey: ["topic-intro", params], queryFn: () => get({ data: params }), staleTime: 60_000, retry: 1 });
  const phone = useIsPhone();
  const r = q.data;
  const topic = me.data?.topics.find((t) => r?.kind === "intro" && t.id === r.topicId);
  const states = stopStates(topic?.resumeLesson ? topic.activeStep : null, !!topic?.completed && !topic.activeSessionId);
  const next = states.indexOf("next");

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [typing, setTyping] = useState(false);
  const [filling, setFilling] = useState<number | null>(null);
  const [open, setOpen] = useState(false); // closed until she taps Ask Fiti
  const [tapBeat, setTapBeat] = useState(0);
  const [seen, setSeen] = useState(0);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const conv = useRef<string | null>(null);
  const nudged = useRef(false);
  const waiting = useRef(false); // a "Ready?" is waiting for her reply
  const nudgeTimer = useRef<number | undefined>(undefined);
  const started = useRef(false);

  useEffect(() => {
    if (r?.kind === "redirect") navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: r.to, search: search.from ? { from: search.from } : {}, replace: true });
    if (r?.kind === "locked") navigate({ to: "/$subject", params: { subject: r.subject }, replace: true });
    if (r?.kind === "intro") document.title = pageTitle(r.topicName, "Let's Begin");
  }, [r, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const lines = (k: string, v: Record<string, string> = {}) =>
    (r?.kind === "intro" ? r.pathLines[k] ?? [] : []).map((t) => t.replace(/\{(\w+)\}/g, (m, key: string) => v[key] ?? m));
  const stopVars = () => {
    const i = Math.max(0, next);
    const done = PATH_STOPS.slice(0, i).map((s) => s.name);
    return { stop_n: String(i + 1), stop_name: PATH_STOPS[i]!.name, prev_stop: PATH_STOPS[Math.max(0, i - 1)]!.name,
      done_stops: done.length > 1 ? `${done.slice(0, -1).join(", ")} and ${done.at(-1)}` : done[0] ?? "" };
  };

  /** Fiti speaks one line after another; the chips sit on the last line. */
  const say = (ls: string[], buttons: HomeButton[] = [], asks = false) => {
    queue.current = queue.current.then(async () => {
      for (let i = 0; i < ls.length; i++) {
        setTyping(true);
        await wait(550);
        setTyping(false);
        const text = ls[i]!;
        prefetchVoice(splitSpoken(text)[0]);
        setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "tutor", text, buttons: i === ls.length - 1 ? buttons : [], live: true }]);
        await wait(Math.min(4000, 300 + text.length * 28));
      }
      waiting.current = asks;
      if (asks) armNudge();
    });
  };
  const armNudge = () => {
    window.clearTimeout(nudgeTimer.current);
    if (nudged.current) return;
    nudgeTimer.current = window.setTimeout(() => {
      if (!waiting.current || nudged.current) return;
      nudged.current = true;
      say(lines("path_nudge"));
    }, NUDGE_MS);
  };
  useEffect(() => () => window.clearTimeout(nudgeTimer.current), []);
  const student = (text: string) => {
    waiting.current = false;
    window.clearTimeout(nudgeTimer.current);
    setMsgs((m) => [...m.map((x) => ({ ...x, buttons: [] })), { id: crypto.randomUUID(), role: "student", text, buttons: [] }]);
  };
  const ready = () => say(lines("path_ready"), chips(GO, WHAT, NOT_NOW), true);

  // Opening: first visit, returning, or finished.
  useEffect(() => {
    if (started.current || r?.kind !== "intro" || !me.data) return;
    started.current = true;
    if (states.every((s) => s === "done")) say(lines("path_done", {}), chips(RECAP_DONE, HUB));
    else if (topic?.resumeLesson) say(lines("path_return", stopVars()), chips(GO, RECAP), true);
    else say(lines("path_first"), chips(GO, WHAT, NOT_NOW), true);
  }, [r, me.data]); // eslint-disable-line react-hooks/exhaustive-deps

  // A fresh lesson shows the "Quick Check" card first; Ready starts it. Resuming opens straight away.
  const [quick, setQuick] = useState<string | null>(null);
  const [backTo, setBackTo] = useState<number | null>(null);
  const [backBusy, setBackBusy] = useState(false);
  const [backErr, setBackErr] = useState<string | null>(null);
  const rewind = useServerFn(rewindStepFn);
  const openLesson = useServerFn(openLessonFn);
  const go = (shown = GO) => {
    if (filling != null || quick != null) return;
    if (!topic?.resumeLesson && lines("path_quick_check_title").length) { playSound("tap"); return setQuick(shown); }
    begin(shown);
  };
  const begin = (shown = GO) => {
    if (filling != null) return;
    student(shown);
    say(lines("path_go"));
    // Open the lesson while the stop fills in, so the lesson page appears ready with no loader.
    const ready = prefetchLesson(qc, params);
    setFilling(Math.max(0, next)); playSound("stop_done");
    const filled = Date.now();
    queue.current = queue.current.then(async () => {
      await wait(Math.max(0, filled - Date.now() + (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 150 : 1100)));
      await Promise.race([ready, wait(2500)]);
      navigate({ to: "/$subject/$chapter/$quest/$topic", params });
    });
  };

  const ask = async (text: string) => {
    student(text);
    setTyping(true);
    try {
      const res = await send({ data: { kind: "text", text, mode: "tutor", conversationId: conv.current } });
      conv.current = res.conversationId ?? conv.current;
      setTyping(false);
      if (res.lines.length) say([res.lines.join(" ")], res.proposal ? [{ label: "Yes", action: "plan_yes" }] : []);
      if (res.outcome === "saved") { void qc.invalidateQueries({ queryKey: ["home"] }); return; }
      if (!res.proposal) ready();
    } catch {
      setTyping(false);
      say(["Sorry, I couldn't do that just now. Please try again."]);
      ready();
    }
  };

  const onButton = async (b: HomeButton) => {
    if (b.label === GO) return go();
    if (b.label === WHAT) { student(WHAT); return say(lines("path_warmup"), chips(GO, WHAT, NOT_NOW), true); }
    if (b.label === NOT_NOW) { student(NOT_NOW); return say(lines("path_notnow"), chips(TOMORROW, HUB)); }
    if (b.label === HUB) return navigate({ to: "/learning-hub" });
    if (b.label === TOMORROW && r?.kind === "intro") return ask(`move ${r.topicName} to tomorrow`);
    if (b.label === RECAP || b.label === RECAP_DONE) {
      student(b.label);
      const v = stopVars();
      const all = states.every((s) => s === "done");
      return all ? say([`You finished ${PATH_STOPS.map((s) => s.name).join(", ")}.`], chips(HUB))
        : say(next > 0 ? lines("path_recap", v) : lines("path_recap_none", v), chips(GO, WHAT, NOT_NOW), true);
    }
    if (b.action === "plan_yes") {
      student("Yes");
      setTyping(true);
      try {
        const res = await send({ data: { kind: "plan_yes", proposal: null as never, conversationId: conv.current } });
        setTyping(false);
        say(res.lines.length ? [res.lines.join(" ")] : []);
        void qc.invalidateQueries({ queryKey: ["home"] });
      } catch { setTyping(false); say(["Sorry, I couldn't do that just now. Please try again."]); }
    }
    return undefined;
  };

  const onType = (text: string) => {
    if (waiting.current && GO_WORDS.test(text)) return go(text);
    void ask(text);
  };

  const onStop = (i: number) => {
    const s = states[i];
    setTapBeat((b) => b + 1);
    if (s === "next") return go();
    if (s === "locked") { playSound("tap"); return void toast(lines("path_locked", { prev_stop: PATH_STOPS[Math.max(0, i - 1)]!.name })[0] ?? lockedMessage(i)); }
    // Done: ask before going back to it (her lesson restarts from that step).
    if (s === "done" && rewindTarget(i, states)) { playSound("tap"); setBackErr(null); setBackTo(i); }
  };
  const confirmBack = async () => {
    if (backTo == null || backBusy) return;
    const step = rewindTarget(backTo, states);
    if (!step) return setBackTo(null);
    setBackBusy(true); setBackErr(null);
    try {
      let id = topic?.activeSessionId ?? null;
      if (!id) { const o = await openLesson({ data: { ...params, preview: false } }); id = o.kind === "session" ? o.sessionId : null; }
      if (!id) throw new Error("no session");
      await rewind({ data: { sessionId: id, step } });
      qc.removeQueries({ queryKey: ["lesson"] }); qc.removeQueries({ queryKey: ["lesson-open"] });
      await Promise.all([qc.invalidateQueries({ queryKey: ["me"] }), qc.invalidateQueries({ queryKey: ["home"] }), qc.invalidateQueries({ queryKey: ["progress"] })]);
      setBackTo(null);
      navigate({ to: "/$subject/$chapter/$quest/$topic", params });
    } catch {
      setBackErr(lines("path_back_error")[0] ?? "Couldn't go back, try again.");
    } finally { setBackBusy(false); }
  };

  if (me.isLoading || home.isLoading || q.isLoading || r?.kind === "redirect" || r?.kind === "locked") return <PageSkeleton rows={4} />;
  if (q.isError || !r || !me.data || !home.data) return <FriendlyError onRetry={() => { void q.refetch(); void me.refetch(); void home.refetch(); }} />;
  if (r.kind === "notfound") return <FriendlyError message="We couldn't find that lesson." />;
  const h = home.data;
  const tutorMsgs = msgs.filter((m) => m.role === "tutor");
  const tutorCount = tutorMsgs.length;
  const lastText = tutorMsgs.at(-1)?.text ?? "";
  const allDone = states.length > 0 && states.every((s) => s === "done");
  const doneCount = states.filter((s) => s === "done").length;
  // Fiti reacts: celebrates a finished topic, nods (encouraging) when stops are finished, taps when a stop is tapped.
  const mood: LiveMood = allDone ? "celebrate" : typing ? "thinking" : /great|well done|brilliant|nice|🎉/i.test(lastText) ? "celebrate" : /\?\s*$/.test(lastText) ? "listening" : tutorCount ? "encouraging" : "idle";

  const chat = (
    <section data-path-chat aria-label={`Chat with ${tutorName}`} className="flex min-h-0 flex-col rounded-[24px] border border-fh-box-line bg-fh-card/95 shadow-[0_8px_24px_-12px_rgb(2_64_100/0.25)] backdrop-blur-sm">
      <div className="flex items-center justify-between px-5 pt-4">
        <p className="text-[15px] font-semibold text-hub-name">{tutorName}</p>
        {<button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-9 w-9 place-items-center rounded-full text-fh-sub hover:bg-fh-plus"><X className="h-5 w-5" /></button>}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4 pt-3 [&_.space-y-10]:space-y-5 [&_img]:h-[44px] [&_img]:w-[36px] [&_img]:object-contain [&_p]:text-[15px]">
        <Conversation msgs={msgs} busy={typing} tutorName={tutorName} initials={h.initials} onButton={(b) => void onButton(b)} onYes={() => undefined} onOther={() => undefined} onPick={() => undefined} />
      </div>
      <AskBox onSend={(t) => onType(t)} busy={typing || filling != null} tutorName={tutorName} className="m-3 mt-0 shadow-[0_4px_0_var(--fh-box-edge)]" placeholder={`Reply to ${tutorName}...`} minimal />
    </section>
  );

  const fromChat = backTarget(trail, search.from === "chat") === "chat";
  // From the chat with a page behind us: step back so she lands on the same conversation.
  const backToChat = (e: { preventDefault(): void }) => { if (fromChat && canGoBack && search.from === "chat") { e.preventDefault(); markChatOpen(); router.history.back(); } else if (fromChat) markChatOpen(); };
  return (
    <FitilaShell initials={h.initials} streak={h.streak} tutorName={tutorName} isAdmin={me.data.isAdmin}>
      {quick != null && <WelcomeCard title={lines("path_quick_check_title").join(" ")} line={lines("path_quick_check_line").join(" ")}
        button={lines("path_quick_check_button").join(" ")} onClose={() => setQuick(null)} onGo={() => { const s = quick; setQuick(null); begin(s); }} />}
      <main className="relative mx-auto min-h-screen w-full max-w-[1536px] px-4 pb-[52vh] pt-24 md:px-[clamp(24px,4vw,72px)] md:pb-8 md:pt-[clamp(104px,12vh,130px)]">
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <Link {...(fromChat ? { to: "/", search: { resume: `/${params.subject}/${params.chapter}/${params.quest}/${params.topic}/path` } } : { to: "/$subject/$chapter", params: { subject: params.subject, chapter: params.chapter } })}
            onClick={backToChat}
            className="flex h-11 items-center gap-2 rounded-xl px-2 text-[18px] text-fh-heading transition-colors hover:bg-fh-nav-on/70 focus-visible:outline-2 focus-visible:outline-fh-box-edge">
            <ArrowLeft className="h-6 w-6" />Back
          </Link>
          <div className="min-w-0 text-center">
            <h1 className="font-hand text-[40px] leading-none text-hub-heading [-webkit-text-stroke:1px_var(--hub-heading)] md:text-[clamp(44px,6vh,60px)]">Let&rsquo;s Begin</h1>
            <p className="mt-1 truncate text-[15px] font-semibold text-fh-sub">{r.topicName}</p>
          </div>
          <span className="w-[88px]" aria-hidden />
        </div>

        <div className={`mx-auto mt-4 grid gap-6 ${open && !phone ? "max-w-[1280px] min-[1100px]:grid-cols-[minmax(0,1fr)_clamp(320px,26vw,400px)] min-[1100px]:items-start" : "max-w-[900px]"}`}>
          <div className="pt-2"><PathMap states={states} secure={!!topic?.secure} phone={phone} filling={filling} onStop={onStop} /></div>
          {backTo != null && (() => { const v = { stop_name: PATH_STOPS[backTo]!.name };
            return <GoBackDialog open title={lines("path_back_title", v)[0] ?? `Go back to ${v.stop_name}?`} line={lines("path_back_line", v)[0] ?? ""}
              yes={lines("path_back_yes", v)[0] ?? "Yes, go back"} stay={lines("path_back_stay", v)[0] ?? "Stay here"}
              busy={backBusy} error={backErr} onYes={() => void confirmBack()} onStay={() => setBackTo(null)} />; })()}
          {!phone && open && <div className="anim-note-pop flex h-[min(560px,calc(100vh-400px))] min-h-[360px] max-[1099px]:h-[420px] flex-col">{chat}</div>}
        </div>

        <div aria-hidden className="pointer-events-none fixed bottom-3 right-[clamp(16px,3vw,48px)] z-0 hidden h-[clamp(240px,34vh,340px)] w-[clamp(170px,13vw,240px)] xl:block">
          <span key={`${tutorCount}:${tapBeat}:${doneCount}`} className="lt-shake block h-full w-full">
            <MapFiti mood={mood} />
          </span>
        </div>
        {!open && (
          <button type="button" aria-label={`Ask ${tutorName}${tutorCount > seen ? ", new message" : ""}`}
            onClick={() => { setOpen(true); setSeen(tutorCount); window.setTimeout(() => document.querySelector<HTMLTextAreaElement>("[data-path-chat] textarea")?.focus(), 60); }}
            className="squish fixed bottom-[88px] left-4 z-20 flex h-14 items-center gap-2 rounded-2xl border-2 border-fh-box-edge/50 bg-fh-card px-5 text-[20px] font-semibold text-fh-heading shadow-[0_4px_0_var(--fh-box-edge)] hover:-translate-y-0.5 md:bottom-8 md:left-[calc(clamp(168px,9.2vw,176px)+32px)]">
            <img src={bird.url} alt="" className="h-6 w-6 object-contain" />Ask {tutorName}
            {tutorCount > seen && <span aria-hidden className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-fh-card bg-hub-day-on" />}
          </button>
        )}
      </main>
      {phone && open && <div className="fixed inset-x-0 bottom-16 z-30 flex h-[48vh] flex-col p-2">{chat}</div>}
    </FitilaShell>
  );
}

const wait = (ms: number) => new Promise<void>((res) => window.setTimeout(res, ms));

/** Map Fiti: see-through "looking around" loop; still picture in low-data/reduced motion; today's Fiti if the clip fails. */
function MapFiti({ mood }: { mood: LiveMood }) {
  const [low] = useLowData();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setReady(true), 400); return () => window.clearTimeout(t); }, []);
  const still = low || (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches);
  const webmOk = typeof document !== "undefined" && document.createElement("video").canPlayType('video/webm; codecs="vp9"') !== "";
  if (failed) return <LiveTutor src={parrot.url} mood={mood} fit="contain" className="h-full w-full" />;
  if (!ready || still || !webmOk) return <img src={lookStill.url} alt="" onError={() => setFailed(true)} className="h-full w-full object-contain object-bottom" />;
  return <video src={lookClip.url} poster={lookStill.url} muted loop autoPlay playsInline preload="auto" onError={() => setFailed(true)} className="h-full w-full object-contain object-bottom" />;
}
