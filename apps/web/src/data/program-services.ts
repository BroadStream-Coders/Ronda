type ProgramServices = {
  name: string;
  collectors?: string[];
  games?: string[];
  host?: string[];
};

export type ServiceId = Exclude<keyof ProgramServices, "name">;

export const programServices: Record<string, ProgramServices> = {
  "6107dc6b-0663-481a-b919-89a4380c140e": {
    name: "Que Gane El Mejor",
    collectors: [
      "deletreo",
      "calculo-mental",
      "si-o-no",
      "la-sabes-o-no",
      "mi-libro-favorito",
      "busca-logo",
      "album",
      "cronos",
      "operaciones-combinadas",
      "reto-cruzado",
      "intruso",
      "galeria-fotos",
      "tres-en-raya",
    ],
    games: ["deletreo", "calculo-mental", "la-sabes-o-no", "mi-libro-favorito"],
    host: ["deletreo", "calculo-mental", "la-sabes-o-no"],
  },
  "a379ba63-30eb-4acc-95b4-5080b02c7516": {
    name: "Más Conectados",
    collectors: ["de-par-en-par", "arma-la-palabra", "arma-la-oracion"],
    games: ["arma-la-palabra", "arma-la-oracion"],
  },
};

export function hasService(programId: string, service: ServiceId): boolean {
  return programServices[programId]?.[service] !== undefined;
}

export function getProgramCollectors(programId: string): string[] {
  return programServices[programId]?.collectors ?? [];
}

export function getProgramGames(programId: string): string[] {
  return programServices[programId]?.games ?? [];
}

export function getProgramHostGames(programId: string): string[] {
  return programServices[programId]?.host ?? [];
}
