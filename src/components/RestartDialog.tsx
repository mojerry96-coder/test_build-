// Restart from the profile menu (demo, admins only, live app too). Same server action and wording as the admin tools Restart.
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, alertPrimaryClass } from "@/components/ui/alert-dialog";
import { restartMyJourneyFn } from "@/lib/api/home.functions";
import { bumpRestartEpoch } from "@/lib/restart-epoch";

function resetSeenFlags() {
  try {
    for (const s of [localStorage, sessionStorage])
      for (const k of Object.keys(s)) if (k.startsWith("ul.seen") || k.startsWith("ul.helper") || k.startsWith("ul.tip") || k.startsWith("tip:") || k.startsWith("ask-since:") || k.startsWith("tutor-collapse") || k.startsWith("wb:") || k === "ul.lowNote" || k === "ul.lowData" || k === "working-step-mode") s.removeItem(k);
    const v = JSON.parse(localStorage.getItem("ul.dev.panel") ?? "{}");
    localStorage.setItem("ul.dev.panel", JSON.stringify({ ...v, open: false }));
  } catch { /* storage unavailable */ }
}

export function RestartDialog({ open, onOpenChange, admin = true }: { open: boolean; onOpenChange: (o: boolean) => void; admin?: boolean }) {
  const mine = useServerFn(restartMyJourneyFn);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [fail, setFail] = useState(false);
  const [slow, setSlow] = useState(false);
  const [wait, setWait] = useState(0);
  useEffect(() => {
    if (wait <= 0) return;
    const id = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(id);
  }, [wait]);
  const router = useRouter();
  const navigate = useNavigate();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const run = async () => {
    setBusy(true); setFail(false); setSlow(false);
    const t = setTimeout(() => setSlow(true), 8000);
    // Admins and students use the same quick reset.
    try { await mine(); } catch (e) {
      clearTimeout(t); setBusy(false);
      const m = e instanceof Error ? /RESTART_COOLDOWN:(\d+)/.exec(e.message) : null;
      if (m) setWait(Number(m[1])); else setFail(true);
      return;
    }
    clearTimeout(t);
    resetSeenFlags();
    await qc.cancelQueries();
    qc.clear();
    setBusy(false); onOpenChange(false);
    bumpRestartEpoch();
    await navigate({ to: "/", replace: true });
    await router.invalidate();
  };
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!busy || slow) { setFail(false); onOpenChange(o); } }}>
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
              <p>{admin ? "Students' lessons and your sign-in are not touched." : "Your sign-in and settings are not touched."}</p>
              {slow && busy && <p role="status" className="font-semibold text-foreground">Still working…</p>}
              {fail && <p role="alert" className="font-semibold text-foreground">That didn't work. Please try again.</p>}
              {wait > 0 && <p role="status" className="font-semibold text-foreground">You just started again. You can do it again in {wait} seconds.</p>}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel ref={cancelRef} disabled={busy && !slow}>Cancel</AlertDialogCancel>
          <button type="button" disabled={(busy && !slow) || wait > 0} onClick={run} className={alertPrimaryClass}>
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}{busy && slow ? "Try again" : busy ? "Restarting…" : fail ? "Try again" : "Restart"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
