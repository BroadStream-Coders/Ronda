export interface CronosItem {
  date: string;
  title: string;
  imagePath: string;
}

export interface CronosGroup {
  title: string;
  items: CronosItem[];
}

export interface CronosSession {
  groups: CronosGroup[];
}

export function isCronosSession(data: unknown): data is CronosSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as CronosSession;
  return (
    Array.isArray(candidate.groups) &&
    candidate.groups.every(
      (group) =>
        typeof group === "object" &&
        group !== null &&
        typeof group.title === "string" &&
        Array.isArray(group.items) &&
        group.items.every(
          (item) =>
            typeof item === "object" &&
            item !== null &&
            typeof item.date === "string" &&
            typeof item.title === "string" &&
            typeof item.imagePath === "string",
        ),
    )
  );
}
