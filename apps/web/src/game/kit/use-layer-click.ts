"use client";

import { useEffect, useMemo, useRef } from "react";

import type { Layer, LayerPart } from "./layer";

export interface ClickPart extends LayerPart {
  type: "click";
}

export function useLayerClick(
  layout: Layer[],
  onClick: (layerId: string) => void,
) {
  const handler = useRef(onClick);
  useEffect(() => {
    handler.current = onClick;
  });

  const clickable = useMemo(
    () =>
      new Set(
        layout
          .filter((layer) => layer.parts.some((part) => part.type === "click"))
          .map((layer) => layer.id),
      ),
    [layout],
  );

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;
      let element =
        (event.target as HTMLElement | null)?.closest<HTMLElement>(
          "[data-layer-id]",
        ) ?? null;
      while (element) {
        const id = element.dataset.layerId;
        if (id && clickable.has(id)) {
          handler.current(id);
          return;
        }
        element =
          element.parentElement?.closest<HTMLElement>("[data-layer-id]") ?? null;
      }
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [clickable]);
}
