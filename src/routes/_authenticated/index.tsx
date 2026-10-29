import { clearTrail, markChatOpen, takeChatOpen } from "@/lib/chat-open";
import { WelcomeCard } from "@/components/home/WelcomeCard";
import { getTopicIntroFn } from "@/lib/api/topic-intro.functions";
import type { TopicPath } from "@/shared/contracts/home";
import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { landingFor } from "@/shared/role-landing";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { meQueryOptions } from "./route";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { FitilaShell } from "@/components/home/FitilaShell";
import { AskBox, Conversation, TutorLine, useFitila } from "@/components/home/FitilaAgent";
import { showStartPage, startBubble } from "@/shared/start-page";
import { START_CARDS } from "@/shared/start-cards";
import times from "@/assets/home/times.png.asset.json";
import dna from "@/assets/home/dna.png.asset.json";
import { getHomeFn, homeHistoryFn } from "@/lib/api/home.functions";
import { tutorNameQuery } from "@/lib/tutor-name";
import type { HomeChatMsg, HomeData } from "@/shared/contracts/home";
import type { Me as MeData } from "@/lib/api/me.functions";
import { WavingFiti } from "@/components/learn/WavingFiti";
import { ChatHistoryTab } from "@/components/home/ChatHistoryTab";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Ask your tutor | uLesson AI Tutor" },
      { name: "description", content: "Your plan for tonight and a chat with your AI tutor, for WAEC, NECO and JAMB." },
      { property: "og:title", content: "Ask your tutor | uLesson AI Tutor" },
      { property: "og:description", content: "Your plan for tonight and a chat with your AI tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { resume?: string } => (typeof s["resume"] === "string" && /^\/[a-z0-9-]+(\/[a-z0-9-]+){3}\/path$/.test(s["resume"]) ? { resume: s["resume"] } : {}),
  component: Home,
});

export function useHomeData() {
  const getHome = useServerFn(getHomeFn);
  const getHist = useServerFn(homeHistoryFn);
  const me = useQuery(meQueryOptions);
  const home = useQuery({ queryKey: ["home"], queryFn: () => getHome() });
  const hist = useQuery({ queryKey: ["home-history"], queryFn: () => getHist(), staleTime: Infinity });
  const { data: tn } = useQuery(tutorNameQuery);
  return { me, home, hist, tutorName: tn ?? "your tutor" };
}

function Home() {
  const { me, home, hist, tutorName } = useHomeData();
  const land = me.data ? landingFor(me.data.roles) : null;
  if (land === "parent") return <Navigate to="/parent" replace />;
  if (land === "teacher") return <Navigate to="/teacher" replace />;
  if (me.isLoading || home.isLoading || hist.isLoading) return <PageSkeleton rows={3} />;
  if (me.isError || home.isError || !me.data || !home.data) return <FriendlyError onRetry={() => { me.refetch(); home.refetch(); }} />;
  const m = me.data;
  if (!m.isStudent && !m.isAdmin) {
    return (
      <main className="mx-auto max-w-md px-5 py-12 text-center">
        <h1 className="text-2xl font-bold">Your account is waiting for access</h1>
        <p className="mt-3 text-muted-foreground">An administrator needs to set up your account before you can start lessons.</p>
      </main>
    );
  }
  const conv = hist.data?.conversationId ?? null;
  // Keyed by conversation so New Chat starts clean.
  return <AskPage key={conv ?? "new"} me={m} h={home.data} tutorName={tutorName} initial={hist.data?.msgs ?? []} conv={conv} />;
}

