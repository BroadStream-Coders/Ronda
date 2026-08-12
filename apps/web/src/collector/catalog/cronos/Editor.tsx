"use client";

import { useCallback, useEffect, useState } from "react";
import { History } from "lucide-react";

import { saveAsZip, loadZipFile } from "@/helpers/persistence";
import {
  GroupsContainer,
  useWorkspaceGroups,
  useWorkspaceHeader,
} from "@/collector/kit";
import { Column } from "./Column";
import {
  createEmptyRow,
  createFullColumn,
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
    removeGroup(idx);
    setTitles((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleTitleChange = (idx: number, value: string) => {
    setTitles((prev) => prev.map((t, i) => (i === idx ? value : t)));
  };

  const handleSave = useCallback(async () => {
    const filesToInclude: { name: string; file: File }[] = [];
    const exportGroups = groups.map((items, groupIndex) => {
      const title = titles[groupIndex] || "";
      const exportItems = items.map((item, itemIndex) => {
        let imagePath = "";
        if (item.file) {
          const ext = item.file.name.split(".").pop();
          imagePath = `images/G${groupIndex + 1}_I${itemIndex + 1}.${ext}`;
          filesToInclude.push({ name: imagePath, file: item.file });
        }
        return { date: item.date.trim(), title: item.title.trim(), imagePath };
      });
      return { title, items: exportItems };
    });

    const sessionData: Data = { groups: exportGroups };
    try {
      await saveAsZip("Cronos.zip", sessionData, filesToInclude);
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
              (g.items || []).map(async (item) => {
                let imageFile: File | undefined;
                let url: string | undefined;
                if (item.imagePath) {
                  const entry = zip.file(item.imagePath);
                  if (entry) {
                    const blob = await entry.async("blob");
                    imageFile = new File(
                      [blob],
                      item.imagePath.split("/").pop() || "image",
                      { type: blob.type },
                    );
                    url = URL.createObjectURL(blob);
                  }
                }
                return {
                  ...createEmptyRow(),
                  date: item.date || "",
                  title: item.title || "",
                  file: imageFile,
                  url,
                } as RowData;
              }),
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

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cronos",
      icon: <History className="h-3 w-3" />,
      format: "zip",
      onSave: handleSave,
      onLoad: handleLoad,
    });
  }, [setHeader, handleSave, handleLoad]);

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
