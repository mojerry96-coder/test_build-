import { describe, expect, it } from "vitest";
import { voiceConfigFrom } from "@/server/providers/elevenlabs.server";

describe("Fiti voice speed", () => {
  it("passes the slower speed from the rule to the voice service", () => {
    const cfg = voiceConfigFrom([
      { key: "voice_provider", value: "elevenlabs" },
      { key: "elevenlabs_voice_id", value: "v1" },
      { key: "elevenlabs_voice_settings", value: { speed: 0.85 } },
    ]);
    expect(cfg.settings?.["speed"]).toBe(0.85);
  });
});