function AskPage({ me: m, h, tutorName, initial, conv }: { me: MeData; h: HomeData; tutorName: string; initial: HomeChatMsg[]; conv: string | null }) {
  const f = useFitila(initial, conv);
  const yes = () => f.run({ kind: "plan_yes", proposal: { itemId: "", topicId: "", label: "", to: "", whenLabel: "", add: false } }, "Yes");
  const other = () => f.run({ kind: "text", text: "pick another time", mode: "tutor" }, "Pick another time");
  const send = (text: string, mode: "tutor" | "quiz") => f.run({ kind: "text", text, mode }, text);
  // Back from the Let's Begin map: offer "Continue learning" to the topic she left.
  const { resume } = Route.useSearch();
  const nav = useNavigate();
  const done = useRef(false);
  // Back from the map (browser back or our Back button) reopens the conversation, never the start page.
  useEffect(() => { if (takeChatOpen() || resume) f.open(); clearTrail(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!resume || done.current) return;
    done.current = true;
    f.addTutor("Ready to pick up where you stopped?", [{ label: "Continue learning", link: resume }]);
    void nav({ to: "/", search: {}, replace: true });
  }, [resume]); // eslint-disable-line react-hooks/exhaustive-deps
  // Just back from Google sign-in with no saved page: show "Choose learning path" first.
  useEffect(() => {
    try { if (sessionStorage.getItem("ul.choosePath")) { sessionStorage.removeItem("ul.choosePath"); void nav({ to: "/choose", replace: true }); } } catch { /* none */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const talking = !showStartPage(f.msgs, f.started);
  // The start page shows no Fiti bubble; his messages appear once the chat opens.
  const bubble = talking ? null : (false as const) && startBubble(f.msgs);
  return (
    <FitilaShell initials={h.initials} streak={h.streak} tutorName={tutorName} isAdmin={m.isAdmin}>
      {f.welcome && <WelcomeGate path={f.welcome} onClose={f.closeWelcome} />}
      <ChatHistoryTab current={conv} />
      {talking ? (
        <main className="mx-auto flex min-h-screen w-full max-w-[830px] flex-col px-4 pb-24 pt-28 md:pb-8 md:pt-[150px]">
          <div className="flex-1 pb-8">
            <Conversation msgs={f.msgs} busy={f.busy} tutorName={tutorName} initials={h.initials} onButton={f.press} onYes={yes} onOther={other} onPick={f.pick} />
          </div>
          <div className="sticky bottom-20 z-10 mx-auto w-full max-w-[775px] md:bottom-[90px]">
            <AskBox tutorName={tutorName} busy={f.busy} onSend={send} placeholder="What do you want to learn today?" classLabel={h.className} />
          </div>
        </main>
      ) : (
        <>
          {/* One centred group a little above the middle (as in the design); Fiti waves from the bottom-right corner. */}
          <main className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[clamp(640px,52vw,760px)] flex-col justify-center px-4 pb-[16vh] pt-24 max-md:max-w-none max-md:pb-28 [@media(max-height:640px)]:justify-start [@media(max-height:640px)]:pb-8">
            <h1 className="spec-heading text-balance break-words text-center max-md:text-[40px] max-md:leading-[46px]">Ready to learn, {h.firstName ?? m.firstName ?? "friend"}?</h1>
            {bubble && (
              <div className="mt-[clamp(16px,3vh,28px)]" aria-live="polite">
                <TutorLine m={bubble} last onButton={f.press} onYes={yes} onOther={other} />
              </div>
            )}
            <div className="mt-[clamp(20px,4vh,40px)] space-y-5">
              <AskBox tutorName={tutorName} busy={f.busy} onSend={send} placeholder="What do you want to learn today?" classLabel={h.className} />
              <StartCards onSend={send} />
            </div>
          </main>
          <WavingFiti
            className="pointer-events-none fixed bottom-[4vh] right-[clamp(16px,5vw,120px)] z-0 hidden h-[clamp(180px,32vh,380px)] w-auto object-contain anim-popup motion-reduce:animate-none md:block max-[1279px]:h-[clamp(150px,22vh,240px)] [@media(max-height:640px)]:hidden" />
        </>
      )}
    </FitilaShell>
  );
}

function StartCards({ onSend }: { onSend: (text: string, mode: "tutor" | "quiz") => void }) {
  const icon = { maths: times.url, science: dna.url } as Record<string, string>;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {START_CARDS.map((c) => {
        const body = (
          <>
            {icon[c.key] ? <img src={icon[c.key]} alt="" className="h-8 w-8 shrink-0 object-contain" />
              : <span aria-hidden className="w-9 shrink-0 text-[26px] font-black italic leading-none text-hub-eng-ink">Aa</span>}
            <span className="min-w-0">
              <span className="block text-[15px] font-medium leading-tight text-hub-heading max-lg:text-[14px]">{c.title}</span>
              <span className="block line-clamp-2 text-[10px] leading-tight text-fh-sub">{c.line}</span>
            </span>
          </>
        );
        const cls = "flex h-[60px] min-w-0 items-center gap-3 rounded-[14px] bg-fh-card px-4 text-left shadow-[0_2px_10px_-6px_rgb(10_49_80/0.15)]";
        return c.send
          ? <button key={c.key} type="button" onClick={() => onSend(c.send!.text, c.send!.mode)} className={`${cls} cursor-pointer transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-10px_rgb(10_49_80/0.3)] focus-visible:outline-2 focus-visible:outline-fh-box-edge motion-reduce:transition-none motion-reduce:hover:translate-y-0`}>{body}</button>
          : <div key={c.key} role="group" aria-label={`${c.title}, coming soon`} className={cls}>{body}</div>;
      })}
    </div>
  );
}

/** "Great Choice!" before a first-time topic's map; words are the approved home_welcome_* lines. */
function WelcomeGate({ path, onClose }: { path: TopicPath; onClose: () => void }) {
  const get = useServerFn(getTopicIntroFn);
  const nav = useNavigate();
  const q = useQuery({ queryKey: ["topic-intro", path], queryFn: () => get({ data: path }), staleTime: 60_000, retry: 1 });
  const l = (k: string) => (q.data?.kind === "intro" ? q.data.pathLines[k]?.join(" ") : undefined);
  const title = l("home_welcome_title");
  const go = () => { markChatOpen(); void nav({ to: "/$subject/$chapter/$quest/$topic/path", params: path, search: { from: "chat" } }); };
  // Words unavailable: open the map as before rather than leave her stuck.
  useEffect(() => { if (q.isError || (q.data && !title)) go(); }, [q.isError, q.data]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!title) return null;
  return <WelcomeCard title={title} line={l("home_welcome_line") ?? ""} button={l("home_welcome_button") ?? ""}
    onClose={onClose} onGo={go} />;
}
