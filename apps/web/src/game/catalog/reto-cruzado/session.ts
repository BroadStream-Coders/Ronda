export interface RetoChoiceQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface RetoPairsQuestion {
  pairs: { leftText: string; rightText: string }[];
}

export interface RetoQaQuestion {
  question: string;
  answer: string;
}

export interface RetoGroup<T> {
  title: string;
  questions: T[];
}

export interface RetoCruzadoSession {
  level0: { courses: string[] };
  level1: { groups: RetoGroup<RetoChoiceQuestion>[] };
  level2: { groups: RetoGroup<RetoChoiceQuestion>[] };
  level3: { groups: RetoGroup<RetoPairsQuestion>[] };
  level4: { groups: RetoGroup<RetoQaQuestion>[] };
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function isGroupList(
  level: unknown,
  isQuestion: (question: unknown) => boolean,
): boolean {
  if (!isObject(level)) return false;
  const groups = level.groups;
  return (
    Array.isArray(groups) &&
    groups.every(
      (group) =>
        isObject(group) &&
        typeof group.title === "string" &&
        Array.isArray(group.questions) &&
        group.questions.every(isQuestion),
    )
  );
}

const isChoiceQuestion = (question: unknown): boolean =>
  isObject(question) &&
  typeof question.question === "string" &&
  typeof question.correctIndex === "number" &&
  Array.isArray(question.options) &&
  question.options.every((option) => typeof option === "string");

const isPairsQuestion = (question: unknown): boolean =>
  isObject(question) &&
  Array.isArray(question.pairs) &&
  question.pairs.every(
    (pair) =>
      isObject(pair) &&
      typeof pair.leftText === "string" &&
      typeof pair.rightText === "string",
  );

const isQaQuestion = (question: unknown): boolean =>
  isObject(question) &&
  typeof question.question === "string" &&
  typeof question.answer === "string";

export function isRetoCruzadoSession(
  data: unknown,
): data is RetoCruzadoSession {
  if (!isObject(data)) return false;
  const level0 = data.level0;
  return (
    isObject(level0) &&
    Array.isArray(level0.courses) &&
    level0.courses.every((course) => typeof course === "string") &&
    isGroupList(data.level1, isChoiceQuestion) &&
    isGroupList(data.level2, isChoiceQuestion) &&
    isGroupList(data.level3, isPairsQuestion) &&
    isGroupList(data.level4, isQaQuestion)
  );
}
