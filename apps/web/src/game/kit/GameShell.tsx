"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { AnimationsProvider } from "./animations/context";
import { FontRegistryProvider } from "./font-context";
import { GameConfig } from "./GameConfig";
import type { GameType } from "./game";
import { GameTopbar } from "./GameTopbar";
import { LayerView } from "./LayerView";
import { preloadMedia } from "./media";
import { NATIVE_PARTS } from "./parts";
import { PartRegistryProvider } from "./part-context";
import type { PartRegistry } from "./registry";
import { useGameSession } from "./session";
import { Stage } from "./Stage";
import { applyState, useGameState } from "./state";

export function GameShell({
  game,
  programId,
}: {
  game: GameType;
  programId: string;
}) {
  const state = useGameState((s) => s.state);
  const setPosition = useGameState((s) => s.setPosition);
  const resetState = useGameState((s) => s.reset);
  const clearSession = useGameSession((s) => s.clear);

  const registry = useMemo<PartRegistry>(
    () => ({ ...NATIVE_PARTS, ...game.parts }),
    [game.parts],
  );
  const layers = useMemo(
    () => applyState(game.layout, state),
    [game.layout, state],
  );

  const fullscreenRef = useRef<(() => void) | null>(null);
  const registerFullscreen = useCallback((toggle: () => void) => {
    fullscreenRef.current = toggle;
  }, []);

  const preload = game.preload;
  const [ready, setReady] = useState(!preload?.length);
  useEffect(() => {
    if (!preload?.length) return;
    let alive = true;
    void preloadMedia(preload).then(() => {
      if (alive) setReady(true);
    });
    return () => {
      alive = false;
    };
  }, [preload]);

  useEffect(
    () => () => {
      resetState();
      clearSession();
    },
    [resetState, clearSession],
  );

  const Logic = game.logic;

  const fonts = useMemo(() => game.fonts ?? {}, [game.fonts]);

  return (
    <FontRegistryProvider value={fonts}>
      <PartRegistryProvider value={registry}>
        <AnimationsProvider>
        {ready && Logic && <Logic />}
        <div className="flex h-full flex-col">
          <GameTopbar
            game={game}
            onFullscreen={() => fullscreenRef.current?.()}
          />
          <div className="flex min-h-0 flex-1">
            <Stage onReady={registerFullscreen}>
              {ready ? (
                layers
                  .filter((layer) => !layer.parentId && layer.visible)
                  .map((layer) => (
                    <LayerView
                      key={layer.id}
                      layer={layer}
                      all={layers}
                      onPosition={setPosition}
                    />
                  ))
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[3cqh] text-white/70">
                    Cargando el juego
                  </span>
                </div>
              )}
            </Stage>
            {game.chromaLayerId && (
              <GameConfig
                game={game}
                programId={programId}
                layerId={game.chromaLayerId}
              />
            )}
          </div>
        </div>
        </AnimationsProvider>
      </PartRegistryProvider>
    </FontRegistryProvider>
  );
}
