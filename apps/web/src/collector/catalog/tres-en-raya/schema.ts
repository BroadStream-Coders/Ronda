import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface RowData {
  id: string;
  question: string;
  answer: string;
}

export interface Data {
  groups: { questions: { question: string; answer: string }[] }[];
}

export const BOARD_SIZE = 9;

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyRow(): RowData {
  return { id: uid(), question: "", answer: "" };
}

export function toBoard(rows: RowData[]): RowData[] {
  return Array.from({ length: BOARD_SIZE }, (_, i) => rows[i] ?? createEmptyRow());
}

export function createEmptyColumn(): RowData[] {
  return toBoard([]);
}

export function buildData(columns: RowData[][]): Data {
  return {
    groups: columns.map((rows) => ({
      questions: rows.map((row) => ({
        question: row.question.trim(),
        answer: row.answer.trim(),
      })),
    })),
  };
}

export function fromData(data: Data): RowData[][] {
  const columns = data.groups.map((group) =>
    toBoard(
      (group.questions ?? []).map((question) => ({
        id: uid(),
        question: question.question || "",
        answer: question.answer || "",
      })),
    ),
  );
  return columns.length > 0 ? columns : [createEmptyColumn()];
}

export function validate(columns: RowData[][]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  columns.forEach((rows, colIndex) => {
    const groupLabel = `Ronda ${colIndex + 1}`;
    rows.forEach((row, rowIndex) => {
      const rowLabel = `Casilla ${rowIndex + 1}`;
      if (isBlank(row.question)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Enunciado"),
          message: "Falta el enunciado.",
        });
      }
      if (isBlank(row.answer)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Respuesta"),
          message: "Falta la respuesta.",
        });
      }
    });
  });
  return issues;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups)
  );
}
