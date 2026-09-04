import {
  emptyImageSlot,
  formatPath,
  hasImage,
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
export const ROUND_COUNT = 6;

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyPhoto(): ImageSlot {
  return { ...emptyImageSlot(), name: "" };
}

export function createEmptyRound(): AlbumRound {
  return {
    id: uid(),
    context: "",
    photos: fitPhotos([]),
  };
}

function fitTo<T>(items: T[], length: number, make: () => T): T[] {
  const fitted = items.slice(0, length);
  while (fitted.length < length) fitted.push(make());
  return fitted;
}

export function fitPhotos(photos: ImageSlot[]): ImageSlot[] {
  return fitTo(photos, PHOTOS_PER_ROUND, createEmptyPhoto);
}

export function fitRounds(rounds: AlbumRound[]): AlbumRound[] {
  return fitTo(rounds, ROUND_COUNT, createEmptyRound);
}

export function validate(rounds: AlbumRound[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  rounds.forEach((round, roundIndex) => {
    const roundLabel = `Sobre ${roundIndex + 1}`;
    if (isBlank(round.context)) {
      issues.push({
        path: formatPath(roundLabel, "Título"),
        message: "Falta el título.",
      });
    }
    round.photos.forEach((photo, photoIndex) => {
      const cardLabel = `Carta ${photoIndex + 1}`;
      if (isBlank(photo.name)) {
        issues.push({
          path: formatPath(roundLabel, cardLabel, "Pregunta"),
          message: "Falta la pregunta.",
        });
      }
      if (!hasImage(photo)) {
        issues.push({
          path: formatPath(roundLabel, cardLabel, "Imagen"),
          message: "Falta la imagen.",
        });
      }
    });
  });
  return issues;
}
