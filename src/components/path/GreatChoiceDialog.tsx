// "Great Choice!" popup between picking a quest/topic and its path map. The line is the approved path_popup line.
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import thumbs from "@/assets/home/parrot-thumbs.png.asset.json";

export function GreatChoiceDialog({ open, line, onContinue, onClose }: { open: boolean; line: string | null; onContinue: () => void; onClose: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-[calc(100vw-32px)] overflow-hidden rounded-[28px] border-0 bg-fh-card p-0 shadow-[0_30px_80px_-30px_rgb(2_64_100/0.5)] sm:max-w-[630px] [&>button]:hidden">
        <div className="relative px-8 pb-14 pt-12 text-center">
          <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute left-[12%] top-[16%] h-24 w-24 text-fh-page"><path fill="currentColor" d="M50 0l9 30 31-12-19 27 29 15-33 4 6 33-23-24-23 24 6-33L0 60l29-15L10 18l31 12z" /></svg>
          <svg aria-hidden viewBox="0 0 120 120" className="pointer-events-none absolute -right-6 -top-4 h-40 w-40 text-fh-page"><path fill="none" stroke="currentColor" strokeWidth="18" strokeLinecap="round" d="M20 30c30-20 60 10 40 30s10 50 40 30" /></svg>
          <svg aria-hidden viewBox="0 0 120 60" className="pointer-events-none absolute bottom-3 right-6 h-14 w-28 text-fh-page"><path fill="currentColor" d="M20 60a20 20 0 0 1 10-38 26 26 0 0 1 48-6 20 20 0 0 1 32 24 14 14 0 0 1-2 20z" /></svg>
          <img src={thumbs.url} alt="" className="relative mx-auto h-[165px] w-[165px] rounded-full object-cover object-top" />
          <DialogTitle className="relative mt-4 font-hand text-[44px] leading-none text-hub-heading [-webkit-text-stroke:1px_var(--hub-heading)] md:text-[48px]">Great Choice!</DialogTitle>
          <DialogDescription className="relative mx-auto mt-4 max-w-[440px] text-[18px] leading-[1.75] text-fh-ink">{line ?? "\u00a0"}</DialogDescription>
          <button type="button" onClick={onContinue} autoFocus
            className="relative mx-auto mt-9 flex h-[58px] w-[248px] items-center justify-center rounded-full bg-fh-dark-btn text-[19px] font-semibold text-fh-dark-btn-ink shadow-[0_6px_0_var(--fh-dark-btn-edge)] transition-[transform,filter,box-shadow] hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge active:translate-y-[3px] active:shadow-[0_3px_0_var(--fh-dark-btn-edge)] motion-reduce:transition-none">
            Continue
          </button>
        </div>
        <div aria-hidden className="h-4 bg-gradient-to-r from-hub-day-on via-path-next-ring to-path-star" />
      </DialogContent>
    </Dialog>
  );
}
