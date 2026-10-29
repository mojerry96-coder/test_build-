import { describe, expect, it } from "vitest";
import { voiceConfigFrom } from "@/server/providers/elevenlabs.server";

describe("voice provider switch", () => {
  it("uses ElevenLabs only when voice_provider is elevenlabs", () => {
    expect(voiceConfigFrom([{ key: "voice_provider", value: "elevenlabs" }, { key: "elevenlabs_voice_id", value: "abc" }]).provider).toBe("elevenlabs");
    expect(voiceConfigFrom([{ key: "voice_provider", value: "mock" }, { key: "elevenlabs_voice_id", value: "abc" }]).provider).toBe("mock");
    expect(voiceConfigFrom([]).provider).toBe("mock");
  });
  it("uses Gemini when voice_provider is gemini, with a Nigerian-accent style by default", () => {
    const c = voiceConfigFrom([{ key: "voice_provider", value: "gemini" }]);
    expect(c.provider).toBe("gemini");
    expect(c.geminiStyle).toContain("Nigerian");
    expect(voiceConfigFrom([{ key: "gemini_voice_name", value: "Kore" }]).geminiVoice).toBe("Kore");
  });
  it("reads voice and model from rules, default model turbo", () => {
    const c = voiceConfigFrom([{ key: "elevenlabs_voice_id", value: " v1 " }]);
    expect(c.voiceId).toBe("v1");
    expect(c.modelId).toBe("eleven_turbo_v2_5");
    expect(voiceConfigFrom([{ key: "elevenlabs_model_id", value: "eleven_multilingual_v2" }]).modelId).toBe("eleven_multilingual_v2");
  });
});
