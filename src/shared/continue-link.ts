// "Continue learning" link for a topic map, and matching links to the same topic (ignoring ?from=chat).
export type TopicPath = { subject: string; chapter: string; quest: string; topic: string };

export const CONTINUE_LABEL = "Continue learning";

export const mapLink = (p: TopicPath) => `/${p.subject}/${p.chapter}/${p.quest}/${p.topic}/path?from=chat`;

export const sameMap = (a?: string, b?: string) => !!a && !!b && a.split("?")[0] === b.split("?")[0];

/** Add a lasting Continue button to a reply that opens a lesson map; never twice. */
export function withContinue<B extends { link?: string }>(buttons: B[], path: TopicPath | undefined): (B | { label: string; link: string })[] {
  if (!path) return buttons;
  const link = mapLink(path);
  return buttons.some((b) => sameMap(b.link, link)) ? buttons : [...buttons, { label: CONTINUE_LABEL, link }];
}
