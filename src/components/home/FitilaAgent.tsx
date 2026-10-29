// Fitila on Home: plan card, ask box (Tutor / Quiz me, mic, send), three cards and the chat strip.
// Every tap or message goes to the Home engine; the reply streams in and any screen opens as it starts.
import { markChatOpen } from "@/lib/chat-open";
import { sameMap } from "@/shared/continue-link";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { createPortal } from "react-dom";
import { FitiLoader } from "@/components/learn/FitiLoader";
import { LOADER_MIN_AFTER_TAP_MS } from "@/shared/loader-timing";
import { playSound } from "@/lib/sound";
import { hush, prefetchVoice, useSay } from "@/lib/voice";
import { splitSpoken } from "@/shared/spoken-split";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUp, Mic, Plus, Square, X } from "lucide-react";
import { homeOpeningFn, homeSendFn } from "@/lib/api/home.functions";
import { supabase } from "@/integrations/supabase/client";
import { useTypeOn, Cursor } from "@/components/lesson/StreamingText";
import { cn } from "@/lib/utils";
import type { TopicPath } from "@/shared/contracts/home";
import type { HomeButton, HomeCard, HomeChatMsg, HomeData, HomeOption, HomeReply } from "@/shared/contracts/home";
import parrotSmall from "@/assets/home/parrot-thumbs.png.asset.json";
import headTutor from "@/assets/tutor/head.png.asset.json";
import times from "@/assets/home/times.png.asset.json";
import dna from "@/assets/home/dna.png.asset.json";

type Msg = HomeChatMsg & { live?: boolean; proposal?: boolean };
type Send = Parameters<typeof homeSendFn>[0]["data"];

export function useFitila(initial: HomeChatMsg[] = [], initialConv: string | null = null) {
  const send = useServerFn(homeSendFn);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [msgs, setMsgs] = useState<Msg[]>(initial);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [welcome, setWelcome] = useState<TopicPath | null>(null);
  const conv = useRef<string | null>(initialConv);
  useEffect(() => { if (initial.length && !msgs.length) setMsgs(initial); }, [initial]); // eslint-disable-line react-hooks/exhaustive-deps
  // Fiti speaks first in a fresh conversation: the first-time talk, or a situation-aware hello once a day.
  const openFn = useServerFn(homeOpeningFn);
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current || initial.length) return;
    opened.current = true;
    setBusy(true);
    openFn({ data: { conversationId: conv.current } }).then((r) => {
      if (!r) return;
      conv.current = r.conversationId ?? conv.current;
      prefetchVoice(splitSpoken(r.lines.join(" "))[0]); // start his voice before the bubble draws
      const tutorMsg: Msg = { id: crypto.randomUUID(), role: "tutor", text: r.lines.join(" "), buttons: r.buttons, live: true };
      setMsgs((m) => (m.length ? m : [tutorMsg]));
      qc.setQueryData(["home-history"], { conversationId: conv.current, msgs: [{ ...tutorMsg, live: false }] });
    }).catch(() => undefined).finally(() => setBusy(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(data: Send, shown?: string) {
    if (busy) return;
    hush(); // her new message stops whatever Fiti was still saying
    setStarted(true);
    setBusy(true);
    if (shown) setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "student", text: shown, buttons: [] }]);
    try {
      const r: HomeReply = await send({ data: { ...data, conversationId: conv.current } as Send });
      if (r.conversationId && r.conversationId !== conv.current) {
        conv.current = r.conversationId;
      }
      const id = crypto.randomUUID();
      prefetchVoice(splitSpoken(r.lines.join(" "))[0]); // start his voice before the bubble draws
      const tutorMsg: Msg = { id, role: "tutor", text: r.lines.join(" "), buttons: r.buttons, live: true, proposal: !!r.proposal, ...(r.options ? { options: r.options } : {}), ...(r.planView ? { planView: r.planView } : {}) };
      setMsgs((m) => [...m, tutorMsg]);
      qc.setQueryData(["home-history"], (old: { msgs: HomeChatMsg[] } | undefined) => ({ conversationId: conv.current, msgs: [...(old?.msgs ?? []), ...(shown ? [{ id: `s-${id}`, role: "student" as const, text: shown, buttons: [] }] : []), { ...tutorMsg, live: false }] }));
      if (r.outcome === "saved" || r.outcome === "quiz_built") qc.invalidateQueries({ queryKey: ["home"] });
      // Screens open right after Fitila's line starts.
      if (r.navigate) setTimeout(() => {
        const n = r.navigate!;
        if (n.to === "quiz" && n.sessionId) navigate({ to: "/quiz/$sessionId", params: { sessionId: n.sessionId } });
        else if (n.to === "lesson" && n.path) markChatOpen(), navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: n.path, search: { from: "chat" } });
        else if (n.to === "intro" && n.path) setWelcome(n.path);
        else if (n.to === "subject") navigate({ to: "/$subject", params: { subject: "mathematics" } });
      }, 900);
    } catch {
      setMsgs((m) => [...m, { id: crypto.randomUUID(), role: "tutor", text: "Sorry, I couldn't do that just now. Please try again.", buttons: [] }]);
    } finally { setBusy(false); }
  }
  const press = (b: HomeButton) => {
    hush();
    if (b.link) { if (b.link.includes("from=chat")) markChatOpen(); return navigate({ href: b.link }); }
    if (b.action === "start_plan") return run({ kind: "start_plan" }, b.label);
    if (b.send) return run({ kind: "text", text: b.send, mode: "tutor" }, b.label);
    return undefined;
  };
  const pick = (o: HomeOption) => { void run({ kind: "option", num: o.num }, o.title); };
  const addTutor = (text: string, buttons: HomeButton[]) => setMsgs((m) => {
    const last = m[m.length - 1];
    if (last?.role === "tutor" && last.buttons.some((b) => sameMap(b.link, buttons[0]?.link))) return m;
    const msg: Msg = { id: crypto.randomUUID(), role: "tutor", text, buttons, live: true };
    qc.setQueryData(["home-history"], (old: { conversationId?: string; msgs: HomeChatMsg[] } | undefined) => old ? { ...old, msgs: [...old.msgs, { ...msg, live: false }] } : old);
    return [...m, msg];
  });
  return { msgs, busy, started, open: () => setStarted(true), run, press, pick, addTutor, welcome, closeWelcome: () => {
    // Closing leaves a way in: the latest Fiti line gets a Continue Learning button.
    const w = welcome; setWelcome(null);
    if (w) setMsgs((m) => m.map((x, i) => i === m.length - 1 && x.role === "tutor" && !x.buttons.some((b) => b.link)
      ? { ...x, buttons: [...x.buttons, { label: "Continue Learning", link: `/${w.subject}/${w.chapter}/${w.quest}/${w.topic}/path?from=chat` }] } : x));
  } };
}

