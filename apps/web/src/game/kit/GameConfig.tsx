"use client";

import { useEffect } from "react";
import { ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GameType } from "./game";
import { findPart } from "./layer";
import type { ColorPart } from "./parts";
import { useGameState } from "./state";
import { settingKey, useGameSetting } from "./use-game-setting";

const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL_KEY = "ronda_game:config-open";

function layoutChroma(game: GameType, layerId: string): string {
  return findPart<ColorPart>(game.layout, layerId, "color")?.value ?? "#00FF00";
}

interface GameConfigProps {
  game: GameType;
  programId: string;
  layerId: string;
}

export function GameConfig({ game, programId, layerId }: GameConfigProps) {
  const fallback = layoutChroma(game, layerId);
  const [chroma, setChroma] = useGameSetting(
    settingKey(programId, game.meta.id, "chroma"),
    fallback,
  );
  const [panel, setPanel] = useGameSetting(PANEL_KEY, "0");
  const patch = useGameState((s) => s.patch);

  const expanded = panel === "1";

  useEffect(() => {
    patch(layerId, "color", { value: chroma });
  }, [layerId, chroma, patch]);

  return (
    <aside
      className={cn(
        "relative flex shrink-0 flex-col border-l border-border bg-card transition-[width] duration-200",
        expanded ? "w-60" : "w-12",
      )}
    >
      <button
        onClick={() => setPanel(expanded ? "0" : "1")}
        title={expanded ? "Contraer configuración" : "Expandir configuración"}
        aria-label={
          expanded ? "Contraer configuración" : "Expandir configuración"
        }
        aria-expanded={expanded}
        className="absolute -left-3 top-4 z-30 flex size-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {expanded ? (
          <ChevronsRight className="size-3.5" />
        ) : (
          <ChevronsLeft className="size-3.5" />
        )}
      </button>

      {expanded ? (
        <div className="flex flex-col gap-4 p-4">
          <div>
            <h2 className="text-sm font-medium">Configuración</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo afecta a este juego en este programa.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="chroma" className="text-xs font-medium">
              Color del croma
            </label>
            <div className="flex items-center gap-2">
              <input
                id="chroma"
                type="color"
                value={chroma}
                onChange={(event) =>
                  setChroma(event.target.value.toUpperCase())
                }
                className="size-9 shrink-0 cursor-pointer rounded-lg border border-border bg-transparent p-1"
              />
              <Input
                key={chroma}
                aria-label="Código hexadecimal del croma"
                defaultValue={chroma}
                spellCheck={false}
                onChange={(event) => {
                  const next = event.target.value.toUpperCase();
                  if (HEX.test(next)) setChroma(next);
                }}
                className="h-9 font-mono text-xs uppercase"
              />
            </div>
          </div>

          {chroma !== fallback && (
            <Button variant="ghost" size="sm" onClick={() => setChroma(null)}>
              <RotateCcw />
              Restaurar
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center py-4">
          <button
            onClick={() => setPanel("1")}
            title={`Color del croma · ${chroma}`}
            aria-label="Expandir configuración"
            className="size-6 rounded-md border border-border outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
            style={{ backgroundColor: chroma }}
          />
        </div>
      )}
    </aside>
  );
}
