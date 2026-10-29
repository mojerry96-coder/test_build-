import { GradientLabV2Stage } from "./GradientLabV2Stage";
import { playSound } from "@/lib/sound";
// Step 4 · Do: one of three built-in simulations (Ramp Builder / Road Inspector / Ramp Designer), chosen by the
// server from her video results. The browser only sends her move; the server marks it and returns the next line.
import { useReaction } from "./celebrate";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, Delete, Lightbulb, Loader2, X } from "lucide-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import waveClip from "@/assets/fitila/fitila_wave_loader.webm.asset.json";
import waveStill from "@/assets/fitila/fitila_wave_loader.webp.asset.json";
import { canPlayClip } from "@/components/learn/FitiLoader";
import { simCheckFn, simHelpFn } from "@/lib/api/lesson.functions";
import type { NativeSimAnswer, NativeSimTask } from "@/shared/contracts/simulation";
import { LESSON_STEPS } from "@/shared/contracts/enums";
import { shouldPromptSimHelp } from "@/shared/sim-help";
import { cn } from "@/lib/utils";
import { useLesson } from "./context";
import { useAdvance } from "./stages-a";
import { SimBoard, type BoardShape } from "./sim-board";
import { GradientLabStage } from "./GradientLabStage";
import thumbsUp from "@/assets/tutor/thumbs-up.png.asset.json";

type Reply = Awaited<ReturnType<typeof simCheckFn>>;
type Field = "rise" | "run" | "gradient";
const HELP_LINE = "Looks like this one's tricky. Want a hint?";
const PRACTISE_LINE = "Time to practise. Do you want me to teach you step by step first, or try on your own?";

