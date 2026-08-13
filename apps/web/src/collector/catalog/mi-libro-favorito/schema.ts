import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface QA {
  question: string;
  answer: string;
}

export interface PlayerData {
  name: string;
}

export interface Data {
  players: { playerName: string; maxHealth: number }[];
  groups: { slots: QA[] }[];
}

const MAX_HEALTH = 3;

export function createEmptyQA(): QA {
  return { question: "", answer: "" };
}

export function initialPlayers(): PlayerData[] {
  return [{ name: "" }, { name: "" }];
}

export function initialGroups(): QA[][] {
  return [
    [createEmptyQA(), createEmptyQA()],
    [createEmptyQA(), createEmptyQA()],
  ];
}

export function buildData(players: PlayerData[], groups: QA[][]): Data {
  return {
    players: players.map((p) => ({ playerName: p.name, maxHealth: MAX_HEALTH })),
    groups: groups.map((slots) => ({ slots })),
  };
}

export function fromData(data: Data): { players: PlayerData[]; groups: QA[][] } {
  return {
    players: Array.isArray(data.players)
      ? data.players.map((p) => ({ name: p.playerName || "" }))
      : initialPlayers(),
    groups: Array.isArray(data.groups)
      ? data.groups.map((g) => g.slots ?? [])
      : initialGroups(),
  };
}

export function validate(
  players: PlayerData[],
  groups: QA[][],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  players.forEach((player, playerIndex) => {
    if (isBlank(player.name)) {
      issues.push({
        path: formatPath(`Jugador ${playerIndex + 1}`, "Nombre"),
        message: "Falta el nombre del jugador.",
      });
    }
  });

  groups.forEach((slots, groupIndex) => {
    const groupLabel = `Ronda ${groupIndex + 1}`;
    slots.forEach((slot, slotIndex) => {
      const rowLabel = `Fila ${slotIndex + 1}`;
      if (isBlank(slot.question)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Enunciado"),
          message: "Falta el enunciado.",
        });
      }
      if (isBlank(slot.answer)) {
        issues.push({
          path: formatPath(groupLabel, rowLabel, "Respuesta"),
          message: "Falta la respuesta.",
        });
      }
    });
  });

  return issues;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups)
  );
}
