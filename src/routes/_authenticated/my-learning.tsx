import { createFileRoute } from "@tanstack/react-router";
import { BackLink } from "@/components/learn/BackLink";

export const Route = createFileRoute("/_authenticated/my-learning")({
  head: () => ({
    meta: [
      { title: "My Learning · uLesson Tutor" },
      { name: "description", content: "My Learning in uLesson Tutor." },
      { property: "og:title", content: "My Learning · uLesson Tutor" },
      { property: "og:description", content: "My Learning in uLesson Tutor." },
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
      <h1 className="font-display text-3xl font-bold text-heading-dark">My Learning</h1>
    </main>
  );
}
