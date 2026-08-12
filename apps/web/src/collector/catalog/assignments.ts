type Assignment = { program: string; collectors: string[] };

export const assignments: Record<string, Assignment> = {
  "6107dc6b-0663-481a-b919-89a4380c140e": {
    program: "Que Gane El Mejor",
    collectors: [
      "deletreo",
      "calculo-mental",
      "si-o-no",
      "la-sabes-o-no",
      "mi-libro-favorito",
      "busca-logo",
      "album",
    ],
  },
  "a379ba63-30eb-4acc-95b4-5080b02c7516": {
    program: "Más Conectados",
    collectors: ["deletreo"],
  },
};

export function getProgramCollectors(programId: string): string[] {
  return assignments[programId]?.collectors ?? [];
}
