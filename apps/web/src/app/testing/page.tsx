"use client";

import { useCallback, useEffect, useState } from "react";
import { Boxes, Layers, Trash2 } from "lucide-react";

import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import {
  CollectorTopbar,
  DescriptionInput,
  GroupColumn,
  GroupFooter,
  GroupsContainer,
  LevelTabs,
  QuickLoad,
  RowsContainer,
  TitleInput,
  AddRowButton,
  getColumnData,
  useWorkspaceHeader,
} from "@/collector";

interface DemoGroup {
  id: string;
  title: string;
  description: string;
  rows: string[];
}

type DemoData = { nivel1: DemoGroup[]; nivel2: DemoGroup[] };

const MAX_ROWS = 8;
const uid = () => Math.random().toString(36).slice(2, 9);
const emptyGroup = (): DemoGroup => ({
  id: uid(),
  title: "",
  description: "",
  rows: ["", "", ""],
});

function LegoDemoGrid({
  value,
  onChange,
}: {
  value: DemoGroup[];
  onChange: (groups: DemoGroup[]) => void;
}) {
  const patch = (id: string, updates: Partial<DemoGroup>) =>
    onChange(value.map((g) => (g.id === id ? { ...g, ...updates } : g)));

  return (
    <GroupsContainer
      onAddGroup={() => onChange([...value, emptyGroup()])}
      addLabel="Agregar ronda"
    >
      {value.map((g, gi) => (
        <GroupColumn
          key={g.id}
          index={gi + 1}
          onRemove={() => onChange(value.filter((x) => x.id !== g.id))}
          currentCapacity={g.rows.length}
          maxCapacity={MAX_ROWS}
        >
          <TitleInput
            value={g.title}
            onChange={(v) => patch(g.id, { title: v })}
            placeholder="Título de la ronda…"
          />
          <DescriptionInput
            value={g.description}
            onChange={(v) => patch(g.id, { description: v })}
            placeholder="Descripción (opcional)…"
          />
          <RowsContainer>
            {g.rows.map((row, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={row}
                  onChange={(e) =>
                    patch(g.id, {
                      rows: g.rows.map((r, j) => (j === i ? e.target.value : r)),
                    })
                  }
                  placeholder={`Fila ${i + 1}`}
                  className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-1 focus:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() =>
                    patch(g.id, { rows: g.rows.filter((_, j) => j !== i) })
                  }
                  className="text-muted-foreground transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </RowsContainer>
          <AddRowButton
            onClick={() =>
              g.rows.length < MAX_ROWS &&
              patch(g.id, { rows: [...g.rows, ""] })
            }
            label="Agregar fila"
          />
          <GroupFooter>
            <QuickLoad
              onLoad={(matrix) =>
                patch(g.id, { rows: getColumnData(matrix, 0).slice(0, MAX_ROWS) })
              }
              placeholder="Pegar lista (una por línea)…"
            />
          </GroupFooter>
        </GroupColumn>
      ))}
    </GroupsContainer>
  );
}

export default function TestingPage() {
  const [data, setData] = useState<DemoData>({
    nivel1: [emptyGroup()],
    nivel2: [emptyGroup()],
  });

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const handleSave = useCallback(() => {
    saveAsJson("colector-demo.json", data);
  }, [data]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const loaded = await loadJsonFile<DemoData>(file);
      setData(loaded);
    } catch {
      alert("No se pudo cargar el archivo.");
    }
  }, []);

  useEffect(() => () => resetHeader(), [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Colector demo",
      icon: <Boxes className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
    });
  }, [setHeader, handleSave, handleLoad]);

  return (
    <div className="flex h-dvh flex-col">
      <CollectorTopbar />
      <div className="min-h-0 flex-1">
        <LevelTabs
          levels={[
            {
              name: "Nivel 1",
              icon: Layers,
              component: (
                <LegoDemoGrid
                  value={data.nivel1}
                  onChange={(g) => setData((p) => ({ ...p, nivel1: g }))}
                />
              ),
            },
            {
              name: "Nivel 2",
              icon: Layers,
              component: (
                <LegoDemoGrid
                  value={data.nivel2}
                  onChange={(g) => setData((p) => ({ ...p, nivel2: g }))}
                />
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
