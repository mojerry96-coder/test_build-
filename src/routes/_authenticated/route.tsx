import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMeFn } from "@/lib/api/me.functions";
import { Button } from "@/components/ui/button";
import { ThemeMenuItems } from "@/components/ThemeMenu";
import { isLessonPath } from "@/shared/routes";
import { DevToolsMount } from "@/components/dev/DevToolsMount";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    // A lesson/network error is not evidence that the saved login expired.
    const { data: saved } = await supabase.auth.getSession();
    if (saved.session) return;
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/sign-in", search: { redirect: location.pathname + location.searchStr } });
  },
  component: AppShell,
});

export const meQueryOptions = { queryKey: ["me"], queryFn: () => getMeFn() };

function AppShell() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: me } = useQuery(meQueryOptions);
  const inLesson = isLessonPath(pathname) || pathname.endsWith("/path") || pathname === "/" || /^\/[a-z-]+(\/[a-z0-9-]+)?\/?$/.test(pathname) && !pathname.startsWith("/admin") && !pathname.endsWith("/welcome") && !["/admin", "/my-learning", "/progress"].includes(pathname); // Home draws its own top bar
  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/sign-in" });
  };
  return (
    <div className="min-h-[calc(100vh-2.5rem)]">
      {!inLesson && (
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-3">
          <Link to="/" className="truncate text-lg font-extrabold">uLesson Tutor</Link>
          <nav className="flex items-center gap-2">
            {me?.isAdmin && (
              <Button asChild variant="ghost" className="h-11 px-3">
                <Link to="/admin">Admin</Link>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" aria-label="Account" className="grid h-11 w-11 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {(me?.firstName ?? "?").slice(0, 1).toUpperCase()}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ThemeMenuItems />
                <DropdownMenuLabel>{me?.firstName ?? "Your account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </header>
      )}
      <Outlet />
      {me?.isAdmin && <DevToolsMount />}
    </div>
  );
}
