"use client";

import { create } from "zustand";

interface GameSessionStore {
  session: unknown;
  images: Record<string, string>;
  fileName: string | null;
  loadedAt: number;
  setSession: (
    session: unknown,
    fileName: string,
    images?: Record<string, Blob>,
  ) => void;
  clear: () => void;
}

function release(images: Record<string, string>) {
  for (const url of Object.values(images)) URL.revokeObjectURL(url);
}

function publish(images: Record<string, Blob>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(images).map(([path, blob]) => [
      path,
      URL.createObjectURL(blob),
    ]),
  );
}

export const useGameSession = create<GameSessionStore>((set) => ({
  session: null,
  images: {},
  fileName: null,
  loadedAt: 0,
  setSession: (session, fileName, images) =>
    set((store) => {
      release(store.images);
      return {
        session,
        fileName,
        loadedAt: Date.now(),
        images: images ? publish(images) : {},
      };
    }),
  clear: () =>
    set((store) => {
      release(store.images);
      return { session: null, images: {}, fileName: null, loadedAt: 0 };
    }),
}));
