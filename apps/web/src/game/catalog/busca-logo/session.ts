export interface BuscaLogoBoard {
  size: string;
  logoPositions: number[];
}

export interface BuscaLogoSession {
  boards: BuscaLogoBoard[];
}

function isBoard(board: unknown): board is BuscaLogoBoard {
  if (typeof board !== "object" || board === null) return false;
  const candidate = board as BuscaLogoBoard;
  return (
    typeof candidate.size === "string" &&
    Array.isArray(candidate.logoPositions) &&
    candidate.logoPositions.every((position) => typeof position === "number")
  );
}

export function isBuscaLogoSession(data: unknown): data is BuscaLogoSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as BuscaLogoSession;
  return Array.isArray(candidate.boards) && candidate.boards.every(isBoard);
}
