import { describe, expect, it, vi } from "vitest";
vi.mock("@/integrations/supabase/auth-middleware", () => ({ requireSupabaseAuth: {} }));
import { spokenOf } from "@/lib/api/home.functions";

describe("Ask Fiti voice permission", () => {
  it("notes every line and the joined message, never button labels", () => {
    expect(spokenOf({ lines: ["Graphs it is.", "Here's how I teach."] })).toEqual(["Graphs it is.", "Here's how I teach.", "Graphs it is. Here's how I teach."]);
  });
  it("no reply notes nothing", () => expect(spokenOf(null)).toEqual([]));
});
