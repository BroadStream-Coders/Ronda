"use client";

import { useCallback } from "react";
import { Copy } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ImagePicker, clearSlotImage, setSlotImage } from "@/collector/kit";
import {
  CARD_RATIO,
  PAIRS,
  cardAspect,
  createEmptyCard,
  createEmptyPair,
} from "./schema";
import type { CardMode, CardContent, PairData } from "./schema";

interface Tab1Props {
  pairsData: Record<number, PairData>;
  setPairsData: React.Dispatch<React.SetStateAction<Record<number, PairData>>>;
}

const pairsArray = Array.from({ length: PAIRS }, (_, i) => i + 1);

const MODES: Record<CardMode, string> = {
  image: "Solo Imagen",
  text: "Solo Texto",
  both: "Ambos",
};

export function Tab1({ pairsData, setPairsData }: Tab1Props) {
  const getCardData = useCallback(
    (pairIndex: number, cardSide: "A" | "B"): CardContent => {
      const pair = pairsData[pairIndex];
      if (!pair) return createEmptyCard();
      return (cardSide === "A" ? pair.cartaA : pair.cartaB) || createEmptyCard();
    },
    [pairsData],
  );

  const updateCardContent = useCallback(
    (pairIndex: number, cardSide: "A" | "B", updates: Partial<CardContent>) => {
      setPairsData((prev) => {
        const currentPair = prev[pairIndex] || createEmptyPair();
        const currentCard =
          cardSide === "A" ? currentPair.cartaA : currentPair.cartaB;
        return {
          ...prev,
          [pairIndex]: {
            ...currentPair,
            [cardSide === "A" ? "cartaA" : "cartaB"]: {
              ...currentCard,
              ...updates,
            },
          },
        };
      });
    },
    [setPairsData],
  );

  const renderCardSlot = (pairNum: number, cardSide: "A" | "B") => {
    const cardData = getCardData(pairNum, cardSide);
    const { mode, image, text } = cardData;

    return (
      <div className="flex-1 min-w-0 flex flex-col gap-1.5 p-1.5 bg-muted/30 rounded-lg border border-border/50">
        <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-1 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Carta {cardSide}
          </span>
          <Select
            items={MODES}
            value={mode}
            onValueChange={(val) =>
              updateCardContent(pairNum, cardSide, { mode: val as CardMode })
            }
          >
            <SelectTrigger className="h-7 w-24 text-[9px] border-border bg-card hover:bg-card/80 p-2 py-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MODES).map(([value, label]) => (
                <SelectItem key={value} value={value} className="text-xs">
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          {(mode === "image" || mode === "both") && (
            <ImagePicker
              crop={CARD_RATIO}
              value={image.url}
              sourceUrl={image.sourceUrl}
              placeholder="Subir imagen"
              onChange={(file, url, sourceUrl) =>
                updateCardContent(pairNum, cardSide, {
                  image: setSlotImage(image, file, url, sourceUrl),
                })
              }
              onClear={() =>
                updateCardContent(pairNum, cardSide, {
                  image: clearSlotImage(image),
                })
              }
            />
          )}

          {(mode === "text" || mode === "both") &&
            (mode === "both" ? (
              <Input
                value={text}
                onChange={(e) =>
                  updateCardContent(pairNum, cardSide, { text: e.target.value })
                }
                placeholder="Corto.."
                className="text-xs w-full bg-card h-8 shrink-0"
              />
            ) : (
              <Textarea
                value={text}
                onChange={(e) =>
                  updateCardContent(pairNum, cardSide, { text: e.target.value })
                }
                placeholder="Ingresa el texto aquí..."
                style={cardAspect}
                className="resize-none field-sizing-fixed min-h-0 text-xs w-full bg-card"
              />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col p-6 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-1 pr-2 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {pairsArray.map((pairNum) => (
            <Card
              key={pairNum}
              className="p-3 flex flex-col gap-3 bg-card/40 border-border/80 shadow-sm"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-foreground/90 border-b border-border/50 pb-1.5">
                <Copy className="h-4 w-4 text-primary" />
                Par {pairNum}
              </div>
              <div className="flex gap-2">
                {renderCardSlot(pairNum, "A")}
                {renderCardSlot(pairNum, "B")}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
