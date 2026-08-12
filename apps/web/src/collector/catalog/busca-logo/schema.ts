export type BoardSize = "4x3" | "5x4" | "6x5";

export const VALID_BOARD_SIZES: BoardSize[] = ["4x3", "5x4", "6x5"];

export const MAX_BOARDS = 12;

export function isValidBoardSize(size: unknown): size is BoardSize {
  return VALID_BOARD_SIZES.includes(size as BoardSize);
}

export interface BoardData {
  id: string;
  size: BoardSize;
  logoPositions: number[];
}

export interface Data {
  boards: { size: string; logoPositions: number[] }[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function spawnBoard(): BoardData {
  return { id: uid(), size: "5x4", logoPositions: [] };
}

export function buildData(boards: BoardData[]): Data {
  const valid: Data["boards"] = [];
  for (const b of boards) {
    if (isValidBoardSize(b.size)) {
      valid.push({
        size: b.size,
        logoPositions: [...b.logoPositions].sort((x, y) => x - y),
      });
    }
  }
  return { boards: valid };
}

export function fromData(data: Data): BoardData[] {
  const boards: BoardData[] = [];
  for (const b of data.boards) {
    if (isValidBoardSize(b.size)) {
      boards.push({ id: uid(), size: b.size, logoPositions: b.logoPositions ?? [] });
    }
  }
  return boards;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as Data).boards)
  );
}
