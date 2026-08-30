export interface TresEnRayaSlot {
  question: string;
  answer: string;
}

export interface TresEnRayaGroup {
  slots: TresEnRayaSlot[];
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
        Array.isArray(group.slots) &&
        group.slots.every(
          (slot) =>
            typeof slot === "object" &&
            slot !== null &&
            typeof slot.question === "string" &&
            typeof slot.answer === "string",
        ),
    )
  );
}
