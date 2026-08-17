"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const rowFieldClass =
  "h-9 rounded-lg border-transparent bg-muted/60 text-sm transition-colors hover:bg-muted focus-visible:border-ring focus-visible:bg-background";

export function GroupRow({
  index,
  onRemove,
  removeLabel = "Eliminar fila",
  align = "center",
  children,
}: {
  index: number;
  onRemove?: () => void;
  removeLabel?: string;
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/row flex gap-2",
        align === "center" ? "items-center" : "items-start",
      )}
    >
      <span
        className={cn(
          "w-4 shrink-0 text-right text-xs tabular-nums text-muted-foreground/70 select-none",
          align === "start" && "pt-2.5",
        )}
      >
        {index + 1}
      </span>

      <div className="min-w-0 flex-1">{children}</div>

      {onRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`${removeLabel} ${index + 1}`}
          className={cn(
            "shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/row:opacity-100 focus-visible:opacity-100 hover:text-destructive",
            align === "start" && "mt-1",
          )}
        >
          <Trash2 />
        </Button>
      )}
    </div>
  );
}
