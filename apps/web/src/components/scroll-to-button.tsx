"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

export function ScrollToButton({
  targetId,
  children,
}: {
  targetId: string;
  children: ReactNode;
}) {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        document
          .getElementById(targetId)
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    >
      {children}
    </Button>
  );
}