function StepHeader({ n, total, done }: { n: number | null; total: number; done: boolean[] }) {
  return (
    <div className="mb-5">
      {n != null && (
        <div className="sr-only">
          <p className="text-[12px] font-bold uppercase tracking-[0.4px] text-sim-label">Your simulation · Task {n} of {total}</p>
          <ol className="flex gap-1.5" aria-label={`${done.filter(Boolean).length} of ${total} tasks done`}>
            {done.map((d, i) => (
              <li key={i} className={cn("grid h-4 w-4 place-items-center rounded-full",
                d ? "bg-step-done text-sim-cta-ink" : i === n - 1 ? "bg-step-current" : "bg-step-todo")}>
                {d && <Check className="h-2.5 w-2.5" strokeWidth={4} aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

const ctaClass = "h-12 w-full rounded-2xl bg-sim-cta text-[14px] font-bold text-sim-cta-ink transition-opacity disabled:opacity-50";

import { hush, useSay } from "@/lib/voice";

export function SimStage() {
  const { view, sessionId, run, say, studentSaid, refresh, busy, addDivider } = useLesson();
  const next = useAdvance();
  const check = useServerFn(simCheckFn);
  const help = useServerFn(simHelpFn);
  const sim = view.simulation;
  const paused = (view as { paused?: boolean; controller?: string }).paused === true || (view as { controller?: string }).controller === "instructor";

  const current = view.simTasks.find((t) => !view.simCompleted.includes(t.id));
  // Voice: the closing card reads out once when it appears.
  const closing = view.simClosing;
  useSay(closing ? [...closing.closing_line, ...closing.did_well, ...closing.watch, ...closing.hook_link].map((l) => l.speakable ?? l.text) : [], "sim-closing", !current && !!closing);
  const task: NativeSimTask | undefined = current ? sim?.tasks[current.sequence - 1] : undefined;
  const [started, setStarted] = useState(view.simCompleted.length > 0 || Object.keys(sim?.saved ?? {}).length > 0);
  const [answer, setAnswer] = useState<NativeSimAnswer>({});
  const [reply, setReply] = useState<Reply>(null);
  const [faint, setFaint] = useState<BoardShape | null>(null);
  const [hintChoice, setHintChoice] = useState<string | null>(null);
  const [field, setField] = useState<Field>("rise");
  const activity = useRef(Date.now());
  const prompted = useRef(false);
  const lastPrompt = useRef(-Infinity);
  const repeats = useRef(0);
  const lastDivider = useRef<string | null>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A new task: restore her last move (resume) and reset the help prompt.
  useEffect(() => {
    setAnswer(current ? sim?.saved[current.id] ?? {} : {});
    setReply(null); setFaint(null); setHintChoice(null); setField("rise");
    // A divider in the chat so replies from the last task never look like they belong to this one.
    if (current && current.sequence > 1 && lastDivider.current !== current.id) { lastDivider.current = current.id; addDivider(`Task ${current.sequence} of ${view.simTasks.length}`); }
    prompted.current = false; repeats.current = 0; activity.current = Date.now();
  }, [current?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => { if (advanceTimer.current) clearTimeout(advanceTimer.current); }, []);

  // Help prompt: 30 s idle or the same wrong answer twice; paused while typing in chat, tab hidden or teacher pause.
  useEffect(() => {
    if (!started || !current || !sim) return;
    const id = setInterval(() => {
      const el = document.activeElement as HTMLElement | null;
      const chatting = !!el && (el.tagName === "TEXTAREA" || (el.tagName === "INPUT" && !el.dataset["simField"]));
      if (document.hidden || chatting || paused) { activity.current = Date.now(); return; }
      const now = Date.now();
      if (shouldPromptSimHelp({ idleMs: now - activity.current, repeats: repeats.current, prompted: prompted.current, lastPrompt: lastPrompt.current }, now, sim.helpIdleS, sim.helpRepeats, paused)) {
        prompted.current = true; lastPrompt.current = now;
        say([{ text: HELP_LINE }], "encouraging");
      }
    }, 1000);
    return () => clearInterval(id);
  }, [started, current?.id, sim, paused, say]); // eslint-disable-line react-hooks/exhaustive-deps

  // Closing: feedback then the practise question, said once.
  const closingSaid = useRef(false);
  useEffect(() => {
    if (current || !view.simClosing || closingSaid.current) return;
    closingSaid.current = true;
    say([...view.simClosing.closing_line, ...view.simClosing.did_well, ...view.simClosing.watch, ...view.simClosing.hook_link, { text: PRACTISE_LINE }]);
  }, [current, view.simClosing, say]);

  const roads = useMemo(() => (sim?.tasks ?? []).filter((t) => t.road), [sim]);

  if (!sim) {
    return (
      <div className="px-[30px] py-7">
        <StepHeader n={null} total={0} done={[]} />
        <p role="alert" className="flex items-center gap-2 text-sim-sub">
          <AlertTriangle className="h-5 w-5 text-sim-amber" aria-hidden /> The simulation didn't load.
          <button type="button" className="min-h-11 font-bold text-sim-line underline" onClick={() => void refresh()}>Tap to try again.</button>
        </p>
      </div>
    );
  }

  if (sim.engine === "gradient-lab-v2" && sim.lab && current) return <GradientLabV2Stage onFallback={() => void refresh()} />;
  if (sim.engine === "gradient-lab" && sim.lab && current) return <GradientLabStage onFallback={() => void refresh()} />;
  if (!sim.url.startsWith("native:") && sim.engine !== "gradient-lab" && sim.engine !== "gradient-lab-v2") {
    return (
      <div className="px-[30px] py-7">
        <StepHeader n={current?.sequence ?? null} total={view.simTasks.length} done={view.simTasks.map((t) => view.simCompleted.includes(t.id))} />
        <iframe title="Your simulation" sandbox="allow-scripts" src={sim.url} className="h-[480px] w-full rounded-[9px] border border-sim-grid" />
      </div>
    );
  }

  const done = view.simTasks.map((t) => view.simCompleted.includes(t.id));

  if (!started && current) {
    return (
      <div className="flex min-h-[600px] flex-col px-[30px] py-7">
        <div className="flex flex-1 flex-col items-center justify-center text-center motion-safe:anim-fade-in">
          <div className="grid h-[122px] w-[122px] place-items-center overflow-hidden rounded-full bg-sim-fill">
            <img src={thumbsUp.url} alt="" width={122} height={122} className="h-[112px] w-[112px] translate-y-2 object-contain" />
          </div>
          <h2 className="mt-6 font-sans text-[22px] font-semibold text-sim-ink">{sim.introTitle || "Next Step: Simulation"}</h2>
          <p className="mt-3 max-w-[520px] text-[16px] text-sim-sub">{sim.goal}</p>
          <button type="button" onClick={() => { setStarted(true); activity.current = Date.now(); }}
            className="mt-7 h-11 w-full max-w-[497px] rounded-[16px] bg-sim-cta text-[14px] font-bold text-sim-cta-ink transition-colors hover:bg-primary-action focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">Start</button>
        </div>
      </div>
    );
  }

  if (!current) return <PracticeCard busy={busy} onGo={() => void next()} />;
  if (!task) return null;

  const right = reply?.right === true;
  const tone: "idle" | "right" | "wrong" = right ? "right" : reply?.right === false ? "wrong" : "idle";
  const locked = busy || right || paused;
  const hasMove = task.kind === "choice" ? !!answer.choice
    : task.kind === "rise_run_gradient" ? !!(answer.rise || answer.run || answer.gradient)
    : (answer.points?.length ?? 0) >= (task.kind === "two_points" ? 2 : 1);

  const move = (a: NativeSimAnswer) => {
    activity.current = Date.now();
    setAnswer(a); setReply(null);
    void check({ data: { sessionId, answer: a, moveOnly: true } }).catch(() => undefined);
  };
  /** Dragging a placed point: show it live, save on release. */
  const dragTo = (i: number, p: number[], done: boolean) => {
    if (task.kind !== "point" && task.kind !== "two_points") return;
    if (task.kind === "point" && p[0] === task.start[0] && p[1] === task.start[1]) return;
    const pts = [...(answer.points ?? [])];
    if (pts.some((q, j) => j !== i && q[0] === p[0] && q[1] === p[1])) return;
    pts[i] = p;
    const a = { ...answer, points: pts };
    if (done) move(a); else { setAnswer(a); setReply(null); }
  };
  const place = (p: number[]) => {
    if (task.kind === "rise_run_gradient" || task.kind === "choice") return;
    if (task.kind === "point") {
      if (p[0] === task.start[0] && p[1] === task.start[1]) return; // never on the start point
      move({ points: [p] });
      return;
    }
    const pts = answer.points ?? [];
    const hit = pts.findIndex((q) => q[0] === p[0] && q[1] === p[1]);
    if (hit >= 0) return; // tapping a placed point again keeps it; the next tap moves the other one
    move({ points: pts.length < 2 ? [...pts, p] : [pts[0]!, p] });
  };
  const react = useReaction();
  const submit = async () => {
    const r = await run(() => check({ data: { sessionId, answer } }));
    if (!r) return;
    setReply(r);
    if (r.right) react.big(); else react.notQuite(document.querySelector(".sim-board, [data-sim-board]"));
    if (!r.right) repeats.current = r.repeats;
    if (r.faint) setFaint({ a: r.faint[0]!, b: r.faint[1]!, triangle: true });
    if (r.choice) setHintChoice(r.choice);
    say(r.lines, r.right ? "encouraging" : "speaking");
    if (r.right) advanceTimer.current = setTimeout(() => void refresh(), 2000);
  };
  const askHelp = async () => {
    activity.current = Date.now();
    studentSaid("Can I have a hint?");
    playSound("hint");
    const h = await run(() => help({ data: { sessionId } }));
    if (!h) return;
    say(h.lines);
    if (h.faint) setFaint({ a: h.faint[0]!, b: h.faint[1]!, triangle: true });
    if (h.fill) move({ ...answer, rise: h.fill.rise });
    if (h.choice) setHintChoice(h.choice);
  };

  // What the board draws for this task.
  let fixed: number[][] = [];
  let shapes: BoardShape[] = [];
  if (task.kind === "point") {
    fixed = [task.start];
    const p = answer.points?.[0];
    if (p) shapes = [{ a: task.start, b: p, triangle: true }];
  } else if (task.kind === "two_points") {
    const [a, b] = answer.points ?? [];
    if (a && b) shapes = [{ a, b, triangle: true }];
  } else if (task.kind === "rise_run_gradient" && task.road) {
    fixed = task.road;
    shapes = [{ a: task.road[0]!, b: task.road[1]!, triangle: right }];
  } else if (task.kind === "choice") {
    fixed = roads.flatMap((r) => r.road!);
    shapes = roads.map((r, i) => ({ a: r.road![0]!, b: r.road![1]!, label: String.fromCharCode(65 + i) }));
  }
  const placed = task.kind === "two_points" ? answer.points ?? [] : task.kind === "point" && answer.points?.[0] ? [answer.points[0]] : [];
  const labels = right && reply?.labels && task.kind !== "choice" ? reply.labels : null;

  return (
    <div className="flex min-h-[690px] flex-col px-4 pb-6 pt-6 md:px-[30px] md:pt-7">
      <StepHeader n={current.sequence} total={view.simTasks.length} done={done} />
      <h2 className="font-display text-[18px] font-bold leading-tight text-sim-ink md:max-w-[830px] md:text-[20px]">{task.title}</h2>
      <p className="mt-1.5 text-[16px] text-sim-sub">{task.instruction}</p>

      <div className="mt-8 flex-1 md:mt-[60px]">
        <SimBoard fixed={fixed} placed={placed} shapes={shapes} tone={task.kind === "choice" ? "idle" : tone} labels={labels}
          faint={faint} showCoords={task.kind === "rise_run_gradient" || task.kind === "choice"} locked={locked}
          onPlace={task.kind === "point" || task.kind === "two_points" ? place : undefined}
          onDrag={task.kind === "point" || task.kind === "two_points" ? dragTo : undefined}
          ariaLabel={task.kind === "point" || task.kind === "two_points" ? "Grid. Use the arrow keys to move, Enter to place a point." : "Grid"} />

        {task.kind === "rise_run_gradient" && (
          <RiseRunInputs answer={answer} field={field} setField={setField} marks={reply?.fields ?? []} locked={locked}
            onChange={(a) => move(a)} />
        )}
        {task.kind === "choice" && (
          <div className="mx-auto mt-6 grid max-w-[554px] grid-cols-3 gap-3" role="radiogroup" aria-label="Roads">
            {roads.map((_, i) => {
              const id = String.fromCharCode(65 + i);
              const picked = answer.choice === id;
              return (
                <button key={id} type="button" role="radio" aria-checked={picked} disabled={locked} onClick={() => move({ choice: id })}
                  className={cn("min-h-12 rounded-2xl border-2 text-[14px] font-bold text-sim-ink transition-colors",
                    picked ? (tone === "wrong" ? "border-sim-amber bg-sim-amber-fill" : tone === "right" ? "border-sim-good bg-success-soft" : "border-sim-point-ring bg-sim-fill") : "border-sim-grid bg-surface-fixed",
                    hintChoice === id && !picked && "border-dashed border-sim-point-ring")}>
                  Road {id}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-4 mt-6 bg-surface-fixed px-4 pb-2 pt-2 md:static md:mx-0 md:px-0">
        <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
          <p role="status" aria-live="polite" className={cn("flex items-center gap-1.5 text-[14px] font-bold", right ? "text-sim-good" : "text-warning-foreground")}>
            {right && <><Check className="h-4 w-4" aria-hidden />That works! Next task coming up.</>}
            {reply?.right === false && <><AlertTriangle className="h-4 w-4 text-sim-amber" aria-hidden />Not quite. Have another go.</>}
            {paused && !reply && <>Your teacher has paused the lesson.</>}
          </p>
        </div>
        <button type="button" disabled={locked || !hasMove} onClick={() => void submit()} className={ctaClass}>Check Answer</button>
      </div>
    </div>
  );
}

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "−", "/", "."];

function RiseRunInputs({ answer, field, setField, marks, locked, onChange }: {
  answer: NativeSimAnswer; field: Field; setField: (f: Field) => void; marks: boolean[]; locked: boolean; onChange: (a: NativeSimAnswer) => void;
}) {
  const fields: { k: Field; label: string }[] = [{ k: "rise", label: "Rise" }, { k: "run", label: "Run" }, { k: "gradient", label: "Gradient" }];
  const set = (k: Field, v: string) => onChange({ ...answer, [k]: v.replace(/-/g, "−").slice(0, 8) });
  return (
    <div className="mx-auto mt-6 max-w-[554px]">
      <div className="grid grid-cols-3 gap-3">
        {fields.map(({ k, label }, i) => {
          const mark = marks[i];
          return (
            <label key={k} className="block">
              <span className="text-[12px] font-bold uppercase tracking-[0.4px] text-sim-label">{label}</span>
              <span className="relative mt-1 block">
                <input data-sim-field inputMode="none" value={answer[k] ?? ""} disabled={locked} onFocus={() => setField(k)}
                  onChange={(e) => set(k, e.target.value)} aria-invalid={mark === false || undefined}
                  className={cn("h-12 w-full rounded-xl border-2 bg-surface-fixed px-3 text-[16px] font-bold text-sim-ink outline-none",
                    field === k ? "border-sim-point-ring" : "border-sim-grid",
                    mark === false && "border-sim-amber bg-sim-amber-fill", mark === true && "border-sim-good")} />
                {mark === true && <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sim-good" aria-label="Right" />}
                {mark === false && <AlertTriangle className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-sim-amber" aria-label="Not quite" />}
              </span>
            </label>
          );
        })}
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1.5" aria-label="Number keys">
        {KEYS.map((k) => (
          <button key={k} type="button" disabled={locked} onClick={() => set(field, (answer[field] ?? "") + k)}
            className="h-11 rounded-lg border border-sim-grid bg-surface-fixed text-[16px] font-bold text-sim-ink disabled:opacity-50">{k}</button>
        ))}
        <button type="button" disabled={locked} aria-label="Delete" onClick={() => set(field, (answer[field] ?? "").slice(0, -1))}
          className="grid h-11 place-items-center rounded-lg border border-sim-grid bg-surface-fixed text-sim-ink disabled:opacity-50"><Delete className="h-4 w-4" aria-hidden /></button>
      </div>
    </div>
  );
}

/** Simulation finished (spec): one centred card, hand-written heading, thinking Fiti, "Let's Practice". */
function PracticeCard({ busy, onGo }: { busy: boolean; onGo: () => void }) {
  const { view } = useLesson();
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { subject: string; chapter: string; quest: string; topic: string };
  const btn = useRef<HTMLButtonElement>(null);
  const tapped = useRef(false);
  const react = useReaction();
  const [clip, setClip] = useState(false);
  useEffect(() => { setClip(canPlayClip()); }, []);
  const title = view.warmup?.labels?.simPracticeTitle || "Time to practice what you've learnt";
  const close = () => { hush(); navigate({ to: "/$subject/$chapter/$quest/$topic/path", params }); };
  const go = () => { if (tapped.current || busy) return; tapped.current = true; hush(); onGo(); };
  useEffect(() => {
    btn.current?.focus();
    react.big();
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { window.dispatchEvent(new Event("fiti:hide")); return () => { window.dispatchEvent(new Event("fiti:show")); }; }, []);
  return (
    <div className="fixed inset-x-0 bottom-0 top-[88px] z-50 flex items-start justify-center bg-practice-veil px-3 pb-4 md:top-[96px] md:px-6 md:pb-8">
      <section role="dialog" aria-modal="true" aria-labelledby="practice-title" className="overlay-edge relative flex h-full max-h-[980px] w-full max-w-[1560px] flex-col items-center justify-center overflow-hidden rounded-[32px] bg-fh-card px-6 pb-12 pt-10 text-center motion-safe:anim-fade-in md:w-[86vw] md:rounded-[48px] md:px-12">
        <button type="button" onClick={close} aria-label="Close" className="absolute right-5 top-5 z-10 grid h-11 w-11 place-items-center rounded-full text-fh-ink hover:bg-muted md:right-12 md:top-10">
          <X className="h-7 w-7" strokeWidth={1.75} aria-hidden />
        </button>
        <h2 id="practice-title" aria-live="polite" className="relative mx-auto max-w-[620px] font-hand text-[32px] leading-[1.15] tracking-[0.5px] text-hub-heading [-webkit-text-stroke:1.2px_var(--hub-heading)] [text-wrap:balance] md:text-[clamp(36px,min(3.6vw,7vh),56px)]">{title}</h2>
        {clip
          ? <video src={waveClip.url} poster={waveStill.url} autoPlay muted loop playsInline onError={() => setClip(false)} className="relative mx-auto mt-6 h-[min(240px,30dvh)] w-auto object-contain md:mt-10 md:h-[min(340px,34dvh)]" />
          : <img src={waveStill.url} alt="" className="relative mx-auto mt-6 h-[min(240px,30dvh)] w-auto object-contain motion-safe:anim-note-pop md:mt-10 md:h-[min(340px,34dvh)]" />}
        <button ref={btn} type="button" disabled={busy} onClick={go}
          className="vl-cta relative mx-auto mt-8 flex h-14 w-[min(260px,70%)] items-center justify-center rounded-full text-[18px] font-bold md:mt-12 md:h-[60px]">
          {busy ? <Loader2 className="h-5 w-5 animate-spin" aria-label="Loading" /> : "Let's Practice"}
        </button>
      </section>
    </div>
  );
}
