"use client";

import { cn } from "@/lib/utils";

export function RoundTabs({
  rounds,
  value,
  onChange,
}: {
  rounds: string[];
  value: number;
  onChange: (index: number) => void;
}) {
  if (rounds.length < 2) return null;

  return (
    <div
      role="tablist"
      aria-label="Rondas"
      className="flex shrink-0 items-stretch overflow-x-auto border-t border-border bg-muted"
    >
      {rounds.map((label, index) => {
        const active = value === index;
        return (
          <button
            key={index}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(index)}
            className={cn(
              "h-12 shrink-0 border-r border-b-2 border-border px-6 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              active
                ? "border-b-primary bg-card text-foreground"
                : "border-b-transparent text-muted-foreground",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
