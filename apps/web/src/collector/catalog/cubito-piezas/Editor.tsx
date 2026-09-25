"use client";

import { useCallback, useEffect, useState } from "react";
import { Puzzle } from "lucide-react";

import { loadZipFile, saveAsZip } from "@/helpers/persistence";
import {
  readImageSlot,
  useWorkspaceHeader,
  notifyError,
} from "@/collector/kit";
import { Rounds } from "./Rounds";
import {
  SESSION_DATA_FILENAME,
  buildData,
  createEmptyRound,
  fitQuestions,
  uid,
  validate,
  type Data,
  type RoundState,
} from "./schema";

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [rounds, setRounds] = useState<RoundState[]>(() => [createEmptyRound()]);

  const handleGetBundle = useCallback(() => buildData(rounds), [rounds]);

  const handleSave = useCallback(async () => {
    const { data, files } = handleGetBundle();
    try {
      await saveAsZip("CubitoPiezas.zip", data, files, SESSION_DATA_FILENAME);
    } catch (error) {
      notifyError("Error al exportar los datos.", error);
    }
  }, [handleGetBundle]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file(SESSION_DATA_FILENAME);
      if (!dataFile) {
        notifyError(
          "El archivo no es un paquete válido de Cubito Piezas (falta sessionData.json).",
        );
        return;
      }

      const data = JSON.parse(await dataFile.async("string")) as Data;

      const loaded = await Promise.all(
        (data.rounds ?? []).map(async (round) => ({
          id: uid(),
          image: await readImageSlot(zip, round.imagePath),
          questions: fitQuestions(
            (round.questions ?? []).map((q) => ({
              question: q.question || "",
              answer: q.answer || "",
            })),
          ),
        })),
      );

      setRounds(loaded.length > 0 ? loaded : [createEmptyRound()]);
    } catch (error) {
      notifyError("Error al importar los datos.", error);
    }
  }, []);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cubito Piezas",
      icon: <Puzzle className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: () => handleGetBundle().data,
      getFiles: () => handleGetBundle().files,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetBundle]);

  return <Rounds rounds={rounds} setRounds={setRounds} />;
}
