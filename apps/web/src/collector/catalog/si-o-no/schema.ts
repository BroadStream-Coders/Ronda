export interface RowData {
  id: string;
  question: string;
  correctAnswer: "Si" | "No" | null;
}

export interface ColumnData {
  title: string;
  rows: RowData[];
}

export interface Data {
  groups: {
    title: string;
    questions: { question: string; answer: boolean | null }[];
  }[];
}

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyRow(): RowData {
  return { id: uid(), question: "", correctAnswer: null };
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
        answer:
          q.correctAnswer === "Si"
            ? true
            : q.correctAnswer === "No"
              ? false
              : null,
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
      correctAnswer:
        q.answer === true
          ? ("Si" as const)
          : q.answer === false
            ? ("No" as const)
            : null,
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
