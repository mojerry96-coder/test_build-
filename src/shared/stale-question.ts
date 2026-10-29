/** Server messages meaning "the page is showing an out-of-date question"; the page reloads instead of showing an error. */
export const STALE_QUESTION_MESSAGES = ["That is not the current question.", "That question isn't part of this step."];
export const isStaleQuestion = (msg: string) => STALE_QUESTION_MESSAGES.includes(msg);
