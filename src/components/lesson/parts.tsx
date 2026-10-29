import { Children, isValidElement, useEffect, useRef, useState, type ReactNode, type KeyboardEvent as RKeyboardEvent } from "react";
import { useReaction } from "./celebrate";
import {
  AlertTriangle,
  LoaderCircle,
  Check,
  CircleHelp,
  Delete,
  ShieldCheck,
  ThumbsUp,
} from "lucide-react";
import type { ViewItem, ViewOption } from "@/shared/contracts/lesson";
import sureIcon from "@/assets/lesson/sure-badge.png.asset.json";
import guessIcon from "@/assets/lesson/guessing.png.asset.json";
import type { Script } from "@/shared/contracts/script";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useLesson } from "./context";
import { TutorBubble } from "@/components/tutor/TutorBubble";

export function Prompt({ script, className }: { script: Script; className?: string }) {
  return (
    <div className={cn("maths text-[1.2rem] font-bold leading-snug", className)}>
      {script.map((s, i) => (
        <p key={i} className={i ? "mt-2" : ""}>
          {s.text}
        </p>
      ))}
    </div>
  );
}

export function Card({
  children,
  className,
  tone,
}: {
  children: ReactNode;
  className?: string;
  tone?: "info" | "warn" | "ok";
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border bg-card p-5",
        tone === "info"
          ? "border-info ring-1 ring-info"
          : tone === "warn"
            ? "border-warning-strong bg-warning"
            : tone === "ok"
              ? "border-success bg-success-soft"
              : "border-border",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}

const LETTERS = "ABCDEFGH";
export function OptionList({
  options,
  value,
  onChange,
  disabled,
  marks,
}: {
  options: ViewOption[];
  value: string | null;
  onChange: (id: string) => void;
  disabled?: boolean | undefined;
  marks?: Record<string, "ok" | "warn"> | undefined;
}) {
  return (
    <div role="radiogroup" aria-label="Choose an answer" className="space-y-2">
      {options.map((o, i) => {
        const sel = value === o.id;
        const mark = marks?.[o.id];
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={sel}
            disabled={disabled}
            onClick={() => onChange(o.id)}
            className={cn(
              "interactive flex min-h-13 w-full items-center gap-3 rounded-xl border bg-card px-3 py-2.5 text-left transition-colors disabled:opacity-70",
              mark === "ok"
                ? "border-success bg-success-soft"
                : mark === "warn"
                  ? "border-warning-strong bg-warning"
                  : sel
                    ? "border-info bg-accent ring-1 ring-info"
                    : "border-border hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm font-bold",
                sel ? "bg-info text-info-foreground" : "bg-muted text-foreground",
              )}
            >
              {LETTERS[i]}
            </span>
            <span className="maths min-w-0 flex-1 text-base font-semibold">{o.label}</span>
            {sel && !mark && <Check className="h-5 w-5 text-info" aria-hidden />}
            {mark === "ok" && <Check className="h-5 w-5 text-success" aria-label="Right" />}
            {mark === "warn" && (
              <AlertTriangle className="h-5 w-5 text-warning-foreground" aria-label="Not quite" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export type Confidence = "sure" | "think_so" | "guessing";
export function ConfidencePicker({
  value,
  onChange,
  segmented = false,
  pills = false,
}: {
  value: Confidence | null;
  onChange: (c: Confidence) => void;
  /** One pill bar with the chosen part filled green (video check spec). */
  segmented?: boolean;
  /** Three separate outlined pills with a navy bottom edge (video question card spec). */
  pills?: boolean;
}) {
  // Sure / Guessing use the supplied icon files as a mask so they take the text colour.
  const masked = (url: string) => function MaskIcon({ className }: { className?: string }) {
    return <span aria-hidden className={cn("inline-block bg-current", className)} style={{ WebkitMask: `url(${url}) center/contain no-repeat`, mask: `url(${url}) center/contain no-repeat` }} />;
  };
  if (pills) segmented = true;
  const opts: { id: Confidence; label: string; Icon: (p: { className?: string }) => ReactNode }[] = [
    { id: "sure", label: "Sure", Icon: segmented ? masked(sureIcon.url) : ShieldCheck },
    { id: "think_so", label: "Think so", Icon: ThumbsUp },
    { id: "guessing", label: "Guessing", Icon: segmented ? masked(guessIcon.url) : CircleHelp },
  ];
  const onKey = (e: RKeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const i = Math.max(0, opts.findIndex((o) => o.id === value));
    const n = (i + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : opts.length - 1)) % opts.length;
    onChange(opts[n]!.id);
    (e.currentTarget.querySelectorAll("button")[n] as HTMLButtonElement | undefined)?.focus();
  };
  if (pills) {
    return (
      <div className="flex flex-wrap justify-center gap-2.5 md:gap-4" role="radiogroup" aria-label="How sure are you?" onKeyDown={onKey}>
        {opts.map(({ id, label, Icon }) => {
          const on = value === id;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} tabIndex={on || (!value && id === "sure") ? 0 : -1} onClick={() => onChange(id)}
              className="vl-conf interactive flex h-12 min-w-0 flex-1 basis-[100px] items-center justify-center gap-1.5 rounded-full px-3 text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-[16px] md:max-w-[150px]">
              <Icon className="h-[20px] w-[20px]" aria-hidden />{label}
            </button>
          );
        })}
      </div>
    );
  }
  if (segmented) {
    return (
      <div className="grid h-[52px] grid-cols-3 gap-1 rounded-full bg-confidence-track p-1" role="radiogroup" aria-label="How sure are you?" onKeyDown={onKey}>
        {opts.map(({ id, label, Icon }) => {
          const on = value === id;
          return (
            <button key={id} type="button" role="radio" aria-checked={on} tabIndex={on || (!value && id === "sure") ? 0 : -1}
              onClick={() => onChange(id)}
              className={cn("interactive flex min-h-11 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-1 text-[13px] font-medium sm:text-[15px] outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-[17px]",
                on ? "bg-confidence-on text-confidence-on-ink" : "text-brand hover:bg-card/60")}>
              <Icon className="h-[18px] w-[18px]" aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="How sure are you?">
      {opts.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "interactive flex h-14 flex-col items-center justify-center gap-0.5 rounded-xl border text-sm font-semibold",
            value === id
              ? "border-info bg-accent text-accent-foreground ring-1 ring-info"
              : "border-border bg-card",
          )}
        >
          <Icon className="h-4 w-4" aria-hidden />
          {label}
        </button>
      ))}
    </div>
  );
}

export const MATH_KEYS = [
  "(",
  ")",
  "−",
  "÷",
  "/",
  "=",
  "×",
  "+",
  "a/b",
  "^",
  "√",
  "±",
  ",",
  "←",
  "→",
];
export function MathKeyboard({
  onKey,
  onBackspace,
}: {
  onKey: (k: string) => void;
  onBackspace: () => void;
}) {
  return (
    <div className="grid grid-cols-9 gap-1.5" aria-label="Maths keyboard">
      {MATH_KEYS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => onKey(k)}
          className="maths h-12 rounded-lg border border-border bg-card text-lg font-semibold active:bg-muted"
          aria-label={`Insert ${k}`}
        >
          {k}
        </button>
      ))}
      <button
        type="button"
        onClick={onBackspace}
        className="grid h-12 place-items-center rounded-lg border border-border bg-card active:bg-muted"
        aria-label="Delete"
      >
        <Delete className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}

/** Text input with the maths keyboard underneath. */
export function MathInput({
  value,
  onChange,
  label,
  placeholder,
  onEnter,
  autoFocus,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
  onEnter?: (() => void) | undefined;
  autoFocus?: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const insert = (k: string) => {
    const el = ref.current;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    if (k === "←" || k === "→") {
      const pos = Math.max(0, Math.min(value.length, start + (k === "←" ? -1 : 1)));
      el?.focus();
      el?.setSelectionRange(pos, pos);
      return;
    }
    k = k === "a/b" ? "()/()" : k === "√" ? "√()" : k;
    const next = value.slice(0, start) + k + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + k.length, start + k.length);
    });
  };
  return (
    <div className="space-y-2">
      <label className="sr-only" htmlFor={label}>
        {label}
      </label>
      <Input
        id={label}
        ref={ref}
        maxLength={1000}
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        inputMode="text"
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className="maths h-13 rounded-xl text-lg"
      />
      <MathKeyboard onKey={insert} onBackspace={() => onChange(value.slice(0, -1))} />
    </div>
  );
}

export function ResultBanner({ correct, label, react = true }: { correct: boolean; label?: string | null; react?: boolean }) {
  const r = useReaction();
  const ref = useRef<HTMLParagraphElement>(null);
  const [word, setWord] = useState<string | null>(null);
  useEffect(() => { if (!react) return; if (correct) setWord(r.small(ref.current) || null); else r.notQuite(ref.current); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return correct ? (
    <p ref={ref}
      className="anim-ok mt-3 flex items-center gap-2 rounded-xl border border-success bg-success-soft px-4 py-3 font-semibold"
      role="status"
    >
      <Check className="cel-tick h-5 w-5 text-success" aria-hidden />
      Right{word && <span className="anim-term ml-1 text-success">{word}</span>}
    </p>
  ) : (
    <p ref={ref}
      className="anim-nudge mt-3 flex items-center gap-2 rounded-xl border border-warning-strong bg-warning px-4 py-3 font-semibold text-warning-foreground"
      role="status"
    >
      <AlertTriangle className="h-5 w-5" aria-hidden />
      Not quite{label ? <span className="font-normal">· {label}</span> : null}
    </p>
  );
}

/** Answer area for one item, by kind. Returns the response shape the server expects. */
export type ItemResponse = {
  value?: string;
  optionId?: string;
  fields?: Record<string, string>;
  text?: string;
};
export function ItemAnswer({
  item,
  value,
  onChange,
  disabled,
  onEnter,
}: {
  item: ViewItem;
  value: ItemResponse;
  onChange: (r: ItemResponse) => void;
  disabled?: boolean | undefined;
  onEnter?: (() => void) | undefined;
}) {
  if (item.kind === "mcq" && item.options) {
    return (
      <OptionList
        options={item.options}
        value={value.optionId ?? null}
        onChange={(id) => onChange({ optionId: id })}
        disabled={disabled}
      />
    );
  }
  if (item.kind === "structured" && item.fields) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {item.fields.map((f) =>
          f.type === "choice" ? (
            <div key={f.id} role="group" aria-label={f.label} className="text-sm font-semibold">
              <span>{f.label}</span>
              <div className="mt-1 flex gap-2">
                {(f.options ?? []).map((o) => (
                  <button
                    key={o}
                    type="button"
                    disabled={disabled}
                    aria-pressed={value.fields?.[f.id] === o}
                    onClick={() => onChange({ fields: { ...(value.fields ?? {}), [f.id]: o } })}
                    className={cn(
                      "interactive h-12 flex-1 rounded-xl border text-base capitalize",
                      value.fields?.[f.id] === o
                        ? "border-info bg-accent ring-1 ring-info"
                        : "border-border bg-card",
                    )}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <label key={f.id} className="block text-sm font-semibold">
              {f.label}
              <Input
                disabled={disabled}
                inputMode="decimal"
                maxLength={40}
                value={value.fields?.[f.id] ?? ""}
                onChange={(e) =>
                  onChange({ fields: { ...(value.fields ?? {}), [f.id]: e.target.value } })
                }
                className="maths mt-1 h-12 rounded-xl text-lg"
              />
            </label>
          ),
        )}
      </div>
    );
  }
  if (item.kind === "theory") {
    return (
      <textarea
        disabled={disabled}
        value={value.text ?? ""}
        onChange={(e) => onChange({ text: e.target.value })}
        rows={4}
        maxLength={1000}
        aria-label="Your answer and explanation"
        placeholder="Write your answer and explain it…"
        className="maths w-full rounded-xl border border-input bg-card p-3 text-base focus-visible:ring-2 focus-visible:ring-ring"
      />
    );
  }
  return (
    <MathInput
      label={`Answer for ${item.id}`}
      value={value.value ?? ""}
      onChange={(v) => onChange({ value: v })}
      placeholder="Your answer"
      onEnter={onEnter}
    />
  );
}

export function isAnswered(item: ViewItem, r: ItemResponse) {
  if (item.kind === "mcq") return !!r.optionId;
  if (item.kind === "structured")
    return (item.fields ?? []).every((f) => (r.fields?.[f.id] ?? "").trim());
  if (item.kind === "theory") return !!r.text?.trim();
  return !!r.value?.trim();
}

/** Bottom action area: thumb-reach on phones (tutor's latest line above), inline on desktop. */
export function Dock({
  children,
  hideTutor = false,
}: {
  children: ReactNode;
  hideTutor?: boolean;
}) {
  const { view, busy } = useLesson();
  const missing = Children.toArray(children).some(
    (c) => isValidElement<{ disabled?: boolean }>(c) && c.props.disabled,
  );
  const hint =
    view.position.step === "video"
      ? "Pick how sure you are first, then choose an answer"
      : view.position.step === "simulation"
        ? "Complete the rise and run first"
        : view.position.step === "worksheet"
          ? "Write the next line first"
          : view.position.step === "reflection"
            ? "Write your reflection first"
            : "Choose an answer";
  return (
    <>
      {/* The tutor's latest line now lives in the tutor panel / phone strip. */}
      <div className="col-span-full mt-6" data-hide-tutor={hideTutor || undefined}>
        <div className="mx-auto max-w-2xl">
          <div className="flex gap-2" aria-busy={busy}>
            {busy && (
              <LoaderCircle className="h-5 w-5 animate-spin self-center" aria-label="Saving" />
            )}
            {children}
          </div>
          {missing && !busy && (
            <p className="mt-2 text-xs text-muted-foreground" role="status">
              {hint}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

/** Calls back when nothing changes for `seconds` (used for the idle help prompt). */
export function useIdle(seconds: number, deps: unknown[], enabled = true) {
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    setIdle(false);
    if (!enabled) return;
    const t = setTimeout(() => setIdle(true), seconds * 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled, seconds]);
  return [idle, () => setIdle(false)] as const;
}
