import { supabase } from "@/integrations/supabase/client";

/**
 * Single source of truth for the MTH12_09_02_01 lesson
 * "Linear Equations and Gradients" (SS3 / Grade 12 Maths).
 * Edit content here — components read everything from this file.
 */

/** Build the public URL for a file in the "lesson-media" storage bucket. */
export function mediaUrl(path: string): string {
  return supabase.storage.from("lesson-media").getPublicUrl(path).data.publicUrl;
}

// ---------------------------------------------------------------------------
// Exact case-sensitive filenames in storage; logical IDs stay v01 … v16.
// ---------------------------------------------------------------------------

export interface LessonVideo {
  id: string; // 'v01' … 'v16'
  file: string;
  url: string;
  /** Optional captions track (.vtt) — set when available. */
  captions?: string;
}

export const lessonVideos: Record<string, LessonVideo> = Object.fromEntries(
  [
    "V01.mp4", "V02.mp4", "V03.mp4", "V04.mp4", "V05.mp4",
    "VO6.mp4", "VO7.mp4", "VO8.mp4", "VO9.mp4", "V10.mp4",
    "V11.mp4", "V12.mp4", "V13.mp4", "V14.mp4", "V15.mp4", "V16.mp4",
  ].map((filename, i) => {
    const id = `v${String(i + 1).padStart(2, "0")}`;
    const file = `videos/${filename}`;
    return [id, { id, file, url: mediaUrl(file) }];
  }),
) as Record<string, LessonVideo>;

/** v16 is the final video of the lesson. */
export const FINAL_VIDEO_ID = "v16";

// ---------------------------------------------------------------------------
// Mascot clips (bucket folder: "mascot")
// webm files exist for clapping / confused / thumbsup; the other moods and all
// .mov versions are empty slots to be filled when the files are added.
// When a slot is empty, components fall back to a mapped clip or a still PNG.
// ---------------------------------------------------------------------------

export type MascotMood =
  | "clapping"
  | "confused"
  | "thumbsup"
  | "excited"
  | "sad"
  | "celebrate"
  | "thinking"
  | "wave"
  | "idle";

export interface MascotClip {
  webm: string | null;
  mov: string | null;
}

export const mascotClips: Record<Exclude<MascotMood, "idle">, MascotClip> = {
  clapping: { webm: mediaUrl("mascot/mascot-clapping_2.webm"), mov: null },
  confused: { webm: mediaUrl("mascot/mascot-confused.webm"), mov: null },
  thumbsup: { webm: mediaUrl("mascot/mascot-thumbsup.webm"), mov: null },
  // Empty slots — files to be added later:
  excited: { webm: null, mov: null },
  sad: { webm: mediaUrl("mascot/mascot-sad.webm"), mov: null },
  celebrate: { webm: mediaUrl("mascot/mascot-celebrate.webm"), mov: null },
  thinking: { webm: null, mov: null },
  wave: { webm: null, mov: null },
};

/** Which clip to use when a mood's own slot is empty. */
export const mascotFallback: Record<Exclude<MascotMood, "idle">, MascotMood> = {
  clapping: "clapping",
  confused: "confused",
  thumbsup: "thumbsup",
  excited: "clapping",
  sad: "sad",
  celebrate: "celebrate",
  thinking: "idle",
  wave: "clapping",
};

/** Silent looping clip shown whenever no reaction is playing. */
export const mascotIdleClip: string = mediaUrl("mascot/mascot-idle.webm");

/** Higher-resolution silent idle loop for the large start-page mascot. */
export const mascotIdleHdClip: string = mediaUrl("mascot/mascot-idle-hd.webm");

/**
 * Eye centres and radius in mascot image pixels, used by IdleMascot for
 * cursor-following eyes once layered images are uploaded. Scaled to the
 * rendered size at runtime. Placeholder values until layered art exists.
 */
export const mascotEyes = {
  left: { x: 250, y: 210 },
  right: { x: 410, y: 210 },
  radius: 34,
};

