export type CardMode = "image" | "text" | "both";

export interface CardContent {
  mode: CardMode;
  imageFile?: File;
  imageUrl?: string;
  text: string;
}

export interface PairData {
  cartaA: CardContent;
  cartaB: CardContent;
}

interface ExportCard {
  type: number;
  text: string;
  pictureFile: string;
}

export interface Data {
  cells: { cardA: ExportCard; cardB: ExportCard }[];
  answer: string[];
}

export const DEFAULT_PAIRS = 8;

export function initialBoardOrder(numPairs: number): string[] {
  const order: string[] = [];
  for (let i = 0; i < numPairs; i++) order.push(`${i}_A`, `${i}_B`);
  return order;
}
