# Super Admin page list, and warm-up screen matched to the spec

## 1. Super Admin "Go to page": real names, in the order she meets them

```text
Sign in
Meet your tutor
Home
Mathematics: chapters
quests
topics
intro
warm-up
My Learning
Progress
---- Admin ----
Admin
Content import
Settings
```

- The chapter, quest and topic names are read from the lesson data, never typed into the code. If a name is missing, it falls back to "Chapters", "Quests", "Topics".
- "Topic intro" moves from 4th place to after Topics. "Lesson preview" becomes "...: warm-up (lesson preview)".
- A thin divider and an "Admin" label separate the student pages from the admin pages.

## 2. Warm-up screen (matching your screenshot)

**Top of page**

- **No 8-step bar:** the bar and the "Step 1 of 8 · Ready" line are removed on the warm-up.
- **Same top as the intro:** the warm-up uses the intro's top bar (logo, Home, My Learning, Progress, name and avatar) and its breadcrumb (Home > Mathematics > Coordinate Geometry > Learning Path). It also uses the intro's title, "Welcome to {topic}".
- **Save and exit:** still available, through the avatar menu.

**Question card**

- **Progress line:** the orange warm-up progress line sits along the top edge of the card. It's full width and has no label.
- **Labels removed:** the "Warm-up" heading and the "WARM-UP · QUESTION 1 OF 3" label are removed. The question number is still read out to screen readers.
- **Question:** centred, large and bold, spread over about two lines.
- **Grid:** much bigger, centred under the question, about 560 x 370 px on desktop.
  - The y-axis runs from 0 to 5 and the x-axis from 1 to 6. The negative rows are removed.
  - The squares are soft, with numbers on the left and bottom only.
  - The interactive parts stay: points light up when she moves over the grid, and choosing an answer traces its path. The caption line and the "Show me" button are removed, as in the spec.
  - On phones, the grid fills the card width.
- **Answers:** a centred 2 x 2 block, each answer 456 x 72 px. The A–D letter tiles and the selected state stay as agreed.
- **Check Answer:** centred, about 612 px wide, inside the card.

**Unchanged:** popups, quick fix, tutor panel layout, and the lesson's other steps (they keep the step bar).

## 3. Tutor panel: remove the suggestion buttons

The "Give me a hint", "Explain the question" and "What is rise?" buttons are removed from the tutor panel on every lesson step. She can still type or ask by voice. The ask box keeps "Ask your tutor a question..." as agreed.

## 4. Checks

- Screenshots of the warm-up on desktop (1440) and phone (390), before and after choosing an answer.
- Screenshots of the reordered Super Admin page list.

## Technical details

- `DevToolsPanel.tsx`, goto section: reorder the buttons and label them from `me.topics` (chapter, quest, display name), with an `Admin` group heading.
- `LessonScreen.tsx`: when `step === "readiness"`, render the intro's shared top bar and breadcrumb component (the same one `.../intro` uses) instead of the lesson header and `StepBar`. Hide the stage title for the readiness step.
- `WarmupStage.tsx`: progress line on the card edge, centred prompt, `PointBoard` with `yMin = 0`, larger viewBox, no caption or Show me. 2 x 2 options with a max width of 936 px, and the Check button inside the card (Dock content moved inline for readiness on desktop; the fixed bottom position stays on phones).
- Pack: question 1's board config changes from `y_max` 5 with negatives to 0..5 (board paths for option d clip at 0). Reload the pack and run the leak check and re-import check.
- Remove the quick-reply chip row from `TutorChatPanel` / `LessonScreen` (stages-b references checked).