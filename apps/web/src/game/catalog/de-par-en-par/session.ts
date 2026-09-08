export interface DeParEnParCard {
  type: number;
  text: string;
  pictureFile: string;
}

export interface DeParEnParCell {
  cardA: DeParEnParCard;
  cardB: DeParEnParCard;
}

export interface DeParEnParSession {
  cells: DeParEnParCell[];
  answer: string[];
}

function isCard(value: unknown): value is DeParEnParCard {
  if (typeof value !== "object" || value === null) return false;
  const card = value as DeParEnParCard;
  return (
    typeof card.type === "number" &&
    typeof card.text === "string" &&
    typeof card.pictureFile === "string"
  );
}

export function isDeParEnParSession(
  data: unknown,
): data is DeParEnParSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as DeParEnParSession;
  return (
    Array.isArray(candidate.cells) &&
    candidate.cells.every(
      (cell) =>
        typeof cell === "object" &&
        cell !== null &&
        isCard(cell.cardA) &&
        isCard(cell.cardB),
    ) &&
    Array.isArray(candidate.answer) &&
    candidate.answer.every((slot) => typeof slot === "string")
  );
}

export interface Slot {
  pair: number;
  card: DeParEnParCard;
}

export function resolveSlot(
  session: DeParEnParSession | null,
  index: number,
): Slot | null {
  const entry = session?.answer[index];
  if (!entry) return null;

  const [rawPair, side] = entry.split("_");
  const pair = Number(rawPair);
  const cell = session.cells[pair];
  if (!cell) return null;

  return { pair, card: side === "B" ? cell.cardB : cell.cardA };
}
