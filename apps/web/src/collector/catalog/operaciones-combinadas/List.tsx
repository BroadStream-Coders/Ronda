"use client";

import { Check, Plus, Trash2 } from "lucide-react";

import { Panel, PanelCount, QuickLoad } from "@/collector/kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Operation } from "./schema";

interface ListProps {
  operations: Operation[];
  maxOperations: number;
  selectedOperationId: string | null;
  onSelectOperation: (id: string) => void;
  onAddOperation: () => void;
  onRemoveOperation: (id: string) => void;
  onUpdateOperation: (
    id: string,
    field: "text" | "direction",
    value: string,
  ) => void;
  onQuickLoad: (matrix: string[][]) => void;
}

export function List({
  operations,
  maxOperations,
  selectedOperationId,
  onSelectOperation,
  onAddOperation,
  onRemoveOperation,
  onUpdateOperation,
  onQuickLoad,
}: ListProps) {
  return (
    <Panel
      title="Operaciones"
      aside={<PanelCount value={operations.length} max={maxOperations} />}
      className="w-full shrink-0 lg:w-[360px]"
    >
      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {operations.length === 0 ? (
          <p className="px-2 py-8 text-center text-sm text-muted-foreground">
            Todavía no hay operaciones. Agrégalas a mano o pégalas desde tu
            planilla.
          </p>
        ) : (
          <div className="space-y-1.5">
            {operations.map((op, index) => {
              const selected = selectedOperationId === op.id;
              const placed = Boolean(op.sequence);

              return (
                <div
                  key={op.id}
                  className={`group/op flex items-center gap-1.5 rounded-lg border p-1.5 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <button
                    onClick={() => onSelectOperation(op.id)}
                    title={
                      selected
                        ? "Ubicando en el tablero"
                        : "Seleccionar para ubicar en el tablero"
                    }
                    className={`relative flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground hover:bg-secondary"
                    }`}
                  >
                    {index + 1}
                    {placed && !selected && (
                      <span className="absolute -top-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="size-2.5" />
                      </span>
                    )}
                  </button>

                  <Input
                    value={op.text}
                    onChange={(e) =>
                      onUpdateOperation(op.id, "text", e.target.value)
                    }
                    placeholder="15+12=27"
                    className="h-8 min-w-0 flex-1 border-transparent bg-background tabular-nums"
                  />

                  <select
                    value={op.direction}
                    aria-label="Dirección"
                    onChange={(e) =>
                      onUpdateOperation(op.id, "direction", e.target.value)
                    }
                    className="h-8 shrink-0 rounded-md border border-input bg-background px-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="H">H</option>
                    <option value="V">V</option>
                  </select>

                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onRemoveOperation(op.id)}
                    aria-label={`Eliminar operación ${index + 1}`}
                    className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/op:opacity-100 focus-visible:opacity-100 hover:text-destructive"
                  >
                    <Trash2 />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/30 p-3">
        <Button
          variant="outline"
          onClick={onAddOperation}
          disabled={operations.length >= maxOperations}
          className="h-9 w-full gap-2"
        >
          <Plus />
          Agregar operación
        </Button>
        <QuickLoad
          onLoad={(matrix) => {
            if (matrix.length > 0) onQuickLoad(matrix);
          }}
          placeholder="Pega una lista de operaciones, o el tablero completo de 11 x 11…"
        />
      </div>
    </Panel>
  );
}
