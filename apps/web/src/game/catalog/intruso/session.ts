export const MAX_CHOICES = 4;

export interface IntrusoTextRound {
  imagePath: string;
  answerIndex: number;
  choices: string[];
}

export interface IntrusoPhotoChoice {
  label: string;
  imagePath: string;
}

export interface IntrusoPhotoRound {
  description: string;
  answerIndex: number;
  choices: IntrusoPhotoChoice[];
}

export interface IntrusoSession {
  textRounds: IntrusoTextRound[];
  photoRounds: IntrusoPhotoRound[];
}

function isTextRound(round: unknown): round is IntrusoTextRound {
  if (typeof round !== "object" || round === null) return false;
  const candidate = round as IntrusoTextRound;
  return (
    typeof candidate.imagePath === "string" &&
    typeof candidate.answerIndex === "number" &&
    Array.isArray(candidate.choices) &&
    candidate.choices.length <= MAX_CHOICES &&
    candidate.choices.every((choice) => typeof choice === "string")
  );
}

function isPhotoRound(round: unknown): round is IntrusoPhotoRound {
  if (typeof round !== "object" || round === null) return false;
  const candidate = round as IntrusoPhotoRound;
  return (
    typeof candidate.description === "string" &&
    typeof candidate.answerIndex === "number" &&
    Array.isArray(candidate.choices) &&
    candidate.choices.length <= MAX_CHOICES &&
    candidate.choices.every(
      (choice) =>
        typeof choice === "object" &&
        choice !== null &&
        typeof choice.label === "string" &&
        typeof choice.imagePath === "string",
    )
  );
}

export function isIntrusoSession(data: unknown): data is IntrusoSession {
  if (typeof data !== "object" || data === null) return false;
  const candidate = data as IntrusoSession;
  return (
    Array.isArray(candidate.textRounds) &&
    candidate.textRounds.every(isTextRound) &&
    Array.isArray(candidate.photoRounds) &&
    candidate.photoRounds.every(isPhotoRound)
  );
}
