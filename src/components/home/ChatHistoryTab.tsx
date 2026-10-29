// Chat history: left edge tab on the Ask Fiti page only. Lists her past chats; tapping one reopens it.
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Clock, Plus } from "lucide-react";
import { SideTab } from "@/components/side-tab/SideTab";
import { listConversationsFn, newConversationFn, openConversationFn } from "@/lib/api/home.functions";
import { markChatOpen } from "@/lib/chat-open";
import { cn } from "@/lib/utils";

function when(iso: string, now = new Date()) {
  const d = new Date(iso);
  const day = (x: Date) => x.toLocaleDateString("en-GB", { timeZone: "Africa/Lagos" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
  if (day(d) === day(now)) return `Today, ${time}`;
  if (day(d) === day(new Date(now.getTime() - 86_400_000))) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

export function ChatHistoryTab({ current }: { current: string | null }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const qc = useQueryClient();
  const list = useServerFn(listConversationsFn);
  const openFn = useServerFn(openConversationFn);
  const fresh = useServerFn(newConversationFn);
  const q = useQuery({ queryKey: ["home-conversations"], queryFn: () => list(), enabled: open, staleTime: 0 });

  const pick = async (id: string) => {
    if (id === current) { setOpen(false); return; }
    setBusy(id);
    try {
      const h = await openFn({ data: { conversationId: id } });
      markChatOpen();
      qc.setQueryData(["home-history"], h);
      setOpen(false);
    } finally { setBusy(null); }
  };
  const startNew = async () => {
    setBusy("new");
    try {
      const { conversationId } = await fresh();
      qc.setQueryData(["home-history"], { conversationId, msgs: [] });
      setOpen(false);
    } finally { setBusy(null); }
  };

  return (
    <SideTab side="left" label="Chat history" ariaLabel="Chat history: your past chats" icon={<Clock className="h-4 w-4" />}
      tabClass="top-[46%] left-0 md:left-[clamp(132px,8vw,148px)] max-md:top-auto max-md:bottom-[180px]"
      title={<><Clock className="h-5 w-5" aria-hidden />Chat history</>} description="Pick a chat to carry on where you left off."
      open={open} onOpenChange={setOpen}>
      <button type="button" onClick={() => void startNew()} disabled={!!busy}
        className="interactive mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-fh-primary text-[15px] font-semibold text-fh-primary-ink shadow-[0_4px_0_var(--fh-primary-edge)] disabled:opacity-60">
        <Plus className="h-4 w-4" aria-hidden />New chat
      </button>
      {q.isLoading && <p className="mt-5 text-sm" role="status">Loading your chats…</p>}
      {q.isError && <p className="mt-5 text-sm">We couldn't load your chats. <button className="underline" onClick={() => void q.refetch()}>Try again</button></p>}
      {q.data && q.data.length === 0 && <p className="mt-5 text-sm">No chats yet.</p>}
      <ul className="mt-4 space-y-2">
        {q.data?.map((c) => (
          <li key={c.id}>
            <button type="button" onClick={() => void pick(c.id)} disabled={!!busy} aria-current={c.id === current || undefined}
              className={cn("interactive flex w-full flex-col items-start rounded-[14px] border px-3 py-2.5 text-left hover:bg-muted disabled:opacity-60", c.id === current ? "border-fh-primary-edge" : "border-fh-box-line")}>
              <span className="line-clamp-2 text-[15px] font-semibold">{c.title}</span>
              <span className="mt-0.5 text-[12px] text-fh-sub">{busy === c.id ? "Opening…" : c.id === current ? "Open now" : when(c.updatedAt)}</span>
            </button>
          </li>
        ))}
      </ul>
    </SideTab>
  );
}
