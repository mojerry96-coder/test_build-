import { describe, expect, it } from "vitest";
import { devToolsAllowed, isProductionHost } from "@/shared/dev-tools";

const preview = "id-preview--e38903bf-78c2-4c6d-a172-db01ff62bb2d.lovable.app";
describe("Super Admin panel access", () => {
  it("never loads for a student (not admin)", () => {
    expect(devToolsAllowed({ isAdmin: false, settingOn: true, host: preview })).toBe(false);
  });
  it("never loads when dev_tools_enabled is off", () => {
    expect(devToolsAllowed({ isAdmin: true, settingOn: false, host: preview })).toBe(false);
  });
  it("never loads on the live published app or a custom domain", () => {
    expect(devToolsAllowed({ isAdmin: true, settingOn: true, host: "ulesson-tutor.lovable.app" })).toBe(false);
    expect(devToolsAllowed({ isAdmin: true, settingOn: true, host: "tutor.ulesson.com" })).toBe(false);
    expect(isProductionHost(null)).toBe(true);
  });
  it("loads for an admin with the setting on in preview", () => {
    expect(devToolsAllowed({ isAdmin: true, settingOn: true, host: preview })).toBe(true);
    expect(devToolsAllowed({ isAdmin: true, settingOn: true, host: "localhost:8080" })).toBe(true);
  });
});
