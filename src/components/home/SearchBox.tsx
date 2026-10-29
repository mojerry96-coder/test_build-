import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shared search box for navigation screens: focus ring on the whole box, clear button, polite results count. */
export function SearchBox({ value, onChange, placeholder, label, count, noun, className }: {
  value: string; onChange: (v: string) => void; placeholder: string; label: string; count: number; noun: [string, string]; className?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const clear = () => { onChange(""); ref.current?.focus(); };
  return (
    <div className={cn("search-box flex h-12 w-full cursor-text items-center gap-3 rounded-xl bg-search px-4", className)} onMouseDown={(e) => {
      if (e.target !== ref.current) { e.preventDefault(); ref.current?.focus(); }
    }}>
      <Search className="search-icon h-5 w-5 shrink-0 text-ink-3" aria-hidden />
      <input ref={ref} type="text" inputMode="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label}
        onKeyDown={(e) => { if (e.key === "Escape" && value) { e.preventDefault(); clear(); } }}
        className="search-input h-full w-full min-w-0 bg-transparent text-sm text-ink placeholder:text-ink-3" />
      {value && (
        <button type="button" onClick={clear} aria-label="Clear search" className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-3 hover:text-ink">
          <X className="h-4 w-4" />
        </button>
      )}
      <span className="sr-only" aria-live="polite">{value ? `${count} ${count === 1 ? noun[0] : noun[1]} found` : ""}</span>
    </div>
  );
}
