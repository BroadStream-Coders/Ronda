"use client";

import { useCallback, useEffect, useState } from "react";
import { Layers, VenetianMask } from "lucide-react";

import { loadZipFile, saveAsZip } from "@/helpers/persistence";
import {
  LevelTabs,
  readImageSlot,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Level1 } from "./Level1";
import { Level2 } from "./Level2";
import {
  SESSION_DATA_FILENAME,
  buildData,
  createEmptyPhotoRound,
  createEmptyTextRound,
  uid,
  validate,
  type Data,
  type PhotoRoundState,
  type TextRoundState,
} from "./schema";

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [textRounds, setTextRounds] = useState<TextRoundState[]>(() => [
    createEmptyTextRound(),
  ]);
  const [photoRounds, setPhotoRounds] = useState<PhotoRoundState[]>(() => [
    createEmptyPhotoRound(),
  ]);

  const handleSave = useCallback(async () => {
    const { data, files } = buildData(textRounds, photoRounds);
    try {
      await saveAsZip("Intruso.zip", data, files, SESSION_DATA_FILENAME);
    } catch {
      alert("Error al exportar los datos.");
    }
  }, [textRounds, photoRounds]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file(SESSION_DATA_FILENAME);
      if (!dataFile) {
        alert(
          "El archivo no es un paquete válido de Intruso (falta sessionData.json).",
        );
        return;
      }

      const data = JSON.parse(await dataFile.async("string")) as Data;

      const loadedTextRounds = await Promise.all(
        (data.textRounds ?? []).map(async (round) => ({
          id: uid(),
          image: await readImageSlot(zip, round.imagePath),
          options: round.choices?.length
            ? round.choices.map((text, i) => ({
                text,
                isIntruso: i === round.answerIndex,
              }))
            : [{ text: "", isIntruso: false }],
        })),
      );

      const loadedPhotoRounds = await Promise.all(
        (data.photoRounds ?? []).map(async (round) => ({
          id: uid(),
          context: round.description || "",
          photos: await Promise.all(
            (round.choices ?? []).map(async (choice, i) => ({
              ...(await readImageSlot(zip, choice.imagePath)),
              name: choice.label || "",
              isIntruso: i === round.answerIndex,
            })),
          ),
        })),
      );

      setTextRounds(
        loadedTextRounds.length > 0 ? loadedTextRounds : [createEmptyTextRound()],
      );
      setPhotoRounds(
        loadedPhotoRounds.length > 0
          ? loadedPhotoRounds
          : [createEmptyPhotoRound()],
      );
    } catch {
      alert("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(textRounds), [textRounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Intruso",
      icon: <VenetianMask className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <LevelTabs
      levels={[
        {
          name: "Nivel 1",
          icon: Layers,
          component: <Level1 rounds={textRounds} setRounds={setTextRounds} />,
        },
        {
          name: "Nivel 2",
          icon: Layers,
          component: <Level2 rounds={photoRounds} setRounds={setPhotoRounds} />,
        },
      ]}
    />
  );
}
