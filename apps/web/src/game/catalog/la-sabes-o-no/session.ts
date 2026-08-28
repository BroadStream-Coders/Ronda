export interface LaSabesQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LaSabesGroup {
  title: string;
  questions: LaSabesQuestion[];
}

export interface LaSabesSession {
  groups: LaSabesGroup[];
}

export function isLaSabesSession(data: unknown): data is LaSabesSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as LaSabesSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        typeof group.title === "string" &&
        Array.isArray(group.questions) &&
        group.questions.every(
          (question) =>
            typeof question === "object" &&
            question !== null &&
            typeof question.question === "string" &&
            typeof question.correctIndex === "number" &&
            Array.isArray(question.options) &&
            question.options.length === 2 &&
            question.options.every((option) => typeof option === "string"),
        ),
    )
  );
}
