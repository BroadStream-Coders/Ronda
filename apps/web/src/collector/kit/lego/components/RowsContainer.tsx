"use client";

import { ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RowsContainerProps {
  children: ReactNode;
  gap?: string;
  className?: string;
}

export function RowsContainer({
  children,
  gap = "gap-1.5",
  className = "",
}: RowsContainerProps) {
  return (
    <div className="min-h-0 flex-1">
      <ScrollArea className={`h-full ${className}`}>
        <div className={`flex flex-col px-3 py-3 ${gap}`}>{children}</div>
      </ScrollArea>
    </div>
  );
}
