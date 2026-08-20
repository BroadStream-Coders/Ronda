export interface CalculoSlot {
  question: string;
  answer: string;
}

export interface CalculoBoard {
  slots: CalculoSlot[];
}

export interface CalculoGroup {
  boards: CalculoBoard[];
}

export interface CalculoSession {
  groups: CalculoGroup[];
}

export function isCalculoSession(data: unknown): data is CalculoSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as CalculoSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        Array.isArray(group.boards) &&
        group.boards.every(
          (board) =>
            typeof board === "object" &&
            board !== null &&
            Array.isArray(board.slots) &&
            board.slots.every(
              (slot) =>
                typeof slot === "object" &&
                slot !== null &&
                typeof slot.question === "string" &&
                typeof slot.answer === "string",
            ),
        ),
    )
  );
}
