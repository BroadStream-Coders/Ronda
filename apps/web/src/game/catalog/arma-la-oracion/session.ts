export interface ArmaOracionGroup {
  sentences: string[];
}

export interface ArmaOracionSession {
  groups: ArmaOracionGroup[];
}

export function isArmaOracionSession(
  data: unknown,
): data is ArmaOracionSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as ArmaOracionSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        Array.isArray(group.sentences) &&
        group.sentences.every((sentence) => typeof sentence === "string"),
    )
  );
}
