import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

/** Frosted glass info card with the small white arrow circle top-right. */
export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`glass-card relative p-5 ${className}`}>
      <span className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white">
        <ArrowUpRight className="h-4 w-4 text-navy" aria-hidden />
      </span>
      {children}
    </div>
  );
}
