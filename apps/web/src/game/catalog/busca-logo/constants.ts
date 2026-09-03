export const BOARD_SIZE = "5x4";
export const CARD_COUNT = 20;

export const LEVEL_0_ID = "level-0";
export const LEVEL_0_MESSAGE_ID = "level-0-message";
export const LEVEL_2_ID = "level-2";

const cardIds = (suffix?: string) =>
  Array.from({ length: CARD_COUNT }, (_, index) =>
    suffix ? `card-${index}-${suffix}` : `card-${index}`,
  );

export const CARD_IDS = cardIds();
export const CARD_BACK_IDS = cardIds("back");
export const CARD_FRONT_IDS = cardIds("front");
export const CARD_NORMAL_IDS = cardIds("normal");
export const CARD_SELECTED_IDS = cardIds("selected");
export const CARD_LOCKED_IDS = cardIds("locked");
export const CARD_EMPTY_IDS = cardIds("empty");
export const CARD_LOGO_IDS = cardIds("logo");
