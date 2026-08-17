"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  useWorkspaceGroups,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Column } from "./Column";
import { Players } from "./Players";
import {
  buildData,
  createEmptyQA,
  fromData,
  initialGroups,
  initialPlayers,
  isData,
  validate,
  type Data,
  type PlayerData,
} from "./schema";

export function Editor() {
  const [players, setPlayers] = useState<PlayerData[]>(initialPlayers);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const {
    groups,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    updateItem,
    replaceGroup,
    setGroups,
  } = useWorkspaceGroups(initialGroups(), createEmptyQA);

  const handlePlayerNameChange = (index: number, name: string) =>
    setPlayers((prev) => prev.map((p, i) => (i === index ? { ...p, name } : p)));

  const handleQuickLoad = (groupIndex: number, matrix: string[][]) =>
    replaceGroup(
      groupIndex,
      matrix.map((row) => ({ question: row[0] || "", answer: row[1] || "" })),
    );

  const handleGetData = useCallback(
    () => buildData(players, groups),
    [players, groups],
  );

  const handleSave = useCallback(() => {
    saveAsJson("MiLibroFavorito.json", handleGetData());
  }, [handleGetData]);

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const data = await loadJsonFile<Data>(file, isData);
        const parsed = fromData(data);
        setPlayers(parsed.players);
        setGroups(parsed.groups);
      } catch {
        alert("Archivo de Mi Libro Favorito no válido.");
      }
    },
    [setGroups],
  );

  const handleValidate = useCallback(
    () => validate(players, groups),
    [players, groups],
  );

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Mi Libro Favorito",
      icon: <BookOpen className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="shrink-0 overflow-y-auto py-6 px-6">
        <Players players={players} onPlayerNameChange={handlePlayerNameChange} />
      </div>

      <div className="w-px bg-border/50 shrink-0 my-6" />

      <div className="flex-1 min-w-0">
        <GroupsContainer onAddGroup={addGroup} addLabel="Agregar ronda">
          {groups.map((slots, groupIndex) => (
            <Column
              key={groupIndex}
              index={groupIndex + 1}
              items={slots}
              onItemChange={(itemIdx, field, val) =>
                updateItem(groupIndex, itemIdx, {
                  ...slots[itemIdx],
                  [field]: val,
                })
              }
              onAddItem={() => addItem(groupIndex)}
              onRemoveItem={(itemIdx) => removeItem(groupIndex, itemIdx)}
              onRemoveColumn={() => removeGroup(groupIndex)}
              onQuickLoad={(matrix) => handleQuickLoad(groupIndex, matrix)}
            />
          ))}
        </GroupsContainer>
      </div>
    </div>
  );
}
