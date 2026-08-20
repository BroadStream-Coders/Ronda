"use client";

import { useCallback, useSyncExternalStore } from "react";

const PREFIX = "ronda_game";

const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function settingKey(
  programId: string,
  gameId: string,
  name: string,
): string {
  return `${PREFIX}:${programId}:${gameId}:${name}`;
}

export function useGameSetting(key: string, fallback: string) {
  const value = useSyncExternalStore(
    subscribe,
    () => window.localStorage.getItem(key) ?? fallback,
    () => fallback,
  );

  const set = useCallback(
    (next: string | null) => {
      if (next === null) window.localStorage.removeItem(key);
      else window.localStorage.setItem(key, next);
      listeners.forEach((listener) => listener());
    },
    [key],
  );

  return [value, set] as const;
}
