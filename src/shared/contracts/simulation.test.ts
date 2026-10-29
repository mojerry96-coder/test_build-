import { afterEach, describe, expect, it, vi } from "vitest";
import { filterSimMessage, taskResultSchema, waitForSimReady } from "./simulation";
describe("simulation bridge",()=>{
 afterEach(()=>vi.useRealTimers());
 it("ignores a valid message from another window",()=>{const frame={};expect(filterSimMessage({},frame,{type:"ready"})).toBeNull();expect(filterSimMessage(frame,frame,{type:"ready"})).toEqual({type:"ready"});});
 it("validates concrete task results",()=>{expect(taskResultSchema.parse({type:"task_result",task_id:"SIM_REBUILD_T1",success:false,attempts:2,misconception:"sign_error"}).success).toBe(false);expect(taskResultSchema.safeParse({type:"task_result",task_id:"T1",success:true,attempts:-1,misconception:null}).success).toBe(false);});
 it("falls back at 5000ms, not 4999ms",()=>{vi.useFakeTimers();const fallback=vi.fn();waitForSimReady(fallback);vi.advanceTimersByTime(4999);expect(fallback).not.toHaveBeenCalled();vi.advanceTimersByTime(1);expect(fallback).toHaveBeenCalledTimes(1);});
 it("cancels fallback when ready arrives",()=>{vi.useFakeTimers();const fallback=vi.fn();const cancel=waitForSimReady(fallback);vi.advanceTimersByTime(300);cancel();vi.advanceTimersByTime(6000);expect(fallback).not.toHaveBeenCalled();});
});
