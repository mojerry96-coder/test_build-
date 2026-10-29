// Shared blue edge tab + slide-out panel (Leaderboard on lesson steps, Chat history on Ask Fiti).
import { useEffect, useState, type ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function useNarrow() {
  const [n, setN] = useState(false);
  useEffect(() => { const m = matchMedia("(max-width: 767px)"); const f = () => setN(m.matches); f(); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return n;
}

/** Hide the tab while any other card or dialog is on screen. */
function useOtherDialog(open: boolean) {
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const check = () => setBusy(!open && !!document.querySelector('[role="dialog"], [role="alertdialog"], [role="menu"], .vl-card, [data-celebrating]'));
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["role", "data-state"] });
    return () => mo.disconnect();
  }, [open]);
  return busy;
}

export function SideTab({ label, ariaLabel, icon, side = "right", tabClass, title, description, open, onOpenChange, children }: {
  label: string; ariaLabel: string; icon: ReactNode; side?: "left" | "right"; /** Position classes for the tab (top/left/right). */ tabClass?: string;
  title: ReactNode; description: ReactNode; open: boolean; onOpenChange: (o: boolean) => void; children: ReactNode;
}) {
  const narrow = useNarrow();
  const hidden = useOtherDialog(open);
  return (
    <>
      {!hidden && (
        <button type="button" onClick={() => onOpenChange(true)} aria-label={ariaLabel}
          className={cn("interactive fixed z-40 flex min-h-11 min-w-11 items-center gap-1.5 border-2 border-fh-primary-edge bg-fh-primary px-2 py-3 text-[13px] font-bold text-fh-primary-ink shadow-[0_4px_0_var(--fh-primary-edge)] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [writing-mode:vertical-rl]",
            side === "right" ? "right-0 rounded-l-[14px] border-r-0" : "rounded-r-[14px] border-l-0", tabClass)}>
          <span className="rotate-90" aria-hidden>{icon}</span>{label}
        </button>
      )}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side={narrow ? "bottom" : side} className={cn("overflow-y-auto bg-fh-card text-fh-ink motion-reduce:animate-none", narrow ? "max-h-[85dvh] rounded-t-[24px]" : "w-[min(400px,92vw)]")}>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 font-display text-[22px] text-fh-primary-edge dark:text-fh-primary">{title}</SheetTitle>
            <SheetDescription className="text-[15px] text-fh-ink">{description}</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>
    </>
  );
}
