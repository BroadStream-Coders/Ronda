import type { ImageSlot } from "@/collector/kit";

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
  return { id: uid(), name: "", isIntruso: false };
}

export function createEmptyTextRound(): TextRoundState {
  return {
    id: uid(),
    image: { id: uid(), name: "" },
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
  const files: { name: string; file: File }[] = [];

  const addImage = (file?: File) => {
    if (!file) return "";
    const name = `images/${uid()}_${file.name}`;
    files.push({ name, file });
    return name;
  };

  const data: Data = {
    textRounds: textRounds.map((round) => ({
      imagePath: addImage(round.image.file),
      answerIndex: Math.max(
        0,
        round.options.findIndex((o) => o.isIntruso),
      ),
      choices: round.options.map((o) => o.text.trim()),
    })),
    photoRounds: photoRounds.map((round) => ({
      description: round.context.trim(),
      answerIndex: Math.max(
        0,
        round.photos.findIndex((p) => p.isIntruso),
      ),
      choices: round.photos.map((photo) => ({
        label: photo.name?.trim() || "",
        imagePath: addImage(photo.file),
      })),
    })),
  };

  return { data, files };
}

export function originalFileName(path: string): string {
  const parts = (path.split("/").pop() || path).split("_");
  return parts.length > 1 ? parts.slice(1).join("_") : parts[0];
}
