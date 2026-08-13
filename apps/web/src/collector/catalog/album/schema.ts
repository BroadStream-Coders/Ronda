import {
  formatPath,
  isBlank,
  type ImageSlot,
  type ValidationIssue,
} from "@/collector/kit";

export interface AlbumRound {
  id: string;
  context: string;
  photos: ImageSlot[];
}

export interface ExportCard {
  isCroma?: boolean;
  question: string;
  imagePath: string;
}

export interface ExportRound {
  title: string;
  cards: ExportCard[];
}

export interface Data {
  rounds: ExportRound[];
}

export const PHOTOS_PER_ROUND = 5;

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyPhoto(): ImageSlot {
  return { id: uid(), name: "" };
}

export function createEmptyRound(): AlbumRound {
  return {
    id: uid(),
    context: "",
    photos: Array(PHOTOS_PER_ROUND).fill(null).map(createEmptyPhoto),
  };
}

export function validate(rounds: AlbumRound[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  rounds.forEach((round, roundIndex) => {
    const roundLabel = round.context.trim() || `Columna ${roundIndex + 1}`;
    round.photos.forEach((photo, photoIndex) => {
      const cardLabel = `Carta ${photoIndex + 1}`;
      if (isBlank(photo.name)) {
        issues.push({
          path: formatPath(roundLabel, cardLabel, "Pregunta"),
          message: "Falta la pregunta.",
        });
      }
      if (!photo.file && !photo.url) {
        issues.push({
          path: formatPath(roundLabel, cardLabel, "Imagen"),
          message: "Falta la imagen.",
        });
      }
    });
  });
  return issues;
}
