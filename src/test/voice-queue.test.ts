import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/voice.functions", () => ({ speakFn: async ({ data }: { data: { text: string } }) => ({ audio: btoa(data.text) }) }));
const played: string[] = [];
let current: FakeAudio | null = null;
class FakeAudio {
  src = ""; paused = true; ended = false; duration = NaN;
  onended: (() => void) | null = null; onerror: (() => void) | null = null; onpause: (() => void) | null = null; onloadedmetadata: (() => void) | null = null; onplaying: (() => void) | null = null;
  play() { this.paused = false; played.push(this.src); current = this; this.onplaying?.(); return Promise.resolve(); }
  end() { this.ended = true; this.onended?.(); } // never ends by itself
  pause() { this.paused = true; this.onpause?.(); }
}
vi.stubGlobal("Audio", FakeAudio);

describe("Fiti's voice queue", () => {
  it("after Stop, a new line plays even though the earlier one never finished", async () => {
    const { say, hush } = await import("@/lib/voice");
    window.dispatchEvent(new Event("pointerdown")); // her first tap unlocks sound
    say(["first line"]);
    await vi.waitFor(() => expect(played.length).toBe(1));
    hush();
    say(["second line"]);
    await vi.waitFor(() => expect(played.at(-1)).toContain(btoa("second line")));
  });

  it("once a long line has started, every piece plays even after the 5 s wait", async () => {
    vi.useFakeTimers();
    const { say, hush, voiceStarted } = await import("@/lib/voice");
    const { splitSpoken } = await import("@/shared/spoken-split");
    hush();
    const line = "Maths feels hard for you right now, and that can be frustrating. You deserve patience and support as you prepare for WAEC. Which part feels hardest?";
    const pieces = splitSpoken(line);
    void voiceStarted(line);
    say([line]);
    const before = played.length;
    await vi.advanceTimersByTimeAsync(10);
    expect(played.length).toBe(before + 1);
    await vi.advanceTimersByTimeAsync(6000); // past the "too slow" wait while he is talking
    for (let i = 1; i < pieces.length; i++) {
      current!.end();
      await vi.advanceTimersByTimeAsync(10);
      expect(played.at(-1)).toContain(btoa(pieces[i]!));
    }
    vi.useRealTimers();
  });
});
