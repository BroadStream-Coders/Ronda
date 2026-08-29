const zones = new Map<string, number>();

export const placement = {
  zoneOf: (cardId: string) => zones.get(cardId),
  cardOf: (zone: number) => {
    for (const [cardId, value] of zones) if (value === zone) return cardId;
    return undefined;
  },
  place: (cardId: string, zone: number) => {
    zones.set(cardId, zone);
  },
  remove: (cardId: string) => {
    zones.delete(cardId);
  },
  clear: () => {
    zones.clear();
  },
};
