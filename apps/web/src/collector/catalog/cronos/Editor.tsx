"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  createImagePacker,
  readImageSlot,
  releaseSlots,
  useWorkspaceGroups,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  createEmptyRow,
  createFullColumn,
  validate,
  type Data,
  type RowData,
} from "./schema";

export function Editor() {
  const [titles, setTitles] = useState<string[]>([""]);

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const {
    groups,
    removeGroup,
    addItem,
    removeItem,
    updateItem,
    replaceGroup,
    setGroups,
  } = useWorkspaceGroups<RowData>([createFullColumn()], createEmptyRow);

  const handleAddGroup = () => {
    setGroups((prev) => [...prev, createFullColumn()]);
    setTitles((prev) => [...prev, ""]);
  };

  const handleQuickLoad = (groupIndex: number, matrix: string[][]) => {
    const updated = groups[groupIndex].map((row, i) =>
      matrix[i]
        ? { ...row, date: matrix[i][0] || "", title: matrix[i][1] || "" }
        : row,
    );
    replaceGroup(groupIndex, updated);
  };

  const handleRemoveGroup = (idx: number) => {
    releaseSlots((groups[idx] ?? []).map((item) => item.image));
    removeGroup(idx);
    setTitles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTitleChange = (idx: number, value: string) => {
    setTitles((prev) => prev.map((t, i) => (i === idx ? value : t)));
  };

  const handleSave = useCallback(async () => {
    const packer = createImagePacker();
    const exportGroups = groups.map((items, groupIndex) => ({
      title: titles[groupIndex] || "",
      items: items.map((item, itemIndex) => ({
        date: item.date.trim(),
        title: item.title.trim(),
        imagePath: packer.add(
          item.image,
          `G${groupIndex + 1}`,
          `I${itemIndex + 1}`,
        ),
      })),
    }));

    const sessionData: Data = { groups: exportGroups };
    try {
      await saveAsZip("Cronos.zip", sessionData, packer.files);
    } catch {
      alert("Error al exportar los datos.");
    }
  }, [groups, titles]);

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const zip = await loadZipFile(file);
        const dataFile = zip.file("sessionData.json");
        if (!dataFile) {
          alert("El ZIP no contiene un sessionData.json válido.");
          return;
        }
        const content = await dataFile.async("string");
        const sessionData = JSON.parse(content) as Data;
        if (!Array.isArray(sessionData.groups)) {
          alert("El archivo no contiene grupos válidos.");
          return;
        }

        const loadedGroups = await Promise.all(
          sessionData.groups.map(async (g) => {
            const items = await Promise.all(
              (g.items || []).map(async (item) => ({
                ...createEmptyRow(),
                date: item.date || "",
                title: item.title || "",
                image: await readImageSlot(zip, item.imagePath),
              })),
            );
            return { title: g.title || "", items };
          }),
        );

        setTitles(loadedGroups.map((g) => g.title));
        setGroups(loadedGroups.map((g) => g.items));
      } catch {
        alert("Error al procesar el archivo ZIP.");
      }
    },
    [setGroups],
  );

  const handleValidate = useCallback(
    () => validate(groups, titles),
    [groups, titles],
  );

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cronos",
      icon: <History className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
      validate: handleValidate,
    });
  }, [setHeader, handleSave, handleLoad, handleValidate]);

  return (
    <GroupsContainer onAddGroup={handleAddGroup} addLabel="Agregar grupo">
      {groups.map((items, groupIndex) => (
        <Column
          key={groupIndex}
          index={groupIndex + 1}
          title={titles[groupIndex] || ""}
          onTitleChange={(val) => handleTitleChange(groupIndex, val)}
          items={items}
          onItemChange={(itemIdx, updates) =>
            updateItem(groupIndex, itemIdx, { ...items[itemIdx], ...updates })
          }
          onAddItem={() => addItem(groupIndex)}
          onRemoveItem={(itemIdx) => removeItem(groupIndex, itemIdx)}
          onRemoveColumn={() => handleRemoveGroup(groupIndex)}
          onQuickLoad={(matrix) => handleQuickLoad(groupIndex, matrix)}
        />
      ))}
    </GroupsContainer>
  );
}
