"use client";

import type { ReactNode } from "react";

interface RowCardProps {
  index: number;
  selected?: boolean;
  action?: ReactNode;
  inline?: boolean;
  children: ReactNode;
}

const badgeClass =
  "flex h-8 w-full items-center justify-center rounded border border-border bg-muted/30 text-xs font-mono font-medium text-muted-foreground";

export function RowCard({
  index,
  selected,
  action,
  inline,
  children,
}: RowCardProps) {
  const frameClass = `group grid w-full gap-2 rounded-xl border p-2 transition-all duration-200 ${
    selected
      ? "border-primary bg-primary/10 ring-1 ring-primary shadow-xs"
      : "border-border bg-card hover:border-primary/40 hover:shadow-xs"
  }`;

  if (inline) {
    return (
      <div
        className={`${frameClass} items-center ${
          action
            ? "grid-cols-[2rem_minmax(0,1fr)_2rem]"
            : "grid-cols-[2rem_minmax(0,1fr)]"
        }`}
      >
        <div className={badgeClass}>{index}</div>
        {children}
        {action}
      </div>
    );
  }

  return (
    <div className={`${frameClass} grid-cols-[2rem_minmax(0,1fr)] items-stretch`}>
      <div
        className={`flex flex-col gap-1.5 ${action ? "" : "justify-center"}`}
      >
        <div className={badgeClass}>{index}</div>
        {action}
      </div>

      {children}
    </div>
  );
}
