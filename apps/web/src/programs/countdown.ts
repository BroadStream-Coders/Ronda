const countdowns: Record<string, string> = {
  "6107dc6b-0663-481a-b919-89a4380c140e":
    "/programs/que-gane-el-mejor/shared/audio/countdown.mp3",
};

export function countdownFor(programId: string): string | null {
  return countdowns[programId] ?? null;
}
