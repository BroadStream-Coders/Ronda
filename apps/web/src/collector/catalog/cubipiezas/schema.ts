import {
  createImagePacker,
  emptyImageSlot,
  formatPath,
  hasImage,
  isBlank,
  type ImageSlot,
  type ValidationIssue,
} from "@/collector/kit";

export interface QuestionState {
  question: string;
  answer: string;
}

export interface RoundState {
  id: string;
  image: ImageSlot;
  questions: QuestionState[];
}

export interface Question {
  question: string;
  answer: string;
}

export interface Round {
  imagePath: string;
  questions: Question[];
}

export interface Data {
  rounds: Round[];
}

export const QUESTIONS_PER_ROUND = 8;
export const IMAGE_CROP = { x: 1376, y: 692 };
export const SESSION_DATA_FILENAME = "sessionData.json";

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyQuestion(): QuestionState {
  return { question: "", answer: "" };
}

export function fitQuestions(questions: QuestionState[]): QuestionState[] {
  const fitted = questions.slice(0, QUESTIONS_PER_ROUND);
  while (fitted.length < QUESTIONS_PER_ROUND) fitted.push(createEmptyQuestion());
  return fitted;
}

export function createEmptyRound(): RoundState {
  return { id: uid(), image: emptyImageSlot(), questions: fitQuestions([]) };
}

export function buildData(rounds: RoundState[]): {
  data: Data;
  files: { name: string; file: File }[];
} {
  const packer = createImagePacker();

  const data: Data = {
    rounds: rounds.map((round, roundIndex) => ({
      imagePath: packer.add(round.image, `R${roundIndex + 1}`),
      questions: round.questions.map((q) => ({
        question: q.question.trim(),
        answer: q.answer.trim(),
      })),
    })),
  };

  return { data, files: packer.files };
}

export function validate(rounds: RoundState[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (rounds.length === 0) {
    issues.push({ path: "Rondas", message: "Agrega al menos una ronda." });
  }

  rounds.forEach((round, roundIndex) => {
    const roundLabel = `Ronda ${roundIndex + 1}`;

    if (!hasImage(round.image)) {
      issues.push({
        path: formatPath(roundLabel, "Imagen"),
        message: "Falta la imagen.",
      });
    }

    round.questions.forEach((q, questionIndex) => {
      const questionLabel = formatPath(roundLabel, `Pregunta ${questionIndex + 1}`);
      if (isBlank(q.question)) {
        issues.push({
          path: formatPath(questionLabel, "Enunciado"),
          message: "Falta el enunciado.",
        });
      }
      if (isBlank(q.answer)) {
        issues.push({
          path: formatPath(questionLabel, "Respuesta"),
          message: "Falta la respuesta.",
        });
      }
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
        typeof r.imagePath === "string" &&
        Array.isArray(r.questions) &&
        r.questions.length === QUESTIONS_PER_ROUND,
    )
  );
}
