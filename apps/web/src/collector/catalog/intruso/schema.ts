import {
  createImagePacker,
  emptyImageSlot,
  formatPath,
  hasImage,
  isBlank,
  type ImageSlot,
  type ValidationIssue,
} from "@/collector/kit";

export type Photo = ImageSlot & { isIntruso: boolean };

export interface TextOption {
  text: string;
  isIntruso: boolean;
}

export interface TextRoundState {
  id: string;
  image: ImageSlot;
  options: TextOption[];
}

export interface PhotoRoundState {
  id: string;
  context: string;
  photos: Photo[];
}

export interface TextRound {
  imagePath: string;
  answerIndex: number;
  choices: string[];
}

export interface PhotoRound {
  description: string;
  answerIndex: number;
  choices: { label: string; imagePath: string }[];
}

export interface Data {
  textRounds: TextRound[];
  photoRounds: PhotoRound[];
}

export const MAX_OPTIONS = 4;
export const MAX_PHOTOS = 4;
export const TEXT_ROUND_CROP = { x: 21, y: 9 };
export const PHOTO_CROP = { x: 3, y: 4 };
export const SESSION_DATA_FILENAME = "sessionData.json";

export const uid = () => Math.random().toString(36).slice(2, 9);

export function createEmptyPhoto(): Photo {
  return { ...emptyImageSlot(), name: "", isIntruso: false };
}

export function createEmptyTextRound(): TextRoundState {
  return {
    id: uid(),
    image: emptyImageSlot(),
    options: [{ text: "", isIntruso: false }],
  };
}

export function createEmptyPhotoRound(): PhotoRoundState {
  const photos = Array(MAX_PHOTOS).fill(null).map(createEmptyPhoto);
  photos[0].isIntruso = true;
  return { id: uid(), context: "", photos };
}

export function buildData(
  textRounds: TextRoundState[],
  photoRounds: PhotoRoundState[],
): { data: Data; files: { name: string; file: File }[] } {
  const packer = createImagePacker();

  const data: Data = {
    textRounds: textRounds.map((round, roundIndex) => ({
      imagePath: packer.add(round.image, `T${roundIndex + 1}`),
      answerIndex: Math.max(
        0,
        round.options.findIndex((o) => o.isIntruso),
      ),
      choices: round.options.map((o) => o.text.trim()),
    })),
    photoRounds: photoRounds.map((round, roundIndex) => ({
      description: round.context.trim(),
      answerIndex: Math.max(
        0,
        round.photos.findIndex((p) => p.isIntruso),
      ),
      choices: round.photos.map((photo, photoIndex) => ({
        label: photo.name?.trim() || "",
        imagePath: packer.add(
          photo,
          `P${roundIndex + 1}`,
          `I${photoIndex + 1}`,
        ),
      })),
    })),
  };

  return { data, files: packer.files };
}

export function validate(textRounds: TextRoundState[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  textRounds.forEach((round, roundIndex) => {
    const roundLabel = formatPath("Nivel 1", `Ronda ${roundIndex + 1}`);

    if (!hasImage(round.image)) {
      issues.push({
        path: formatPath(roundLabel, "Imagen"),
        message: "Falta la imagen.",
      });
    }

    round.options.forEach((option, optionIndex) => {
      if (isBlank(option.text)) {
        issues.push({
          path: formatPath(roundLabel, `Opción ${optionIndex + 1}`),
          message: "Falta el texto de la opción.",
        });
      }
    });

    if (!round.options.some((option) => option.isIntruso)) {
      issues.push({ path: roundLabel, message: "No hay un intruso marcado." });
    }
  });

  return issues;
}
