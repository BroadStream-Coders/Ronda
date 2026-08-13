import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface SlotData {
  question: string;
  answer: string;
}

export interface BoardData {
  slots: SlotData[];
}

export interface Data {
  groups: { boards: BoardData[] }[];
}

export function createEmptySlot(): SlotData {
  return { question: "", answer: "" };
}

export function createEmptyBoard(): BoardData {
  return { slots: Array(4).fill(null).map(createEmptySlot) };
}

export function buildData(groups: BoardData[][]): Data {
  return {
    groups: groups.map((boards) => ({
      boards: boards.map((board) => ({
        slots: board.slots.map((slot) => ({
          question: slot.question.trim(),
          answer: slot.answer.trim(),
        })),
      })),
    })),
  };
}

export function validate(groups: BoardData[][]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  groups.forEach((boards, groupIndex) => {
    const groupLabel = `Grupo ${groupIndex + 1}`;
    boards.forEach((board, boardIndex) => {
      const boardLabel = `Tablero ${boardIndex + 1}`;
      board.slots.forEach((slot, slotIndex) => {
        const slotLabel = `Casilla ${slotIndex + 1}`;
        if (isBlank(slot.question)) {
          issues.push({
            path: formatPath(groupLabel, boardLabel, slotLabel, "Enunciado"),
            message: "Falta el enunciado.",
          });
        }
        if (isBlank(slot.answer)) {
          issues.push({
            path: formatPath(groupLabel, boardLabel, slotLabel, "Respuesta"),
            message: "Falta la respuesta.",
          });
        }
      });
    });
  });
  return issues;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups) &&
    (data as Data).groups.every(
      (g) =>
        g != null &&
        Array.isArray(g.boards) &&
        g.boards.every((b) => b != null && Array.isArray(b.slots)),
    )
  );
}
