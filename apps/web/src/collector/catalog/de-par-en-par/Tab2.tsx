"use client";

import { useState } from "react";
import { Image as ImageIcon, Shuffle, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PairData } from "./schema";

interface Tab2Props {
  boardOrder: string[];
  setBoardOrder: React.Dispatch<React.SetStateAction<string[]>>;
  pairsData: Record<number, PairData>;
}

export function Tab2({ boardOrder, setBoardOrder, pairsData }: Tab2Props) {
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const handleCardClick = (cardId: string) => {
    setSelectedCards((prev) => {
      if (prev.includes(cardId)) return prev.filter((id) => id !== cardId);
      if (prev.length >= 2) return [prev[1], cardId];
      return [...prev, cardId];
    });
  };

  const handleSwap = () => {
    if (selectedCards.length !== 2) return;
    const [id1, id2] = selectedCards;
    setBoardOrder((prev) => {
      const newOrder = [...prev];
      const idx1 = newOrder.indexOf(id1);
      const idx2 = newOrder.indexOf(id2);
      if (idx1 !== -1 && idx2 !== -1) {
        newOrder[idx1] = id2;
        newOrder[idx2] = id1;
      }
      return newOrder;
    });
    setSelectedCards([]);
  };

  const handleShuffle = () => {
    setBoardOrder((prev) => {
      const newOrder = [...prev];
      for (let i = newOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      }
      return newOrder;
    });
    setSelectedCards([]);
  };

  const renderCardVisuals = (cardId: string) => {
    const [pairIdxStr, side] = cardId.split("_");
    const pairIdx = parseInt(pairIdxStr);
    const pair = pairsData[pairIdx + 1];
    if (!pair)
      return (
        <div className="p-2 text-xs text-muted-foreground text-center">
          Vacío
        </div>
      );

    const data = side === "A" ? pair.cartaA : pair.cartaB;
    if (!data) return null;

    return (
      <div className="flex-1 flex flex-col min-h-0 w-full rounded-md overflow-hidden bg-background border border-border/50 justify-center">
        {(data.mode === "image" || data.mode === "both") && (
          <div
            className={`relative flex flex-col items-center justify-center bg-card ${data.mode === "both" ? "flex-1 min-h-0 shrink border-b border-border/40" : "h-full w-full"}`}
          >
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.imageUrl}
                className="w-full h-full object-cover"
                alt="Carta"
              />
            ) : (
              <div className="flex flex-col items-center opacity-30">
                <ImageIcon className="h-6 w-6" />
              </div>
            )}
          </div>
        )}
        {(data.mode === "text" || data.mode === "both") && (
          <div
            className={`flex items-center justify-center p-2 text-center text-xs font-medium text-foreground bg-muted/20 ${data.mode === "both" ? "min-h-[40px] shrink-0" : "h-full w-full"}`}
          >
            <span className="line-clamp-3 leading-snug break-all">
              {data.text || "Sin texto"}
            </span>
          </div>
        )}
      </div>
    );
  };

  let gridColsClass = "grid-cols-4";
  let maxWidthClass = "max-w-5xl";
  let totalCells = boardOrder.length;

  if (boardOrder.length === 16) {
    gridColsClass = "grid-cols-6";
    maxWidthClass = "max-w-[1200px]";
    totalCells = 18;
  } else if (boardOrder.length === 20) {
    gridColsClass = "grid-cols-5";
    maxWidthClass = "max-w-[950px]";
    totalCells = 20;
  } else if (boardOrder.length === 24) {
    gridColsClass = "grid-cols-6";
    maxWidthClass = "max-w-[1100px]";
    totalCells = 24;
  } else if (boardOrder.length === 30) {
    gridColsClass = "grid-cols-8";
    maxWidthClass = "max-w-[1400px]";
    totalCells = 32;
  }

  return (
    <div className="flex h-full flex-col p-6 space-y-4 overflow-hidden">
      <div className="flex items-center justify-between pb-4 border-b border-border">
        <div>
          <h2 className="text-lg font-bold text-foreground">Tablero de juego</h2>
          <p className="text-sm text-muted-foreground">
            Ordena las cartas para el tablero (aleatoriza o intercambia
            manualmente).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShuffle}
            className="gap-2 shrink-0"
          >
            <Shuffle className="h-4 w-4" />
            Aleatorizar
          </Button>
          <Button
            variant={selectedCards.length === 2 ? "default" : "secondary"}
            size="sm"
            onClick={handleSwap}
            disabled={selectedCards.length !== 2}
            className="gap-2 shrink-0"
          >
            <ArrowRightLeft className="h-4 w-4" />
            Intercambiar {selectedCards.length === 1 && "(Falta 1)"}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden pb-4">
        <div className={`grid ${gridColsClass} gap-3 ${maxWidthClass} w-full`}>
          {Array.from({ length: totalCells }).map((_, index) => {
            const cardId = boardOrder[index];

            if (!cardId) {
              return (
                <div
                  key={`empty-${index}`}
                  className="p-2 aspect-square rounded-lg border-2 border-dashed border-border/30 bg-muted/10 flex items-center justify-center"
                >
                  <span className="text-[9px] font-mono text-muted-foreground/30">
                    Vacío
                  </span>
                </div>
              );
            }

            const isSelected = selectedCards.includes(cardId);

            return (
              <div
                key={cardId}
                onClick={() => handleCardClick(cardId)}
                className={`relative p-2 aspect-square rounded-lg border-2 cursor-pointer transition-all flex flex-col gap-1.5 items-center ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/30 scale-105 z-10"
                    : "border-border/60 hover:border-primary/40 hover:bg-muted/50"
                }`}
              >
                <div className="flex w-full items-center justify-between shrink-0 mb-0.5">
                  <span className="text-[9px] font-mono font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {index + 1}
                  </span>
                  <span className="text-[9px] font-bold text-foreground/50 uppercase tracking-wider">
                    Id: {cardId}
                  </span>
                </div>

                {renderCardVisuals(cardId)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
