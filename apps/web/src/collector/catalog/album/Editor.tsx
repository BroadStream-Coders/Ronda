"use client";

import { useCallback, useEffect, useState } from "react";
import { Image as ImageIcon } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  useWorkspaceHeader,
  type ImageSlot,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  createEmptyPhoto,
  createEmptyRound,
  uid,
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
    const round = rounds.find((r) => r.id === roundId);
    round?.photos.forEach((p) => {
      if (p.url) URL.revokeObjectURL(p.url);
    });
    setRounds((prev) => prev.filter((r) => r.id !== roundId));
  };

  const updatePhotoInRound = (
    roundId: string,
    photoId: string,
    updates: Partial<ImageSlot>,
  ) =>
    setRounds((prev) =>
      prev.map((r) => {
        if (r.id !== roundId) return r;
        return {
          ...r,
          photos: r.photos.map((p) => {
            if (p.id === photoId) {
              if (updates.url && p.url && updates.url !== p.url) {
                URL.revokeObjectURL(p.url);
              }
              return { ...p, ...updates };
            }
            return p;
          }),
        };
      }),
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
    const sessionData: Data = {
      rounds: rounds.map((round) => ({
        title: round.context.trim(),
        cards: round.photos.map((photo) => ({
          isCroma: photo.isCroma ? true : undefined,
          question: (photo.name || "").trim(),
          imagePath: photo.file ? `images/${uid()}_${photo.file.name}` : "",
        })),
      })),
    };

    const filesToInclude: { name: string; file: File }[] = [];
    rounds.forEach((round, roundIndex) => {
      round.photos.forEach((photo, photoIndex) => {
        if (photo.file) {
          const path = sessionData.rounds[roundIndex].cards[photoIndex].imagePath;
          if (path) filesToInclude.push({ name: path, file: photo.file });
        }
      });
    });

    try {
      await saveAsZip(
        "Album.zip",
        sessionData,
        filesToInclude,
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
            (roundMeta.cards || []).map(async (pMeta) => {
              let imageFile: File | undefined;
              let imageUrl: string | undefined;
              if (pMeta.imagePath) {
                const imgEntry = zip.file(pMeta.imagePath);
                if (imgEntry) {
                  const blob = await imgEntry.async("blob");
                  const parts = (
                    pMeta.imagePath.split("/").pop() || pMeta.imagePath
                  ).split("_");
                  const originalName =
                    parts.length > 1 ? parts.slice(1).join("_") : parts[0];
                  imageFile = new File([blob], originalName, {
                    type: blob.type || "image/png",
                  });
                  imageUrl = URL.createObjectURL(blob);
                }
              }
              return {
                id: uid(),
                name: pMeta.question || "",
                file: imageFile,
                url: imageUrl,
                isCroma: pMeta.isCroma ?? false,
              } as ImageSlot;
            }),
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

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Álbum",
      icon: <ImageIcon className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
    });
  }, [setHeader, handleSave, handleLoad]);

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
          onUpdateRound={(updates) => updateRound(round.id, updates)}
          onRemoveColumn={() => removeRound(round.id)}
          onQuickLoad={(matrix) => handleQuickLoad(round.id, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
