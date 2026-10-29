import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/parent")({
  head: () => ({
    meta: [
      { title: "Parent home | uLesson AI Tutor" },
      { name: "description", content: "Your parent page on uLesson AI Tutor is coming soon." },
      { property: "og:title", content: "Parent home | uLesson AI Tutor" },
      { property: "og:description", content: "Your parent page is coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto max-w-md px-5 py-16 text-center">
      <h1 className="text-2xl font-bold text-brand">Your parent page is coming soon</h1>
      <p className="mt-3 text-muted-foreground">We'll let you know when it's ready.</p>
      <Button className="mt-8" variant="outline" onClick={async () => { await supabase.auth.signOut(); window.location.assign("/sign-in"); }}>Sign out</Button>
    </main>
  );
}
