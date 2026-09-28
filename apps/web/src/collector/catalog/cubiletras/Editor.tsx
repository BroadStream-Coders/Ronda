"use client";

import { useCallback, useEffect, useState } from "react";
import { LetterText } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  Panel,
  PanelList,
  notifyError,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Grid, type PreviewCell } from "./Grid";
import { List } from "./List";
import {
  COLS,
  MAX_ROUNDS,
  MAX_WORDS,
  MIN_WORD_LENGTH,
  ROWS,
  buildData,
  conflicts,
  fits,
  fromData,
  generateFiller,
  isData,
  normalizeText,
  placedGrid,
  spawnRound,
  toVector,
  tokenize,
  uid,
  validate,
  type Direction,
  type ExportedData,
  type RoundData,
  type Word,
} from "./schema";

export function Editor() {
  const [rounds, setRounds] = useState<RoundData[]>(() => [spawnRound()]);
  const [selectedRoundId, setSelectedRoundId] = useState<string>(
    () => rounds[0].id,
  );
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [hoverCell, setHoverCell] = useState<{ row: number; col: number } | null>(
    null,
  );

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const currentRound = rounds.find((r) => r.id === selectedRoundId) ?? rounds[0];

  const handleGetData = useCallback(() => buildData(rounds), [rounds]);

  const handleSave = useCallback(() => {
    saveAsJson("Cubiletras.json", handleGetData());
  }, [handleGetData]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<ExportedData>(file, isData);
      const newRounds = fromData(data);
      if (newRounds.length > 0) {
        setRounds(newRounds);
        setSelectedRoundId(newRounds[0].id);
        setSelectedWordId(null);
        setHoverCell(null);
      }
    } catch (error) {
      notifyError("Archivo de Cubiletras no válido.", error);
    }
  }, []);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cubiletras",
      icon: <LetterText className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  const updateCurrentRound = (patch: Partial<RoundData>) => {
    setRounds((prev) =>
      prev.map((r) => (r.id === currentRound.id ? { ...r, ...patch } : r)),
    );
  };

  const handleAddRound = () => {
    if (rounds.length >= MAX_ROUNDS) return;
    const newRound = spawnRound();
    setRounds((prev) => [...prev, newRound]);
    setSelectedRoundId(newRound.id);
    setSelectedWordId(null);
  };

  const handleRemoveRound = (id: string) => {
    if (rounds.length <= 1) return;
    const index = rounds.findIndex((r) => r.id === id);
    const remaining = rounds.filter((r) => r.id !== id);
    setRounds(remaining);
    if (id === currentRound.id) {
      setSelectedRoundId(remaining[Math.min(index, remaining.length - 1)].id);
      setSelectedWordId(null);
      setHoverCell(null);
    }
  };

  const handleSelectRound = (id: string) => {
    setSelectedRoundId(id);
    setSelectedWordId(null);
    setHoverCell(null);
  };

  const handleGridCellClick = (row: number, col: number) => {
    if (!selectedWordId) return;
    const word = currentRound.words.find((w) => w.id === selectedWordId);
    if (!word) return;

    const values = tokenize(word.text);
    if (!values) {
      notifyError("La palabra está vacía o tiene caracteres que no son letras.");
      return;
    }

    const position = { x: col, y: row };
    const direction = toVector(word.direction);

    if (!fits(values.length, position, direction)) {
      notifyError("La palabra no cabe en el tablero iniciando en esta posición.");
      return;
    }
    if (conflicts(placedGrid(currentRound.words, word.id), values, position, direction)) {
      notifyError("Hay un cruce conflictivo. Una letra distinta ya ocupa esa celda.");
      return;
    }

    updateCurrentRound({
      words: currentRound.words.map((w) =>
        w.id === word.id ? { ...w, sequence: { values, position, direction } } : w,
      ),
    });
    setSelectedWordId(null);
    setHoverCell(null);
  };

  const handleCellHover = (row: number, col: number) => {
    if (selectedWordId) setHoverCell({ row, col });
  };
  const handleCellLeave = () => setHoverCell(null);

  const handleAddWord = () => {
    if (currentRound.words.length >= MAX_WORDS) return;
    updateCurrentRound({
      words: [...currentRound.words, { id: uid(), text: "", direction: "H" }],
    });
  };

  const handleRemoveWord = (id: string) => {
    updateCurrentRound({ words: currentRound.words.filter((w) => w.id !== id) });
    if (selectedWordId === id) setSelectedWordId(null);
  };

  const handleUpdateWord = (id: string, field: "text" | "direction", value: string) => {
    updateCurrentRound({
      words: currentRound.words.map((w) => {
        if (w.id !== id) return w;
        return field === "text"
          ? { ...w, text: normalizeText(value), sequence: undefined }
          : { ...w, direction: value as Direction, sequence: undefined };
      }),
    });
  };

  const handleSelectWord = (id: string) => {
    if (selectedWordId === id) {
      setSelectedWordId(null);
      return;
    }
    if (currentRound.words.find((w) => w.id === id)?.sequence) {
      updateCurrentRound({
        words: currentRound.words.map((w) =>
          w.id === id ? { ...w, sequence: undefined } : w,
        ),
      });
    }
    setHoverCell(null);
    setSelectedWordId(id);
  };

  const handleGenerateFiller = () => updateCurrentRound({ filler: generateFiller() });

  const handleQuickLoad = (matrix: string[][]) => {
    const cells: string[][] = [];
    for (let y = 0; y < matrix.length; y++) {
      for (let x = 0; x < matrix[y].length; x++) {
        const cell = normalizeText(matrix[y][x].trim());
        if (!cell) continue;
        if (y >= ROWS || x >= COLS) {
          notifyError(
            `El tablero pegado es más grande que ${COLS} × ${ROWS}. Hay una letra en la fila ${y + 1}, columna ${x + 1}.`,
          );
          return;
        }
        if (!/^[A-ZÑ]$/.test(cell)) {
          notifyError(
            `La celda de la fila ${y + 1}, columna ${x + 1} ("${matrix[y][x]}") no es una sola letra.`,
          );
          return;
        }
        (cells[y] ??= [])[x] = cell;
      }
    }

    const at = (x: number, y: number) => cells[y]?.[x] ?? "";
    const words: Word[] = [];

    const scan = (direction: Direction) => {
      const dir = toVector(direction);
      const outer = direction === "H" ? ROWS : COLS;
      const inner = direction === "H" ? COLS : ROWS;
      for (let a = 0; a < outer; a++) {
        let b = 0;
        while (b < inner) {
          const values: string[] = [];
          const start = direction === "H" ? { x: b, y: a } : { x: a, y: b };
          while (b < inner && at(start.x + values.length * dir.x, start.y + values.length * dir.y)) {
            values.push(at(start.x + values.length * dir.x, start.y + values.length * dir.y));
            b++;
          }
          if (values.length >= MIN_WORD_LENGTH) {
            words.push({
              id: uid(),
              text: values.join(""),
              direction,
              sequence: { values, position: start, direction: dir },
            });
          }
          if (values.length === 0) b++;
        }
      }
    };

    scan("H");
    scan("V");

    if (words.length === 0) {
      notifyError(`No se encontró ninguna palabra de ${MIN_WORD_LENGTH} letras o más.`);
      return;
    }
    if (words.length > MAX_WORDS) {
      notifyError(
        `El tablero pegado tiene ${words.length} palabras y el máximo por ronda es ${MAX_WORDS}.`,
      );
      return;
    }

    updateCurrentRound({ words });
    setSelectedWordId(null);
    setHoverCell(null);
  };

  const wordsGrid = placedGrid(currentRound.words, selectedWordId ?? undefined);

  const previewCells: Record<string, PreviewCell> = {};
  const selectedWord = currentRound.words.find((w) => w.id === selectedWordId);
  const previewValues = selectedWord ? tokenize(selectedWord.text) : null;
  if (selectedWord && previewValues && hoverCell) {
    const position = { x: hoverCell.col, y: hoverCell.row };
    const direction = toVector(selectedWord.direction);
    const isValid =
      fits(previewValues.length, position, direction) &&
      !conflicts(wordsGrid, previewValues, position, direction);
    previewValues.forEach((value, i) => {
      const x = position.x + i * direction.x;
      const y = position.y + i * direction.y;
      if (x < COLS && y < ROWS) previewCells[`${y}-${x}`] = { value, isValid };
    });
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden p-4 lg:flex-row">
      <Panel title="Estructura" className="w-full shrink-0 lg:w-[160px]">
        <PanelList
          label="Rondas"
          count={rounds.length}
          max={MAX_ROUNDS}
          items={rounds.map((r, i) => ({ id: r.id, label: `Ronda ${i + 1}` }))}
          selectedId={currentRound.id}
          onSelect={handleSelectRound}
          onAdd={handleAddRound}
          onRemove={handleRemoveRound}
          addLabel="Ronda"
        />
      </Panel>

      <Grid
        words={wordsGrid}
        filler={currentRound.filler}
        onCellClick={handleGridCellClick}
        onCellHover={handleCellHover}
        onCellLeave={handleCellLeave}
        onGenerateFiller={handleGenerateFiller}
        previewCells={previewCells}
        isPlacementMode={!!selectedWordId}
      />

      <List
        words={currentRound.words}
        maxWords={MAX_WORDS}
        selectedWordId={selectedWordId}
        onSelectWord={handleSelectWord}
        onAddWord={handleAddWord}
        onRemoveWord={handleRemoveWord}
        onUpdateWord={handleUpdateWord}
        onQuickLoad={handleQuickLoad}
      />
    </div>
  );
}
