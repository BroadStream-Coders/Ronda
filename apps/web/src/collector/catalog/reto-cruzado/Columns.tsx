"use client";

import { Fragment, type Dispatch, type ReactNode, type SetStateAction } from "react";

import {
  AddRowButton,
  GroupColumn,
  GroupFooter,
  GroupsContainer,
  QuickLoad,
  RowsContainer,
  TitleInput,
} from "@/collector/kit";
import { MAX_CAPACITY, type ColumnData } from "./schema";

interface ColumnsProps<T> {
  columns: ColumnData<T>[];
  setColumns: Dispatch<SetStateAction<ColumnData<T>[]>>;
  createEmptyRow: () => T;
  parsePaste: (matrix: string[][]) => T[];
  pastePlaceholder?: string;
  renderRow: (args: {
    row: T;
    index: number;
    onChange: (updates: Partial<T>) => void;
    onRemove: () => void;
  }) => ReactNode;
}

export function Columns<T extends { id: string }>({
  columns,
  setColumns,
  createEmptyRow,
  parsePaste,
  pastePlaceholder,
  renderRow,
}: ColumnsProps<T>) {
  const updateColumn = (
    colIndex: number,
    updater: (column: ColumnData<T>) => ColumnData<T>,
  ) =>
    setColumns((prev) =>
      prev.map((col, i) => (i === colIndex ? updater(col) : col)),
    );

  const addColumn = () =>
    setColumns((prev) => [...prev, { title: "", rows: [createEmptyRow()] }]);

  const removeColumn = (colIndex: number) =>
    setColumns((prev) => prev.filter((_, i) => i !== colIndex));

  const addRow = (colIndex: number, rowCount: number) => {
    if (rowCount >= MAX_CAPACITY) return;
    updateColumn(colIndex, (col) => ({
      ...col,
      rows: [...col.rows, createEmptyRow()],
    }));
  };

  const handleQuickLoad = (colIndex: number, matrix: string[][]) => {
    const rows = parsePaste(matrix);
    if (rows.length === 0) return;
    updateColumn(colIndex, (col) => ({ ...col, rows }));
  };

  return (
    <GroupsContainer onAddGroup={addColumn} addLabel="Agregar grupo">
      {columns.map((col, colIndex) => (
        <GroupColumn
          key={colIndex}
          index={colIndex + 1}
          onRemove={() => removeColumn(colIndex)}
          currentCapacity={col.rows.length}
          maxCapacity={MAX_CAPACITY}
        >
          <TitleInput
            value={col.title}
            onChange={(val) =>
              updateColumn(colIndex, (current) => ({ ...current, title: val }))
            }
            placeholder="Nombre del grupo..."
          />

          <RowsContainer>
            {col.rows.map((row, rowIndex) => (
              <Fragment key={row.id}>
                {renderRow({
                  row,
                  index: rowIndex,
                  onChange: (updates) =>
                    updateColumn(colIndex, (current) => ({
                      ...current,
                      rows: current.rows.map((r, j) =>
                        j === rowIndex ? { ...r, ...updates } : r,
                      ),
                    })),
                  onRemove: () =>
                    updateColumn(colIndex, (current) => ({
                      ...current,
                      rows: current.rows.filter((_, j) => j !== rowIndex),
                    })),
                })}
              </Fragment>
            ))}
          </RowsContainer>

          <AddRowButton
            onClick={() => addRow(colIndex, col.rows.length)}
            label="Agregar fila"
          />

          <GroupFooter>
            <QuickLoad onLoad={(matrix) => handleQuickLoad(colIndex, matrix)} placeholder={pastePlaceholder} />
          </GroupFooter>
        </GroupColumn>
      ))}
    </GroupsContainer>
  );
}
