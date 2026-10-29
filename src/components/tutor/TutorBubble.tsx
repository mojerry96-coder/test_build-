import { looksRaw, safeChatLines } from "@/shared/contracts/chat-safety";
import type { Script } from "@/shared/contracts/script";
import { cn } from "@/lib/utils";
import { TutorAvatar, type TutorMood } from "./TutorAvatar";

/** Tutor speech: bubble with a tail pointing at the avatar. Captions are the text itself. */
export function TutorBubble({ lines, name, mood = "head", compact = false, className, live = false, fallback = [] }: { lines: Script; name: string; mood?: TutorMood; compact?: boolean; className?: string; live?: boolean; fallback?: Script | undefined }) {
  lines = safeChatLines(lines, fallback, (t) => console.warn("[chat-safety] blocked raw text in tutor bubble", t.slice(0, 80)));
  if (!lines.length) return null;
  return (
    <div className={cn("flex min-w-0 items-start gap-3", className)} aria-live="polite">
      <TutorAvatar mood={mood} size={compact ? 36 : 44} live={live} />
      <div className="min-w-0 flex-1">
        {(
          <p className="mb-1 text-xs font-semibold text-muted-foreground">
            {name} <span className="font-normal">· AI</span>
          </p>
        )}
        <div className="relative rounded-2xl rounded-tl-sm bg-accent px-4 py-3 text-[0.95rem] leading-relaxed text-foreground">
          {lines.map((l, i) => (
            <p key={i} className={cn("maths break-words", i ? "mt-2" : "")}>{l.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function StudentBubble({ text }: { text: string }) {
  if (looksRaw(text)) { console.warn("[chat-safety] blocked raw text in student bubble"); return null; }
  return (
    <div className="flex justify-end">
      <p className="max-w-[85%] rounded-2xl rounded-tr-sm border border-border bg-card px-4 py-2.5 text-[0.95rem]">{text}</p>
    </div>
  );
}
