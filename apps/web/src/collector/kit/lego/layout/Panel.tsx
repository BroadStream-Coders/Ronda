"use client";

import type { ReactNode } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Panel({
  title,
  aside,
  children,
  className,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
        className,
      )}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border px-3">
        <h2 className="text-sm font-medium">{title}</h2>
        {aside && <div className="ml-auto flex items-center">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

export function PanelCount({ value, max }: { value: number; max: number }) {
  return (
    <span className="text-xs tabular-nums text-muted-foreground">
      {value}/{max}
    </span>
  );
}

export function PanelHint({ children }: { children: ReactNode }) {
  return (
    <p className="shrink-0 border-t border-border bg-muted/30 px-3 py-2.5 text-xs leading-snug text-muted-foreground">
      {children}
    </p>
  );
}

export function PanelList({
  label,
  count,
  max,
  items,
  selectedId,
  onSelect,
  onAdd,
  addLabel = "Agregar",
  className,
}: {
  label: string;
  count: number;
  max: number;
  items: { id: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  addLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>
      <div className="flex shrink-0 items-center justify-between border-b border-border px-3 py-2">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <PanelCount value={count} max={max} />
      </div>

      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
        {items.map((item) => {
          const selected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => onSelect(item.id)}
              aria-current={selected}
              className={`w-full rounded-lg px-2.5 py-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                selected
                  ? "bg-primary font-medium text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="shrink-0 p-2">
        <Button
          variant="ghost"
          onClick={onAdd}
          disabled={count >= max}
          className="h-9 w-full justify-start gap-2 pl-1.5 text-muted-foreground hover:text-foreground"
        >
          <Plus />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
