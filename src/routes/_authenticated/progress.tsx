import { createFileRoute } from "@tanstack/react-router";
import { BackLink } from "@/components/learn/BackLink";

export const Route = createFileRoute("/_authenticated/progress")({
  head: () => ({
    meta: [
      { title: "Progress · uLesson Tutor" },
      { name: "description", content: "Progress in uLesson Tutor." },
      { property: "og:title", content: "Progress · uLesson Tutor" },
      { property: "og:description", content: "Progress in uLesson Tutor." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <main className="mx-auto max-w-2xl px-5 pb-12 pt-4">
      <BackLink to="/" label="Home" />
      <h1 className="font-display text-3xl font-bold text-heading-dark">Progress</h1>
    </main>
  );
}
