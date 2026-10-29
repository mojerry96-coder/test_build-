// Ready, Hook, See (video) and Do (simulation) stages.
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Pause, Play, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CheckResult, ViewItem } from "@/shared/contracts/lesson";
import type { Script } from "@/shared/contracts/script";
import { advanceFn, checkAnswerFn, predictionFn } from "@/lib/api/lesson.functions";

import { useLesson } from "./context";
import { Card, ConfidencePicker, Dock, Eyebrow, ItemAnswer, OptionList, Prompt, ResultBanner, isAnswered, type Confidence, type ItemResponse } from "./parts";

export function useAdvance() {
  const { run, refresh, sessionId } = useLesson();
  const adv = useServerFn(advanceFn);
  return async () => {
    const ok = await run(() => adv({ data: { sessionId } }));
    if (ok) await refresh();
  };
}

function useCheck() {
  const { run, sessionId, say } = useLesson();
  const check = useServerFn(checkAnswerFn);
  return async (itemId: string, response: ItemResponse, confidence: Confidence | null = null) => {
    const r = await run(() => check({ data: { sessionId, itemId, response, confidence } }));
    if (r?.tutorLines) say(r.tutorLines ?? [], "encouraging");
    return r;
  };
}

/* ---------- 1 · Ready ---------- */
export function ReadinessStage() {
  const { view, busy } = useLesson();
  const item = view.items[view.position.index];
  const check = useCheck();
  const next = useAdvance();
  const [resp, setResp] = useState<ItemResponse>({});
  const [result, setResult] = useState<CheckResult | null>(null);
  const [practice, setPractice] = useState<ItemResponse>({});
  const [practiceResult, setPracticeResult] = useState<CheckResult | null>(null);
  if (!item) return null;
  const already = view.results[item.id];
  const repair = result?.repair ?? null;
  const done = already || (result && (!repair || practiceResult));
  return (
    <div className={`grid gap-4 ${repair ? "xl:grid-cols-2" : ""}`}>
      <Card>
        <Eyebrow>Question {view.position.index + 1} of {view.items.length}</Eyebrow>
        <Prompt script={item.prompt} />
        <div className="mt-4"><ItemAnswer item={item} value={resp} onChange={setResp} disabled={!!result || !!already} onEnter={() => !result && isAnswered(item, resp) && check(item.id, resp).then(setResult)} /></div>
        {result && <ResultBanner correct={result.correct === true} />}
        {already && !result && <ResultBanner correct={already.correct} react={false} />}
        {!result && !already && <p className="mt-3 text-sm text-muted-foreground">A warm-up, not a test.</p>}
      </Card>
      {repair && (
        <Card tone="info">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-bold"><Wrench className="h-5 w-5 text-info" aria-hidden />Quick fix</h2><span className="text-sm font-semibold text-accent-foreground">About 1 minute</span></div>
          <div className="mt-3 space-y-2">{repair.lines.map((l, i) => <p key={i}>{l.text}</p>)}</div>
          <hr className="my-4 border-border" />
          <Eyebrow>Try one</Eyebrow>
          <Prompt script={repair.practiceItem.prompt} className="text-base" />
          <div className="mt-3"><ItemAnswer item={repair.practiceItem} value={practice} onChange={setPractice} disabled={!!practiceResult} /></div>
          {practiceResult && <ResultBanner correct={practiceResult.correct === true} />}
          {!practiceResult && (
            <Button className="mt-3 h-12 w-full rounded-xl" disabled={busy || !isAnswered(repair.practiceItem, practice)} onClick={() => check(repair.practiceItem.id, practice).then(setPracticeResult)}>Check</Button>
          )}
        </Card>
      )}
      <Dock>
        {!done ? (
          <Button size="lg" className="h-13 flex-1 rounded-xl text-base" disabled={busy || !!result || !isAnswered(item, resp)} onClick={() => check(item.id, resp).then(setResult)}>Check</Button>
        ) : (
          <Button size="lg" className="h-13 flex-1 rounded-xl text-base" disabled={busy} onClick={next}>Next</Button>
        )}
      </Dock>
    </div>
  );
}

/* ---------- 2 · Hook ---------- */
function TwoRoads() {
  return (
    <svg viewBox="0 0 320 150" role="img" aria-label="Two straight paths climbing from the same spot: one gentle, one very steep" className="w-full">
      <rect x="0" y="0" width="320" height="150" rx="16" fill="var(--color-muted)" />
      <line x1="30" y1="130" x2="290" y2="130" stroke="var(--color-border)" strokeWidth="2" />
      <line x1="40" y1="130" x2="150" y2="20" stroke="var(--color-reward)" strokeWidth="6" strokeLinecap="round" />
      <line x1="40" y1="130" x2="290" y2="75" stroke="var(--color-info)" strokeWidth="6" strokeLinecap="round" />
      <text x="140" y="44" fontSize="13" fontWeight="700" fill="var(--color-foreground)" textAnchor="end">Path A: very steep</text>
      <text x="285" y="66" fontSize="13" fontWeight="700" fill="var(--color-foreground)" textAnchor="end">Path B: gentle</text>
    </svg>
  );
}

export function HookStage() {
  const { view, busy, run, sessionId, studentSaid } = useLesson();
  const save = useServerFn(predictionFn);
  const next = useAdvance();
  const [choice, setChoice] = useState<string | null>(null);
  const [boxes, setBoxes] = useState<Record<string, string>>({});
  const hook = view.hook;
  if (!hook) return <Card>The hook isn't loaded yet.</Card>;
  const go = async () => {
    if (!choice) return;
    studentSaid(hook.options.find((o) => o.id === choice)?.label ?? choice);
    const ok = await run(() => save({ data: { sessionId, optionId: choice, boxes } }));
    if (ok) await next();
  };
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><TwoRoads /><div className="mt-4 space-y-2">{hook.script.map((l, i) => <p key={i} className={i === 1 ? "font-bold" : ""}>{l.text}</p>)}</div></Card>
      <Card>
        <Eyebrow>Quick guess</Eyebrow>
        <p className="mb-3 font-semibold">Which path is steeper?</p>
        <OptionList options={hook.options} value={choice} onChange={setChoice} />
        {hook.boxes.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {hook.boxes.map((b) => (
              <label key={b.id} className="text-sm font-semibold">{b.label}
                <Input inputMode="decimal" value={boxes[b.id] ?? ""} onChange={(e) => setBoxes({ ...boxes, [b.id]: e.target.value })} className="maths mt-1 h-12 rounded-xl text-lg" placeholder="Optional" />
              </label>
            ))}
          </div>
        )}
      </Card>
      <Dock><Button size="lg" className="h-13 flex-1 rounded-xl text-base" disabled={busy || !choice} onClick={go}>Let's find out</Button></Dock>
    </div>
  );
}

/* ---------- 3 · See (video with embedded checks) ---------- */
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;


export { SimulationStage } from "./simulation-stage";
