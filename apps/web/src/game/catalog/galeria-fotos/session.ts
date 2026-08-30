export interface GaleriaFotosItem {
  imagePath: string;
}

export interface GaleriaFotosGroup {
  title: string;
  items: GaleriaFotosItem[];
}

export interface GaleriaFotosSession {
  groups: GaleriaFotosGroup[];
}

export function isGaleriaFotosSession(
  data: unknown,
): data is GaleriaFotosSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as GaleriaFotosSession;
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
            typeof item.imagePath === "string",
        ),
    )
  );
}
