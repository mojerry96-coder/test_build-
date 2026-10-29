import { describe, expect, it } from "vitest";
import { toSsml } from "./tts.server";

describe("toSsml", () => {
  it("escapes markup characters and names the voice", () => {
    const s = toSsml(" Hello, John! 2 < 3 & 4. ", "en-NG-EzinneNeural");
    expect(s).toContain(
      'xml:lang="en-NG"><voice name="en-NG-EzinneNeural">Hello, John! 2 &lt; 3 &amp; 4.</voice>',
    );
  });
});
