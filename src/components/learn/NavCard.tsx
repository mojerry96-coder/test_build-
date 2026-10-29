import type { CSSProperties, ReactNode } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatusChip({ tone, children }: { tone: "secure" | "progress" | "next" | "locked" | "neutral"; children: ReactNode }) {
  const cls = {
    secure: "bg-reward-soft text-reward",
    progress: "bg-accent text-accent-foreground",
    next: "bg-info text-info-foreground",
    locked: "bg-muted text-muted-foreground",
    neutral: "bg-muted text-foreground",
  }[tone];
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold", cls)}>{children}</span>;
}

export function ProgressRing({ value, total, size = 40 }: { value: number; total: number; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${value} of ${total} secure`} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth="4" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-info)" strokeWidth="4" strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="var(--color-foreground)">{value}/{total}</text>
    </svg>
  );
}

/** Card for subjects, chapters, quests and topics. Locked items stay visible, faded with a lock. */
export function NavCard({ title, subtitle, icon, chip, right, locked, highlight, onClick, children, stacked, iconStyle }: {
  iconStyle?: CSSProperties | undefined;
  stacked?: boolean | undefined;
  title: string; subtitle?: string | undefined; icon?: ReactNode; chip?: ReactNode; right?: ReactNode; locked?: boolean | undefined; highlight?: boolean | undefined;
  onClick?: (() => void) | undefined; children?: ReactNode;
}) {
  const body = stacked ? (
    <div className="relative flex min-h-28 flex-col gap-3">
      {locked && <Lock className="absolute right-0 top-0 h-4 w-4 text-muted-foreground" aria-label="Not available yet" />}
      {icon && <div className={cn("grid h-11 w-11 place-items-center rounded-xl", locked ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground")}>{icon}</div>}
      <div className="min-w-0">
        <h3 className="truncate text-base font-bold">{title}</h3>
        {chip && <div className="mt-1.5">{chip}</div>}
      </div>
    </div>
  ) : (
    <>
      <div className="flex min-w-0 items-start gap-3">
        {icon && <div style={iconStyle} className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-xl", locked ? "bg-muted text-muted-foreground" : "bg-accent text-accent-foreground", iconStyle && "chap-tile")}>{icon}</div>}
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold leading-snug">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
          {chip && <div className="mt-2">{chip}</div>}
        </div>
        {locked ? <Lock className="h-5 w-5 shrink-0 text-muted-foreground" aria-label="Not available yet" /> : right}
      </div>
      {children}
    </>
  );
  const cls = cn(
    "block w-full rounded-2xl border bg-card p-4 text-left transition-shadow",
    highlight ? "border-info shadow-sm ring-1 ring-info" : "border-border",
    locked ? "bg-muted text-muted-foreground opacity-50 saturate-0" : onClick ? "interactive hover:shadow-md" : "",
  );
  if (locked || !onClick) return <div className={cls} aria-disabled={locked || undefined}>{body}</div>;
  return <button type="button" className={cls} onClick={onClick}>{body}</button>;
}

export const SecureChip = () => <StatusChip tone="secure"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden />Secure</StatusChip>;
