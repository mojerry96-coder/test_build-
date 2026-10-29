import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { MeTopic } from "@/lib/api/me.functions";

/** Every way into a topic opens its "Let's Begin" map; Fiti starts or resumes the lesson from there. */
export function useStartTopic() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState<string | null>(null);
  const open = async (t: MeTopic) => {
    setBusy(t.id);
    try { await navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: t.path }); } finally { setBusy(null); }
  };
  return { open, busy, error: null as string | null };
}
