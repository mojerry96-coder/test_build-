/** "1 skill", "3 skills": the one rule for every count in tutor lines and labels. */
export function countWords(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}
