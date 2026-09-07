"use client";

import { useCallback, useEffect, useState } from "react";
import { Images } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  createImagePacker,
  readImageSlot,
  setSlotImage,
  useWorkspaceHeader,
  type ImageSlot,
  type QuickImage,
  notifyError,
  notifyInfo,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  fitPhotos,
  fitRounds,
  PHOTOS_PER_ROUND,
  ROUND_COUNT,
  uid,
  validate,
  type AlbumRound,
  type Data,
} from "./schema";

const SESSION_DATA_FILENAME = "sessionData.json";

export function Editor() {
  const [rounds, setRounds] = useState<AlbumRound[]>(() => fitRounds([]));
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const updatePhotoInRound = (
    roundId: string,
    photoId: string,
    updates: Partial<ImageSlot>,
  ) =>
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              photos: r.photos.map((p) =>
                p.id === photoId ? { ...p, ...updates } : p,
              ),
            }
          : r,
      ),
    );

  const setPhotoImage = (
    roundId: string,
    photoId: string,
    file: File,
    url: string,
  ) =>
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              photos: r.photos.map((p) =>
                p.id === photoId ? setSlotImage(p, file, url) : p,
              ),
            }
          : r,
      ),
    );

  const updateRound = (roundId: string, updates: Partial<{ context: string }>) =>
    setRounds((prev) =>
      prev.map((r) => (r.id === roundId ? { ...r, ...updates } : r)),
    );

  const handleQuickLoad = (roundId: string, matrix: string[][]) => {
    const names: string[] = [];
    for (const row of matrix) {
      const line = row[0]?.trim() ?? "";
      if (line !== "") {
        names.push(line);
        if (names.length === 5) break;
      }
    }
    if (names.length === 0) return;
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              photos: r.photos.map((p, i) => ({ ...p, name: names[i] ?? p.name })),
            }
          : r,
      ),
    );
  };

  const handleQuickImages = (roundId: string, images: QuickImage[]) =>
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundId
          ? {
              ...r,
              photos: r.photos.map((p, i) =>
                images[i] ? setSlotImage(p, images[i].file, images[i].url) : p,
              ),
            }
          : r,
      ),
    );

  const handleGetBundle = useCallback(() => {
    const packer = createImagePacker();

    const data: Data = {
      rounds: rounds.map((round, roundIndex) => ({
        title: round.context.trim(),
        cards: round.photos.map((photo, photoIndex) => ({
          isCroma: photo.isCroma ? true : undefined,
          question: (photo.name || "").trim(),
          imagePath: packer.add(
            photo,
            `G${roundIndex + 1}`,
            `I${photoIndex + 1}`,
          ),
        })),
      })),
    };

    return { data, files: packer.files };
  }, [rounds]);

  const handleSave = useCallback(async () => {
    const { data, files } = handleGetBundle();
    try {
      await saveAsZip("Album.zip", data, files, SESSION_DATA_FILENAME);
    } catch {
      notifyError("Error al exportar los datos.");
    }
  }, [handleGetBundle]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file(SESSION_DATA_FILENAME) || zip.file("data.json");
      if (!dataFile) {
        notifyError("El archivo no es un paquete válido de Álbum (falta sessionData.json).");
        return;
      }
      const content = await dataFile.async("string");
      const sessionData = JSON.parse(content) as Data;
      if (!sessionData.rounds || !Array.isArray(sessionData.rounds)) {
        notifyError("El archivo no contiene rondas válidas.");
        return;
      }

      if (sessionData.rounds.length > ROUND_COUNT) {
        notifyInfo(
          `El archivo trae ${sessionData.rounds.length} sobres; solo se cargan los primeros ${ROUND_COUNT}.`,
        );
      }

      const loaded = await Promise.all(
        sessionData.rounds.slice(0, ROUND_COUNT).map(async (roundMeta) => {
          const photos = await Promise.all(
            (roundMeta.cards || []).slice(0, PHOTOS_PER_ROUND).map(
              async (pMeta) => ({
                ...(await readImageSlot(zip, pMeta.imagePath)),
                name: pMeta.question || "",
                isCroma: pMeta.isCroma ?? false,
              }),
            ),
          );
          return {
            id: uid(),
            context: roundMeta.title || "",
            photos: fitPhotos(photos),
          } as AlbumRound;
        }),
      );

      setRounds(fitRounds(loaded));
    } catch {
      notifyError("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Álbum",
      icon: <Images className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
      getData: () => handleGetBundle().data,
      getFiles: () => handleGetBundle().files,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate, handleGetBundle]);

  return (
    <GroupsContainer>
      {rounds.map((round, roundIndex) => (
        <Column
          key={round.id}
          index={roundIndex + 1}
          photos={round.photos}
          context={round.context}
          onUpdatePhoto={(photoId, updates) =>
            updatePhotoInRound(round.id, photoId, updates)
          }
          onSetPhotoImage={(photoId, file, url) =>
            setPhotoImage(round.id, photoId, file, url)
          }
          onUpdateRound={(updates) => updateRound(round.id, updates)}
          onQuickLoad={(matrix) => handleQuickLoad(round.id, matrix)}
          onQuickImages={(files) => handleQuickImages(round.id, files)}
        />
      ))}
    </GroupsContainer>
  );
}
