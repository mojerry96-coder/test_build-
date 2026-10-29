import type { ReactNode } from "react";
import { FitiLoader } from "./FitiLoader";
import { Button } from "@/components/ui/button";
import { TutorAvatar } from "@/components/tutor/TutorAvatar";

export function PageSkeleton(_: { rows?: number } = {}) {
  return <FitiLoader />;
}

export function FriendlyError({ message, onRetry }: { message?: string | undefined; onRetry?: (() => void) | undefined }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-12 text-center" role="alert">
      <TutorAvatar mood="thinking" size={88} forceShow live />
      <h2 className="mt-4 text-xl font-bold">That didn't load</h2>
      <p className="mt-2 text-muted-foreground">{message ?? "Check your connection, then try again. Your place is saved."}</p>
      {message && /no longer exists|isn't yours|couldn't find/i.test(message)
        ? <Button asChild className="mt-6 h-12 px-6"><a href="/">Back to my topics</a></Button>
        : onRetry && <Button className="mt-6 h-12 px-6" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-8 text-center">
      <TutorAvatar mood="idle" size={64} className="mx-auto block" live />
      <p className="mt-3 font-semibold">{title}</p>
      {children && <div className="mt-1 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}

export function PageHeader({ eyebrow, title, subtitle, back }: { eyebrow?: string; title: string; subtitle?: string; back?: ReactNode }) {
  return (
    <header className="mb-6">
      {back}
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{eyebrow}</p>}
      <h1 className="mt-1 text-[1.75rem] font-extrabold leading-tight">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
    </header>
  );
}
