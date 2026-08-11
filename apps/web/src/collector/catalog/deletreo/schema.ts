export interface Data {
  groups: { words: string[] }[];
}

export function buildData(groups: string[][]): Data {
  return { groups: groups.map((words) => ({ words })) };
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    "groups" in data &&
    Array.isArray((data as Data).groups) &&
    (data as Data).groups.every((g) => g != null && Array.isArray(g.words))
  );
}
