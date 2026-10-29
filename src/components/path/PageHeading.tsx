// "← Back  Heading" in Patrick Hand, as on the Fiti pages.
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

export function PageHeading({ onBack, children }: { onBack: () => void; children: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-4 md:gap-6">
      <button type="button" onClick={onBack}
        className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-2 text-[20px] text-fh-heading transition-colors hover:bg-fh-nav-on/70 focus-visible:outline-2 focus-visible:outline-fh-box-edge md:text-[24px]">
        <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />Back
      </button>
      <h1 className="min-w-0 truncate font-hand text-[38px] leading-none text-hub-heading [-webkit-text-stroke:1px_var(--hub-heading)] md:text-[clamp(40px,5.5vh,52px)]">{children}</h1>
    </div>
  );
}
