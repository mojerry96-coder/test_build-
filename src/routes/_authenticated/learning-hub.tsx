import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { clearTrail } from "@/lib/chat-open";
import { Lock } from "lucide-react";
import { FitilaShell } from "@/components/home/FitilaShell";
import { FriendlyError, PageSkeleton } from "@/components/learn/PageStates";
import { useHomeData } from "./index";
import { cn } from "@/lib/utils";
import type { HomeData } from "@/shared/contracts/home";
import parrot from "@/assets/home/parrot-wave.png.asset.json";
import fire from "@/assets/hub/fire.png.asset.json";
import bigX from "@/assets/hub/x.png.asset.json";
import eng from "@/assets/hub/eng.png.asset.json";
import times from "@/assets/home/times.png.asset.json";
import dna from "@/assets/home/dna.png.asset.json";
import chm from "@/assets/hub/chm.png.asset.json";
import eco from "@/assets/hub/eco.png.asset.json";
import gov from "@/assets/hub/gov.png.asset.json";
import acc from "@/assets/hub/acc.png.asset.json";
import lit from "@/assets/hub/lit.png.asset.json";
import phy from "@/assets/hub/phy.png.asset.json";

export const Route = createFileRoute("/_authenticated/learning-hub")({
  head: () => ({
    meta: [
      { title: "My Learning Hub | uLesson AI Tutor" },
      { name: "description", content: "Continue your lesson, see your weekly streak and pick a subject." },
      { property: "og:title", content: "My Learning Hub | uLesson AI Tutor" },
      { property: "og:description", content: "Continue your lesson, see your weekly streak and pick a subject." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Hub,
});

// Design order and colours. Only Mathematics is open (same rule as the subject picker).
const SUBJECTS: { key: string; label: string; bg: string; ink: string; icon: string; open?: boolean }[] = [
  { key: "math", label: "Mathematics", bg: "bg-hub-math", ink: "text-hub-math-ink", icon: times.url, open: true },
  { key: "eng", label: "English Language", bg: "bg-hub-eng", ink: "text-hub-eng-ink", icon: eng.url },
  { key: "bio", label: "Biology", bg: "bg-hub-bio", ink: "text-hub-bio-ink", icon: dna.url },
  { key: "chm", label: "Chemistry", bg: "bg-hub-chm", ink: "text-hub-chm-ink", icon: chm.url },
  { key: "eco", label: "Economics", bg: "bg-hub-eco", ink: "text-hub-eco-ink", icon: eco.url },
  { key: "gov", label: "Government", bg: "bg-hub-gov", ink: "text-hub-gov-ink", icon: gov.url },
  { key: "acc", label: "Accounting", bg: "bg-hub-acc", ink: "text-hub-acc-ink", icon: acc.url },
  { key: "lit", label: "Literature in English", bg: "bg-hub-lit", ink: "text-hub-lit-ink", icon: lit.url },
  { key: "phy", label: "Physics", bg: "bg-hub-phy", ink: "text-hub-phy-ink", icon: phy.url },
];

function Hub() {
  const { me, home, tutorName } = useHomeData();
  useEffect(() => { clearTrail(); }, []);
  if (me.isLoading || home.isLoading) return <PageSkeleton rows={3} />;
  if (me.isError || home.isError || !me.data || !home.data) return <FriendlyError onRetry={() => { me.refetch(); home.refetch(); }} />;
  const h = home.data;
  return (
    <FitilaShell initials={h.initials} streak={h.streak} tutorName={tutorName} isAdmin={me.data.isAdmin}>
      <main className="mx-auto w-full max-w-[1536px] px-4 pb-28 pt-24 md:px-[clamp(32px,5vw,94px)] md:pb-2 md:pt-[clamp(72px,11vh,150px)]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-hand text-[44px] leading-none text-hub-heading [-webkit-text-stroke:1px_var(--hub-heading)] md:text-[clamp(40px,5.5vh,52px)]">My Learning Hub</h1>
          <Week week={h.week} />
        </div>
        <Banner h={h} />
        <h2 className="mt-8 text-[28px] font-semibold text-fh-heading md:mt-[clamp(12px,3vh,68px)] md:text-[clamp(22px,3vh,28px)]">Select a Subject</h2>
        <SubjectGrid />
      </main>
    </FitilaShell>
  );
}

function Week({ week }: { week: HomeData["week"] }) {
  return (
    <div className="md:mt-5">
      <p className="text-[19px] font-medium text-fh-heading">Learning Streak</p>
      <ol className="mt-2 flex gap-2.5" aria-label="This week">
        {week.map((d, i) => (
          <li key={i} aria-label={`${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][i]}${d.learned ? ", learned" : ""}${d.today ? ", today" : ""}`}
            className={cn("grid h-10 w-10 place-items-center rounded-full text-[15px]", d.learned ? "bg-hub-day-on" : "bg-hub-day text-hub-day-ink", d.today && "ring-2 ring-hub-day-today ring-offset-2 ring-offset-fh-page")}>
            {d.learned ? <img src={fire.url} alt="" aria-hidden className="h-5 w-5 object-contain" /> : d.letter}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Banner({ h }: { h: HomeData }) {
  const navigate = useNavigate();
  const cont = h.allPlan.find((i) => i.kind === "continue");
  const first = h.plan[0];
  const go = () => {
    if (cont) return navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: cont.path });
    if (first) return navigate({ to: "/$subject/$chapter/$quest/$topic/path", params: first.path });
    return navigate({ to: "/$subject", params: { subject: "mathematics" } });
  };
  return (
    <section className="relative mt-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-hub-banner-from to-hub-banner-to md:mt-[clamp(16px,3.5vh,48px)] md:h-[clamp(230px,36vh,390px)]">
      <div aria-hidden className="pointer-events-none absolute inset-0 select-none font-semibold text-hub-banner-ink">
        <span className="absolute inset-0 bg-[linear-gradient(115deg,transparent_35%,color-mix(in_oklab,var(--hub-banner-glow)_22%,transparent)_60%,transparent_85%)]" />
        <span className="absolute left-[37%] top-[3%] text-[30px] opacity-20">x²</span>
        <span className="absolute left-[41%] top-[72%] rotate-6 text-[34px] opacity-20">π</span>
        <span className="absolute left-[32%] top-[70%] text-[26px] opacity-20">△</span>
        <span className="absolute left-[56%] top-[50%] flex items-start max-md:hidden">
          <img src={bigX.url} alt="" className="h-[clamp(48px,7.5vh,70px)] w-auto drop-shadow-[0_4px_10px_rgb(0_0_0/0.25)]" />
          <span className="-ml-0.5 -mt-1.5 bg-gradient-to-b from-hub-banner-ink to-hub-banner-accent bg-clip-text text-[clamp(18px,2.6vh,26px)] font-black text-transparent">2</span>
        </span>
      </div>
      <div className="relative z-10 px-6 py-8 md:flex md:h-full md:flex-col md:justify-center md:px-16 md:py-0">
        <h2 className="text-[34px] font-extrabold leading-[1.08] tracking-[-0.01em] md:text-[clamp(36px,6vh,56px)]">
          <span className="block text-hub-banner-ink">Ready for your next</span>
          <span className="block text-hub-banner-accent">learning adventure?</span>
        </h2>
        <p className="mt-[clamp(10px,1.8vh,18px)] text-[14px] font-medium text-hub-banner-ink/90 md:text-[15px]">Keep your momentum going or choose a new subject to explore.</p>
        <button type="button" onClick={go}
          className="mt-[clamp(14px,2.8vh,28px)] h-[52px] self-start rounded-full bg-hub-cta px-6 text-[19px] font-semibold text-hub-cta-ink shadow-[0_5px_0_var(--hub-cta-edge)] transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-[0_7px_0_var(--hub-cta-edge)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--hub-cta-edge)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hub-cta motion-reduce:transform-none motion-reduce:transition-none">
          {cont ? "Continue Learning" : "Start Learning"}
        </button>
      </div>
      <div aria-hidden className="pointer-events-none absolute bottom-0 right-[6%] hidden h-full aspect-square md:block">
        <span className="absolute -right-[18%] -top-[30%] h-[120%] w-[120%] rounded-full border-2 border-hub-banner-accent/25" />
        <span className="absolute bottom-[-28%] left-[8%] h-[92%] w-[92%] rounded-full bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--hub-banner-accent)_45%,transparent),color-mix(in_oklab,var(--hub-banner-glow)_35%,transparent)_70%)]" />
        <img src={parrot.url} alt="" className="absolute -bottom-[4%] left-1/2 h-[96%] w-auto -translate-x-1/2" />
      </div>
    </section>
  );
}

function SubjectGrid() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let visible = true;
    const sync = () => { if (visible && !document.hidden) el.removeAttribute("data-paused"); else el.setAttribute("data-paused", ""); };
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener("visibilitychange", sync);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", sync); };
  }, []);
  return (
    <div ref={ref} className="hub-float-grid mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {SUBJECTS.map((s, i) => <div key={s.key} className="anim-card-in" style={{ ["--d" as string]: `${i * 60}ms` }}><SubjectTile s={s} i={i} /></div>)}
    </div>
  );
}

function SubjectTile({ s, i }: { s: (typeof SUBJECTS)[number]; i: number }) {
  const [note, setNote] = useState(false);
  const navigate = useNavigate();
  const float = { "--dur": `${6 + ((i * 7) % 4) * 0.85 + (i % 2) * 0.4}s`, "--delay": `-${((i * 5) % 6) * 0.5}s`, "--dir": i % 2 === 0 ? 1 : -1 } as React.CSSProperties;
  const inner = (
    <>
      <img src={s.icon} alt="" className="hub-float-icon h-[clamp(40px,6vh,60px)] w-[clamp(40px,6vh,60px)] object-contain object-left transition-[scale] duration-200 group-hover:scale-[1.08] group-focus-visible:scale-[1.08] motion-reduce:transition-none" />
      <span className={cn("mt-1.5 block text-[clamp(14px,1.1vw,18px)] leading-tight font-semibold", s.ink)}>{s.label}</span>
      {!s.open && <span className={cn("mt-0.5 flex items-center gap-1 text-[12px] font-semibold", s.ink)}><Lock aria-hidden className="h-3 w-3" strokeWidth={2.5} />Locked</span>}
    </>
  );
  const cls = cn("group relative flex h-full min-h-[clamp(96px,13vh,128px)] w-full flex-col justify-end rounded-[20px] px-[clamp(14px,1.6vw,28px)] pb-3 text-left transition-[translate,scale] duration-200 hover:-translate-y-1 focus-visible:-translate-y-1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fh-box-edge motion-reduce:transition-none", s.bg,
    "after:pointer-events-none after:absolute after:inset-0 after:rounded-[20px] after:opacity-0 after:shadow-[0_12px_24px_-8px_rgb(0_0_0/0.25)] after:transition-opacity after:duration-200 hover:after:opacity-100 focus-visible:after:opacity-100");
  return (
    <div className="hub-float" style={float} data-locked={s.open ? undefined : ""}>
      {s.open ? (
        <Link to="/$subject" params={{ subject: "mathematics" }} aria-label={s.label} className={cls}
          onClick={(e) => { e.preventDefault(); setTimeout(() => navigate({ to: "/$subject", params: { subject: "mathematics" } }), 120); }}>{inner}</Link>
      ) : (
        <button type="button" aria-label={`${s.label}, locked`} onClick={() => { setNote(true); setTimeout(() => setNote(false), 2000); }} className={cls}>
          {inner}
          <span role="status" className={cn("absolute right-3 top-3 rounded-full bg-fh-card/90 px-2 py-0.5 text-[11px] font-semibold text-fh-sub transition-opacity", note ? "opacity-100" : "opacity-0")}>{note ? "Only Mathematics is open for now" : ""}</span>
        </button>
      )}
    </div>
  );
}
