import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GroupColumnProps {
  index: number;
  onRemove: () => void;
  children: ReactNode;
  width?: string;
  label?: string;
  currentCapacity?: number;
  maxCapacity?: number;
}

export function GroupColumn({
  index,
  onRemove,
  children,
  width = "w-[320px]",
  label = "Ronda",
  currentCapacity,
  maxCapacity,
}: GroupColumnProps) {
  const showCapacity =
    currentCapacity !== undefined && maxCapacity !== undefined;
  const ratio = showCapacity ? currentCapacity / maxCapacity : 0;
  const full = ratio >= 1;

  return (
    <section
      className={`group/column flex h-full shrink-0 flex-col overflow-hidden rounded-xl border border-border bg-card ${width}`}
    >
      <header className="flex h-12 shrink-0 items-center gap-2.5 border-b border-border px-3">
        <span className="font-heading flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary tabular-nums">
          {index}
        </span>
        <span className="text-sm font-medium">
          {label} {index}
        </span>

        {showCapacity && (
          <span className="ml-auto flex items-center gap-2">
            <span
              className={`text-xs tabular-nums ${full ? "font-medium text-accent" : "text-muted-foreground"}`}
            >
              {currentCapacity}/{maxCapacity}
            </span>
            <span className="h-1 w-10 overflow-hidden rounded-full bg-muted">
              <span
                className={`block h-full transition-all ${full ? "bg-accent" : "bg-primary"}`}
                style={{ width: `${Math.min(100, ratio * 100)}%` }}
              />
            </span>
          </span>
        )}

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar ${label.toLowerCase()} ${index}`}
          className={`${showCapacity ? "" : "ml-auto"} text-muted-foreground opacity-0 transition-opacity group-hover/column:opacity-100 focus-visible:opacity-100 hover:text-destructive`}
        >
          <Trash2 />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}
