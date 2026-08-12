import type { ImageSlot } from "@/collector/kit";

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
