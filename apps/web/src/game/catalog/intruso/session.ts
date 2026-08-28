export interface IntrusoRound {
  imagePath: string;
  answerIndex: number;
  choices: string[];
}

export interface IntrusoSession {
  textRounds: IntrusoRound[];
}

export function isIntrusoSession(data: unknown): data is IntrusoSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as IntrusoSession;
  return (
    Array.isArray(candidate.textRounds) &&
    candidate.textRounds.every(
      (round) =>
        typeof round === "object" &&
        round !== null &&
        typeof round.imagePath === "string" &&
        typeof round.answerIndex === "number" &&
        Array.isArray(round.choices) &&
        round.choices.length === 4 &&
        round.choices.every((choice) => typeof choice === "string"),
    )
  );
}
