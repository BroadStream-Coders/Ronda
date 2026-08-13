export interface ChoiceRow {
  id: string;
  question: string;
  answers: string[];
  correctIndex: number;
}

export interface PairsRow {
  id: string;
  pairs: { leftText: string; rightText: string }[];
}

export interface QaRow {
  id: string;
  question: string;
  answer: string;
}

export interface ColumnData<T> {
  title: string;
  rows: T[];
}

export interface ChoiceQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface PairsQuestion {
  pairs: { leftText: string; rightText: string }[];
}

export interface QaQuestion {
  question: string;
  answer: string;
}

export interface Group<T> {
  title: string;
  questions: T[];
}

export interface Data {
  level0: { courses: string[] };
  level1: { groups: Group<ChoiceQuestion>[] };
  level2: { groups: Group<ChoiceQuestion>[] };
  level3: { groups: Group<PairsQuestion>[] };
  level4: { groups: Group<QaQuestion>[] };
}

export interface EditorData {
  courses: string[];
  level1: ColumnData<ChoiceRow>[];
  level2: ColumnData<ChoiceRow>[];
  level3: ColumnData<PairsRow>[];
  level4: ColumnData<QaRow>[];
}

export const MAX_COURSES = 20;
export const MAX_CAPACITY = 30;
export const PAIRS_PER_ROW = 3;

export const BINARY_OPTIONS = [
  { label: "L", placeholder: "Respuesta izquierda..." },
  { label: "R", placeholder: "Respuesta derecha..." },
];

export const MULTIPLE_OPTIONS = ["A", "B", "C", "D"].map((label) => ({
  label,
  placeholder: `Ingrese la respuesta ${label}...`,
}));

const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyChoiceRow(optionCount: number): ChoiceRow {
  return {
    id: uid(),
    question: "",
    answers: Array(optionCount).fill(""),
    correctIndex: 0,
  };
}

export function createEmptyPairsRow(): PairsRow {
  return {
    id: uid(),
    pairs: Array.from({ length: PAIRS_PER_ROW }, () => ({
      leftText: "",
      rightText: "",
    })),
  };
}

export function createEmptyQaRow(): QaRow {
  return { id: uid(), question: "", answer: "" };
}

export function createEmptyColumn<T>(createRow: () => T): ColumnData<T> {
  return { title: "", rows: [createRow()] };
}

export function parseBinaryPaste(matrix: string[][]): ChoiceRow[] {
  return matrix.map((row) => {
    const isLeftCorrect = Math.random() > 0.5;
    return {
      id: uid(),
      question: row[0] || "",
      answers: isLeftCorrect
        ? [row[1] || "", row[2] || ""]
        : [row[2] || "", row[1] || ""],
      correctIndex: isLeftCorrect ? 0 : 1,
    };
  });
}

export function parseMultiplePaste(matrix: string[][]): ChoiceRow[] {
  const lines = matrix
    .map((row) => row[0]?.trim() ?? "")
    .filter((line) => line !== "");

  const rows: ChoiceRow[] = [];
  for (let i = 0; i < lines.length; i += 5) {
    const chunk = lines.slice(i, i + 5);
    if (chunk.length < 2) continue;

    const question = chunk[0];
    const correct = chunk[1];
    const answers = [correct, ...chunk.slice(2)];

    for (let j = answers.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [answers[j], answers[k]] = [answers[k], answers[j]];
    }

    rows.push({
      id: uid(),
      question,
      answers: Array.from({ length: 4 }, (_, idx) => answers[idx] || ""),
      correctIndex: answers.indexOf(correct),
    });
  }
  return rows;
}

