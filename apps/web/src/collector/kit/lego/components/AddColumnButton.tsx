"use client";

import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  label: string;
  sublabel?: string;
  onClick: () => void;
  width?: string;
}

export function AddColumnButton({
  label,
  sublabel,
  onClick,
  width = "w-[200px]",
}: AddColumnButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`group flex h-full shrink-0 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card/40 px-4 text-muted-foreground transition-colors hover:border-primary/50 hover:bg-card hover:text-foreground ${width}`}
    >
      <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
        <Plus className="size-4" />
      </span>
      <span className="text-center">
        <span className="block text-sm font-medium">{label}</span>
        {sublabel && (
          <span className="mt-0.5 block text-xs text-muted-foreground">
            {sublabel}
          </span>
        )}
      </span>
    </button>
  );
}