export function PlanCard({ home, onStart, tutorName }: { home: HomeData; onStart: () => void; tutorName: string }) {
  return (
    <section aria-label="Tonight's plan" className="rounded-[20px] bg-fh-card p-5 shadow-[0_8px_30px_-12px_rgb(10_49_80/0.18)] md:p-6">
      <div className="flex items-start gap-3">
        <img src={headTutor.url} alt="" className="h-11 w-11 shrink-0 rounded-full bg-fh-plus object-contain" />
        <p className="pt-2 text-[17px] font-semibold text-fh-ink">{home.planGreeting}</p>
      </div>
      {home.plan.length > 0 && (
        <ol className="mt-3 space-y-2 pl-14">
          {home.plan.map((p, i) => (
            <li key={p.id} className="flex gap-2 text-[15px] text-fh-ink">
              <span className="font-bold text-fh-box-edge">{i + 1}.</span>
              <span>{planLabel(p)}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-4 pl-14">
        <button type="button" onClick={onStart}
          className="h-11 rounded-full bg-fh-primary px-6 text-[16px] font-semibold text-fh-primary-ink shadow-[0_4px_0_var(--fh-primary-edge)] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_var(--fh-primary-edge)]">
          {home.plan.length ? `Start with ${tutorName}` : "Let's make your plan"}
        </button>
      </div>
    </section>
  );
}

export function planLabel(p: HomeData["plan"][number]) {
  if (p.kind === "continue") return `Continue: ${p.label}`;
  if (p.kind === "review") return `5-minute review: ${p.label}`;
  if (p.kind === "teacher") return `${p.label} · from your teacher${p.due_at ? `, due ${new Date(p.due_at).toLocaleDateString("en-GB", { weekday: "short", timeZone: "Africa/Lagos" })}` : ""}`;
  if (p.kind === "plan" && p.source === "parent") return `${p.label} · from your parent`;
  return p.label;
}

export function AskBox({ onSend, busy, tutorName, className: cls, placeholder, classLabel = "SS3", minimal }: { minimal?: boolean; onSend: (text: string, mode: "tutor" | "quiz") => void; busy: boolean; tutorName: string; className?: string; placeholder?: string; classLabel?: string }) {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"tutor" | "quiz">("tutor");
  const mic = useMic((t, send) => {
    if (send && !busy) { const full = (text.trim() ? `${text.trim()} ${t}` : t); onSend(full, mode); setText(""); }
    else setText((x) => (x ? `${x} ${t}` : t));
  });
  const go = () => { const t = text.trim() || (mode === "quiz" ? "quiz me" : ""); if (!t || busy) return; onSend(t, mode); setText(""); };
  return (
    <div className={cn("rounded-[24px] border border-fh-box-line bg-fh-card shadow-[0_8px_0_var(--fh-box-edge)] transition-[box-shadow] focus-within:ring-2 focus-within:ring-fh-box-edge/40", cls)}>
      {mic.on ? <RecordingBar secs={mic.secs} levels={mic.levels} onCancel={() => mic.stop("cancel")} onStop={() => mic.stop("text")} onSend={() => mic.stop("send")} />
      : <>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={600}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }}
        placeholder={placeholder ?? `Or ask ${tutorName} anything...`} aria-label={`Ask ${tutorName}`}
        className="block w-full resize-none rounded-t-[24px] border-0 bg-transparent px-5 pt-5 text-[14px] text-fh-ink shadow-none placeholder:text-fh-sub !outline-none !ring-0 focus:!outline-none focus-visible:!outline-none focus:!ring-0 focus:!shadow-none" />
      <div className="flex items-center gap-2 px-4 pb-4 pt-2">
        <button type="button" aria-label="More" className="grid h-9 w-9 place-items-center rounded-full bg-fh-plus text-fh-ink transition-colors hover:bg-fh-chip-on"><Plus className="h-5 w-5" /></button>
        {!minimal && (["tutor", "quiz"] as const).map((m) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
            className={cn("h-6 rounded-full px-4 text-[12px] font-semibold transition-colors", mode === m ? "bg-fh-chip-on text-fh-chip-on-ink" : "bg-fh-chip text-fh-chip-ink hover:bg-fh-chip-on/70")}>
            {m === "tutor" ? "Tutor" : "Quiz me"}
          </button>
        ))}
        <span className="ml-auto text-[11px] font-semibold text-fh-chip-ink">{minimal ? null : classLabel}</span>
        <button type="button" onClick={() => void mic.start()} disabled={mic.busy} aria-label="Speak" title={mic.note ?? undefined}
          className={cn("grid h-9 w-9 place-items-center rounded-full text-fh-mic transition-colors hover:bg-fh-plus", mic.on && "bg-fh-chip-on")}>
          <Mic className="h-5 w-5" />
        </button>
        <button type="button" onClick={go} disabled={busy} aria-label="Send"
          className="grid h-9 w-9 place-items-center rounded-full bg-fh-send text-fh-send-ink transition-[filter,transform] hover:brightness-110 active:scale-95 disabled:opacity-60 motion-reduce:transition-none"><ArrowUp className="h-5 w-5" strokeWidth={2.5} /></button>
      </div>
      </>}
      {!mic.on && mic.note && <p className="px-5 pb-3 text-xs font-medium text-fh-sub" role="status">{mic.note}</p>}
    </div>
  );
}

const BARS = 96;
function useMic(onText: (t: string, send: boolean) => void) {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [secs, setSecs] = useState(0);
  const [levels, setLevels] = useState<number[]>(() => Array(BARS).fill(0));
  const [note, setNote] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const after = useRef<"text" | "send" | "cancel">("text");
  const cleanup = useRef<() => void>(() => {});
  useEffect(() => () => { hush(); after.current = "cancel"; if (rec.current?.state === "recording") rec.current.stop(); cleanup.current(); }, []);
  const stop = (how: "text" | "send" | "cancel") => { after.current = how; if (rec.current?.state === "recording") rec.current.stop(); };
  async function start() {
    if (busy || on) return;
    setNote(null);
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") { setNote("Voice isn't supported on this browser. You can type instead."); return; }
    let stream: MediaStream;
    hush(); // the mic never hears Fiti
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); }
    catch { setNote("Please allow the microphone, or type instead."); return; }
    const type = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    const r = type ? new MediaRecorder(stream, { mimeType: type }) : new MediaRecorder(stream);
    const base = (r.mimeType || type || "audio/webm").split(";")[0] ?? "audio/webm";
    const ext = base.includes("mp4") ? "m4a" : base.includes("ogg") ? "ogg" : "webm";
    const chunks: BlobPart[] = [];
    const started = Date.now();
    // Live sound wave: volume sampled ~12 times a second, newest on the right.
    let ctx: AudioContext | null = null; let raf = 0; let last = 0;
    try {
      ctx = new AudioContext(); void ctx.resume().catch(() => {});
      const an = ctx.createAnalyser(); an.fftSize = 512; ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      const loop = (t: number) => {
        raf = requestAnimationFrame(loop);
        if (t - last < 80) return; last = t;
        an.getByteTimeDomainData(buf);
        let sum = 0; for (const v of buf) { const d = (v - 128) / 128; sum += d * d; }
        const lvl = Math.min(1, Math.sqrt(sum / buf.length) * 4);
        setLevels((p) => [...p.slice(1), lvl]);
        setSecs(Math.floor((Date.now() - started) / 1000));
      };
      raf = requestAnimationFrame(loop);
    } catch { /* wave is decoration only */ }
    const limit = setTimeout(() => stop("text"), 30000);
    cleanup.current = () => { cancelAnimationFrame(raf); clearTimeout(limit); void ctx?.close().catch(() => {}); stream.getTracks().forEach((t) => t.stop()); };
    r.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    r.onstop = async () => {
      cleanup.current(); setOn(false); setLevels(Array(BARS).fill(0));
      const how = after.current;
      if (how === "cancel") return;
      const blob = new Blob(chunks, { type: base });
      if (Date.now() - started < 700 || blob.size < 1000) { setNote("That was too short. Speak a little longer."); return; }
      setBusy(true); setNote("Writing what you said…");
      try {
        const { data } = await supabase.auth.getSession();
        const form = new FormData(); form.append("file", new File([blob], `speech.${ext}`, { type: base }));
        const res = await fetch("/api/transcribe", { method: "POST", headers: { Authorization: `Bearer ${data.session?.access_token ?? ""}` }, body: form });
        const j = await res.json().catch(() => ({})) as { text?: string; error?: string };
        if (res.status === 403 && j.error === "consent") { setNote("Ask your parent to allow voice. You can type instead."); return; }
        if (!res.ok || !j.text) { setNote(j.error ?? "I couldn't hear that. Please try again or type."); return; }
        setNote(null); onText(j.text, how === "send");
      } catch { setNote("I couldn't hear that. Please try again or type."); }
      finally { setBusy(false); }
    };
    after.current = "text"; rec.current = r; r.start(250); setOn(true); setSecs(0);
  }
  return { on, busy, secs, levels, note, start, stop };
}

