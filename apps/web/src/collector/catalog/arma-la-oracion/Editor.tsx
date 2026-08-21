"use client";

import { useCallback, useEffect } from "react";
import { TextQuote } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  getColumnData,
  useWorkspaceGroups,
  useWorkspaceHeader,
  notifyError,
} from "@/collector/kit";
import { Column } from "./Column";
import { buildData, isData, validate, type Data } from "./schema";

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
  } = useWorkspaceGroups<string>([["", "", ""]], () => "");

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const handleGetData = useCallback(() => buildData(groups), [groups]);

  const handleSave = useCallback(() => {
    saveAsJson("ArmaLaOracion.json", handleGetData());
  }, [handleGetData]);

  const handleValidate = useCallback(() => validate(groups), [groups]);

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const data = await loadJsonFile<Data>(file, isData);
        setGroups(data.groups.map((g) => g.sentences));
      } catch {
        notifyError("Archivo de Arma la Oración no válido.");
      }
    },
    [setGroups],
  );

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Arma la Oración",
      icon: <TextQuote className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  return (
    <GroupsContainer onAddGroup={addGroup} addLabel="Agregar ronda">
      {groups.map((sentences, gi) => (
        <Column
          key={gi}
          index={gi + 1}
          sentences={sentences}
          onSentenceChange={(si, val) => updateItem(gi, si, val)}
          onAddSentence={() => addItem(gi)}
          onRemoveSentence={(si) => removeItem(gi, si)}
          onRemoveColumn={() => removeGroup(gi)}
          onQuickLoad={(matrix) => replaceGroup(gi, getColumnData(matrix, 0))}
        />
      ))}
    </GroupsContainer>
  );
}
