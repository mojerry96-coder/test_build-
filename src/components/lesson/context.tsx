import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type Context, type ReactNode } from "react";
import { isStaleQuestion } from "@/shared/stale-question";
import { useQueryClient } from "@tanstack/react-query";
import type { LessonView } from "@/shared/contracts/lesson";
import { LESSON_STEPS } from "@/shared/contracts/enums";
import { STEP_LABELS } from "@/shared/contracts/step-labels";
import type { Script } from "@/shared/contracts/script";
import { LessonAssets } from "./WarmupPopup";
import type { TutorMood } from "@/components/tutor/TutorAvatar";

import { friendlyError } from "@/shared/friendly-error";
export type ChatBlock = { id: string; title: string; lines: string[]; done: boolean; total?: number };
export type ChatEntry = { from: "tutor" | "student"; lines: Script; question?: string | undefined; queued?: boolean; at?: number; block?: ChatBlock; diag?: string };

type Ctx = {
  view: LessonView;
  sessionId: string;
  mood: TutorMood;
  chat: ChatEntry[];
  latest: Script;
  say: (lines: Script, mood?: TutorMood) => void;
  studentSaid: (text: string) => void;
  /** Admin-only sorting label under her last message. */
  tagLastStudent: (diag: string) => void;
  setMood: (m: TutorMood) => void;
  /** Runs a server call: waits while offline, marks "Saved", surfaces friendly errors. */
  run: <T>(fn: () => Promise<T>) => Promise<T | null>;
  busy: boolean;
  saved: number;
  error: string | null;
  clearError: () => void;
  refresh: () => Promise<void>;
  /** Worked examples: one collapsible chat block whose lines fill in with the stage. */
  blockStart: (title: string, total?: number) => string;
  blockLine: (id: string, line: string) => void;
  blockEnd: (id: string) => void;
  /** A step-style divider in the chat, e.g. "Quick fix · Reading coordinates". */
  addDivider: (text: string) => void;
};

function divider(view: LessonView): string | undefined {
  const n = LESSON_STEPS.indexOf(view.position.step) + 1;
  return view.position.index === 0 ? `Step ${n} · ${STEP_LABELS[view.position.step]}` : undefined;
}

// One context object even when hot reload re-runs this file, so the provider and screen never disagree.
const g = globalThis as { __lessonCtx?: React.Context<Ctx | null> };
const LessonCtx = (g.__lessonCtx ??= createContext<Ctx | null>(null));

function whenOnline(): Promise<void> {
  if (typeof navigator === "undefined" || navigator.onLine) return Promise.resolve();
  return new Promise((res) => window.addEventListener("online", () => res(), { once: true }));
}

export function LessonProvider({ view, children }: { view: LessonView; children: ReactNode }) {
  const qc = useQueryClient();
  // Older saved lessons may come back without chat history, so treat missing lists as empty.
  const [chat, setChat] = useState<ChatEntry[]>(() => {
    const history = view.chatHistory ?? [];
    const opening = view.tutorLines ?? [];
    if (history.length) return history.map(({ role, text }) => ({ from: role, lines: [{ text }] }));
    if (opening.length) return [{ from: "tutor", lines: opening, question: divider(view) }];
    return [];
  });
  const [mood, setMood] = useState<TutorMood>("speaking");
  // Calm return to idle after a few quiet seconds; thinking/listening stay until something happens.
  useEffect(() => {
    if (!["speaking", "encouraging", "celebrate"].includes(mood)) return;
    const t = setTimeout(() => setMood("idle"), mood === "celebrate" ? 8000 : 6000);
    return () => clearTimeout(t);
  }, [mood, chat.length]);
  const inFlight = useRef(false);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const key = `${view.position.step}:${view.position.index}`;
  const lastKey = useRef(key);
  useEffect(() => {
    if (lastKey.current === key) return;
    lastKey.current = key;
    if (view.tutorLines.length) setChat((c) => [...c, { from: "tutor", lines: view.tutorLines, question: divider(view) }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const say = useCallback((lines: Script, m: TutorMood = "speaking") => {
    if (!lines.length) return;
    setChat((c) => [...c, { from: "tutor", lines, at: Date.now() }]);
    setMood(m);
  }, []);
  const blockStart = useCallback((title: string, total?: number) => {
    const id = `b${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    setChat((c) => [...c, { from: "tutor", lines: [], at: Date.now(), block: { id, title, lines: [], done: false, ...(total ? { total } : {}) } }]);
    return id;
  }, []);
  const blockLine = useCallback((id: string, line: string) => {
    setChat((c) => c.map((e) => e.block?.id === id && !e.block.lines.includes(line) ? { ...e, block: { ...e.block, lines: [...e.block.lines, line] } } : e));
    setMood("speaking");
  }, []);
  const blockEnd = useCallback((id: string) => setChat((c) => c.map((e) => e.block?.id === id ? { ...e, block: { ...e.block, done: true } } : e)), []);
  const addDivider = useCallback((text: string) => { if (text) setChat((c) => [...c, { from: "tutor", lines: [], question: text, at: Date.now() }]); }, []);
  const studentSaid = useCallback((text: string) => setChat((c) => [...c, { from: "student", lines: [{ text }], queued: !navigator.onLine, at: Date.now() }]), []);

  const tagLastStudent = useCallback((diag: string) => setChat((c) => {
    const i = c.map((e) => e.from).lastIndexOf("student");
    return i < 0 ? c : c.map((e, j) => (j === i ? { ...e, diag } : e));
  }), []);

  const run = useCallback(async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    if (inFlight.current) return null;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    setMood("thinking");
    try {
      await whenOnline();
      const out = await fn();
      setSaved(Date.now());
      setMood("speaking");
      return out;
    } catch (e) {
      const msg = e instanceof Error && e.message ? e.message : "";
      // The page showed a question the server has moved past: reload the real lesson state quietly.
      if (isStaleQuestion(msg)) { void qc.invalidateQueries({ queryKey: ["lesson"] }); setMood("idle"); return null; }
      setError(friendlyError(msg));
      setMood("idle");
      return null;
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }, [qc]);

  const refresh = useCallback(async () => {
    await qc.invalidateQueries({ queryKey: ["lesson", view.sessionId] });
  }, [qc, view.sessionId]);

  const latest = useMemo(() => [...chat].reverse().find((c) => c.from === "tutor")?.lines ?? [], [chat]);

  return (
    <LessonCtx.Provider value={{ view, sessionId: view.sessionId, mood, chat, latest, say, studentSaid, tagLastStudent, setMood, run, busy, saved, error, clearError: () => setError(null), refresh, blockStart, blockLine, blockEnd, addDivider }}><LessonAssets.Provider value={view.avatarAssets ?? null}>
      {children}
    </LessonAssets.Provider></LessonCtx.Provider>
  );
}

export function useLesson() {
  const c = useContext(LessonCtx);
  if (!c) throw new Error("useLesson outside LessonProvider");
  return c;
}

/** Lesson context when inside a lesson, else null (e.g. the whiteboard opened from Home). */
export function useOptionalLesson() {
  return useContext(LessonCtx);
}
