"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/collector/kit";
import { BoardsSidebar } from "./BoardsSidebar";
import { Grid } from "./Grid";
import { ControlsSidebar } from "./ControlsSidebar";
import {
  MAX_BOARDS,
  buildData,
  fromData,
  isData,
  isValidBoardSize,
  spawnBoard,
  validate,
  type BoardData,
  type BoardSize,
  type Data,
} from "./schema";

export function Editor() {
  const [boards, setBoards] = useState<BoardData[]>(() => [spawnBoard()]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    () => boards[0].id,
  );

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const currentBoardIndex = boards.findIndex((b) => b.id === selectedBoardId);
  const currentBoard =
    currentBoardIndex !== -1 ? boards[currentBoardIndex] : boards[0];

  const handleGetData = useCallback(() => buildData(boards), [boards]);

  const handleSave = useCallback(() => {
    saveAsJson("BuscaLogo.json", handleGetData());
  }, [handleGetData]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<Data>(file, isData);
      const newBoards = fromData(data);
      if (newBoards.length > 0) {
        setBoards(newBoards);
        setSelectedBoardId(newBoards[0].id);
      }
    } catch {
      alert("Archivo de Busca el Logo no válido.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(boards), [boards]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Busca el Logo",
      icon: <Search className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  const handleAddBoard = () => {
    if (boards.length >= MAX_BOARDS) return;
    const newBoard = spawnBoard();
    setBoards((prev) => [...prev, newBoard]);
    setSelectedBoardId(newBoard.id);
  };

  const handleCellClick = (index: number) => {
    if (currentBoardIndex === -1) return;
    const newBoards = [...boards];
    const board = { ...newBoards[currentBoardIndex] };
    board.logoPositions = board.logoPositions.includes(index)
      ? board.logoPositions.filter((i) => i !== index)
      : [...board.logoPositions, index];
    newBoards[currentBoardIndex] = board;
    setBoards(newBoards);
  };

  const handleSizeChange = (size: BoardSize) => {
    if (currentBoardIndex === -1) return;
    const newBoards = [...boards];
    const board = { ...newBoards[currentBoardIndex] };
    const [cols, rows] = size.split("x").map(Number);
    const maxIndex = cols * rows;
    board.size = size;
    board.logoPositions = board.logoPositions.filter((i) => i < maxIndex);
    newBoards[currentBoardIndex] = board;
    setBoards(newBoards);
  };

  const handleRandomFill = (count: number) => {
    if (currentBoardIndex === -1) return;
    const newBoards = [...boards];
    const board = { ...newBoards[currentBoardIndex] };
    const [cols, rows] = board.size.split("x").map(Number);
    const maxIndex = cols * rows;
    const actualCount = Math.min(count, maxIndex);
    const allIndexes = Array.from({ length: maxIndex }, (_, i) => i);
    for (let i = allIndexes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allIndexes[i], allIndexes[j]] = [allIndexes[j], allIndexes[i]];
    }
    board.logoPositions = allIndexes.slice(0, actualCount);
    newBoards[currentBoardIndex] = board;
    setBoards(newBoards);
  };

  if (!currentBoard) return null;

  return (
    <div className="flex h-full flex-col xl:flex-row gap-4 xl:gap-6 p-4 xl:p-6 overflow-hidden">
      <BoardsSidebar
        boards={boards}
        selectedBoardId={selectedBoardId}
        maxBoards={MAX_BOARDS}
        onSelectBoard={setSelectedBoardId}
        onAddBoard={handleAddBoard}
      />

      {isValidBoardSize(currentBoard.size) ? (
        <Grid
          logoPositions={currentBoard.logoPositions}
          boardSize={currentBoard.size}
          onCellClick={handleCellClick}
        />
      ) : (
        <section className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
          Tamaño de tablero no válido
        </section>
      )}

      <ControlsSidebar
        boardSize={currentBoard.size}
        logoCount={currentBoard.logoPositions.length}
        onSizeChange={handleSizeChange}
        onRandomFill={handleRandomFill}
      />
    </div>
  );
}
