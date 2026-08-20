"use client";

import { GameShell } from "@/game/kit";
import { registry } from "./registry";

export function GameMount({ gameId }: { gameId: string }) {
  const game = registry[gameId];
  if (!game) return null;
  return <GameShell game={game} />;
}
