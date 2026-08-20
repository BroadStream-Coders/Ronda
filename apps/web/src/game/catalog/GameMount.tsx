"use client";

import { useEffect, useState } from "react";

import { GameShell, type GameType } from "@/game/kit";

const loaders: Record<string, () => Promise<GameType>> = {
  deletreo: () => import("./deletreo").then((m) => m.deletreo),
};

export function GameMount({
  gameId,
  programId,
}: {
  gameId: string;
  programId: string;
}) {
  const [game, setGame] = useState<GameType | null>(null);

  useEffect(() => {
    let alive = true;
    setGame(null);
    loaders[gameId]?.().then((g) => {
      if (alive) setGame(g);
    });
    return () => {
      alive = false;
    };
  }, [gameId]);

  if (!game) return null;
  return <GameShell game={game} programId={programId} />;
}
