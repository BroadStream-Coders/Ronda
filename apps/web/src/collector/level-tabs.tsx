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
    <div className={`flex h-full ${className}`}>
      <div className="flex-1 relative overflow-hidden">
        {levels.map((level, index) => (
          <div
            key={index}
            className="absolute inset-0"
            style={{
              opacity: activeIndex === index ? 1 : 0,
              pointerEvents: activeIndex === index ? "auto" : "none",
              zIndex: activeIndex === index ? 1 : 0,
            }}
          >
            {level.component}
          </div>
        ))}
      </div>

      <div className="flex flex-col shrink-0 border-l border-border bg-card/50">
        {levels.map((level, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`flex flex-col items-center gap-1.5 px-2 py-4 transition-colors border-r-2 ${
              activeIndex === index
                ? "text-primary border-primary bg-primary/5"
                : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/30"
            }`}
          >
            {level.icon && <level.icon className="h-3.5 w-3.5 shrink-0 mb-1" />}
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ writingMode: "vertical-lr" }}
            >
              {level.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
