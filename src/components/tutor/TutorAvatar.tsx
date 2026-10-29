import idle from "@/assets/tutor/idle.png.asset.json";
import speaking from "@/assets/tutor/speaking.png.asset.json";
import thinking from "@/assets/tutor/thinking.png.asset.json";
import encouraging from "@/assets/tutor/encouraging-folded.png.asset.json";
import celebrate from "@/assets/tutor/celebrate-wings.png.asset.json";
import head from "@/assets/tutor/head.png.asset.json";
import main from "@/assets/tutor/main.png.asset.json";
import { useLowData } from "@/lib/ui-prefs";
import { cn } from "@/lib/utils";

export type TutorMood = "listening" | "idle" | "speaking" | "thinking" | "encouraging" | "celebrate" | "head" | "full";
const SRC: Record<TutorMood, string> = {
  listening: thinking.url, idle: idle.url, speaking: speaking.url, thinking: thinking.url, encouraging: encouraging.url,
  celebrate: celebrate.url, head: head.url, full: main.url,
};
const MOTION: Record<TutorMood, string> = {
  idle: "tutor-breathe", head: "tutor-breathe", full: "tutor-breathe", listening: "tutor-breathe",
  thinking: "tutor-breathe", speaking: "tutor-bob", encouraging: "tutor-hop", celebrate: "tutor-hop",
};

/**
 * The tutor (an African Grey, always labelled as an AI). Hidden in low-data mode.
 * `live` adds calm mood movement; leave it off for the small avatars beside chat messages.
 */
export function TutorAvatar({ mood = "head", size = 48, className, forceShow = false, live = false }: { mood?: TutorMood; size?: number; className?: string; forceShow?: boolean; live?: boolean }) {
  const [lowData] = useLowData();
  if (!forceShow && (lowData || (typeof navigator !== "undefined" && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData))) return null;
  return (
    <span className={cn("relative inline-block shrink-0", className)} style={{ width: size, height: size }} data-mood={mood}>
      <img
        key={mood}
        src={new URL(SRC[mood], typeof window !== "undefined" ? window.location.origin : "http://localhost").href}
        alt="AI tutor"
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cn("h-full w-full object-contain", live && "tutor-fade", live && MOTION[mood])}
      />
      {live && mood === "thinking" && (
        <span className="tutor-dots absolute -right-1 top-0 flex gap-0.5" aria-hidden>
          <i /><i /><i />
        </span>
      )}
      {live && mood === "celebrate" && (
        <span className="pointer-events-none absolute inset-0" aria-hidden>
          <span className="tutor-feather absolute left-[10%] top-0" />
          <span className="tutor-feather absolute left-[55%] top-[5%] [animation-delay:200ms]" />
          <span className="tutor-feather absolute left-[80%] top-0 [animation-delay:400ms]" />
        </span>
      )}
    </span>
  );
}
