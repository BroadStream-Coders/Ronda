export interface AlVueloQuestion {
  question: string;
  answer: boolean | null;
}

export interface AlVueloGroup {
  title: string;
  questions: AlVueloQuestion[];
}

export interface AlVueloSession {
  groups: AlVueloGroup[];
}

export function isAlVueloSession(data: unknown): data is AlVueloSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as AlVueloSession;
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
            (typeof question.answer === "boolean" || question.answer === null),
        ),
    )
  );
}

export function correctOption(question: AlVueloQuestion): number {
  if (question.answer === true) return 0;
  if (question.answer === false) return 1;
  return -1;
}
