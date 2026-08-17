"use client";

import { Panel, PanelList } from "@/collector/kit";
import type { BoardData } from "./schema";

interface BoardsSidebarProps {
  boards: BoardData[];
  selectedBoardId: string;
  maxBoards: number;
  onSelectBoard: (id: string) => void;
  onAddBoard: () => void;
}

export function BoardsSidebar({
  boards,
  selectedBoardId,
  maxBoards,
  onSelectBoard,
  onAddBoard,
}: BoardsSidebarProps) {
  return (
    <Panel title="Tableros" className="w-full shrink-0 lg:w-[220px]">
      <PanelList
        label="Del juego"
        count={boards.length}
        max={maxBoards}
        items={boards.map((b, i) => ({ id: b.id, label: `Tablero ${i + 1}` }))}
        selectedId={selectedBoardId}
        onSelect={onSelectBoard}
        onAdd={onAddBoard}
        addLabel="Agregar tablero"
      />
    </Panel>
  );
}
