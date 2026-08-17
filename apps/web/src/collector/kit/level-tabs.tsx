"use client";

import { useState, ElementType, ReactNode } from "react";

interface LevelTab {
  name: string;
  icon?: ElementType;
  component: ReactNode;
}

interface LevelTabsProps {
  levels: LevelTab[];
  className?: string;
}

export function LevelTabs({ levels, className = "" }: LevelTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <div
        role="tablist"
        aria-label="Niveles"
        className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-border bg-card px-3 py-2"
      >
        {levels.map((level, index) => {
          const active = activeIndex === index;
          const Icon = level.icon;
          return (
            <button
              key={index}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveIndex(index)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {Icon && <Icon className="size-4" />}
              {level.name}
            </button>
          );
        })}
      </div>

      <div className="relative min-h-0 flex-1">
        {levels.map((level, index) => (
          <div
            key={index}
            role="tabpanel"
            hidden={activeIndex !== index}
            className="absolute inset-0"
          >
            {level.component}
          </div>
        ))}
      </div>
    </div>
  );
}
