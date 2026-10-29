import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface PillButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  /** "raised" = 3D lesson style (default); "flat" = original start-page style. */
  look?: "raised" | "flat";
  className?: string;
  ariaLabel?: string;
}

/** Pill button with a white arrow circle on primary. */
export function PillButton({ children, onClick, variant = "primary", look = "raised", className = "", ariaLabel }: PillButtonProps) {
  const primary = variant === "primary";
  const raised = look === "raised";
  const skin = raised
    ? `btn-3d ${primary ? "btn-3d-primary" : "btn-3d-secondary"} font-bold`
    : `rounded-full font-semibold transition-transform hover:scale-[1.03] active:scale-[0.96] ${primary ? "bg-brand text-white" : "bg-white text-navy"}`;
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`group inline-flex min-h-11 cursor-pointer items-center gap-3 px-6 py-2.5 text-base tracking-tight outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${skin} ${className}`}
    >
      <span>{children}</span>
      {primary && (
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white transition-transform duration-200 group-hover:translate-x-0.5">
          <ArrowRight className={`h-4 w-4 ${raised ? "text-btn3d-edge" : "text-brand"}`} aria-hidden />
        </span>
      )}
    </button>
  );
}
