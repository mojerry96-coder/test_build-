export function classifyQuestion(text: string) {
  if (/\b(real person|are you (a )?(human|real|robot|ai|bot)|who are you)\b/i.test(text)) return 'ai_honest';
  if (/\b(dumb|stupid|useless|can't do|never get)\b/i.test(text)) return 'encourage';
  if (/give me (the )?answer|what is the answer/i.test(text)) return 'answer_request';
  if (/\b(just tell me|give me)\b/i.test(text)) return 'answer_request';
  if (/hint/i.test(text)) return 'hint_request';
  if (/\b(rise|run)\b/i.test(text)) return 'concept_rise_run';
  if (/help|solve|how do i|how to|stuck|understand|confused|explain|show me|what do i do|i don'?t get|what next|question|gradient|slope|steep|line|graph|answer/i.test(text)) return 'dont_understand';
  if (/\b(football|match|music|song|film|movie|game|games|chelsea|arsenal|barca|church|party|boyfriend|girlfriend|biology|chemistry|physics|english|history)\b/i.test(text)) return 'off_topic';
  return 'unclear';
}
export function mayTeach(step: string, currentId: string | undefined, requestedId: string, index: number, mode: string, worksheetMode: string) {
 return step === 'worksheet' && currentId === requestedId && worksheetMode === 'teach_me' && ((index === 0 && mode === 'model') || (index >= 1 && mode === 'together'));
}
export function mayAdvance(open: unknown, settled: boolean) { return open === true || settled; }
/** Browser-facing simulation task id: never carries the band name. */
export function publicTaskId(sequence: number) { return `T${sequence}`; }
export function toViewSimTasks(rows: { id: string; sequence: number; goal: string; required: boolean }[], done: string[]) {
  return {
    tasks: rows.map(r => ({ id: publicTaskId(r.sequence), sequence: r.sequence, goal: r.goal, required: r.required })),
    completed: rows.filter(r => done.includes(r.id)).map(r => publicTaskId(r.sequence)),
  };
}
/** A lab result ticks a task only when it is for the open task and succeeded. */
export function settleSimResult(openPublicId: string | undefined, result: { task_id: string; success: boolean }): "ignore" | "not_yet" | "done" {
  if (!openPublicId || result.task_id !== openPublicId) return "ignore";
  return result.success ? "done" : "not_yet";
}
type BandName = "rebuild" | "bridge" | "stretch";
const BANDS: readonly string[] = ["rebuild", "bridge", "stretch"];
/** Rule default_band, or bridge if the setting is missing or not a band. */
export function defaultBandOf(value: unknown): BandName { return typeof value === "string" && BANDS.includes(value) ? value as BandName : "bridge"; }
/** Routing band from the number of first-try correct video checks (rule routing_bands, keyed by number of checks). */
export function pickBand(bands: Record<string, Record<string, readonly [number, number] | [number, number]>>, checks: number, firstTry: number, fallbackBand: BandName = "bridge"): BandName {
  const table = bands[String(checks)] ?? {};
  for (const [band, range] of Object.entries(table)) if (firstTry >= range[0] && firstTry <= range[1]) return band as BandName;
  return fallbackBand;
}
/** A skipped check (video skipped or failed) means no routing evidence: use the default band. */
export function chooseBandFrom(bands: Parameters<typeof pickBand>[0], checkIds: string[], results: Record<string, { correct: boolean; firstTry: boolean } | undefined>, defaultBand: BandName): { band: BandName; defaulted: null | "no_checks" | "check_skipped" } {
  if (!checkIds.length) return { band: defaultBand, defaulted: "no_checks" };
  if (checkIds.some((id) => !results[id])) return { band: defaultBand, defaulted: "check_skipped" };
  const firstTry = checkIds.filter((id) => results[id]?.correct && results[id]?.firstTry).length;
  return { band: pickBand(bands, checkIds.length, firstTry, defaultBand), defaulted: null };
}
