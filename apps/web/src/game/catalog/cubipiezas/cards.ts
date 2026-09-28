export const CARD_COUNT = 8;
export const BLUR_MAX = 32;

export type CardStatus = "letter" | "question" | "answer" | "hidden";
export type CardAction = "interact" | "showAnswer" | "reset" | "hide";

export const cardId = (index: number) => `card-${index}`;

export function nextStatus(status: CardStatus, action: CardAction): CardStatus {
  if (action === "reset") return "letter";
  if (action === "hide") return "hidden";
  if (action === "interact" && status === "letter") return "question";
  if (action === "showAnswer" && status === "question") return "answer";
  return status;
}

export function blurFor(statuses: CardStatus[], max: number): number {
  const covering = statuses.filter((status) => status !== "hidden").length;
  return (max * covering) / CARD_COUNT;
}

export const blurFilter = (px: number) => `blur(${px / 10.8}cqh)`;
