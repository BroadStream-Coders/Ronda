"use client";

import { useEffect } from "react";
import { ChevronsLeft, ChevronsRight, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { GameType } from "./game";
import { findPart } from "./layer";
import type { ColorPart, TimerPart } from "./parts";
import { useGameState } from "./state";
import { settingKey, useGameSetting } from "./use-game-setting";

const HEX = /^#[0-9a-fA-F]{6}$/;
const PANEL_KEY = "ronda_game:config-open";
const MIN_SECONDS = 1;
const MAX_SECONDS = 999;

interface ControlProps {
  game: GameType;
  programId: string;
  layerId: string;
  expanded: boolean;
  onExpand: () => void;
}

function RestoreButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onClick}>
      <RotateCcw />
      Restaurar
    </Button>
  );
}

function ChromaControl({
  game,
  programId,
  layerId,
  expanded,
  onExpand,
}: ControlProps) {
  const fallback =
    findPart<ColorPart>(game.layout, layerId, "color")?.value ?? "#00FF00";
  const [chroma, setChroma] = useGameSetting(
    settingKey(programId, game.meta.id, "chroma"),
    fallback,
  );
  const patch = useGameState((s) => s.patch);

  useEffect(() => {
    patch(layerId, "color", { value: chroma });
  }, [layerId, chroma, patch]);

  if (!expanded) {
    return (
      <button
        onClick={onExpand}
        title={`Color del croma · ${chroma}`}
        aria-label="Expandir configuración"
        className="size-6 rounded-md border border-border outline-none transition-transform hover:scale-110 focus-visible:ring-3 focus-visible:ring-ring/50"
        style={{ backgroundColor: chroma }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="chroma" className="text-xs font-medium">
        Color del croma
      </label>
      <div className="flex items-center gap-2">
        <input
          id="chroma"
          type="color"
          value={chroma}
          onChange={(event) => setChroma(event.target.value.toUpperCase())}
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
      {chroma !== fallback && <RestoreButton onClick={() => setChroma(null)} />}
    </div>
  );
}

function TimerControl({
  game,
  programId,
  layerId,
  expanded,
  onExpand,
}: ControlProps) {
  const fallback = String(
    findPart<TimerPart>(game.layout, layerId, "timer")?.duration ?? 30,
  );
  const [duration, setDuration] = useGameSetting(
    settingKey(programId, game.meta.id, "duration"),
    fallback,
  );

  const commit = (input: HTMLInputElement) => {
    const parsed = Math.round(Number(input.value));
    const valid =
      Number.isFinite(parsed) &&
      parsed >= MIN_SECONDS &&
      parsed <= MAX_SECONDS;
    const next = valid ? String(parsed) : duration;
    input.value = next;
    setDuration(next === fallback ? null : next);
  };

  if (!expanded) {
    return (
      <button
        onClick={onExpand}
        title={`Duración del cronómetro · ${duration} s`}
        aria-label="Expandir configuración"
        className="flex h-6 w-8 items-center justify-center rounded-md border border-border font-mono text-[10px] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {duration}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="duration" className="text-xs font-medium">
        Duración del cronómetro
      </label>
      <div className="flex items-center gap-2">
        <Input
          id="duration"
          key={duration}
          type="number"
          inputMode="numeric"
          min={MIN_SECONDS}
          max={MAX_SECONDS}
          defaultValue={duration}
          onBlur={(event) => commit(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur();
          }}
          className="h-9 font-mono text-xs"
        />
        <span className="shrink-0 text-xs text-muted-foreground">segundos</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Se aplica en la siguiente ronda que arranques.
      </p>
      {duration !== fallback && (
        <RestoreButton onClick={() => setDuration(null)} />
      )}
    </div>
  );
}

interface GameConfigProps {
  game: GameType;
  programId: string;
}

export function GameConfig({ game, programId }: GameConfigProps) {
  const [panel, setPanel] = useGameSetting(PANEL_KEY, "0");

  const expanded = panel === "1";
  const controls = { game, programId, expanded, onExpand: () => setPanel("1") };

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

      <div
        className={cn(
          expanded
            ? "flex flex-col gap-4 p-4"
            : "flex flex-col items-center gap-2 py-4",
        )}
      >
        {expanded && (
          <div>
            <h2 className="text-sm font-medium">Configuración</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Solo afecta a este juego en este programa.
            </p>
          </div>
        )}

        {game.chromaLayerId && (
          <ChromaControl {...controls} layerId={game.chromaLayerId} />
        )}
        {game.timerLayerId && (
          <TimerControl {...controls} layerId={game.timerLayerId} />
        )}
      </div>
    </aside>
  );
}
