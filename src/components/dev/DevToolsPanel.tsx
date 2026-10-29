// Super Admin panel (testing only). Loaded lazily by DevToolsMount after a server access check;
// every action is re-checked and logged on the server.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Compass, LoaderCircle, RotateCcw, X } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { devToolsActionFn } from "@/lib/api/dev-tools.functions";
import type { LessonStep } from "@/shared/contracts/enums";
import type { DevSection } from "@/shared/dev-tools";
import { cn } from "@/lib/utils";

export const POS_KEY = "ul.dev.panel";
type Saved = { top: number; open: boolean };
const readSaved = (): Saved => { try { return { top: 50, open: false, ...JSON.parse(localStorage.getItem(POS_KEY) ?? "{}") }; } catch { return { top: 50, open: false }; } };

type TopicRow = { id: string; display_name: string; subject: string | null; chapter_slug: string | null; quest_slug: string | null; topic_slug: string | null; is_active: boolean };

const SECTIONS: { id: DevSection; label: string; Icon: typeof Compass }[] = [
  { id: "goto", label: "Go to page", Icon: Compass },
  { id: "restart", label: "Restart", Icon: RotateCcw },
];

const typing = (el: Element | null) => !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || (el as HTMLElement).isContentEditable);
const sessionIdNow = () => document.documentElement.dataset["sessionId"] ?? null;

export default function DevToolsPanel() {
  const [saved, setSaved] = useState<Saved>({ top: 50, open: false });
  const [section, setSection] = useState<DevSection | null>(null);
  const [phone, setPhone] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.href });
  useEffect(() => { setSaved(readSaved()); const mq = matchMedia("(max-width: 767px)"); const f = () => setPhone(mq.matches); f(); mq.addEventListener("change", f); return () => mq.removeEventListener("change", f); }, []);
  const persist = useCallback((p: Partial<Saved>) => setSaved((s) => { const n = { ...s, ...p }; try { localStorage.setItem(POS_KEY, JSON.stringify(n)); } catch { /* none */ } return n; }), []);
  const close = useCallback(() => { setSection(null); persist({ open: false }); }, [persist]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        if (typing(document.activeElement)) return;
        e.preventDefault();
        if (saved.open) close(); else persist({ open: true });
      } else if (e.key === "Escape" && saved.open) {
        if (section) setSection(null); else close();
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [saved.open, section, close, persist]);
  // Phone sheet closes on page change.
  useEffect(() => { if (phone) setSection(null); }, [pathname, phone]);

  const drag = useRef<{ y: number; top: number; moved: boolean } | null>(null);
  const onDown = (e: React.PointerEvent) => { drag.current = { y: e.clientY, top: saved.top, moved: false }; (e.target as HTMLElement).setPointerCapture(e.pointerId); };
  const onMove = (e: React.PointerEvent) => { const d = drag.current; if (d && Math.abs(e.clientY - d.y) > 4) d.moved = true; };
  const onUp = () => { const d = drag.current; drag.current = null; if (d?.moved) persist({ top: saved.top }); else if (d) persist({ open: !saved.open }); };

  return (
    <>
      {!saved.open && (
        <button type="button" aria-label="Open admin tools (Ctrl+Shift+A)" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); persist({ open: true }); } }}
          className="fixed bottom-28 left-0 z-[60] flex h-20 w-6 md:bottom-6 touch-none items-center justify-center rounded-r-lg bg-admin-tool text-[10px] font-bold uppercase tracking-wider text-admin-tool-foreground shadow-lg [writing-mode:vertical-rl]">
          Admin
        </button>
      )}
      {saved.open && (
        <>
          <div className="pointer-events-none fixed inset-y-0 left-0 z-[59] w-0.5 bg-admin-tool" aria-hidden />
          <nav aria-label="Admin tools"
            className="fixed bottom-28 left-0.5 z-[60] md:bottom-6 flex w-11 flex-col items-center gap-1 rounded-r-xl border border-l-0 border-line bg-card py-2 shadow-xl md:w-[52px]">
            {SECTIONS.map(({ id, label, Icon }) => (
              <button key={id} type="button" aria-label={label} title={label} aria-pressed={section === id} onClick={() => setSection(section === id ? null : id)}
                className={cn("grid h-11 w-9 place-items-center rounded-lg text-ink-2 hover:bg-muted md:w-10", section === id && "bg-admin-tool text-admin-tool-foreground hover:bg-admin-tool")}>
                <Icon className="h-5 w-5" aria-hidden />
              </button>
            ))}
            <button type="button" aria-label="Close admin tools" onClick={close} className="grid h-11 w-9 place-items-center rounded-lg text-ink-3 hover:bg-muted md:w-10"><X className="h-5 w-5" aria-hidden /></button>
          </nav>
          {section === "restart" && <Body section={section} onDone={() => setSection(null)} />}
          {section && section !== "restart" && (
            <section aria-label={SECTIONS.find((s) => s.id === section)?.label}
              className={cn("fixed z-[60] overflow-y-auto border border-line bg-card p-3 text-sm text-ink-1 shadow-xl",
                phone ? "inset-x-2 bottom-24 max-h-[45vh] rounded-2xl" : "bottom-6 left-[56px] max-h-[70vh] w-[260px] rounded-xl")}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-bold">{SECTIONS.find((s) => s.id === section)?.label}</h2>
                <button type="button" aria-label="Close section" onClick={() => setSection(null)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-muted"><X className="h-4 w-4" aria-hidden /></button>
              </div>
              <Body section={section} onDone={() => setSection(null)} />
            </section>
          )}
        </>
      )}
    </>
  );
}

