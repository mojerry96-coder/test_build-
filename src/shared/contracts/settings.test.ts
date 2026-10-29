import { describe, expect, it } from "vitest";
import { isSystemSettingKey, shouldAutoAssignStudent } from "./settings";
import { topicButtonLabel } from "./step-labels";

describe("new-account role rule", () => {
  it("gives student role when dev_open_access is on and no domain list", () => {
    expect(shouldAutoAssignStudent(true, [], "a@gmail.com")).toBe(true);
  });
  it("gives no role when dev_open_access is off", () => {
    expect(shouldAutoAssignStudent(false, [], "a@gmail.com")).toBe(false);
  });
  it("gives no role when email domain is not allowed", () => {
    expect(shouldAutoAssignStudent(true, ["ulesson.com"], "a@gmail.com")).toBe(false);
    expect(shouldAutoAssignStudent(true, ["ulesson.com"], "b@ULesson.com")).toBe(true);
  });
});

describe("system settings are protected", () => {
  it("treats dev_open_access and tutor_display_name as system settings", () => {
    expect(isSystemSettingKey("dev_open_access")).toBe(true);
    expect(isSystemSettingKey("tutor_display_name")).toBe(true);
    expect(isSystemSettingKey("routing_bands")).toBe(false);
  });
});

describe("topic button", () => {
  it("says Start with no active session", () => {
    expect(topicButtonLabel("Gradient of a line", null)).toBe("Start");
  });
  it("says Continue with the step when a session is active", () => {
    expect(topicButtonLabel("Gradient of a line", "video")).toBe("Continue: Gradient of a line, Video");
  });
});
