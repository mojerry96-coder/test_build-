import { describe, expect, it } from "vitest";
import { rewindTarget, stepsFrom, stopStates } from "@/shared/path-stops";

describe("going back on the map", () => {
  const onVideo = stopStates("video", false); // Warm-up, Puzzle done; Video next
  it("step 1 from step 3 goes back to the warm-up", () => expect(rewindTarget(0, onVideo)).toBe("readiness"));
  it("Practice goes back to the worksheet", () => expect(rewindTarget(4, stopStates("exit_ticket", false))).toBe("worksheet"));
  it("the next stop is not a go-back", () => expect(rewindTarget(2, onVideo)).toBeNull());
  it("a locked stop is not a go-back", () => expect(rewindTarget(4, onVideo)).toBeNull());
  it("going back to the video clears it and every later step", () =>
    expect(stepsFrom("video")).toEqual(["video", "simulation", "worksheet", "guided", "exit_ticket", "reflection"]));
});
