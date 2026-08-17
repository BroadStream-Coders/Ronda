"use client";

import { useCallback, useEffect, useState } from "react";
import { Sigma } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/collector/kit";
import { Sidebar } from "./Sidebar";
import { Grid, type PreviewCell } from "./Grid";
import { List } from "./List";
import {
  GRID_SIZE,
  MAX_BOARDS,
  MAX_OPERATIONS,
  MAX_ROUNDS,
  buildData,
  createEmptyGrid,
  fromData,
  isData,
  spawnBoard,
  spawnRound,
  uid,
  validate,
  type BoardData,
  type Direction,
  type ExportedData,
  type Operation,
  type RoundData,
} from "./schema";

export function Editor() {
  const [rounds, setRounds] = useState<RoundData[]>(() => [spawnRound()]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>(
    () => rounds[0].id,
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string>(
    () => rounds[0].boards[0].id,
  );
  const [selectedOperationId, setSelectedOperationId] = useState<string | null>(
    null,
  );
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(
    null,
  );

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const currentRoundIndex = rounds.findIndex((r) => r.id === selectedRoundId);
  const currentRound =
    currentRoundIndex !== -1 ? rounds[currentRoundIndex] : rounds[0];

  const currentBoardIndex = currentRound
    ? currentRound.boards.findIndex((b) => b.id === selectedBoardId)
    : -1;
  const currentBoard =
    currentRound && currentBoardIndex !== -1
      ? currentRound.boards[currentBoardIndex]
      : currentRound?.boards[0];

  const handleGetData = useCallback(() => buildData(rounds), [rounds]);

  const handleSave = useCallback(() => {
    saveAsJson("OperacionesCombinadas.json", handleGetData());
  }, [handleGetData]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<ExportedData>(file, isData);
      const newRounds = fromData(data);
      if (newRounds.length > 0) {
        setRounds(newRounds);
        setSelectedRoundId(newRounds[0].id);
        setSelectedBoardId(newRounds[0].boards[0]?.id || "");
        setSelectedOperationId(null);
        setHoverCell(null);
      }
    } catch {
      alert("Archivo de Operaciones Combinadas no válido.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Operaciones Combinadas",
      icon: <Sigma className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  const handleAddRound = () => {
    if (rounds.length >= MAX_ROUNDS) return;
    const newRound = spawnRound();
    setRounds((prev) => [...prev, newRound]);
    setSelectedRoundId(newRound.id);
    setSelectedBoardId(newRound.boards[0].id);
  };

  const handleAddBoard = () => {
    if (!currentRound || currentRound.boards.length >= MAX_BOARDS) return;
    const newBoard = spawnBoard();
    const updatedRounds = [...rounds];
    updatedRounds[currentRoundIndex] = {
      ...currentRound,
      boards: [...currentRound.boards, newBoard],
    };
    setRounds(updatedRounds);
    setSelectedBoardId(newBoard.id);
  };

  const handleSelectRound = (id: string) => {
    setSelectedRoundId(id);
    const round = rounds.find((r) => r.id === id);
    if (round && round.boards.length > 0) setSelectedBoardId(round.boards[0].id);
    setSelectedOperationId(null);
  };

  const handleSelectBoard = (id: string) => {
    setSelectedBoardId(id);
    setSelectedOperationId(null);
  };

  const updateCurrentBoard = (updatedBoard: BoardData) => {
    if (currentRoundIndex === -1 || currentBoardIndex === -1) return;
    const updatedRounds = [...rounds];
    const newBoards = [...currentRound.boards];
    newBoards[currentBoardIndex] = updatedBoard;
    updatedRounds[currentRoundIndex] = { ...currentRound, boards: newBoards };
    setRounds(updatedRounds);
  };

  const handleGridCellClick = (rowIndex: number, colIndex: number) => {
    if (!currentBoard) return;
    if (!selectedOperationId) return;

    const operationIndex = currentBoard.operations.findIndex(
      (o) => o.id === selectedOperationId,
    );
    if (operationIndex === -1) return;

    const operation = currentBoard.operations[operationIndex];
    const text = operation.text.trim();
    if (!text) {
      alert("La operación está vacía. Escribe algo como '15+12=27' primero.");
      return;
    }

    const values = text.match(/\d+|[+\-*/=]/g);
    const joinedValues = values ? values.join("") : "";
    if (!values || joinedValues.length !== text.replace(/\s+/g, "").length) {
      alert(
        "Formato de operación no válido. Usa números y operadores (+, -, *, /, =).",
      );
      return;
    }

    const isHorizontal = operation.direction === "H";
    const dirX = isHorizontal ? 1 : 0;
    const dirY = isHorizontal ? 0 : 1;

    if (
      colIndex + values.length * dirX > GRID_SIZE ||
      rowIndex + values.length * dirY > GRID_SIZE
    ) {
      alert("La operación no cabe en el tablero iniciando en esta posición.");
      return;
    }

    const mockGrid = createEmptyGrid();
    currentBoard.operations.forEach((op) => {
      if (op.sequence && op.id !== operation.id) {
        op.sequence.values.forEach((v, i) => {
          const cx = op.sequence!.position.x + i * op.sequence!.direction.x;
          const cy = op.sequence!.position.y + i * op.sequence!.direction.y;
          mockGrid[cy][cx] = v;
        });
      }
    });

    let overlapsConflict = false;
    for (let i = 0; i < values.length; i++) {
      const cx = colIndex + i * dirX;
      const cy = rowIndex + i * dirY;
      const existingVal = mockGrid[cy][cx];
      if (existingVal && existingVal !== values[i]) {
        overlapsConflict = true;
        break;
      }
    }
    if (overlapsConflict) {
      alert("Hay un cruce conflictivo. Un carácter distinto ya ocupa esa celda.");
      return;
    }

    const newOp: Operation = {
      ...operation,
      sequence: {
        values,
        position: { x: colIndex, y: rowIndex },
        direction: { x: dirX, y: dirY },
      },
    };

    const newOperations = [...currentBoard.operations];
    newOperations[operationIndex] = newOp;
    updateCurrentBoard({ ...currentBoard, operations: newOperations });
    setSelectedOperationId(null);
    setHoverCell(null);
  };

  const handleGridCellDoubleClick = (rowIndex: number, colIndex: number) => {
    if (!currentBoard || selectedOperationId) return;

    let toggled = false;
    const newOperations = currentBoard.operations.map((op) => {
      if (op.sequence) {
        const { position, direction, values } = op.sequence;
        let intersectingIndex = -1;
        if (
          direction.x === 1 &&
          position.y === rowIndex &&
          colIndex >= position.x &&
          colIndex < position.x + values.length
        ) {
          intersectingIndex = colIndex - position.x;
        } else if (
          direction.y === 1 &&
          position.x === colIndex &&
          rowIndex >= position.y &&
          rowIndex < position.y + values.length
        ) {
          intersectingIndex = rowIndex - position.y;
        }
        if (intersectingIndex !== -1) {
          const hidden = op.sequence.hiddenIndexes || [];
          const newHidden = hidden.includes(intersectingIndex)
            ? hidden.filter((i) => i !== intersectingIndex)
            : [...hidden, intersectingIndex];
          toggled = true;
          return { ...op, sequence: { ...op.sequence, hiddenIndexes: newHidden } };
        }
      }
      return op;
    });

    if (toggled) updateCurrentBoard({ ...currentBoard, operations: newOperations });
  };

  const handleCellHover = (row: number, col: number) => {
    if (selectedOperationId) setHoverCell({ row, col });
  };
  const handleCellLeave = () => setHoverCell(null);

  const handleAddOperation = () => {
    if (!currentBoard || currentBoard.operations.length >= MAX_OPERATIONS) return;
    updateCurrentBoard({
      ...currentBoard,
      operations: [
        ...currentBoard.operations,
        { id: uid(), text: "", direction: "H" },
      ],
    });
  };

  const handleQuickLoad = (matrix: string[][]) => {
    if (!currentBoard) return;

    let isListMode = true;
    for (const row of matrix) {
      if (row.filter(Boolean).length > 1) {
        isListMode = false;
        break;
      }
    }

    if (isListMode) {
      const availableSlots = MAX_OPERATIONS - currentBoard.operations.length;
      if (availableSlots <= 0) {
        alert("No hay más espacio para agregar operaciones en este tablero.");
        return;
      }
      const lines = matrix.flatMap((row) => {
        const line = row.join("\t").trim();
        return line ? [line] : [];
      });
      const toAdd = lines.slice(0, availableSlots).map((line) => ({
        id: uid(),
        text: line,
        direction: "H" as const,
      }));
      updateCurrentBoard({
        ...currentBoard,
        operations: [...currentBoard.operations, ...toAdd],
      });
      setSelectedOperationId(null);
      setHoverCell(null);
      return;
    }

    const newOperations: Operation[] = [];

    const getNorm = (y: number, x: number) => {
      if (y >= matrix.length || x >= matrix[y].length) return "";
      const val = matrix[y][x].trim();
      return val.replace(/^\((.+)\)$/, "$1");
    };

    const pushRun = (
      values: string[],
      startX: number,
      startY: number,
      direction: Direction,
    ) => {
      const dir = direction === "H" ? { x: 1, y: 0 } : { x: 0, y: 1 };
      if (values.length <= 5) {
        newOperations.push({
          id: uid(),
          text: values.join(""),
          direction,
          sequence: { values, position: { x: startX, y: startY }, direction: dir },
        });
        return;
      }
      for (let i = 0; i + 5 <= values.length; i += 4) {
        const chunk = values.slice(i, i + 5);
        newOperations.push({
          id: uid(),
          text: chunk.join(""),
          direction,
          sequence: {
            values: chunk,
            position: { x: startX + i * dir.x, y: startY + i * dir.y },
            direction: dir,
          },
        });
      }
    };

    const rowsLength = Math.min(GRID_SIZE, matrix.length);

    for (let y = 0; y < rowsLength; y++) {
      let x = 0;
      while (x < GRID_SIZE) {
        const val = getNorm(y, x);
        if (val) {
          let len = 1;
          const values = [val];
          while (x + len < GRID_SIZE && getNorm(y, x + len)) {
            values.push(getNorm(y, x + len));
            len++;
          }
          if (len >= 3) pushRun(values, x, y, "H");
          x += len;
        } else {
          x++;
        }
      }
    }

    for (let x = 0; x < GRID_SIZE; x++) {
      let y = 0;
      while (y < rowsLength) {
        const val = getNorm(y, x);
        if (val) {
          let len = 1;
          const values = [val];
          while (y + len < rowsLength && getNorm(y + len, x)) {
            values.push(getNorm(y + len, x));
            len++;
          }
          if (len >= 3) pushRun(values, x, y, "V");
          y += len;
        } else {
          y++;
        }
      }
    }

    const finalOps = newOperations.slice(0, MAX_OPERATIONS);
    updateCurrentBoard({ ...currentBoard, operations: finalOps });
    setSelectedOperationId(null);
    setHoverCell(null);
  };

  const handleRemoveOperation = (id: string) => {
    if (!currentBoard) return;
    updateCurrentBoard({
      ...currentBoard,
      operations: currentBoard.operations.filter((o) => o.id !== id),
    });
    if (selectedOperationId === id) setSelectedOperationId(null);
  };

  const handleUpdateOperation = (
    id: string,
    field: "text" | "direction",
    value: string,
  ) => {
    if (!currentBoard) return;
    updateCurrentBoard({
      ...currentBoard,
      operations: currentBoard.operations.map((o) => {
        if (o.id !== id) return o;
        const updated: Operation =
          field === "text"
            ? { ...o, text: value }
            : { ...o, direction: value as Direction };
        return updated.sequence ? { ...updated, sequence: undefined } : updated;
      }),
    });
  };

  const handleSelectOperation = (id: string) => {
    if (!currentBoard) return;
    if (selectedOperationId === id) {
      setSelectedOperationId(null);
      return;
    }
    const opIndex = currentBoard.operations.findIndex((o) => o.id === id);
    if (opIndex !== -1 && currentBoard.operations[opIndex].sequence) {
      const freshOps = [...currentBoard.operations];
      freshOps[opIndex] = { ...freshOps[opIndex], sequence: undefined };
      updateCurrentBoard({ ...currentBoard, operations: freshOps });
      setHoverCell(null);
    }
    setSelectedOperationId(id);
  };

  if (!currentBoard) return null;

  const visualGrid = createEmptyGrid();
  const hiddenCells = new Set<string>();

  currentBoard.operations.forEach((op) => {
    if (op.sequence && op.id !== selectedOperationId) {
      op.sequence.values.forEach((val, i) => {
        const cx = op.sequence!.position.x + i * op.sequence!.direction.x;
        const cy = op.sequence!.position.y + i * op.sequence!.direction.y;
        visualGrid[cy][cx] = val;
      });
      if (op.sequence.hiddenIndexes) {
        op.sequence.hiddenIndexes.forEach((idx) => {
          const cx = op.sequence!.position.x + idx * op.sequence!.direction.x;
          const cy = op.sequence!.position.y + idx * op.sequence!.direction.y;
          hiddenCells.add(`${cy}-${cx}`);
        });
      }
    }
  });

  const previewCells: Record<string, PreviewCell> = {};
  if (selectedOperationId && hoverCell) {
    const op = currentBoard.operations.find((o) => o.id === selectedOperationId);
    if (op && op.text.trim()) {
      const values = op.text.match(/\d+|[+\-*/=]/g);
      const joined = values ? values.join("") : "";
      if (values && joined.length === op.text.replace(/\s+/g, "").length) {
        const isHorizontal = op.direction === "H";
        const dirX = isHorizontal ? 1 : 0;
        const dirY = isHorizontal ? 0 : 1;

        const isOutOfBounds =
          hoverCell.col + values.length * dirX > GRID_SIZE ||
          hoverCell.row + values.length * dirY > GRID_SIZE;

        let hasConflict = false;
        if (!isOutOfBounds) {
          for (let i = 0; i < values.length; i++) {
            const cx = hoverCell.col + i * dirX;
            const cy = hoverCell.row + i * dirY;
            const existingVal = visualGrid[cy]?.[cx];
            if (existingVal && existingVal !== values[i]) {
              hasConflict = true;
              break;
            }
          }
        }

        if (!isOutOfBounds && hasConflict) {
          const mockGrid = createEmptyGrid();
          currentBoard.operations.forEach((o) => {
            if (o.sequence && o.id !== op.id) {
              o.sequence.values.forEach((v, i) => {
                const cx = o.sequence!.position.x + i * o.sequence!.direction.x;
                const cy = o.sequence!.position.y + i * o.sequence!.direction.y;
                mockGrid[cy][cx] = v;
              });
            }
          });
          hasConflict = false;
          for (let i = 0; i < values.length; i++) {
            const cx = hoverCell.col + i * dirX;
            const cy = hoverCell.row + i * dirY;
            const existingVal = mockGrid[cy]?.[cx];
            if (existingVal && existingVal !== values[i]) {
              hasConflict = true;
              break;
            }
          }
        }

        const isValid = !isOutOfBounds && !hasConflict;
        values.forEach((val, i) => {
          const cx = hoverCell.col + i * dirX;
          const cy = hoverCell.row + i * dirY;
          if (cx < GRID_SIZE && cy < GRID_SIZE) {
            previewCells[`${cy}-${cx}`] = { value: val, isValid };
          }
        });
      }
    }
  }

  return (
    <div className="flex h-full flex-col xl:flex-row gap-4 xl:gap-6 p-4 xl:p-6 overflow-hidden">
      <Sidebar
        rounds={rounds}
        selectedRoundId={selectedRoundId}
        selectedBoardId={selectedBoardId}
        maxRounds={MAX_ROUNDS}
        maxBoards={MAX_BOARDS}
        onSelectRound={handleSelectRound}
        onSelectBoard={handleSelectBoard}
        onAddRound={handleAddRound}
        onAddBoard={handleAddBoard}
      />

      <Grid
        grid={visualGrid}
        onCellClick={handleGridCellClick}
        onCellDoubleClick={handleGridCellDoubleClick}
        onCellHover={handleCellHover}
        onCellLeave={handleCellLeave}
        previewCells={previewCells}
        hiddenCells={hiddenCells}
        isPlacementMode={!!selectedOperationId}
      />

      <List
        operations={currentBoard.operations}
        maxOperations={MAX_OPERATIONS}
        selectedOperationId={selectedOperationId}
        onSelectOperation={handleSelectOperation}
        onAddOperation={handleAddOperation}
        onRemoveOperation={handleRemoveOperation}
        onUpdateOperation={handleUpdateOperation}
        onQuickLoad={handleQuickLoad}
      />
    </div>
  );
}
