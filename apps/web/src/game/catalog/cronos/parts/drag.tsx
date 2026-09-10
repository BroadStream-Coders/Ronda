"use client";

import { useRef, useState, type PointerEvent } from "react";

import { useGameState, type Layer, type LayerPart, type Vec2 } from "@/game/kit";
import layout from "../layout.json";
import { placement } from "../placement";

export interface DragPart extends LayerPart {
  type: "drag";
}

const design = layout as Layer[];

const layerOf = (id: string) => design.find((layer) => layer.id === id);

const ZONE_IDS = design
  .map((layer) => layer.id)
  .filter((id) => /^zone-\d+-target$/.test(id))
  .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]));

const DRAG_Z = "1000";

interface DragState {
  cardId: string;
  element: HTMLElement;
  scale: number;
  origin: Vec2;
  start: { x: number; y: number };
}

function zoneAt(x: number, y: number) {
  for (const [index, id] of ZONE_IDS.entries()) {
    const element = document.querySelector<HTMLElement>(
      `[data-layer-id="${id}"]`,
    );
    if (!element) continue;
    const rect = element.getBoundingClientRect();
    if (x < rect.left || x > rect.right) continue;
    if (y < rect.top || y > rect.bottom) continue;
    return { index, element };
  }
  return null;
}

const positionOf = (cardId: string, fallback: Vec2): Vec2 =>
  useGameState.getState().state[cardId]?.position ?? fallback;

export function DragView() {
  const setPosition = useGameState((s) => s.setPosition);
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const element = event.currentTarget.closest<HTMLElement>("[data-layer-id]");
    const cardId = element?.dataset.layerId;
    const layer = cardId ? layerOf(cardId) : undefined;
    if (!element || !cardId || !layer) return;

    drag.current = {
      cardId,
      element,
      scale: element.getBoundingClientRect().width / layer.rect.size.x,
      origin: positionOf(cardId, layer.rect.position),
      start: { x: event.clientX, y: event.clientY },
    };
    element.style.zIndex = DRAG_Z;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;
    current.element.style.zIndex = DRAG_Z;
    setPosition(current.cardId, {
      x: current.origin.x + (event.clientX - current.start.x) / current.scale,
      y: current.origin.y - (event.clientY - current.start.y) / current.scale,
    });
  };

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current) return;
    drag.current = null;
    setDragging(false);
    current.element.style.zIndex = "";

    const zone = zoneAt(event.clientX, event.clientY);
    const holder = zone ? placement.cardOf(zone.index) : undefined;
    const occupied = holder !== undefined && holder !== current.cardId;

    if (zone && !occupied) {
      const card = current.element.getBoundingClientRect();
      const target = zone.element.getBoundingClientRect();
      const at = positionOf(current.cardId, current.origin);
      setPosition(current.cardId, {
        x:
          at.x +
          (target.left + target.width / 2 - (card.left + card.width / 2)) /
            current.scale,
        y:
          at.y -
          (target.top + target.height / 2 - (card.top + card.height / 2)) /
            current.scale,
      });
      placement.place(current.cardId, zone.index);
      return;
    }

    const home = layerOf(current.cardId)?.rect.position;
    if (home) setPosition(current.cardId, home);
    placement.remove(current.cardId);
  };

  return (
    <div
      className={`absolute inset-0 touch-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
      style={{ zIndex: 30 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
