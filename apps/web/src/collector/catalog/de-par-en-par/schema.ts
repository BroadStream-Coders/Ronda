import { formatPath, isBlank, type ValidationIssue } from "@/collector/kit";

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

export function validate(
  numPairs: number,
  pairsData: Record<number, PairData>,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  const checkCard = (
    card: CardContent | undefined,
    pairLabel: string,
    side: "A" | "B",
  ) => {
    const cardLabel = formatPath(pairLabel, `Carta ${side}`);
    const mode = card?.mode ?? "image";

    if ((mode === "text" || mode === "both") && isBlank(card?.text)) {
      issues.push({
        path: formatPath(cardLabel, "Texto"),
        message: "Falta el texto.",
      });
    }
    if ((mode === "image" || mode === "both") && !card?.imageFile) {
      issues.push({
        path: formatPath(cardLabel, "Imagen"),
        message: "Falta la imagen.",
      });
    }
  };

  for (let i = 0; i < numPairs; i++) {
    const pair = pairsData[i + 1];
    const pairLabel = `Par ${i + 1}`;
    checkCard(pair?.cartaA, pairLabel, "A");
    checkCard(pair?.cartaB, pairLabel, "B");
  }

  return issues;
}
