import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

export interface RoundState {
  id: string;
  letters: string;
  words: string[];
}

export interface Data {
  rounds: { boards: { letters: string[]; hiddenWords: string[] }[] }[];
}

export const MIN_LETTERS = 3;
export const MAX_LETTERS = 7;
export const MAX_WORDS = 5;
export const MIN_WORD_LENGTH = 3;

export const uid = () => Math.random().toString(36).slice(2, 9);

export function toLetters(value: string): string {
  return value
    .toUpperCase()
    .replace(/Ñ/g, "\0")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\0/g, "Ñ")
    .replace(/[^A-ZÑ]/g, "");
}

export function createEmptyRound(): RoundState {
  return { id: uid(), letters: "", words: [""] };
}

function countLetters(value: string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const letter of value) counts.set(letter, (counts.get(letter) ?? 0) + 1);
  return counts;
}

export function wordProblem(word: string, letters: string): string | null {
  if (word === "") return null;
  if (word.length < MIN_WORD_LENGTH) {
    return `Debe tener al menos ${MIN_WORD_LENGTH} letras.`;
  }
  if (word.length > MAX_LETTERS) {
    return `No puede tener más de ${MAX_LETTERS} letras.`;
  }
  const available = countLetters(letters);
  for (const [letter, need] of countLetters(word)) {
    const have = available.get(letter) ?? 0;
    if (need > have) {
      return have === 0
        ? `Usa la ${letter}, que no está en las letras.`
        : `Necesita ${need} ${letter} y las letras solo tienen ${have}.`;
    }
  }
  return null;
}

export function buildData(rounds: RoundState[]): Data {
  return {
    rounds: rounds.map((round) => ({
      boards: [
        {
          letters: [...round.letters],
          hiddenWords: round.words.filter((w) => w !== ""),
        },
      ],
    })),
  };
}

export function fromData(data: Data): RoundState[] {
  const rounds = data.rounds.map((round) => {
    const board = round.boards[0];
    const words = (board?.hiddenWords ?? []).map(toLetters).slice(0, MAX_WORDS);
    return {
      id: uid(),
      letters: toLetters((board?.letters ?? []).join("")),
      words: words.length > 0 ? words : [""],
    };
  });
  return rounds.length > 0 ? rounds : [createEmptyRound()];
}

export function validate(rounds: RoundState[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (rounds.length === 0) {
    issues.push({ path: "Rondas", message: "Agrega al menos una ronda." });
  }

  rounds.forEach((round, roundIndex) => {
    const roundLabel = `Ronda ${roundIndex + 1}`;
    const lettersLabel = formatPath(roundLabel, "Letras");

    if (round.letters.length < MIN_LETTERS) {
      issues.push({
        path: lettersLabel,
        message: `Debe tener al menos ${MIN_LETTERS} letras.`,
      });
    } else if (round.letters.length > MAX_LETTERS) {
      issues.push({
        path: lettersLabel,
        message: `No puede tener más de ${MAX_LETTERS} letras.`,
      });
    }

    if (round.words.every(isBlank)) {
      issues.push({
        path: roundLabel,
        message: "Agrega al menos una palabra oculta.",
      });
      return;
    }
    if (round.words.length > MAX_WORDS) {
      issues.push({
        path: roundLabel,
        message: `No puede tener más de ${MAX_WORDS} palabras ocultas.`,
      });
    }

    const seen = new Set<string>();
    round.words.forEach((word, wordIndex) => {
      const wordLabel = formatPath(roundLabel, `Palabra ${wordIndex + 1}`);
      if (isBlank(word)) {
        issues.push({ path: wordLabel, message: "Falta la palabra." });
        return;
      }
      const problem = wordProblem(word, round.letters);
      if (problem) {
        issues.push({ path: wordLabel, message: `"${word}": ${problem}` });
      }
      if (seen.has(word)) {
        issues.push({ path: wordLabel, message: `"${word}" está repetida.` });
      }
      seen.add(word);
    });
  });

  return issues;
}

export function isData(data: unknown): data is Data {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray((data as Data).rounds) &&
    (data as Data).rounds.every(
      (r) =>
        r != null &&
        Array.isArray(r.boards) &&
        r.boards.length > 0 &&
        Array.isArray(r.boards[0]?.letters) &&
        Array.isArray(r.boards[0]?.hiddenWords),
    )
  );
}
