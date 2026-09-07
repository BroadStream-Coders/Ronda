"use client";

import type { ReactNode } from "react";

interface RowCardProps {
  index: number;
  selected?: boolean;
  action?: ReactNode;
  children: ReactNode;
}

export function RowCard({ index, selected, action, children }: RowCardProps) {
  return (
    <div
      className={`group grid w-full grid-cols-[2rem_minmax(0,1fr)] items-stretch gap-2 rounded-xl border p-2 transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
          : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
      }`}
    >
      <div
        className={`flex flex-col gap-1.5 ${action ? "" : "justify-center"}`}
      >
        <div className="flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground">
          {index}
        </div>
        {action}
      </div>

      {children}
    </div>
  );
}
