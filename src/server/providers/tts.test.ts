import { describe, expect, it } from "vitest";
import { toSsml } from "./tts.server";

describe("toSsml", () => {
  it("escapes markup characters, names the voice and slows the rate", () => {
    const s = toSsml(" Hello, John! 2 < 3 & 4. ", "en-NG-EzinneNeural");
    expect(s).toContain(
      'xml:lang="en-NG"><voice name="en-NG-EzinneNeural"><prosody rate="-10%">Hello, John! 2 &lt; 3 &amp; 4.</prosody></voice>',
    );
  });
});
