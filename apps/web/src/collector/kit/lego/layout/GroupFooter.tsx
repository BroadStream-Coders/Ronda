"use client";

import { ReactNode } from "react";

interface GroupFooterProps {
  children: ReactNode;
}

export function GroupFooter({ children }: GroupFooterProps) {
  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-border bg-muted/30 p-3">
      {children}
    </div>
  );
}
