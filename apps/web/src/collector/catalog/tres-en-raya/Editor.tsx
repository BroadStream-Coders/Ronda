"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3 } from "lucide-react";

import { loadJsonFile, saveAsJson } from "@/helpers/persistence";
import { GroupsContainer, useWorkspaceHeader } from "@/collector/kit";
import { Column } from "./Column";
import {
  buildData,
  createEmptyColumn,
  fromData,
  isData,
  validate,
  type Data,
  type RowData,
} from "./schema";

export function Editor() {
  const [columns, setColumns] = useState<RowData[][]>(() => [
    createEmptyColumn(),
  ]);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const addColumn = () => setColumns((prev) => [...prev, createEmptyColumn()]);

  const removeColumn = (colIndex: number) =>
    setColumns((prev) => prev.filter((_, i) => i !== colIndex));

  const updateRow = (
    colIndex: number,
    rowIndex: number,
    updates: Partial<RowData>,
  ) =>
    setColumns((prev) =>
      prev.map((rows, i) =>
        i === colIndex
          ? rows.map((row, j) => (j === rowIndex ? { ...row, ...updates } : row))
          : rows,
      ),
    );

  const handleQuickLoad = (colIndex: number, matrix: string[][]) =>
    setColumns((prev) =>
      prev.map((rows, i) =>
        i === colIndex
          ? rows.map((row, j) =>
              matrix[j]
                ? {
                    ...row,
                    question: matrix[j][0] || "",
                    answer: matrix[j][1] || "",
                  }
                : row,
            )
          : rows,
      ),
    );

  const handleSave = useCallback(() => {
    saveAsJson("TresEnRaya.json", buildData(columns));
  }, [columns]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<Data>(file, isData);
      setColumns(fromData(data));
    } catch {
      alert("Archivo de Tres en Raya no válido.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(columns), [columns]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Tres en Raya",
      icon: <Grid3x3 className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <GroupsContainer onAddGroup={addColumn} addLabel="Agregar ronda">
      {columns.map((rows, colIndex) => (
        <Column
          key={colIndex}
          index={colIndex + 1}
          rows={rows}
          onUpdateRow={(rowIndex, updates) =>
            updateRow(colIndex, rowIndex, updates)
          }
          onRemoveColumn={() => removeColumn(colIndex)}
          onQuickLoad={(matrix) => handleQuickLoad(colIndex, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
