export type Direction = "H" | "V";

export interface SequenceData {
  values: string[];
  position: { x: number; y: number };
  direction: { x: number; y: number };
  hiddenIndexes?: number[];
}

export interface Operation {
  id: string;
  text: string;
  direction: Direction;
  sequence?: SequenceData;
}

export interface BoardData {
  id: string;
  grid: string[][];
  operations: Operation[];
}

export interface RoundData {
  id: string;
  boards: BoardData[];
}

export interface ExportedOperation {
  sequence: {
    values: string[];
    position: { x: number; y: number };
    direction: { x: number; y: number };
  };
  hiddenIndexes: number[];
}

export interface ExportedData {
  rounds: { boards: { operations: ExportedOperation[] }[] }[];
}

export const GRID_SIZE = 11;
export const MAX_ROUNDS = 6;
export const MAX_BOARDS = 4;
export const MAX_OPERATIONS = 30;

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyGrid(): string[][] {
  return Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(""));
}

export function spawnBoard(): BoardData {
  return { id: uid(), grid: createEmptyGrid(), operations: [] };
}

export function spawnRound(): RoundData {
  return { id: uid(), boards: [spawnBoard()] };
}

export function buildData(rounds: RoundData[]): ExportedData {
  return {
    rounds: rounds.map((r) => ({
      boards: r.boards.map((b) => ({
        operations: b.operations.reduce((acc, op) => {
          if (op.sequence) {
            acc.push({
              sequence: {
                values: op.sequence.values,
                position: op.sequence.position,
                direction: op.sequence.direction,
              },
              hiddenIndexes: op.sequence.hiddenIndexes || [],
            });
          }
          return acc;
        }, [] as ExportedOperation[]),
      })),
    })),
  };
}

export function fromData(data: ExportedData): RoundData[] {
  return data.rounds.map((r) => ({
    id: uid(),
    boards: (r.boards || []).map((b) => ({
      id: uid(),
      grid: createEmptyGrid(),
      operations: (b.operations || []).map((op) => {
        const seq = op.sequence;
        return {
          id: uid(),
          text: seq.values.join(""),
          direction: (seq.direction.x === 1 ? "H" : "V") as Direction,
          sequence: {
            values: seq.values,
            position: seq.position,
            direction: seq.direction,
            hiddenIndexes: op.hiddenIndexes || [],
          },
        };
      }),
    })),
  }));
}

export function isData(data: unknown): data is ExportedData {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as ExportedData).rounds)
  );
}
