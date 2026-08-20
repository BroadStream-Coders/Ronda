"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

export type AnimationTrigger = () => Promise<void>;

export interface AnimationsApi {
  register: (layerId: string, type: string, run: AnimationTrigger) => void;
  unregister: (layerId: string, type: string) => void;
  play: (layerId: string, type: string) => Promise<void>;
  playStagger: (
    layerIds: string[],
    type: string,
    stepMs?: number,
  ) => Promise<void>;
}

const AnimationsContext = createContext<AnimationsApi>({
  register: () => {},
  unregister: () => {},
  play: () => Promise.resolve(),
  playStagger: () => Promise.resolve(),
});

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function AnimationsProvider({ children }: { children: ReactNode }) {
  const triggers = useRef(new Map<string, Map<string, AnimationTrigger>>());

  const register = useCallback(
    (layerId: string, type: string, run: AnimationTrigger) => {
      let byType = triggers.current.get(layerId);
      if (!byType) {
        byType = new Map();
        triggers.current.set(layerId, byType);
      }
      byType.set(type, run);
    },
    [],
  );

  const unregister = useCallback((layerId: string, type: string) => {
    const byType = triggers.current.get(layerId);
    if (!byType) return;
    byType.delete(type);
    if (byType.size === 0) triggers.current.delete(layerId);
  }, []);

  const play = useCallback(
    (layerId: string, type: string) =>
      triggers.current.get(layerId)?.get(type)?.() ?? Promise.resolve(),
    [],
  );

  const playStagger = useCallback(
    (layerIds: string[], type: string, stepMs = 100) =>
      Promise.all(
        layerIds.map((layerId, i) =>
          delay(i * stepMs).then(() => play(layerId, type)),
        ),
      ).then(() => {}),
    [play],
  );

  const api = useMemo(
    () => ({ register, unregister, play, playStagger }),
    [register, unregister, play, playStagger],
  );

  return (
    <AnimationsContext.Provider value={api}>
      {children}
    </AnimationsContext.Provider>
  );
}

export function useAnimations(): AnimationsApi {
  return useContext(AnimationsContext);
}
