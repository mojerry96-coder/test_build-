import { describe, expect, it } from "vitest";
import { settleSimResult, toViewSimTasks } from "./policy";

const rows = [
  { id: "SIM_REBUILD_T1", sequence: 1, goal: "Make a line that goes uphill", required: true },
  { id: "SIM_REBUILD_T2", sequence: 2, goal: "Make a line that goes downhill", required: true },
];

describe("simulation tasks sent to the browser", () => {
  it("never carry a level name", () => {
    for (const band of ["SIM_BRIDGE", "SIM_STRETCH", "SIM_REBUILD"]) {
      const out = toViewSimTasks(rows.map(r => ({ ...r, id: r.id.replace("SIM_REBUILD", band) })), [`${band}_T1`]);
      expect(JSON.stringify(out)).not.toMatch(/rebuild|bridge|stretch/i);
      expect(out.tasks.map(t => t.id)).toEqual(["T1", "T2"]);
      expect(out.completed).toEqual(["T1"]);
    }
  });
});

describe("a task finishes only on a success", () => {
  it("a failed result does not tick the task", () => expect(settleSimResult("T1", { task_id: "T1", success: false })).toBe("not_yet"));
  it("a success ticks the open task", () => expect(settleSimResult("T1", { task_id: "T1", success: true })).toBe("done"));
  it("a result for a task that isn't open is ignored", () => expect(settleSimResult("T2", { task_id: "T1", success: true })).toBe("ignore"));
  it("nothing is open, so it is ignored", () => expect(settleSimResult(undefined, { task_id: "T1", success: true })).toBe("ignore"));
});
