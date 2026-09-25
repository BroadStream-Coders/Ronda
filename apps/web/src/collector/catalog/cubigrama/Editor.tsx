"use client";

import { useCallback, useEffect, useState } from "react";
import { Shuffle } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  useWorkspaceHeader,
  notifyError,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  buildData,
  createEmptyRound,
  fromData,
  isData,
  validate,
  type Data,
  type RoundState,
} from "./schema";

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [rounds, setRounds] = useState<RoundState[]>(() => [createEmptyRound()]);

  const handleGetData = useCallback(() => buildData(rounds), [rounds]);

  const handleSave = useCallback(() => {
    saveAsJson("Cubigrama.json", handleGetData());
  }, [handleGetData]);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const data = await loadJsonFile<Data>(file, isData);
      setRounds(fromData(data));
    } catch (error) {
      notifyError("Archivo de Cubigrama no válido.", error);
    }
  }, []);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cubigrama",
      icon: <Shuffle className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: handleGetData,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetData]);

  return (
    <GroupsContainer
      onAddGroup={() => setRounds((prev) => [...prev, createEmptyRound()])}
      addLabel="Agregar ronda"
    >
      {rounds.map((round, roundIndex) => (
        <Column
          key={round.id}
          index={roundIndex + 1}
          round={round}
          onChange={(next) =>
            setRounds((prev) => prev.map((r) => (r.id === round.id ? next : r)))
          }
          onRemove={() =>
            setRounds((prev) => prev.filter((r) => r.id !== round.id))
          }
        />
      ))}
    </GroupsContainer>
  );
}
