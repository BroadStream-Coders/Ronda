export interface RowData {
  id: string;
  question: string;
  answerL: string;
  answerR: string;
  correctAnswer: "L" | "R" | null;
}

export interface ColumnData {
  title: string;
  rows: RowData[];
}

export interface Data {
  groups: {
    title: string;
    questions: { question: string; options: string[]; correctIndex: number }[];
  }[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyRow(): RowData {
  return { id: uid(), question: "", answerL: "", answerR: "", correctAnswer: "L" };
}

export function createEmptyColumn(): ColumnData {
  return { title: "", rows: [createEmptyRow()] };
}

export function buildData(columns: ColumnData[]): Data {
  return {
    groups: columns.map((col) => ({
      title: col.title.trim(),
      questions: col.rows.map((q) => ({
        question: q.question.trim(),
        options: [q.answerL.trim(), q.answerR.trim()],
        correctIndex: q.correctAnswer === "L" ? 0 : 1,
      })),
    })),
  };
}

export function fromData(data: Data): ColumnData[] {
  const columns = data.groups.map((g) => ({
    title: g.title || "",
    rows: (g.questions ?? []).map((q) => ({
      id: uid(),
      question: q.question || "",
      answerL: q.options?.[0] || "",
      answerR: q.options?.[1] || "",
      correctAnswer: q.correctIndex === 0 ? ("L" as const) : ("R" as const),
    })),
  }));
  return columns.length > 0 ? columns : [createEmptyColumn()];
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups) &&
    (data as Data).groups.every(
      (g) => g != null && Array.isArray(g.questions),
    )
  );
}
