import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";
import { routeTree } from "@/routeTree.gen";
import { isLessonPath, pageTitle, slugify, subjectKeyFor } from "@/shared/routes";

describe("readable addresses", () => {
  it("builds slugs from display names", () => {
    expect(slugify("Coordinate Geometry")).toBe("coordinate-geometry");
    expect(slugify("Lines and Their Steepness")).toBe("lines-and-their-steepness");
    expect(slugify("Gradient of a line")).toBe("gradient-of-a-line");
    expect(subjectKeyFor("SS3 Mathematics")).toBe("mathematics");
  });
  it("recognises the lesson address", () => {
    expect(isLessonPath("/mathematics/coordinate-geometry/lines-and-their-steepness/gradient-of-a-line")).toBe(true);
    expect(isLessonPath("/mathematics/coordinate-geometry")).toBe(false);
    expect(isLessonPath("/admin/sessions/x/y")).toBe(false);
  });
  it("titles pages as [Page] · uLesson Tutor", () => {
    expect(pageTitle("Gradient of a line", "Warm-up")).toBe("Gradient of a line · Warm-up · uLesson Tutor");
  });
  const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
  const leaf = (p: string) => router.matchRoutes(p).at(-1)?.routeId;
  it.each([
    ["/sign-in", "/sign-in"],
    ["/mathematics", "/_authenticated/$subject/"], ["/mathematics/welcome", "/_authenticated/$subject/welcome"],
    ["/mathematics/coordinate-geometry", "/_authenticated/$subject/$chapter/"],
    ["/mathematics/coordinate-geometry/lines-and-their-steepness", "/_authenticated/$subject/$chapter/$quest/"],
    ["/mathematics/coordinate-geometry/lines-and-their-steepness/gradient-of-a-line", "/_authenticated/$subject/$chapter/$quest/$topic"],
    ["/admin/content-import", "/_authenticated/admin_/content-import"], ["/admin/settings", "/_authenticated/admin_/settings"],
    ["/auth", "/auth"], ["/chapters/mathematics", "/chapters/$subject"], ["/admin/import", "/admin/import"],
  ])("%s opens its page", (path, id) => { expect(leaf(path)).toBe(id); });
});
