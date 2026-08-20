"use client";

import { create } from "zustand";

import type { Layer, Vec2 } from "./layer";

export type PartPatch = Record<string, unknown>;

export interface LayerOverride {
  position?: Vec2;
  parts?: Record<string, PartPatch>;
}

export type GameState = Record<string, LayerOverride>;

export function applyState(layout: Layer[], state: GameState): Layer[] {
  return layout.map((layer) => {
    const override = state[layer.id];
    if (!override) return layer;
    const { position, parts } = override;
    return {
      ...layer,
      rect: position ? { ...layer.rect, position } : layer.rect,
      parts: parts
        ? layer.parts.map((part) => {
            const fields = parts[part.type];
            return fields ? { ...part, ...fields } : part;
          })
        : layer.parts,
    };
  });
}

interface GameStateStore {
  state: GameState;
  patch: (layerId: string, partType: string, fields: PartPatch) => void;
  setPosition: (layerId: string, position: Vec2) => void;
  reset: () => void;
}

export const useGameState = create<GameStateStore>((set) => ({
  state: {},
  patch: (layerId, partType, fields) =>
    set((store) => {
      const layer = store.state[layerId] ?? {};
      const parts = layer.parts ?? {};
      return {
        state: {
          ...store.state,
          [layerId]: {
            ...layer,
            parts: { ...parts, [partType]: { ...(parts[partType] ?? {}), ...fields } },
          },
        },
      };
    }),
  setPosition: (layerId, position) =>
    set((store) => ({
      state: {
        ...store.state,
        [layerId]: { ...(store.state[layerId] ?? {}), position },
      },
    })),
  reset: () => set({ state: {} }),
}));
