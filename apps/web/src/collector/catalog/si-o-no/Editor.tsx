"use client";

import { useCallback, useEffect, useState } from "react";
import { Zap } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import { GroupsContainer, useWorkspaceHeader } from "@/collector/kit";
import { Column } from "./Column";
import {
  buildData,
  createEmptyColumn,
  createEmptyRow,
  fromData,
  isData,
  validate,
  type ColumnData,
  type Data,
  type RowData,
} from "./schema";

export function Editor() {
  const [columns, setColumns] = useState<ColumnData[]>([createEmptyColumn()]);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const addColumn = () => setColumns((prev) => [...prev, createEmptyColumn()]);
  const removeColumn = (index: number) =>
    setColumns((prev) => prev.filter((_, i) => i !== index));
  const updateTitle = (colIndex: number, title: string) =>
    setColumns((prev) =>
      prev.map((c, i) => (i === colIndex ? { ...c, title } : c)),
    );
  const addRow = (colIndex: number) =>
    setColumns((prev) =>
      prev.map((c, i) =>
        i === colIndex ? { ...c, rows: [...c.rows, createEmptyRow()] } : c,
      ),
    );
  const updateRow = (
    colIndex: number,
    rowIndex: number,
    updates: Partial<RowData>,
  ) =>
    setColumns((prev) =>
      prev.map((c, i) =>
        i === colIndex
          ? {
              ...c,
              rows: c.rows.map((r, j) =>
                j === rowIndex ? { ...r, ...updates } : r,
              ),
            }
          : c,
      ),
    );
  const removeRow = (colIndex: number, rowIndex: number) =>
    setColumns((prev) =>
      prev.map((c, i) =>
        i === colIndex
          ? { ...c, rows: c.rows.filter((_, j) => j !== rowIndex) }
          : c,
      ),
    );

  const handleQuickLoad = useCallback(
    (colIndex: number, matrix: string[][]) => {
      const newRows: RowData[] = matrix.map((row) => {
        const normalized = (row[1] || "").trim().toLowerCase();
        const isSi = normalized === "si" || normalized === "sí";
        const isNo = normalized === "no";
        const answer: RowData["correctAnswer"] = isSi ? "Si" : isNo ? "No" : null;
        return { ...createEmptyRow(), question: row[0] || "", correctAnswer: answer };
      });
      if (newRows.length > 0) {
        setColumns((prev) =>
          prev.map((c, i) => (i === colIndex ? { ...c, rows: newRows } : c)),
        );
      }
    },
    [],
  );

  const handleGetData = useCallback(() => buildData(columns), [columns]);

  const handleSave = useCallback(() => {
    saveAsJson("SiONo.json", handleGetData());
  }, [handleGetData]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<Data>(file, isData);
      setColumns(fromData(data));
    } catch {
      alert("Archivo de Sí o No no válido.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(columns), [columns]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Al Vuelo",
      icon: <Zap className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  return (
    <GroupsContainer onAddGroup={addColumn} addLabel="Agregar grupo">
      {columns.map((col, colIndex) => (
        <Column
          key={colIndex}
          index={colIndex + 1}
          title={col.title}
          onTitleChange={(val) => updateTitle(colIndex, val)}
          rows={col.rows}
          onAddRow={() => addRow(colIndex)}
          onRemoveColumn={() => removeColumn(colIndex)}
          onUpdateRow={(rowIdx, updates) => updateRow(colIndex, rowIdx, updates)}
          onRemoveRow={(rowIdx) => removeRow(colIndex, rowIdx)}
          onQuickLoad={(matrix) => handleQuickLoad(colIndex, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
