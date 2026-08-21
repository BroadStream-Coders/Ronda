export interface ArmaPalabraGroup {
  words: string[];
}

export interface ArmaPalabraSession {
  groups: ArmaPalabraGroup[];
}

export function isArmaPalabraSession(
  data: unknown,
): data is ArmaPalabraSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as ArmaPalabraSession;
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