function RecordingBar({ secs, levels, onCancel, onStop, onSend }: { secs: number; levels: number[]; onCancel: () => void; onStop: () => void; onSend: () => void }) {
  const t = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  return (
    <div className="px-4 pb-4 pt-3" role="group" aria-label="Recording">
      <p className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold text-fh-ink" role="status" aria-live="polite">
        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-fh-send motion-reduce:animate-none" aria-hidden />
        Recording {t}{secs >= 25 && <span className="font-medium text-fh-sub"> · stops at 0:30</span>}
      </p>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onCancel} aria-label="Cancel recording"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-fh-box-line text-fh-ink transition-colors hover:bg-fh-plus"><X className="h-5 w-5" /></button>
        <div className="flex h-11 min-w-0 flex-1 items-center justify-end gap-[3px] overflow-hidden" aria-hidden>
          {levels.map((l, i) => (
            <span key={i} className={cn("w-[3px] shrink-0 rounded-full", l > 0.04 ? "bg-fh-ink" : "bg-fh-sub/50")}
              style={{ height: l > 0.04 ? `${Math.max(6, l * 40)}px` : "3px" }} />
          ))}
        </div>
        <button type="button" onClick={onStop} aria-label="Stop and write my words"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-fh-box-edge text-fh-ink transition-colors hover:bg-fh-plus"><Square className="h-4 w-4 fill-current" /></button>
        <button type="button" onClick={onSend} aria-label="Stop and send"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-fh-send text-fh-send-ink transition-[filter] hover:brightness-110"><ArrowUp className="h-5 w-5" strokeWidth={2.5} /></button>
      </div>
    </div>
  );
}

