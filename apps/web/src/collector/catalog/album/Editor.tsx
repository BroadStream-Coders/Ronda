"use client";

import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  createImagePacker,
  readImageSlot,
  releaseSlots,
  setSlotImage,
  useWorkspaceHeader,
  type ImageSlot,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  createEmptyPhoto,
  createEmptyRound,
  uid,
  validate,
  type AlbumRound,
  type Data,
} from "./schema";

const SESSION_DATA_FILENAME = "sessionData.json";

export function Editor() {
  const [rounds, setRounds] = useState<AlbumRound[]>(() => [createEmptyRound()]);
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const addRound = () => setRounds((prev) => [...prev, createEmptyRound()]);

  const removeRound = (roundId: string) => {
    releaseSlots(rounds.find((r) => r.id === roundId)?.photos ?? []);
    setRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

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

  const handleSave = useCallback(async () => {
    const packer = createImagePacker();

    const sessionData: Data = {
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

    try {
      await saveAsZip(
        "Album.zip",
        sessionData,
        packer.files,
        SESSION_DATA_FILENAME,
      );
    } catch {
      alert("Error al exportar los datos.");
    }
  }, [rounds]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file(SESSION_DATA_FILENAME) || zip.file("data.json");
      if (!dataFile) {
        alert("El archivo no es un paquete válido de Álbum (falta sessionData.json).");
        return;
      }
      const content = await dataFile.async("string");
      const sessionData = JSON.parse(content) as Data;
      if (!sessionData.rounds || !Array.isArray(sessionData.rounds)) {
        alert("El archivo no contiene rondas válidas.");
        return;
      }

      const loaded = await Promise.all(
        sessionData.rounds.map(async (roundMeta) => {
          const photos = await Promise.all(
            (roundMeta.cards || []).map(async (pMeta) => ({
              ...(await readImageSlot(zip, pMeta.imagePath)),
              name: pMeta.question || "",
              isCroma: pMeta.isCroma ?? false,
            })),
          );
          return {
            id: uid(),
            context: roundMeta.title || "",
            photos:
              photos.length > 0
                ? photos
                : [createEmptyPhoto(), createEmptyPhoto()],
          } as AlbumRound;
        }),
      );

      setRounds(loaded.length > 0 ? loaded : [createEmptyRound()]);
    } catch {
      alert("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(rounds), [rounds]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Álbum",
      icon: <ImageIcon className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <GroupsContainer onAddGroup={addRound} addLabel="Agregar columna">
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
          onRemoveColumn={() => removeRound(round.id)}
          onQuickLoad={(matrix) => handleQuickLoad(round.id, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
