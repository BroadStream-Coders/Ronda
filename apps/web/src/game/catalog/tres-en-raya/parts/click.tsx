"use client";

import type { MouseEvent } from "react";

import type { LayerPart } from "@/game/kit";
import { clicks } from "../clicks";

export interface ClickPart extends LayerPart {
  type: "click";
}

export function ClickView() {
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const element = event.currentTarget.closest<HTMLElement>("[data-layer-id]");
    const layerId = element?.dataset.layerId;
    if (layerId) clicks.emit(layerId);
  };

  return (
    <div
      className="absolute inset-0 cursor-pointer"
      style={{ zIndex: 30 }}
      onClick={onClick}
    />
  );
}
