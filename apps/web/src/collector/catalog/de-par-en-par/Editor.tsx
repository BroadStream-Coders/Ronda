"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid2x2, Layers } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  LevelTabs,
  createImagePacker,
  readImageSlot,
  useWorkspaceHeader,
  notifyError,
} from "@/collector/kit";
import { Tab1 } from "./Tab1";
import { Tab2 } from "./Tab2";
import {
  PAIRS,
  createEmptyCard,
  createEmptyPair,
  initialBoardOrder,
  isBoardOrder,
  validate,
  type CardContent,
  type Data,
  type PairData,
} from "./schema";

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [pairsData, setPairsData] = useState<Record<number, PairData>>({});
  const [boardOrder, setBoardOrder] = useState<string[]>(initialBoardOrder);

  const handleGetBundle = useCallback(() => {
    const cells: Data["cells"] = [];
    const packer = createImagePacker();

    for (let i = 0; i < PAIRS; i++) {
      const pair = pairsData[i + 1] || createEmptyPair();

      const processCard = (cardData: CardContent, side: "A" | "B") => {
        let type = 0;
        if (cardData.mode === "image") type = 1;
        if (cardData.mode === "both") type = 2;

        return {
          type,
          text: type === 0 || type === 2 ? cardData.text || "" : "",
          pictureFile:
            type === 0 ? "" : packer.add(cardData.image, `P${i + 1}`, side),
        };
      };

      cells.push({
        cardA: processCard(pair.cartaA, "A"),
        cardB: processCard(pair.cartaB, "B"),
      });
    }

    const data: Data = { cells, answer: boardOrder };

    return { data, files: packer.files };
  }, [pairsData, boardOrder]);

  const handleSave = useCallback(async () => {
    const { data, files } = handleGetBundle();
    try {
      await saveAsZip("DeParEnPar.zip", data, files, "sessionData.json");
    } catch {
      notifyError("Error al exportar los datos.");
    }
  }, [handleGetBundle]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file("sessionData.json") || zip.file("data.json");
      if (!dataFile) {
        notifyError("El archivo no es un paquete válido de De Par en Par.");
        return;
      }

      const content = await dataFile.async("string");
      const sessionData = JSON.parse(content) as Data;
      if (!sessionData.cells || !Array.isArray(sessionData.cells)) {
        notifyError("Estructura del archivo inválida.");
        return;
      }

      if (sessionData.cells.length !== PAIRS) {
        notifyError(
          `El archivo trae ${sessionData.cells.length} pares; el tablero es de ${PAIRS}.`,
        );
        return;
      }

      const newPairsData: Record<number, PairData> = {};

      for (let i = 0; i < PAIRS; i++) {
        const cell = sessionData.cells[i];

        const processLoadedCard = async (cardInfo: {
          type: number;
          text: string;
          pictureFile: string;
        }): Promise<CardContent> => {
          let mode: CardContent["mode"] = "text";
          if (cardInfo.type === 1) mode = "image";
          if (cardInfo.type === 2) mode = "both";

          return {
            ...createEmptyCard(),
            mode,
            text: cardInfo.text || "",
            image: await readImageSlot(zip, cardInfo.pictureFile),
          };
        };

        newPairsData[i + 1] = {
          cartaA: await processLoadedCard(cell.cardA),
          cartaB: await processLoadedCard(cell.cardB),
        };
      }

      setPairsData(newPairsData);
      setBoardOrder(
        isBoardOrder(sessionData.answer)
          ? sessionData.answer
          : initialBoardOrder(),
      );
    } catch {
      notifyError("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(
    () => validate(pairsData),
    [pairsData],
  );

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "De Par en Par",
      icon: <Grid2x2 className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: () => handleGetBundle().data,
      getFiles: () => handleGetBundle().files,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetBundle]);

  return (
    <LevelTabs
      levels={[
        {
          name: "Recolector",
          icon: Layers,
          component: (
            <Tab1 pairsData={pairsData} setPairsData={setPairsData} />
          ),
        },
        {
          name: "Tablero",
          icon: Layers,
          component: (
            <Tab2
              boardOrder={boardOrder}
              setBoardOrder={setBoardOrder}
              pairsData={pairsData}
            />
          ),
        },
      ]}
    />
  );
}
