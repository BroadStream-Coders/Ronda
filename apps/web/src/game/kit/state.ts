"use client";

import { create } from "zustand";

import type { Layer } from "./layer";

export type PartPatch = Record<string, unknown>;
export type LayerPatch = Record<string, PartPatch>;
export type GameState = Record<string, LayerPatch>;

export function applyState(layout: Layer[], state: GameState): Layer[] {
  return layout.map((layer) => {
    const patch = state[layer.id];
    if (!patch) return layer;
    return {
      ...layer,
      parts: layer.parts.map((part) => {
        const fields = patch[part.type];
        return fields ? { ...part, ...fields } : part;
      }),
    };
  });
}

interface GameStateStore {
  state: GameState;
  patch: (layerId: string, partType: string, fields: PartPatch) => void;
  reset: () => void;
}

export const useGameState = create<GameStateStore>((set) => ({
  state: {},
  patch: (layerId, partType, fields) =>
    set((store) => {
      const layer = store.state[layerId] ?? {};
      return {
        state: {
          ...store.state,
          [layerId]: { ...layer, [partType]: { ...(layer[partType] ?? {}), ...fields } },
        },
      };
    }),
  reset: () => set({ state: {} }),
}));