export function parsePairsPaste(matrix: string[][]): PairsRow[] {
  const valid = matrix.filter(
    (row) => row.length >= 2 && (row[0].trim() !== "" || row[1].trim() !== ""),
  );

  const rows: PairsRow[] = [];
  for (let i = 0; i < valid.length; i += PAIRS_PER_ROW) {
    const chunk = valid.slice(i, i + PAIRS_PER_ROW);
    rows.push({
      id: uid(),
      pairs: Array.from({ length: PAIRS_PER_ROW }, (_, idx) => ({
        leftText: chunk[idx]?.[0] || "",
        rightText: chunk[idx]?.[1] || "",
      })),
    });
  }
  return rows;
}

export function parseQaPaste(matrix: string[][]): QaRow[] {
  return matrix
    .filter((row) => row.some((cell) => cell.trim() !== ""))
    .map((row) => ({
      id: uid(),
      question: row[0] || "",
      answer: row[1] || "",
    }));
}

function buildChoiceGroups(columns: ColumnData<ChoiceRow>[]) {
  return columns.map((col) => ({
    title: col.title.trim(),
    questions: col.rows.map((row) => ({
      question: row.question.trim(),
      options: row.answers.map((answer) => answer.trim()),
      correctIndex: row.correctIndex,
    })),
  }));
}

export function buildData(state: EditorData): Data {
  const courses: string[] = [];
  for (const course of state.courses) {
    const trimmed = course.trim();
    if (trimmed !== "") {
      courses.push(trimmed);
      if (courses.length === MAX_COURSES) break;
    }
  }

  return {
    level0: { courses },
    level1: { groups: buildChoiceGroups(state.level1) },
    level2: { groups: buildChoiceGroups(state.level2) },
    level3: {
      groups: state.level3.map((col) => ({
        title: col.title.trim(),
        questions: col.rows.map((row) => ({
          pairs: row.pairs.slice(0, PAIRS_PER_ROW).map((pair) => ({
            leftText: pair.leftText.trim(),
            rightText: pair.rightText.trim(),
          })),
        })),
      })),
    },
    level4: {
      groups: state.level4.map((col) => ({
        title: col.title.trim(),
        questions: col.rows.map((row) => ({
          question: row.question.trim(),
          answer: row.answer.trim(),
        })),
      })),
    },
  };
}

function fromChoiceGroups(
  groups: Group<ChoiceQuestion>[] | undefined,
  optionCount: number,
): ColumnData<ChoiceRow>[] {
  if (!groups?.length) {
    return [createEmptyColumn(() => createEmptyChoiceRow(optionCount))];
  }
  return groups.map((group) => ({
    title: group.title || "",
    rows: (group.questions ?? []).map((question) => ({
      id: uid(),
      question: question.question || "",
      answers: Array.from(
        { length: optionCount },
        (_, i) => question.options?.[i] || "",
      ),
      correctIndex: question.correctIndex ?? 0,
    })),
  }));
}

export function fromData(data: Data): EditorData {
  return {
    courses: data.level0?.courses?.length ? data.level0.courses : [""],
    level1: fromChoiceGroups(data.level1?.groups, 2),
    level2: fromChoiceGroups(data.level2?.groups, 4),
    level3: data.level3?.groups?.length
      ? data.level3.groups.map((group) => ({
          title: group.title || "",
          rows: (group.questions ?? []).map((question) => ({
            id: uid(),
            pairs: Array.from({ length: PAIRS_PER_ROW }, (_, i) => ({
              leftText: question.pairs?.[i]?.leftText || "",
              rightText: question.pairs?.[i]?.rightText || "",
            })),
          })),
        }))
      : [createEmptyColumn(createEmptyPairsRow)],
    level4: data.level4?.groups?.length
      ? data.level4.groups.map((group) => ({
          title: group.title || "",
          rows: (group.questions ?? []).map((question) => ({
            id: uid(),
            question: question.question || "",
            answer: question.answer || "",
          })),
        }))
      : [createEmptyColumn(createEmptyQaRow)],
  };
}

export function isData(data: unknown): data is Data {
  if (typeof data !== "object" || data === null) return false;
  return ["level0", "level1", "level2", "level3", "level4"].some(
    (key) => key in data,
  );
}
