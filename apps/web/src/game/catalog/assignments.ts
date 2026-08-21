type Assignment = { program: string; games: string[] };

export const assignments: Record<string, Assignment> = {
  "6107dc6b-0663-481a-b919-89a4380c140e": {
    program: "Que Gane El Mejor",
    games: ["deletreo", "calculo-mental"],
  },
  "a379ba63-30eb-4acc-95b4-5080b02c7516": {
    program: "Más Conectados",
    games: ["arma-la-oracion"],
  },
};

export function getProgramGames(programId: string): string[] {
  return assignments[programId]?.games ?? [];
}
