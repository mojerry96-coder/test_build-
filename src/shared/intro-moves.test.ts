
import { pickHookMove as hookMove } from "./intro-moves";
describe("hook help", () => {
  it("'how do i solve this' is help on the Hook, not unclear", () => {
    expect(hookMove("how do i solve this")).toBe("help");
  });
});
