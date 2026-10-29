// "Choose learning mode": first page after sign-in. Solo Mode (autopilot) opens Ask Fiti; Together Mode (override) is not scoped yet.
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FitiLoader } from "@/components/learn/FitiLoader";
import { LOADER_MIN_AFTER_TAP_MS } from "@/shared/loader-timing";
import { Backdrop, MaskIcon } from "@/components/home/FitilaShell";
import { useTheme } from "@/lib/theme";
import { playSound } from "@/lib/sound";
import logo from "@/assets/brand/logo.png.asset.json";
import logoDark from "@/assets/brand/logo-dark.png.asset.json";
import moon from "@/assets/home/moon.png.asset.json";

export const Route = createFileRoute("/_authenticated/choose")({
  head: () => ({
    meta: [
      { title: "Choose learning mode | uLesson AI Tutor" },
      { name: "description", content: "Pick how you want to learn tonight: Solo Mode or Together Mode." },
      { property: "og:title", content: "Choose learning mode | uLesson AI Tutor" },
      { property: "og:description", content: "Pick how you want to learn tonight: Solo Mode or Together Mode." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChoosePage,
});

const PILL = "hdr-bounce flex min-h-[clamp(130px,17vh,165px)] w-full flex-col items-center justify-center gap-1.5 rounded-[22px] border-[1.5px] bg-[var(--cp-pill)] px-5 py-4 font-splash text-[clamp(24px,1.7vw,30px)] font-black leading-tight text-[var(--cp-ink)] transition-transform hover:-translate-y-0.5 active:translate-y-[8px] focus-visible:outline-2 focus-visible:outline-offset-4 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-[clamp(240px,15vw,272px)]";

const SUB = "block text-balance font-sans text-[clamp(14px,0.95vw,16px)] font-medium leading-snug tracking-normal text-[var(--cp-ink)] opacity-85";

function ChoosePage() {
  const navigate = useNavigate();
  const { resolved, setPref } = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [soon, setSoon] = useState(false);
  // Arrived here: clear the "show this page first" note so Ask Fiti never bounces back here.
  useEffect(() => { try { sessionStorage.removeItem("ul.choosePath"); } catch { /* none */ } }, []);
  const autoPilot = async () => {
    if (loading) return;
    playSound("tap"); setLoading(true);
    const wait = new Promise((r) => setTimeout(r, LOADER_MIN_AFTER_TAP_MS));
    await Promise.all([router.preloadRoute({ to: "/" }).catch(() => undefined), wait]);
    navigate({ to: "/" });
  };
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-fh-page">
      <Backdrop variant="open" />
      <header className="relative z-10 flex items-center justify-between px-[clamp(16px,6.8vw,132px)] pt-[clamp(20px,5vh,56px)]">
        <img src={logo.url} alt="uLesson" className="h-7 w-auto dark:hidden sm:h-11" />
        <img src={logoDark.url} alt="uLesson" className="hidden h-7 w-auto dark:block sm:h-11" />
        <button type="button" onClick={() => setPref(resolved === "dark" ? "light" : "dark")}
          className="hdr-bounce flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-fh-dark-btn px-4 text-[16px] font-semibold text-fh-dark-btn-ink shadow-[0_5px_0_var(--fh-dark-btn-edge)] active:translate-y-[3px] active:shadow-[0_2px_0_var(--fh-dark-btn-edge)] max-md:h-10 max-md:px-3 max-md:text-sm">
          <MaskIcon url={moon.url} className="h-5 w-5" />{resolved === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </header>
      {loading ? <main className="relative z-10 flex min-h-[calc(100dvh-140px)] items-center justify-center"><FitiLoader delayMs={0} /></main> : <main className="relative z-10 flex flex-col items-center px-5 pt-[clamp(80px,22vh,300px)]">
        <h1 className="text-balance text-center font-splash text-[clamp(36px,3.4vw,66px)] font-black tracking-[0.03em] text-fh-heading">Choose learning mode</h1>
        <div className="mt-[clamp(28px,5vh,64px)] flex w-full max-w-[420px] flex-col gap-5 sm:w-auto sm:max-w-none sm:flex-row">
          <button type="button" onClick={() => void autoPilot()}
            className={`${PILL} border-[var(--cp-auto-edge)] shadow-[0_12px_0_var(--cp-auto-edge)] active:shadow-[0_6px_0_var(--cp-auto-edge)] focus-visible:outline-[var(--cp-auto-edge)]`}><span className="whitespace-nowrap">Solo Mode</span><span className={SUB}>AI-led, student learns independently</span></button>
          <button type="button" onClick={() => { playSound("tap"); setSoon(true); }}
            className={`${PILL} border-[var(--cp-tutor-edge)] shadow-[0_12px_0_var(--cp-tutor-edge)] active:shadow-[0_6px_0_var(--cp-tutor-edge)] focus-visible:outline-[var(--cp-tutor-edge)]`}><span className="whitespace-nowrap">Together Mode</span><span className={SUB}>Parent or teacher-led, working with the AI</span></button>
        </div>
        <p role="status" className="mt-6 min-h-6 text-center text-[16px] font-semibold text-fh-sub">{soon ? "Together Mode is coming soon." : ""}</p>
      </main>}
    </div>
  );
}