// ---------------------------------------------------------------------------
// Questions
//
// Flow: v01 → Q1 (correct = B → v02; wrong → v03/v04/v05) → v06 → Q2
// (correct = B → v07; wrong → v08/v09/v10) → v11 → Q3 (correct = B → v12;
// wrong → v13/v14/v15) → v16 (final video).
// ---------------------------------------------------------------------------

export interface LessonOption {
  label: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
  /** Render `text` as KaTeX maths instead of plain text. */
  katex?: boolean;
}

export interface LessonQuestion {
  id: string;
  /** 1-based checkpoint number shown in the "Checkpoint N of 3" pill. */
  checkpoint: number;
  /** Question is shown after this video finishes. */
  shownAfterVideo: string;
  prompt: string;
  correctLabel: string;
  options: LessonOption[];
  /** Played when the correct option is chosen. */
  correctVideo: string;
  /** Played after wrong attempts 1, 2 and 3 respectively. */
  wrongVideos: [string, string, string];
  /** Played from the decision panel's "Continue" button. */
  nextVideo: string;
  /** Shown after the 1st wrong attempt. */
  hint: string;
  /** Render the hint as KaTeX maths. */
  hintKatex?: boolean;
  /** Shown in a working box after the 3rd wrong attempt. */
  reveal: string;
  revealKatex?: boolean;
  /** Key term in the hint shown on a highlighter swipe. */
  hintHighlight?: string;
}

export const lessonQuestions: LessonQuestion[] = [
  {
    id: "Q1",
    checkpoint: 1,
    shownAfterVideo: "v01",
    prompt: "A straight line falls from left to right. What is true about its gradient, m?",
    correctLabel: "B",
    options: [
      { label: "A", text: "m is positive" },
      { label: "B", text: "m is negative" },
      { label: "C", text: "m is zero" },
      { label: "D", text: "m is equal to the y-intercept" },
    ],
    correctVideo: "v02",
    wrongVideos: ["v03", "v04", "v05"],
    nextVideo: "v06",
    hint: "Climbing up the hill = positive. Going down the hill = ?",
    reveal: "The line falls from left to right, so its gradient, m, is negative.",
  },
  {
    id: "Q2",
    checkpoint: 2,
    shownAfterVideo: "v06",
    prompt: "A straight line passes through the points P(2, 1) and Q(4, 7). What is the gradient of the line?",
    correctLabel: "B",
    options: [
      { label: "A", text: "\\frac{1}{3}", katex: true },
      { label: "B", text: "3" },
      { label: "C", text: "6" },
      { label: "D", text: "2" },
    ],
    correctVideo: "v07",
    wrongVideos: ["v08", "v09", "v10"],
    nextVideo: "v11",
    hint: "Gradient = change in y ÷ change in x",
    hintHighlight: "change in y ÷ change in x",
    reveal: "m = \\frac{7 - 1}{4 - 2} = \\frac{6}{2} = 3",
    revealKatex: true,
  },
  {
    id: "Q3",
    checkpoint: 3,
    shownAfterVideo: "v11",
    prompt: "A straight line has a gradient of 3 and crosses the y-axis at 5. Which of these is the equation of the line?",
    correctLabel: "B",
    options: [
      { label: "A", text: "y = 5x + 3", katex: true },
      { label: "B", text: "y = 3x + 5", katex: true },
      { label: "C", text: "y = 3x - 5", katex: true },
      { label: "D", text: "y = x + 8", katex: true },
    ],
    correctVideo: "v12",
    wrongVideos: ["v13", "v14", "v15"],
    nextVideo: "v16",
    hint: "y = mx + c → m = gradient, c = y-intercept",
    hintHighlight: "gradient",
    reveal: "m = 3 \\text{ and } c = 5, \\text{ so } y = 3x + 5",
    revealKatex: true,
  },
];

/** Answer videos (correct + wrong) — the mascot stays on screen while these play. */
export const answerVideoIds: ReadonlySet<string> = new Set(
  lessonQuestions.flatMap((q) => [q.correctVideo, ...q.wrongVideos]),
);

export const lessonMeta = {
  title: "Interactive Learning for Grade 12",
  lessonCode: "MTH12_09_02_01",
  lessonTitle: "Linear Equations and Gradients",
  subtitle: "SS3 / Grade 12 Maths",
};
