"use client";

import { cn } from "@/lib/utils";

export function HostSwitch({
  options,
  value,
  onChange,
  label,
}: {
  options: string[];
  value: number;
  onChange: (index: number) => void;
  label: string;
}) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div
        role="tablist"
        aria-label={label}
        className="flex items-stretch overflow-hidden rounded-xl border border-border"
      >
        {options.map((option, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={value === index}
            onClick={() => onChange(index)}
            className={cn(
              "h-10 px-4 text-base font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
              index > 0 && "border-l border-border",
              value === index
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
