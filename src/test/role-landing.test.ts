import { describe, expect, it } from "vitest";
import { landingFor } from "@/shared/role-landing";
describe("landing after the splash", () => {
  it("student → Home", () => expect(landingFor(["student"])).toBe("home"));
  it("parent → parent home", () => expect(landingFor(["parent"])).toBe("parent"));
  it("teacher → teacher home", () => expect(landingFor(["instructor"])).toBe("teacher"));
  it("student and parent → Home", () => expect(landingFor(["parent", "student"])).toBe("home"));
});
