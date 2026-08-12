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

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups)
  );
}
