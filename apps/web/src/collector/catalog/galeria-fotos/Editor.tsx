"use client";

import { useCallback, useEffect, useState } from "react";
import { Images } from "lucide-react";

import { loadZipFile, saveAsZip } from "@/helpers/persistence";
import { GroupsContainer, useWorkspaceHeader } from "@/collector/kit";
import { Column } from "./Column";
import {
  SESSION_DATA_FILENAME,
  buildData,
  createEmptyColumn,
  createEmptyPhoto,
  isData,
  uid,
  validate,
  type ColumnData,
  type Data,
} from "./schema";

export function Editor() {
  const [columns, setColumns] = useState<ColumnData[]>(() => [
    createEmptyColumn(),
  ]);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const updateColumn = (
    columnIndex: number,
    updater: (column: ColumnData) => ColumnData,
  ) =>
    setColumns((prev) =>
      prev.map((column, i) => (i === columnIndex ? updater(column) : column)),
    );

  const addColumn = () => setColumns((prev) => [...prev, createEmptyColumn()]);

  const removeColumn = (columnIndex: number) => {
    columns[columnIndex]?.photos.forEach((photo) => {
      if (photo.url) URL.revokeObjectURL(photo.url);
    });
    setColumns((prev) => prev.filter((_, i) => i !== columnIndex));
  };

  const setPhoto = (
    columnIndex: number,
    photoId: string,
    file: File,
    url: string,
  ) =>
    updateColumn(columnIndex, (column) => ({
      ...column,
      photos: column.photos.map((photo) => {
        if (photo.id !== photoId) return photo;
        if (photo.url && photo.url !== url) URL.revokeObjectURL(photo.url);
        return { ...photo, file, url };
      }),
    }));

  const removePhoto = (columnIndex: number, photoId: string) => {
    const photo = columns[columnIndex]?.photos.find((p) => p.id === photoId);
    if (photo?.url) URL.revokeObjectURL(photo.url);
    updateColumn(columnIndex, (column) => ({
      ...column,
      photos: column.photos.filter((p) => p.id !== photoId),
    }));
  };

  const handleSave = useCallback(async () => {
    const { data, files } = buildData(columns);
    try {
      await saveAsZip("GaleriaFotos.zip", data, files, SESSION_DATA_FILENAME);
    } catch {
      alert("Error al exportar los datos.");
    }
  }, [columns]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const zip = await loadZipFile(file);
      const dataFile = zip.file(SESSION_DATA_FILENAME);
      if (!dataFile) {
        alert(
          "El archivo no es un paquete válido de Galería de Fotos (falta sessionData.json).",
        );
        return;
      }

      const data = JSON.parse(await dataFile.async("string")) as Data;
      if (!isData(data)) {
        alert("El archivo no contiene grupos válidos.");
        return;
      }

      const loaded = await Promise.all(
        data.groups.map(async (group) => ({
          title: group.title || "",
          photos: await Promise.all(
            (group.items ?? []).map(async (item) => {
              if (!item.imagePath) return createEmptyPhoto();
              const entry = zip.file(item.imagePath);
              if (!entry) return createEmptyPhoto();
              const blob = await entry.async("blob");
              return {
                id: uid(),
                file: new File(
                  [blob],
                  item.imagePath.split("/").pop() || "image.png",
                  { type: blob.type || "image/png" },
                ),
                url: URL.createObjectURL(blob),
              };
            }),
          ),
        })),
      );

      setColumns(loaded.length > 0 ? loaded : [createEmptyColumn()]);
    } catch {
      alert("Error al importar los datos.");
    }
  }, []);

  const handleValidate = useCallback(() => validate(columns), [columns]);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Galería de Fotos",
      icon: <Images className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <GroupsContainer onAddGroup={addColumn} addLabel="Agregar grupo">
      {columns.map((column, columnIndex) => (
        <Column
          key={columnIndex}
          index={columnIndex + 1}
          title={column.title}
          photos={column.photos}
          onTitleChange={(val) =>
            updateColumn(columnIndex, (current) => ({ ...current, title: val }))
          }
          onPhotoChange={(photoId, file, url) =>
            setPhoto(columnIndex, photoId, file, url)
          }
          onAddPhoto={() =>
            updateColumn(columnIndex, (current) => ({
              ...current,
              photos: [...current.photos, createEmptyPhoto()],
            }))
          }
          onRemovePhoto={(photoId) => removePhoto(columnIndex, photoId)}
          onRemoveColumn={() => removeColumn(columnIndex)}
        />
      ))}
    </GroupsContainer>
  );
}
