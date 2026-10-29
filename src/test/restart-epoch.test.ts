import { describe, expect, it } from "vitest";
import { bumpRestartEpoch, getRestartEpoch, onRestart } from "@/lib/restart-epoch";

describe("Start again rebuild", () => {
  it("bumps the epoch and runs each registered reset once", () => {
    const before = getRestartEpoch();
    let a = 0, b = 0;
    const offA = onRestart(() => { a++; });
    onRestart(() => { b++; throw new Error("x"); });
    bumpRestartEpoch();
    expect(getRestartEpoch()).toBe(before + 1);
    expect([a, b]).toEqual([1, 1]);
    offA();
    bumpRestartEpoch();
    expect(a).toBe(1);
  });
});
