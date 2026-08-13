"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid2x2, Layers } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import { LevelTabs, useWorkspaceHeader } from "@/collector/kit";
import { Tab1 } from "./Tab1";
import { Tab2 } from "./Tab2";
import {
  DEFAULT_PAIRS,
  initialBoardOrder,
  validate,
  type CardContent,
  type Data,
  type PairData,
} from "./schema";

export function Editor() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [numPairs, setNumPairs] = useState<number>(DEFAULT_PAIRS);
  const [pairsData, setPairsData] = useState<Record<number, PairData>>({});
  const [boardOrder, setBoardOrder] = useState<string[]>(() =>
    initialBoardOrder(DEFAULT_PAIRS),
  );

  const handleNumPairsChange = useCallback((newPairs: number) => {
    setNumPairs(newPairs);
    setBoardOrder(initialBoardOrder(newPairs));
  }, []);

  const handleSave = useCallback(async () => {
    const cells: Data["cells"] = [];
    const filesToInclude: { name: string; file: File }[] = [];

    for (let i = 0; i < numPairs; i++) {
      const pair = pairsData[i + 1] || {
        cartaA: { mode: "image", text: "" },
        cartaB: { mode: "image", text: "" },
      };

      const processCard = (cardData: CardContent, side: "A" | "B") => {
        let type = 0;
        if (cardData.mode === "image") type = 1;
        if (cardData.mode === "both") type = 2;

        let pictureFileStr = "";
        if ((type === 1 || type === 2) && cardData.imageFile) {
          const ext = cardData.imageFile.name.split(".").pop();
          pictureFileStr = `images/${i}_${side}.${ext || "png"}`;
          filesToInclude.push({ name: pictureFileStr, file: cardData.imageFile });
        }

        return {
          type,
          text: type === 0 || type === 2 ? cardData.text || "" : "",
          pictureFile: pictureFileStr,
        };
      };

      cells.push({
        cardA: processCard(pair.cartaA, "A"),
        cardB: processCard(pair.cartaB, "B"),
      });
    }

    const exportData: Data = { cells, answer: boardOrder };

    try {
      await saveAsZip(
        "DeParEnPar.zip",
        exportData,
        filesToInclude,
        "sessionData.json",
      );
    } catch {
      alert("Error al exportar los datos.");
    }
  }, [numPairs, pairsData, boardOrder]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file("sessionData.json") || zip.file("data.json");
      if (!dataFile) {
        alert("El archivo no es un paquete válido de De Par en Par.");
        return;
      }

      const content = await dataFile.async("string");
      const sessionData = JSON.parse(content) as Data;
      if (!sessionData.cells || !Array.isArray(sessionData.cells)) {
        alert("Estructura del archivo inválida.");
        return;
      }

      const newNumPairs = sessionData.cells.length;
      const newPairsData: Record<number, PairData> = {};

      for (let i = 0; i < newNumPairs; i++) {
        const cell = sessionData.cells[i];

        const processLoadedCard = async (cardInfo: {
          type: number;
          text: string;
          pictureFile: string;
        }): Promise<CardContent> => {
          let mode: CardContent["mode"] = "text";
          if (cardInfo.type === 1) mode = "image";
          if (cardInfo.type === 2) mode = "both";

          let imageFile: File | undefined;
          let imageUrl: string | undefined;
          if ((mode === "image" || mode === "both") && cardInfo.pictureFile) {
            const imgEntry = zip.file(cardInfo.pictureFile);
            if (imgEntry) {
              const blob = await imgEntry.async("blob");
              const filename =
                cardInfo.pictureFile.split("/").pop() || "image.png";
              imageFile = new File([blob], filename, {
                type: blob.type || "image/png",
              });
              imageUrl = URL.createObjectURL(blob);
            }
          }

          return { mode, text: cardInfo.text || "", imageFile, imageUrl };
        };

        newPairsData[i + 1] = {
          cartaA: await processLoadedCard(cell.cardA),
          cartaB: await processLoadedCard(cell.cardB),
        };
      }

      setNumPairs(newNumPairs);
      setPairsData(newPairsData);

      if (Array.isArray(sessionData.answer)) {
        setBoardOrder(sessionData.answer);
      } else {
        setBoardOrder(initialBoardOrder(newNumPairs));
      }
    } catch {
      alert("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(
    () => validate(numPairs, pairsData),
    [numPairs, pairsData],
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
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <LevelTabs
      levels={[
        {
          name: "Recolector",
          icon: Layers,
          component: (
            <Tab1
              numPairs={numPairs}
              setNumPairs={handleNumPairsChange}
              pairsData={pairsData}
              setPairsData={setPairsData}
            />
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
