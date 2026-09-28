import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export type Direction = "H" | "V";

export interface Vector {
  x: number;
  y: number;
}

export interface SequenceData {
  values: string[];
  position: Vector;
  direction: Vector;
}

export interface Word {
  id: string;
  text: string;
  direction: Direction;
  sequence?: SequenceData;
}

export interface Clue {
  id: string;
  text: string;
}

export interface RoundData {
  id: string;
  words: Word[];
  clues: Clue[];
  filler: string[][] | null;
}

export interface ExportedData {
  rounds: {
    words: { sequence: SequenceData }[];
    clues: string[];
    grid: string[];
  }[];
}

export const COLS = 9;
export const ROWS = 8;
export const MAX_ROUNDS = 30;
export const MAX_WORDS = 20;
export const MIN_WORD_LENGTH = 3;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export const uid = () => Math.random().toString(36).slice(2, 9);

export function normalizeText(text: string): string {
  return text
    .toUpperCase()
    .replace(/Ñ/g, "\0")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\0/g, "Ñ");
}

export function tokenize(text: string): string[] | null {
  const letters = [...normalizeText(text).replace(/\s+/g, "")];
  if (letters.length === 0) return null;
  return letters.every((l) => /^[A-ZÑ]$/.test(l)) ? letters : null;
}

export function toVector(direction: Direction): Vector {
  return direction === "H" ? { x: 1, y: 0 } : { x: 0, y: 1 };
}

export function createEmptyGrid(): string[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(""));
}

export function generateFiller(): string[][] {
  return Array.from({ length: ROWS }, () =>
    Array.from(
      { length: COLS },
      () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)],
    ),
  );
}

export function placedGrid(words: Word[], excludeId?: string): string[][] {
  const grid = createEmptyGrid();
  words.forEach((w) => {
    if (!w.sequence || w.id === excludeId) return;
    const { values, position, direction } = w.sequence;
    values.forEach((v, i) => {
      grid[position.y + i * direction.y][position.x + i * direction.x] = v;
    });
  });
  return grid;
}

export function fits(length: number, position: Vector, direction: Vector) {
  return (
    position.x + (length - 1) * direction.x < COLS &&
    position.y + (length - 1) * direction.y < ROWS
  );
}

export function conflicts(
  grid: string[][],
  values: string[],
  position: Vector,
  direction: Vector,
) {
  return values.some((v, i) => {
    const existing = grid[position.y + i * direction.y][position.x + i * direction.x];
    return existing !== "" && existing !== v;
  });
}

export function composeGrid(round: RoundData): string[][] {
  const grid = placedGrid(round.words);
  return grid.map((row, y) =>
    row.map((cell, x) => cell || round.filler?.[y]?.[x] || ""),
  );
}

export function spawnRound(): RoundData {
  return { id: uid(), words: [], clues: [], filler: null };
}

export function buildData(rounds: RoundData[]): ExportedData {
  return {
    rounds: rounds.map((r) => ({
      words: r.words.flatMap((w) => (w.sequence ? [{ sequence: w.sequence }] : [])),
      clues: r.clues.map((c) => c.text.trim()),
      grid: composeGrid(r).map((row) => row.map((c) => c || " ").join("")),
    })),
  };
}

function parseFiller(grid: unknown): string[][] | null {
  if (!Array.isArray(grid) || grid.length !== ROWS) return null;
  const rows = grid.map((row) => (typeof row === "string" ? [...row] : []));
  const complete = rows.every(
    (row) => row.length === COLS && row.every((c) => /^[A-ZÑ]$/.test(c)),
  );
  return complete ? rows : null;
}

export function fromData(data: ExportedData): RoundData[] {
  return data.rounds.map((r) => ({
    id: uid(),
    filler: parseFiller(r.grid),
    clues: (r.clues || []).map((text) => ({ id: uid(), text })),
    words: (r.words || []).map((w) => ({
      id: uid(),
      text: w.sequence.values.join(""),
      direction: (w.sequence.direction.x === 1 ? "H" : "V") as Direction,
      sequence: w.sequence,
    })),
  }));
}

export function validate(rounds: RoundData[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  rounds.forEach((round, roundIndex) => {
    const roundLabel = `Ronda ${roundIndex + 1}`;

    if (!round.words.some((w) => w.sequence)) {
      issues.push({
        path: formatPath(roundLabel),
        message: "La ronda no tiene palabras colocadas.",
      });
    }

    if (!round.filler) {
      issues.push({
        path: formatPath(roundLabel),
        message: "Falta generar el relleno de letras: usa «Generar relleno» sobre el tablero.",
      });
    }

    if (round.clues.length !== round.words.length) {
      issues.push({
        path: formatPath(roundLabel),
        message: `Hay ${round.words.length} palabras y ${round.clues.length} enunciados; deben ser la misma cantidad.`,
      });
    }

    round.clues.forEach((clue, clueIndex) => {
      if (isBlank(clue.text)) {
        issues.push({
          path: formatPath(roundLabel, `Enunciado ${clueIndex + 1}`),
          message: "El enunciado está vacío.",
        });
      }
    });

    round.words.forEach((word, wordIndex) => {
      const wordLabel = `Palabra ${wordIndex + 1}`;
      if (isBlank(word.text)) {
        issues.push({
          path: formatPath(roundLabel, wordLabel),
          message: "La palabra está vacía.",
        });
      } else if (!word.sequence) {
        issues.push({
          path: formatPath(roundLabel, wordLabel),
          message: "La palabra no está colocada en el tablero (se perderá al guardar).",
        });
      }
    });
  });

  return issues;
}

export function isData(data: unknown): data is ExportedData {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as ExportedData).rounds)
  );
}
