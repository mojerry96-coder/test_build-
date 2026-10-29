import type React from "react";
import { Link, type LinkProps } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

export function BackLink({ label, ...props }: LinkProps & { label: string; onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <Link {...props} className="-ml-2 mb-3 inline-flex h-11 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ChevronLeft className="h-5 w-5" aria-hidden />
      {label}
    </Link>
  );
}
