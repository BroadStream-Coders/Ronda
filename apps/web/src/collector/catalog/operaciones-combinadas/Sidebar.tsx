"use client";

import { Panel, PanelList } from "@/collector/kit";
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
  const boards = selectedRound?.boards ?? [];

  return (
    <Panel title="Estructura" className="w-full shrink-0 lg:w-[260px]">
      <div className="flex min-h-0 flex-1 divide-x divide-border">
        <PanelList
          label="Rondas"
          count={rounds.length}
          max={maxRounds}
          items={rounds.map((r, i) => ({ id: r.id, label: `Ronda ${i + 1}` }))}
          selectedId={selectedRoundId}
          onSelect={onSelectRound}
          onAdd={onAddRound}
          addLabel="Ronda"
          className="w-1/2"
        />
        <PanelList
          label="Tableros"
          count={boards.length}
          max={maxBoards}
          items={boards.map((b, i) => ({ id: b.id, label: `Tablero ${i + 1}` }))}
          selectedId={selectedBoardId}
          onSelect={onSelectBoard}
          onAdd={onAddBoard}
          addLabel="Tablero"
          className="w-1/2"
        />
      </div>
    </Panel>
  );
}
