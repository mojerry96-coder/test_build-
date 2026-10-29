// "Go back to {stop}?" on the Let's Begin map: confirm before her lesson moves back to an earlier step.
// Words come from approved path_back_* lines; Escape or tapping outside counts as "Stay here".
import { LoaderCircle } from "lucide-react";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, alertPrimaryClass } from "@/components/ui/alert-dialog";
import { useSay } from "@/lib/voice";
import bird from "@/assets/path/bird.png.asset.json";

export function GoBackDialog({ open, title, line, yes, stay, busy, error, onYes, onStay }: {
  open: boolean; title: string; line: string; yes: string; stay: string; busy: boolean; error: string | null;
  onYes: () => void; onStay: () => void;
}) {
  useSay(open && line ? [line] : [], open ? `goback:${title}` : "", open && !!line, true);
  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o && !busy) onStay(); }}>
      <AlertDialogContent className="rounded-[24px] text-center sm:max-w-[420px]" onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}>
        <img src={bird.url} alt="" aria-hidden className="mx-auto h-20 w-auto" />
        <AlertDialogHeader className="items-center sm:text-center">
          <AlertDialogTitle className="font-splash text-2xl text-fh-heading">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-base text-fh-sub">{line}</AlertDialogDescription>
          {error && <p role="alert" className="text-sm font-semibold text-foreground">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:justify-center">
          <AlertDialogCancel disabled={busy} onClick={onStay}>{stay}</AlertDialogCancel>
          <button type="button" disabled={busy} onClick={onYes} className={alertPrimaryClass}>
            {busy && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}{yes}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
