"use client";

import { useCallback, useEffect } from "react";
import { Calculator } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  useWorkspaceGroups,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  buildData,
  createEmptyBoard,
  isData,
  validate,
  type BoardData,
  type Data,
} from "./schema";

export function Editor() {
  const {
    groups,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    updateItem,
    replaceGroup,
    setGroups,
  } = useWorkspaceGroups<BoardData>([[createEmptyBoard()]], createEmptyBoard);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const handleQuickLoad = (groupIndex: number, matrix: string[][]) => {
    const boards: BoardData[] = [];
    for (let i = 0; i < matrix.length; i += 2) {
      const questionRow = matrix[i] || [];
      const answerRow = matrix[i + 1] || [];
      if (questionRow.length === 0 && answerRow.length === 0) continue;
      boards.push({
        slots: Array(4)
          .fill(null)
          .map((_, slotIdx) => ({
            question: (questionRow[slotIdx] || "").trim(),
            answer: (answerRow[slotIdx] || "").trim(),
          })),
      });
    }
    if (boards.length > 0) replaceGroup(groupIndex, boards);
  };

  const handleSave = useCallback(() => {
    saveAsJson("CalculoMental.json", buildData(groups));
  }, [groups]);

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const data = await loadJsonFile<Data>(file, isData);
        setGroups(data.groups.map((g) => g.boards));
      } catch {
        alert("Archivo de Cálculo Mental no válido.");
      }
    },
    [setGroups],
  );

  const handleValidate = useCallback(() => validate(groups), [groups]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cálculo Mental",
      icon: <Calculator className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <GroupsContainer onAddGroup={addGroup} addLabel="Agregar grupo">
      {groups.map((boards, groupIndex) => (
        <Column
          key={groupIndex}
          index={groupIndex + 1}
          boards={boards}
          onSlotChange={(boardIdx, slotIdx, field, val) =>
            updateItem(groupIndex, boardIdx, {
              ...boards[boardIdx],
              slots: boards[boardIdx].slots.map((s, i) =>
                i === slotIdx ? { ...s, [field]: val } : s,
              ),
            })
          }
          onAddBoard={() => addItem(groupIndex)}
          onRemoveBoard={(boardIdx) => removeItem(groupIndex, boardIdx)}
          onRemoveColumn={() => removeGroup(groupIndex)}
          onQuickLoad={(matrix) => handleQuickLoad(groupIndex, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
