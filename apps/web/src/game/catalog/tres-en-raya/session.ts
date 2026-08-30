export interface TresEnRayaQuestion {
  question: string;
  answer: string;
}

export interface TresEnRayaGroup {
  questions: TresEnRayaQuestion[];
}

export interface TresEnRayaSession {
  groups: TresEnRayaGroup[];
}

export function isTresEnRayaSession(
  data: unknown,
): data is TresEnRayaSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as TresEnRayaSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        Array.isArray(group.questions) &&
        group.questions.every(
          (question) =>
            typeof question === "object" &&
            question !== null &&
            typeof question.question === "string" &&
            typeof question.answer === "string",
        ),
    )
  );
}
