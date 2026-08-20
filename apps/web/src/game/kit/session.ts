"use client";

import { create } from "zustand";

interface GameSessionStore {
  session: unknown;
  fileName: string | null;
  loadedAt: number;
  setSession: (session: unknown, fileName: string) => void;
  clear: () => void;
}

export const useGameSession = create<GameSessionStore>((set) => ({
  session: null,
  fileName: null,
  loadedAt: 0,
  setSession: (session, fileName) =>
    set({ session, fileName, loadedAt: Date.now() }),
  clear: () => set({ session: null, fileName: null, loadedAt: 0 }),
}));
