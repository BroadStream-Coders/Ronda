export interface MiLibroPlayer {
  playerName: string;
  maxHealth: number;
}

export interface MiLibroSlot {
  question: string;
  answer: string;
}

export interface MiLibroGroup {
  slots: MiLibroSlot[];
}

export interface MiLibroSession {
  players: MiLibroPlayer[];
  groups: MiLibroGroup[];
}

export function isMiLibroSession(data: unknown): data is MiLibroSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as MiLibroSession;
  return (
    Array.isArray(candidate.players) &&
    candidate.players.length >= 2 &&
    candidate.players.every(
      (player) =>
        typeof player === "object" &&
        player !== null &&
        typeof player.playerName === "string" &&
        typeof player.maxHealth === "number",
    ) &&
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