const CARD_ICON: Record<HomeCard["kind"], string> = { continue: times.url, review: dna.url, teacher: "", explore: times.url };

export function FitilaCards({ cards, onCard }: { cards: HomeCard[]; onCard: (c: HomeCard) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-3.5">
      {cards.map((c, i) => (
        <button key={`${c.kind}-${i}`} type="button" onClick={() => onCard(c)}
          className="flex min-w-0 items-center gap-3 rounded-[14px] bg-fh-card px-4 py-3.5 text-left shadow-[0_2px_10px_-6px_rgb(10_49_80/0.15)] transition-transform hover:-translate-y-0.5">
          {c.kind === "teacher" ? <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center text-[26px] font-black text-fh-box-edge">Aa</span>
            : <img src={c.kind === "explore" ? [times.url, dna.url, times.url][i] : CARD_ICON[c.kind]} alt="" className="h-9 w-9 shrink-0 object-contain" />}
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-semibold text-fh-ink">{c.title}</span>
            <span className="block truncate text-[11px] text-fh-sub">{c.line}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

export function ChatLines({ msgs, busy, onButton, onYes, onOther, compact }: {
  msgs: Msg[]; busy: boolean; onButton: (b: HomeButton) => void; onYes: () => void; onOther: () => void; compact?: boolean;
}) {
  const shown = compact ? msgs.slice(-2) : msgs;
  return (
    <div className="space-y-2.5" aria-live="polite">
      {shown.map((m, i) => m.role === "student"
        ? <p key={m.id} className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-fh-chip-on px-4 py-2 text-[15px] text-fh-ink">{m.text}</p>
        : <TutorLine key={m.id} m={m} last={i === shown.length - 1} onButton={onButton} onYes={onYes} onOther={onOther} />)}
      {busy && <div className="flex items-center gap-2"><img src={headTutor.url} alt="" className="h-7 w-7" /><span className="flex gap-1" aria-label="Typing">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-fh-sub" style={{ animationDelay: `${d * 120}ms` }} />)}</span></div>}
    </div>
  );
}

export function TutorLine({ m, last, onButton, onYes, onOther }: { m: Msg; last: boolean; onButton: (b: HomeButton) => void; onYes: () => void; onOther: () => void }) {
  const t = useTypeOn(m.text, { live: !!m.live, voice: true });
  return (
    <div className="flex items-start gap-2">
      <img src={headTutor.url} alt="" className="h-7 w-7 shrink-0" />
      <div className="min-w-0 rounded-2xl rounded-tl-md bg-fh-bubble px-4 py-2 text-[15px] text-fh-ink" onClick={t.skip}>
        {t.text === null ? <span className="text-fh-sub">…</span> : <>{t.text}{!t.done && <Cursor />}</>}
        {t.done && m.planView && (
          <div className="mt-5 max-w-[560px] rounded-[18px] bg-fh-card p-5 shadow-[0_6px_24px_-12px_rgb(10_49_80/0.25)]" aria-label="Your plan">
            {m.planView.tonight.length > 0 && <>
              <p className="text-[13px] font-semibold uppercase tracking-wide text-fh-sub">Tonight</p>
              <ol className="mt-2 space-y-2">
                {m.planView.tonight.map((it) => (
                  <li key={it.num} className="flex items-center gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-fh-nav-on text-[12px] font-bold text-fh-heading">{it.num}</span><span className="text-[15px] font-semibold text-fh-heading">{it.label}</span></li>
                ))}
              </ol>
            </>}
            {m.planView.week.length > 0 && <>
              <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-fh-sub">This week</p>
              <ul className="mt-2 space-y-1.5">
                {m.planView.week.map((it, k) => (
                  <li key={k} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-baseline gap-3 text-[14px]"><span className="font-semibold text-fh-sub">{it.day}</span><span className="truncate font-semibold text-fh-heading">{it.label}</span><span className="text-[12px] text-fh-ink/80">{it.source}</span></li>
                ))}
              </ul>
            </>}
          </div>
        )}
        {t.done && last && m.proposal && (
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" onClick={onYes} className="h-9 rounded-full bg-fh-primary px-4 text-sm font-semibold text-fh-primary-ink">Yes</button>
            <button type="button" onClick={onOther} className="h-9 rounded-full bg-fh-chip px-4 text-sm font-semibold text-fh-chip-ink">Pick another time</button>
          </div>
        )}
        {t.done && last && m.buttons.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {m.buttons.map((b) => <button key={b.label} type="button" onClick={() => onButton(b)} className="h-9 rounded-full bg-fh-chip-on px-4 text-sm font-semibold text-fh-chip-on-ink">{b.label}</button>)}
          </div>
        )}
      </div>
    </div>
  );
}

/** The Ask conversation, as in the design: her messages right (light blue, her initials), the tutor's left
 *  (small parrot, name label, streamed reply in the readable font), numbered options under a reply. */
export function Conversation({ msgs, busy, tutorName, initials, onButton, onYes, onOther, onPick }: {
  msgs: Msg[]; busy: boolean; tutorName: string; initials: string; onButton: (b: HomeButton) => void; onYes: () => void; onOther: () => void; onPick: (o: HomeOption) => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const first = useRef(true);
  const lastStudent = msgs.length > 0 && msgs[msgs.length - 1]?.role === "student";
  // Follow the newest message while it types in and its buttons appear; stop if she scrolls up to read.
  useEffect(() => {
    const onScroll = () => {
      const doc = document.scrollingElement ?? document.documentElement;
      stick.current = doc.scrollHeight - (window.scrollY + window.innerHeight) < 160;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (lastStudent) stick.current = true;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    end.current?.scrollIntoView({ behavior: first.current || reduce ? "auto" : "smooth", block: "end" });
    if (msgs.length) first.current = false;
  }, [msgs.length, busy, lastStudent]);
  useEffect(() => {
    const el = box.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => { if (stick.current) end.current?.scrollIntoView({ behavior: "auto", block: "end" }); });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="space-y-10" aria-live="polite">
      {msgs.map((m, i) => m.role === "student" ? (
        <div key={m.id} className="flex items-start justify-end gap-3">
          <p className="max-w-[80%] rounded-[18px] bg-hub-me-bubble px-6 py-5 font-hand text-[19px] leading-snug text-fh-heading md:min-w-[260px]">{m.text}</p>
          <span className="-mt-3 grid h-12 w-12 shrink-0 place-items-center rounded-full bg-fh-avatar text-[16px] font-medium text-fh-avatar-ink" aria-label="You">{initials}</span>
        </div>
      ) : (
        <ConvTutor key={m.id} m={m} name={tutorName} last={i === msgs.length - 1} onButton={onButton} onYes={onYes} onOther={onOther} onPick={onPick} />
      ))}
      {busy && (
        <div className="flex items-start gap-4">
          <img src={parrotSmall.url} alt="" className="h-[100px] w-[60px] shrink-0 object-contain" />
          <div className="pt-1"><p className="text-[17px] text-hub-name">{tutorName}</p>
            <span className="mt-3 flex gap-1" aria-label="Typing">{[0, 1, 2].map((d) => <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-fh-sub" style={{ animationDelay: `${d * 120}ms` }} />)}</span></div>
        </div>
      )}
      <div ref={end} className="scroll-mb-40" />
    </div>
  );
}

function ConvTutor({ m, name, last, onButton, onYes, onOther, onPick }: { m: Msg; name: string; last: boolean; onButton: (b: HomeButton) => void; onYes: () => void; onOther: () => void; onPick: (o: HomeOption) => void }) {
  const t = useTypeOn(m.text, { live: !!m.live, voice: true });
  // Only a new message speaks (history stays silent); a newer one replaces it.
  useSay(m.live && last ? [m.text] : [], `home-msg:${m.id}`, !!m.live && last, true);
  return (
    <div className="flex items-start gap-4">
      <img src={parrotSmall.url} alt="" className={cn("h-[100px] w-[60px] shrink-0 origin-bottom object-contain", last && "fiti-greet")} />
      <div className="min-w-0 flex-1 pt-1" onClick={t.skip}>
        <p className="text-[17px] text-hub-name">{name}</p>
        <p className="mt-2 max-w-[600px] font-hand text-[clamp(19px,1.5vw,22px)] font-normal leading-snug text-fh-heading">
          {t.text === null ? <span className="text-fh-sub">…</span> : <>{t.text}{!t.done && <Cursor />}</>}
        </p>
        {t.done && m.options && m.options.length > 0 && (
          <ol className="mt-10 space-y-8">
            {m.options.map((o) => {
              const body = (
                <>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-fh-card text-[13px] font-bold text-fh-heading shadow-[0_3px_0_var(--fh-box-edge)] transition-transform duration-200 group-hover:-translate-y-0.5 motion-reduce:transition-none max-md:h-11 max-md:w-11">{o.num}</span>
                  <span className="min-w-0 text-left">
                    <span className="block text-[15px] font-semibold text-fh-heading">{o.title}</span>
                    <span className="mt-1 block text-[12.5px] font-medium text-fh-ink/85">{o.line}</span>
                  </span>
                </>
              );
              return (
                <li key={o.num}>
                  <button type="button" onClick={(e) => { e.stopPropagation(); onPick(o); }} className="group flex w-full items-start gap-3 rounded-xl p-1 text-left transition-colors hover:bg-fh-nav-on/60 focus-visible:outline-2 focus-visible:outline-fh-box-edge">{body}</button>
                </li>
              );
            })}
          </ol>
        )}
        {t.done && last && m.proposal && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={onYes} className="h-9 rounded-full bg-fh-primary px-4 text-sm font-semibold text-fh-primary-ink">Yes</button>
            <button type="button" onClick={onOther} className="h-9 rounded-full bg-fh-chip px-4 text-sm font-semibold text-fh-chip-ink">Pick another time</button>
          </div>
        )}
        {t.done && last && m.buttons.some((b) => !b.link) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {m.buttons.filter((b) => !b.link).map((b) => <button key={b.label} type="button" onClick={() => onButton(b)} className="h-9 rounded-full bg-fh-chip-on px-4 text-sm font-semibold text-fh-chip-on-ink">{b.label}</button>)}
          </div>
        )}
        {t.done && last && m.buttons.some((b) => b.link) && (
          <div className="mt-6 flex flex-wrap justify-end gap-3 max-md:flex-col">
            {m.buttons.filter((b) => b.link).map((b) => <ContinueButton key={b.label} b={b} onButton={onButton} />)}
          </div>
        )}
      </div>
    </div>
  );
}

/** Design "Continue Learning": white pill, thin navy line, deep navy bottom edge; one tap only. */
function ContinueButton({ b }: { b: HomeButton; onButton: (b: HomeButton) => void }) {
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  const go = async () => {
    if (loading || !b.link) return; // one tap only
    playSound("tap"); setLoading(true); setFailed(false);
    const wait = new Promise((r) => setTimeout(r, LOADER_MIN_AFTER_TAP_MS));
    try {
      await Promise.all([router.preloadRoute({ href: b.link } as never), wait]);
      await router.navigate({ href: b.link });
    } catch {
      setLoading(false); setFailed(true); // loader goes away; the button works again
    }
  };
  return (
    <>
      <button type="button" disabled={loading} aria-label={b.label} aria-busy={loading}
        onClick={(e) => { e.stopPropagation(); void go(); }}
        className="hdr-bounce min-h-12 rounded-full border-2 border-fh-heading bg-fh-card px-6 py-2 text-[clamp(17px,1.3vw,20px)] font-semibold text-fh-heading shadow-[0_5px_0_var(--fh-heading)] transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-heading)] disabled:opacity-80 motion-reduce:transition-none motion-reduce:hover:translate-y-0 max-md:w-full">
        {b.label}
      </button>
      {failed && <p role="status" className="text-sm text-fh-heading">Sorry, I couldn't open that just now. Please try again.</p>}
      {loading && typeof document !== "undefined" && createPortal(<div className="fixed inset-0 z-[80] flex items-center justify-center bg-fh-page"><FitiLoader delayMs={0} /></div>, document.body)}
    </>
  );
}
