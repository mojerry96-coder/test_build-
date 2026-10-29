import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/lib/theme";
import logo from "@/assets/brand/logo.png.asset.json";
import logoDark from "@/assets/brand/logo-dark.png.asset.json";

export const Route = createFileRoute("/sign-in")({
  validateSearch: z.object({ redirect: z.string().max(500).optional().catch(undefined) }),
  head: () => ({
    meta: [
      { title: "Sign in · uLesson Tutor" },
      { name: "description", content: "Sign in to your uLesson AI Tutor maths lessons for WAEC, NECO and JAMB." },
      { property: "og:title", content: "Sign in | uLesson AI Tutor" },
      { property: "og:description", content: "Your personal AI maths tutor for SS3." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const SOON = "Email sign-in is coming soon. Please continue with Google.";
const v = (n: string) => `var(--si-${n})`;

function GoogleG() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function Background() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1920 1210" preserveAspectRatio="xMidYMid slice" style={{ maxWidth: "none" }} aria-hidden="true">
      <path fill={v("shape-a")} d="M0 160 C300 120 520 200 520 280 C520 360 300 380 220 520 C140 660 200 720 360 760 C440 790 380 880 0 890 Z" />
      <path fill={v("bg")} opacity=".7" d="M0 380 C120 330 220 300 320 290 C200 330 100 360 0 400 Z" />
      <path fill={v("shape-b")} d="M1700 140 C1760 120 1800 220 1830 320 C1880 220 1920 210 1920 260 L1920 1000 C1860 940 1840 900 1840 860 C1780 980 1720 1150 1640 1210 L1560 1210 C1580 1050 1620 900 1640 820 C1500 920 1360 960 1330 880 C1300 800 1480 700 1560 640 C1420 620 1330 560 1350 500 C1370 440 1520 480 1600 520 C1500 400 1380 260 1420 190 C1460 130 1580 220 1670 330 C1650 260 1650 160 1700 140 Z" />
      <path fill={v("shape-c")} d="M1000 1210 C1080 1060 1200 990 1300 990 C1420 990 1520 1080 1560 1210 Z" />
      <g fill="none" stroke={v("doodle")} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round">
        <path d="M0 900 L70 950 L80 890 L110 960 L150 905 L130 975 L175 985 L120 1010 L130 1050 L90 1025 L60 1050 L50 1000" />
        <path d="M0 1090 L80 990 C95 970 120 990 105 1010 L25 1110 C10 1130 0 1135 0 1135" />
      </g>
    </svg>
  );
}

// Sizes follow the screen's height so the whole page fits on laptops; short screens scroll.
const gap = (min: number, vh: number, max: number) => `clamp(${min}rem, ${vh}vh, ${max}rem)`;
const FIELD = "si-field flex h-12 items-center rounded-full px-6 transition-shadow sm:h-14";
const INPUT = "w-full min-w-0 bg-transparent text-base tracking-wide sm:text-lg";
const BTN = "si-btn flex h-12 w-full items-center justify-center rounded-full text-lg sm:h-14";

function AuthPage() {
  const navigate = useNavigate();
  const { redirect: back } = Route.useSearch();
  const { resolved, setPref } = useTheme();
  const dark = resolved === "dark";
  const target = () => {
    const t = back ?? (typeof window !== "undefined" ? sessionStorage.getItem("ul.signInBack") : null);
    return t && t.startsWith("/") && !t.startsWith("//") && !t.startsWith("/sign-in") ? t : "/choose";
  };
  const goBack = () => { const t = target(); try { sessionStorage.removeItem("ul.signInBack"); sessionStorage.removeItem("ul.choosePath"); } catch { /* none */ } navigate({ href: t, replace: true }); };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) goBack(); });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const google = async () => {
    if (busy) return;
    setBusy(true); setError(null); setNotice(null);
    try { if (back) sessionStorage.setItem("ul.signInBack", back); else sessionStorage.setItem("ul.choosePath", "1"); } catch { /* none */ }
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) { setError("Sign-in didn't complete. Please try again."); setBusy(false); return; }
    if (result.redirected) return;
    goBack();
  };
  const emailSubmit = (e: FormEvent) => { e.preventDefault(); setNotice(SOON); };
  const fieldStyle = { background: v("field"), color: v("field-ink") };
  const onType = () => setNotice(null);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-x-hidden" style={{ background: v("bg"), color: v("ink") }}>
      <Background />
      <header
        className="relative z-10 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 sm:px-[6%]"
        style={{ paddingTop: `max(env(safe-area-inset-top), ${gap(1, 4, 2.5)})` }}
      >
        <img src={logo.url} alt="uLesson" className="h-8 w-auto dark:hidden sm:h-10" />
        <img src={logoDark.url} alt="uLesson" className="hidden h-8 w-auto dark:block sm:h-10" />
        <button
          type="button"
          onClick={() => setPref(dark ? "light" : "dark")}
          aria-label={dark ? "Light mode" : "Dark mode"}
          className="si-btn inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-base font-semibold sm:px-4"
          style={{ background: v("btn"), color: v("btn-ink"), boxShadow: `0 3px 0 ${v("btn-edge")}` }}
        >
          {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
          <span className="hidden sm:inline">{dark ? "Light mode" : "Dark mode"}</span>
        </button>
      </header>

      <div
        className="relative z-10 mx-auto flex w-full max-w-[29rem] flex-1 flex-col justify-center px-5"
        style={{ paddingTop: gap(1.5, 4, 3), paddingBottom: `max(env(safe-area-inset-bottom), ${gap(1.5, 4, 3)})` }}
      >
        <h1 className="text-center font-display text-4xl font-bold tracking-wide sm:text-5xl" style={{ color: v("ink") }}>Welcome Back!</h1>

        <form onSubmit={emailSubmit} noValidate style={{ marginTop: gap(1.25, 4, 2.25) }}>
          <label className={`${FIELD} scroll-mb-24`} style={fieldStyle}>
            <span className="sr-only">Email</span>
            <input type="email" name="email" autoComplete="email" placeholder="Enter your email" className={INPUT} onChange={onType} />
          </label>
          <label className={`${FIELD} mt-3 scroll-mb-24 pr-2`} style={fieldStyle}>
            <span className="sr-only">Password</span>
            <input type={show ? "text" : "password"} name="password" autoComplete="current-password" placeholder="Password" className={INPUT} onChange={onType} />
            <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"} className="si-link grid h-11 w-11 shrink-0 place-items-center rounded-full" style={{ color: v("ph") }}>
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </label>
          <div className="mt-2 flex justify-end">
            <button type="button" onClick={() => setNotice(SOON)} className="si-link rounded py-1 text-base tracking-wide" style={{ color: v("ink") }}>Forgot password?</button>
          </div>

          <button type="submit" className={`${BTN} font-bold`} style={{ marginTop: gap(1, 3, 1.75), background: v("btn"), color: v("btn-ink"), boxShadow: `0 5px 0 ${v("btn-edge")}` }}>
            Sign in
          </button>
          <p role="status" aria-live="polite" className="text-center text-sm font-semibold empty:hidden sm:text-base" style={{ color: v("ink"), marginTop: notice ? "0.9rem" : 0 }}>{notice}</p>
        </form>

        <div className="flex items-center gap-3" style={{ marginTop: gap(1.25, 3.5, 2) }} aria-hidden="true">
          <span className="h-0 flex-1 border-t-2 border-dashed" style={{ borderColor: v("dots") }} />
          <span className="text-base tracking-widest" style={{ color: v("ph") }}>Or continue with</span>
          <span className="h-0 flex-1 border-t-2 border-dashed" style={{ borderColor: v("dots") }} />
        </div>

        <button type="button" onClick={google} disabled={busy} className={`${BTN} gap-4 border font-medium disabled:opacity-80`} style={{ marginTop: gap(1.25, 3.5, 2), background: v("g-bg"), color: v("g-ink"), borderColor: v("g-edge"), boxShadow: `0 4px 0 ${v("g-edge")}` }}>
          <GoogleG />{busy ? "Opening Google…" : "Continue with Google"}
        </button>

        {error && <p className="mt-4 rounded-xl bg-warning px-4 py-3 text-sm text-warning-foreground" role="alert">{error}</p>}

        <p className="text-center text-base font-medium sm:text-lg" style={{ marginTop: gap(1.25, 3.5, 2.25), color: v("ink") }}>
          Don’t have an account?{" "}
          <button type="button" onClick={google} disabled={busy} className="si-link rounded underline underline-offset-4" style={{ color: v("link") }}>Sign up</button>
        </p>
      </div>
    </main>
  );
}
