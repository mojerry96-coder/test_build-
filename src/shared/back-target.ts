// Where an in-app Back goes: a learning trip that started in the Ask Fiti chat always returns to that chat.
export type BackTarget = "chat" | "up";
export const backTarget = (trailFromChat: boolean, searchFromChat = false): BackTarget =>
  trailFromChat || searchFromChat ? "chat" : "up";
