"use client";

import { useEffect, useState } from "react";

import { GameShell, type GameType } from "@/game/kit";

const loaders: Record<string, () => Promise<GameType>> = {
  deletreo: () => import("./deletreo").then((m) => m.deletreo),
  "calculo-mental": () =>
    import("./calculo-mental").then((m) => m.calculoMental),
  "arma-la-oracion": () =>
    import("./arma-la-oracion").then((m) => m.armaLaOracion),
};

export function GameMount({
  gameId,
  programId,
}: {
  gameId: string;
  programId: string;
}) {
  const [loaded, setLoaded] = useState<{ id: string; game: GameType } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    loaders[gameId]?.().then((game) => {
      if (alive) setLoaded({ id: gameId, game });
    });
    return () => {
      alive = false;
    };
  }, [gameId]);

  if (loaded?.id !== gameId) return null;
  return <GameShell game={loaded.game} programId={programId} />;
}
