"use client";

import { Plus, X, ChevronDown, CheckCircle2 } from "lucide-react";
import { QuickLoad } from "@/collector/kit";
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
    <section className="w-full lg:w-[380px] shrink-0 flex flex-col border border-border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="flex-none bg-muted px-4 py-3 border-b border-border h-12 flex items-center justify-between shrink-0">
        <h2 className="text-sm font-bold text-foreground">Operaciones</h2>
        <span className="text-[10px] font-mono font-bold text-muted-foreground bg-background px-2 py-0.5 rounded border border-border">
          {operations.length} / {maxOperations}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-background/30">
        {operations.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/60 text-sm space-y-2">
            <p className="italic">No hay operaciones</p>
          </div>
        ) : (
          operations.map((op, index) => {
            const isSelected = selectedOperationId === op.id;
            const isPlaced = !!op.sequence;

            return (
              <div
                key={op.id}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border shadow-sm transition-colors group ${
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <button
                  onClick={() => onSelectOperation(op.id)}
                  className={`relative w-8 h-8 shrink-0 flex items-center justify-center rounded-md text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                      : "bg-muted text-foreground hover:bg-primary/20"
                  }`}
                  title={
                    isSelected
                      ? "Modo ubicación activo"
                      : "Seleccionar para ubicar en tablero"
                  }
                >
                  {index + 1}
                  {isPlaced && !isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-emerald-500 rounded-full text-white p-[1px] shadow-sm">
                      <CheckCircle2 className="h-2.5 w-2.5" />
                    </div>
                  )}
                </button>

                <input
                  type="text"
                  value={op.text}
                  onChange={(e) => onUpdateOperation(op.id, "text", e.target.value)}
                  placeholder="Ej: 15+12=27"
                  className="flex-1 h-8 min-w-0 font-mono rounded-md border-transparent bg-transparent px-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-primary/40 focus:bg-background transition-all"
                />

                <div className="relative shrink-0 w-12">
                  <select
                    value={op.direction}
                    onChange={(e) =>
                      onUpdateOperation(op.id, "direction", e.target.value)
                    }
                    className="w-full h-8 appearance-none rounded-md border border-border bg-background pl-2 pr-5 text-xs font-bold text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary/40 cursor-pointer"
                  >
                    <option value="H">H</option>
                    <option value="V">V</option>
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                </div>

                <button
                  onClick={() => onRemoveOperation(op.id)}
                  className="w-7 h-7 flex shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors ml-0.5"
                  title="Eliminar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex-none p-3 border-t border-border bg-card space-y-3">
        <button
          onClick={onAddOperation}
          disabled={operations.length >= maxOperations}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary py-2.5 font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <Plus className="h-4 w-4" />
          Agregar operación manual
        </button>

        <div className="pt-2 border-t border-border/60">
          <QuickLoad
            onLoad={(matrix) => {
              if (matrix.length > 0) onQuickLoad(matrix);
            }}
            placeholder="Pega listado o tabla de Excel de 11x11"
          />
        </div>
      </div>
    </section>
  );
}
