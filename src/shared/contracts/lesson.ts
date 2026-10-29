// Lesson screen contract (temporary demo path; Phase 2 engine keeps the same shapes).
import type { ItemKind, LessonStep } from "./enums";
import type { Script } from "./script";

export type ViewOption = { id: string; label: string };
export type ViewField = { id: string; label: string; type: "choice" | "number" | "text"; options?: string[] };

/** Only what the student sees before acting. Never answers or hidden scripts. */
export type ViewItem = {
  id: string;
  step: LessonStep;
  kind: ItemKind;
  prompt: Script;
  options: ViewOption[] | null;
  fields: ViewField[] | null;
  hasTeachMe: boolean;
  hintCount: number;
  /** Optional interactive board for the question (warm-up point questions). */
  board?: ViewBoard | null;
  skillIds?: string[];
};

/** A point on a grid; each option has a neutral path preview (no right/wrong shown). */
export type ViewBoard = { kind: "point"; x_max: number; y_max: number; point: [number, number]; label: string; paths: Record<string, [number, number][]> };

export type ViewHook = {
  script: Script;
  /** Approved nudge after hook_nudge_s with no pick, and the skip link after another hook_skip_s. */
  nudge?: string; skipLink?: string; nudgeS?: number; skipS?: number;
  options: ViewOption[];
  boxes: { id: string; label: string }[];
  /** Seconds to choose before the video starts by itself (rule hook_prediction_timeout_s). */
  timeoutS: number;
  /** Rule video_start_mode: "auto" starts the video after a choice or the timeout. */
  videoStart: "auto" | "tap";
  /** Her saved choice ("none" when the countdown ran out), or null before she chose. */
  saved: string | null;
};

export type ViewSimTask = { id: string; sequence: number; goal: string; required: boolean };

export type StepPosition = { step: LessonStep; index: number };

export type ItemResult = { correct: boolean; firstTry: boolean; attempts: number; /** Practise: the tutor showed the answer after the try limit. */ revealed?: boolean };

export type LessonView = {
  chatHistory: { role: "tutor" | "student"; text: string }[];
  /** Approved line shown instead of any chat message that looks like raw data. */
  chatFallback?: Script;
  /** Approved first line of the Ask chat card opened while a warm-up question is showing. */
  askOpener?: Script;
  /** Fiti's whiteboard lines: before erasing, and the last line of a watch part. */
  /** tapHint: the approved "tap me for a hint" line; idleHintMs: still time before it shows (rule qf_idle_hint_ms). */
  boardLines?: { clear: string; end: string; notQuite?: string; strategy?: string; tapHint?: string; idleHintMs?: number; gotIt?: string; placeHelp?: string; reopen?: string };
  /** Approved praise words for a right step (rotated, never the same twice in a row). */
  praise?: string[];
  /** Warm-up popup wording (from the pack), any popup still open, and the quick fix in progress. */
  warmup?: {
    labels: { rightTitle: string; closeTitle: string; continue: string; fix: string; skip: string; practiceContinue: string; working?: string | null;
      fixHeader?: string; watchTitle?: string; tryTitle?: string; nowTry?: string; showAll?: string; aloneTitle?: string;
      togetherTitle?: string; tryAgain?: string; nice?: string; shown?: string; fixDivider?: string; backDivider?: string;
      /** Fiti says this after the "You got close!" message when a fix follows. */
      letsFix?: string; simPracticeTitle?: string };
    popup: { itemId: string; optionId: string; correct: boolean; lines: Script; practice: boolean } | null;
    repair: ViewRepair | null;
  } | null | undefined;
  sessionId: string;
  topicName: string;
  tutorName: string;
  firstName: string | null;
  position: StepPosition;
  completed: boolean;
  /** Items in the current step, in order. */
  items: ViewItem[];
  hook: ViewHook | null;
  simLevel: import("./simulation").SimLevel | null;
  simCompleted: string[];
  devOpenAccess: boolean;
  /** Built from her results: tasks right first time, and the misconception she showed most. */
  simClosing: { did_well: Script; watch: Script; hook_link: Script; closing_line: Script } | null;
  simTasks: ViewSimTask[];
  /** What she sees before acting: titles, instructions, start points and roads; never targets. */
  simulation?: { engine: string; lab: { tasks: { id: string; level: "beginner" | "intermediate" | "advanced" | string; mission: string }[]; timeoutMs: number; fallback: string | null; progress: Record<string, import("./simulation").LabValues>; v2Screen?: number | null } | null; url: string; goal: string; introTitle?: string; tasks: import("./simulation").NativeSimTask[]; saved: Record<string, import("./simulation").NativeSimAnswer>; helpIdleS: number; helpRepeats: number } | undefined;
  videoChecks: { atSeconds: number; itemId: string }[];
  /** The video step: manifest fields the player needs, saved position and approved labels. Null outside the video. */
  video?: ViewVideo | null;
  results: Record<string, ItemResult>;
  /** Practise: her own working lines for the open problem (restored after a reload). */
  workLines?: string[];
  /** Practise: approved how-to guide shown before her first line (example uses only the first step's left side). */
  workGuide?: string | null;
  /** Approved lines for the current position only. */
  tutorLines: Script;
  /** Settings the screen needs (help timers etc.). */
  helpIdleSeconds: number;
  helpAlertCount: number;
  /** Worked-working pace from rules working_line_* (see src/shared/working-pace.ts). */
  pace: import("../working-pace").WorkingPace;
  /** Rule tutor_avatar_assets: per mood an image or animated file; empty url = built-in image. */
  avatarAssets: Record<string, { type: "image" | "rive" | "lottie"; url: string }> | null;
};

