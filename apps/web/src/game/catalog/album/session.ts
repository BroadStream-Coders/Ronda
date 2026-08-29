export interface AlbumCard {
  isCroma?: boolean;
  question: string;
  imagePath: string;
}

export interface AlbumRound {
  title: string;
  cards: AlbumCard[];
}

export interface AlbumSession {
  rounds: AlbumRound[];
}

export function isAlbumSession(data: unknown): data is AlbumSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as AlbumSession;
  return (
    Array.isArray(candidate.rounds) &&
    candidate.rounds.every(
      (round) =>
        typeof round === "object" &&
        round !== null &&
        typeof round.title === "string" &&
        Array.isArray(round.cards) &&
        round.cards.every(
          (card) =>
            typeof card === "object" &&
            card !== null &&
            typeof card.question === "string" &&
            typeof card.imagePath === "string" &&
            (card.isCroma === undefined || typeof card.isCroma === "boolean"),
        ),
    )
  );
}
