export interface DeletreoGroup {
  words: string[];
}

export interface DeletreoSession {
  groups: DeletreoGroup[];
}

export function isDeletreoSession(data: unknown): data is DeletreoSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as DeletreoSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        Array.isArray(group.words) &&
        group.words.every((word) => typeof word === "string"),
    )
  );
}