export function useAct() {
  const act = useServerFn(devToolsActionFn);
  const qc = useQueryClient();
  return useCallback(async (data: Record<string, unknown>, done?: string) => {
    try {
      const r = JSON.parse(await act({ data })) as Record<string, unknown>;
      if (done) toast(done);
      return r;
    } catch (e) {
      toast(e instanceof Error ? e.message : "That didn't work.");
      if (e instanceof Error && /off/.test(e.message)) void qc.invalidateQueries({ queryKey: ["dev-tools-access"] });
      return null;
    }
  }, [act, qc]);
}


const LESSON_ITEMS: { step: LessonStep; label: string; band?: "rebuild" | "bridge" | "stretch" }[] = [
  { step: "readiness", label: "Lesson: Ready (warm-up)" }, { step: "hook", label: "Lesson: Hook" }, { step: "video", label: "Lesson: See (video)" },
  { step: "simulation", band: "rebuild", label: "Lesson: Do · Ramp Builder (rebuild)" },
  { step: "simulation", band: "bridge", label: "Lesson: Do · Road Inspector (bridge)" },
  { step: "simulation", band: "stretch", label: "Lesson: Do · Ramp Designer (stretch)" },
  { step: "worksheet", label: "Lesson: Practise" }, { step: "guided", label: "Lesson: Guided" },
  { step: "exit_ticket", label: "Lesson: Exit ticket" }, { step: "reflection", label: "Lesson: Reflect" },
];

/** Clears this device's "seen" flags: Meet your tutor, the tutor helper bubble, dismissed tips. */
export function resetSeenFlags() {
  try {
    for (const k of Object.keys(localStorage)) if (k.startsWith("ul.seen") || k.startsWith("ul.helper") || k.startsWith("ul.tip")) localStorage.removeItem(k);
    for (const k of Object.keys(sessionStorage)) if (k.startsWith("ul.seen") || k.startsWith("ul.helper") || k.startsWith("ul.tip")) sessionStorage.removeItem(k);
  } catch { /* storage unavailable */ }
}

