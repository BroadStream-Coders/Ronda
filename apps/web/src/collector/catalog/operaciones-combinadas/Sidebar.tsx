"use client";

import { Plus } from "lucide-react";
import type { RoundData } from "./schema";

interface SidebarProps {
  rounds: RoundData[];
  selectedRoundId: string;
  selectedBoardId: string;
  maxRounds: number;
  maxBoards: number;
  onSelectRound: (id: string) => void;
  onSelectBoard: (id: string) => void;
  onAddRound: () => void;
  onAddBoard: () => void;
}

export function Sidebar({
  rounds,
  selectedRoundId,
  selectedBoardId,
  maxRounds,
  maxBoards,
  onSelectRound,
  onSelectBoard,
  onAddRound,
  onAddBoard,
}: SidebarProps) {
  const selectedRound = rounds.find((r) => r.id === selectedRoundId);
  const boardsLength = selectedRound?.boards.length || 0;

  return (
    <section className="w-full lg:w-[240px] shrink-0 flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="flex-none bg-muted px-4 py-3 border-b border-border h-12 flex items-center justify-center">
        <h2 className="text-sm font-bold text-foreground">Estructura</h2>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 flex flex-col border-r border-border overflow-hidden bg-background/50">
          <div className="flex-none flex flex-col items-center bg-muted/50 p-2 border-b border-border text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Rondas
            </span>
            <span className="text-[10px] font-mono text-muted-foreground opacity-60 mt-0.5">
              {rounds.length} / {maxRounds}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {rounds.map((r, i) => {
              const isSelected = r.id === selectedRoundId;
              return (
                <button
                  key={r.id}
                  onClick={() => onSelectRound(r.id)}
                  className={`w-full text-left px-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 ring-1 ring-primary-foreground/20"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>Ronda {i + 1}</span>
                    {isSelected && <span className="text-xs opacity-80">›</span>}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t border-border shrink-0 bg-card">
            <button
              onClick={onAddRound}
              disabled={rounds.length >= maxRounds}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary py-2 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" /> Añadir
            </button>
          </div>
        </div>

        <div className="w-1/2 flex flex-col overflow-hidden bg-background">
          <div className="flex-none flex flex-col items-center bg-muted/50 p-2 border-b border-border text-center">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Tableros
            </span>
            <span className="text-[10px] font-mono text-muted-foreground opacity-60 mt-0.5">
              {boardsLength} / {maxBoards}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {selectedRound?.boards.map((b, i) => {
              const isSelected = b.id === selectedBoardId;
              return (
                <button
                  key={b.id}
                  onClick={() => onSelectBoard(b.id)}
                  className={`w-full text-left px-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-sm"
                      : "border border-transparent hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tablero {i + 1}
                </button>
              );
            })}
          </div>
          <div className="p-2 border-t border-border shrink-0 bg-card">
            <button
              onClick={onAddBoard}
              disabled={!selectedRound || boardsLength >= maxBoards}
              className="w-full flex items-center justify-center gap-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary py-2 text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-3 w-3" /> Añadir
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