/** One you-try step. Its answer stays on the server; the line is only sent once the step is settled. */
export type ViewFixStep = {
  id: string; prompt: Script; input: "number" | "choice" | "point"; choices?: string[];
  /** Point steps: the empty grid size, and the target ring (sent only after a miss when the hint allows it). */
  grid?: { x_max: number; y_max: number }; ring?: [number, number];
  state: "open" | "right" | "hint_right" | "filled"; misses: number;
  /** The hint after a first miss (open steps only). */
  hint: Script | null;
  /** The full line once she gets it, or the filled-in line after a second miss. */
  line: Script | null;
};

/** The quick fix: slip line, worked example, guided steps, then the practice question. */
export type ViewRepair = {
  /** Kept for older screens: the slip line. */
  lines: Script;
  slip: Script;
  part: "watch" | "try" | "practice";
  watch: { lines: Script; board: ViewBoard | null; expr: Script[number] | null };
  you: { intro: Script; board: ViewBoard | null; expr: Script[number] | null; steps: ViewFixStep[] };
  practiceItem: ViewItem;
  skillName?: string | undefined;
  /** The dialog waiting for her tap, if any. */
  dialog: { kind: "close" | "together" | "done"; lines: Script } | null;
};

export type FixStepResult = { result: "right" | "hint" | "filled"; step: ViewFixStep; dialog: ViewRepair["dialog"]; last: boolean };

export type CheckResult = {
  status?: "saved";
  summary?: { itemId: string; correct: boolean; firstTry: boolean; attempts: number }[];
  correct?: boolean;
  attempts?: number;
  /** Approved feedback for this answer; empty in the exit ticket and deferred in guided. */
  tutorLines?: Script;
  misconceptionLabel?: string | null;
  /** True when the item is settled (correct or out of tries). */
  settled?: boolean;
  repair?: { lines: Script; practiceItem: ViewItem; fixLabel?: string | null } | null;
};

export type LineResult = {
  status: "ok" | "check";
  /** Soft amber message shown with the line, never red. */
  message: string | null;
  misconceptionLabel: string | null;
  solved: boolean;
  tutorLines: Script;
  /** Practise: after the try limit, the approved intro + worked solution, played on the board. */
  reveal?: Script;
  /** Practise: approved line for the next problem after a reveal ("try this one on your own"). */
  afterReveal?: Script;
};

export type CloseSummary = {
  secure: boolean;
  hookClose: Script;
  didWell: string[];
  watch: string[];
  tutorLines: Script;
};

export type ViewVideo = {
  title: string; durationS: number; posterUrl: string | null; urlLow: string | null; urlStandard: string | null;
  segments: { start: number; end: number; title: string; summary: string }[];
  captions: { start: number; end: number; text: string }[];
  startMode: "auto" | "tap";
  /** Saved play position in seconds. */
  position: number;
  /** Tries used on each check so far (unsettled ones too), and options already tried. */
  tries: Record<string, { attempts: number; tried: string[] }>;
  labels: { demoTitle: string; followupAck: string; end: string; endTitle: string; unavailable: string; answerRequest: string; rightTitle: string; closeTitle: string; continue: string;
    /** Opening screen words (fallback lines video_intro_*). */
    intro?: Record<string, string> };
  /** Clip-per-moment flow (real clips); null = the single placeholder clip. */
  flow?: import("./content-pack").VideoFlow | null;
};
