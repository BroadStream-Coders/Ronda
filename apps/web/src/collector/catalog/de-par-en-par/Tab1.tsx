"use client";

import { useCallback } from "react";
import { Copy, Image as ImageIcon, Trash2 } from "lucide-react";
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
import type { CardMode, CardContent, PairData } from "./schema";

const OPTIONS = [
  { value: "8", label: "16 cartas (8 pares)" },
  { value: "10", label: "20 cartas (10 pares)" },
  { value: "12", label: "24 cartas (12 pares)" },
  { value: "15", label: "30 cartas (15 pares)" },
];

interface Tab1Props {
  numPairs: number;
  setNumPairs: (n: number) => void;
  pairsData: Record<number, PairData>;
  setPairsData: React.Dispatch<React.SetStateAction<Record<number, PairData>>>;
}

export function Tab1({
  numPairs,
  setNumPairs,
  pairsData,
  setPairsData,
}: Tab1Props) {
  const pairsArray = Array.from({ length: numPairs }, (_, i) => i + 1);

  const getCardData = useCallback(
    (pairIndex: number, cardSide: "A" | "B"): CardContent => {
      const pair = pairsData[pairIndex];
      const defaultContent: CardContent = { mode: "image", text: "" };
      if (!pair) return defaultContent;
      return cardSide === "A"
        ? pair.cartaA || defaultContent
        : pair.cartaB || defaultContent;
    },
    [pairsData],
  );

  const updateCardContent = useCallback(
    (pairIndex: number, cardSide: "A" | "B", updates: Partial<CardContent>) => {
      setPairsData((prev) => {
        const currentPair = prev[pairIndex] || {
          cartaA: { mode: "image", text: "" },
          cartaB: { mode: "image", text: "" },
        };
        const currentCard =
          cardSide === "A" ? currentPair.cartaA : currentPair.cartaB;
        const newContent = { ...currentCard, ...updates };
        return {
          ...prev,
          [pairIndex]: {
            ...currentPair,
            [cardSide === "A" ? "cartaA" : "cartaB"]: newContent,
          },
        };
      });
    },
    [setPairsData],
  );

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    pairIndex: number,
    cardSide: "A" | "B",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      updateCardContent(pairIndex, cardSide, { imageFile: file, imageUrl });
    }
    e.target.value = "";
  };

  const removeImage = (pairIndex: number, cardSide: "A" | "B") => {
    const cardData = getCardData(pairIndex, cardSide);
    if (cardData.imageUrl) URL.revokeObjectURL(cardData.imageUrl);
    updateCardContent(pairIndex, cardSide, {
      imageFile: undefined,
      imageUrl: undefined,
    });
  };

  const renderCardSlot = (pairNum: number, cardSide: "A" | "B") => {
    const cardData = getCardData(pairNum, cardSide);
    const { mode, imageUrl, text } = cardData;

    return (
      <div className="flex-1 flex flex-col gap-1.5 p-1.5 bg-muted/30 rounded-lg border border-border/50 aspect-4/5">
        <div className="flex flex-col 2xl:flex-row items-start 2xl:items-center justify-between gap-1 shrink-0">
          <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground ml-1">
            Carta {cardSide}
          </span>
          <Select
            value={mode}
            onValueChange={(val) =>
              updateCardContent(pairNum, cardSide, { mode: val as CardMode })
            }
          >
            <SelectTrigger className="h-7 w-24 text-[9px] border-border bg-card hover:bg-card/80 p-2 py-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="image" className="text-xs">
                Solo Imagen
              </SelectItem>
              <SelectItem value="text" className="text-xs">
                Solo Texto
              </SelectItem>
              <SelectItem value="both" className="text-xs">
                Ambos
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 flex flex-col gap-2 min-h-0">
          {(mode === "image" || mode === "both") && (
            <div
              className={`relative flex-1 min-h-0 rounded-md border-2 border-dashed overflow-hidden flex flex-col items-center justify-center transition-colors ${
                imageUrl
                  ? "border-transparent bg-transparent"
                  : "border-border/60 hover:border-primary/50 hover:bg-primary/5 cursor-pointer group bg-card"
              }`}
            >
              {imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt={`Carta ${cardSide}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removeImage(pairNum, cardSide)}
                    className="absolute top-1 right-1 p-1 bg-destructive/90 hover:bg-destructive text-destructive-foreground rounded-md shadow-sm transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Eliminar imagen"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                    <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <span className="text-[9px] mt-2 font-medium text-muted-foreground group-hover:text-primary px-2 text-center">
                    Subir imagen
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, pairNum, cardSide)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </>
              )}
            </div>
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
                className="resize-none text-xs w-full bg-card flex-1 min-h-0"
              />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col p-6 space-y-6 overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Configuración de pares
          </h2>
          <p className="text-sm text-muted-foreground">
            Personaliza el contenido de cada carta. Puedes usar imágenes, texto
            o ambos.
          </p>
        </div>
        <div className="w-[280px]">
          <Select
            value={numPairs.toString()}
            onValueChange={(val) => val && setNumPairs(parseInt(val))}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-12">
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
              <div className="flex gap-2 min-h-[140px]">
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
