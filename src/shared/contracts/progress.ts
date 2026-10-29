// Her own progress, shown in the lesson's Leaderboard side tab.
export type ProgressData = {
  /** Lesson steps finished in this topic's current lesson (0–8). */
  stepsDone: number;
  /** Stars = right first time (not quizzes): all of her journey, and this topic. */
  stars: number;
  topicStars: number;
  /** Right out of tried, lessons and quizzes. */
  correct: number;
  tried: number;
  fitiLine: string;
};
