import { z } from "zod";
export type SimLevel = "beginner" | "intermediate" | "advanced";
export type Point = { x: number; y: number };
const point = z.object({ x: z.number().finite(), y: z.number().finite() });
const values = z.union([z.object({ m: z.number().finite(), c: z.number().finite() }), z.object({ A: point, B: point })]);
export type SimValues = z.infer<typeof values>;
export type SimMisconception = "inverted_ratio" | "sign_error" | null;
export const taskResultSchema = z.object({ type: z.literal("task_result"), task_id: z.string().min(1).max(64), success: z.boolean(), attempts: z.number().int().min(1).max(10000), misconception: z.enum(["inverted_ratio", "sign_error"]).nullable() });
export const simMessageSchema = z.discriminatedUnion("type", [z.object({ type: z.literal("ready") }), z.object({ type: z.literal("changed"), values }), taskResultSchema, z.object({ type: z.literal("help_requested"), task_id: z.string().optional() })]);
export type SimToApp = z.infer<typeof simMessageSchema>;
export function filterSimMessage(source: unknown, frame: unknown, data: unknown): SimToApp | null {
  if (!frame || source !== frame) return null;
  const parsed = simMessageSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
}
export function waitForSimReady(fallback: () => void) { const timer = setTimeout(fallback, 5000); return () => clearTimeout(timer); }
export type AppToSim = { type: "init"; level: SimLevel; required_tasks: string[]; state: { current_task?: string | null; values?: SimValues }; misconception_tags: string[]; embedded: true } | { type: "highlight"; target: string } | { type: "lock" | "unlock"; controls: string[] } | { type: "reset" };

export type NativeSimAnswer = { points?: number[][] | undefined; rise?: string | undefined; run?: string | undefined; gradient?: string | undefined; choice?: string | undefined };
export type NativeSimTask = { title:string; instruction:string; kind:'point'|'two_points'|'rise_run_gradient'|'choice'; start:number[]; road?:number[][] };
export interface SimEngine {
 send(command: {type:'init'|'set'|'highlight'|'lock'|'unlock'|'reset'; state?:NativeSimAnswer}):void;
 subscribe(listener:(event:{type:'ready'|'changed'|'activity'|'task_result'|'help_requested'|'error'; answer?:NativeSimAnswer})=>void):()=>void;
}

/** Gradient Lab: the values she controls (sliders, points, or the two given points and her m and c). */
export type LabPoint = { x: number; y: number };
export type LabValues = { m?: number | string; c?: number | string; A?: LabPoint; B?: LabPoint; p1?: LabPoint | null; p2?: LabPoint | null };