function Body({ section, onDone }: { section: DevSection; onDone: () => void }) {
  const act = useAct();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const loc = useRouterState({ select: (s) => ({ path: s.location.pathname, preview: (s.location.search as Record<string, unknown>)["preview"] }) });
  const { data: topicsRes } = useQuery({ queryKey: ["dev-topics"], queryFn: () => act({ action: "topics" }), staleTime: 60_000 });
  const topics = ((topicsRes as { topics?: TopicRow[] } | null)?.topics ?? []);
  const t = topics.find((x) => x.is_active) ?? topics[0];
  const params = t ? { subject: "mathematics", chapter: t.chapter_slug ?? "general", quest: t.quest_slug ?? "general", topic: t.topic_slug ?? "general" } : null;
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const curStep = typeof document !== "undefined" ? document.documentElement.dataset["lessonStep"] : undefined;
  const go = (label: string, fn: () => unknown) => { void act({ action: "log", section: "goto", what: label }); fn(); };

  if (section === "restart") {
    const run = async () => {
      setBusy(true); setFail(false);
      const r = await act({ action: "restart_journey" });
      if (!r) { setBusy(false); setFail(true); return; }
      resetSeenFlags();
      qc.removeQueries({ queryKey: ["lesson"] });
      await qc.invalidateQueries();
      try { const k = POS_KEY; const v = JSON.parse(localStorage.getItem(k) ?? "{}"); localStorage.setItem(k, JSON.stringify({ ...v, open: false })); } catch { /* none */ }
      window.location.assign("/");
    };
    return (
      <AlertDialog open onOpenChange={(o) => { if (!o && !busy) onDone(); }}>
        <AlertDialogContent onOpenAutoFocus={(e) => { e.preventDefault(); cancelRef.current?.focus(); }}>
          <AlertDialogHeader>
            <AlertDialogTitle>Start again from the beginning?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>This resets:</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>Your lessons and progress, back to 0</li>
                  <li>Warm-up answers and hook choices</li>
                  <li>Tutor tips you've closed</li>
                </ul>
                <p>Students' lessons and your sign-in are not touched.</p>
                {fail && <p role="alert" className="font-semibold text-foreground">That didn't work. Please try again.</p>}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel ref={cancelRef} disabled={busy} className="h-11">Cancel</AlertDialogCancel>
            <button type="button" disabled={busy} onClick={run} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-admin-tool px-4 text-sm font-semibold text-admin-tool-foreground disabled:opacity-60">
              {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}{busy ? "Restarting…" : "Restart"}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  const base = params ? `/${params.subject}/${params.chapter}/${params.quest}/${params.topic}` : "";
  const pages: { label: string; active: boolean; run: () => unknown }[] = [
    { label: "Sign in", active: loc.path === "/sign-in", run: () => navigate({ to: "/sign-in", search: {} }) },
    { label: "Home", active: loc.path === "/", run: () => navigate({ to: "/" }) },
    { label: "Choose a chapter (Mathematics)", active: loc.path === "/mathematics", run: () => navigate({ to: "/$subject", params: { subject: "mathematics" } }) },
  ];
  if (params) {
    pages.push(
      { label: "Choose a quest (Coordinate Geometry)", active: loc.path === `/${params.subject}/${params.chapter}`, run: () => navigate({ to: "/$subject/$chapter", params }) },
      { label: `Path map (${t?.display_name ?? "topic"})`, active: loc.path === `${base}/path`, run: () => navigate({ to: "/$subject/$chapter/$quest/$topic/path", params }) },
      ...LESSON_ITEMS.map((li) => ({
        label: li.label,
        active: loc.path === base && loc.preview != null && curStep === li.step,
        run: async () => {
          setBusy(true);
          const r = await act({ action: "open_step", step: li.step, ...(li.band ? { band: li.band } : {}) });
          setBusy(false);
          if (!r) return;
          qc.removeQueries({ queryKey: ["lesson"] });
          if (loc.path === base && loc.preview != null) window.location.reload();
          else void navigate({ to: "/$subject/$chapter/$quest/$topic", params, search: { preview: 1 } });
        },
      })),
    );
  }
  pages.push(
    { label: "Admin: Content import", active: loc.path === "/admin/content-import", run: () => navigate({ to: "/admin/content-import" }) },
    { label: "Admin: Session debug", active: loc.path === "/admin/session-debug", run: () => navigate({ to: "/admin/session-debug" }) },
  );
  return (
    <ul className="flex flex-col gap-1">
      {pages.map((p) => (
        <li key={p.label}>
          <button type="button" disabled={busy} aria-current={p.active ? "page" : undefined} onClick={() => go(p.label, p.run)}
            className={cn("min-h-9 w-full rounded-lg border border-line px-2.5 py-1.5 text-left text-xs font-semibold hover:bg-muted disabled:opacity-60",
              p.active && "border-admin-tool bg-admin-tool text-admin-tool-foreground hover:bg-admin-tool")}>{p.label}</button>
        </li>
      ))}
    </ul>
  );
}
