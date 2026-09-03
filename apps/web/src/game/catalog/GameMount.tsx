"use client";

import { useEffect, useState } from "react";

import { GameShell, type GameType } from "@/game/kit";

const loaders: Record<string, () => Promise<GameType>> = {
  deletreo: () => import("./deletreo").then((m) => m.deletreo),
  "calculo-mental": () =>
    import("./calculo-mental").then((m) => m.calculoMental),
  "la-sabes-o-no": () =>
    import("./la-sabes-o-no").then((m) => m.laSabesONo),
  "mi-libro-favorito": () =>
    import("./mi-libro-favorito").then((m) => m.miLibroFavorito),
  intruso: () => import("./intruso").then((m) => m.intruso),
  "al-vuelo": () => import("./al-vuelo").then((m) => m.alVuelo),
  "arma-la-oracion": () =>
    import("./arma-la-oracion").then((m) => m.armaLaOracion),
  "arma-la-palabra": () =>
    import("./arma-la-palabra").then((m) => m.armaLaPalabra),
  album: () => import("./album").then((m) => m.album),
  cronos: () => import("./cronos").then((m) => m.cronos),
  "tres-en-raya": () =>
    import("./tres-en-raya").then((m) => m.tresEnRaya),
  "galeria-fotos": () =>
    import("./galeria-fotos").then((m) => m.galeriaFotos),
  "reto-cruzado": () =>
    import("./reto-cruzado").then((m) => m.retoCruzado),
  "busca-logo": () => import("./busca-logo").then((m) => m.buscaLogo),
};

interface Mounted {
  id: string;
  game?: GameType;
  error?: string;
}

export function GameMount({
  gameId,
  programId,
}: {
  gameId: string;
  programId: string;
}) {
  const [mounted, setMounted] = useState<Mounted | null>(null);
  const fresh = mounted?.id === gameId ? mounted : null;
  const known = gameId in loaders;

  useEffect(() => {
    const loader = loaders[gameId];
    if (!loader) return;

    let alive = true;
    loader().then(
      (game) => {
        if (alive) setMounted({ id: gameId, game });
      },
      (cause) => {
        console.error(`No se pudo cargar el juego "${gameId}".`, cause);
        if (alive) {
          setMounted({
            id: gameId,
            error:
              cause instanceof Error
                ? cause.message
                : "No se pudo cargar el juego.",
          });
        }
      },
    );

    return () => {
      alive = false;
    };
  }, [gameId]);

  if (fresh?.game) {
    return <GameShell game={fresh.game} programId={programId} />;
  }

  const error = known
    ? fresh?.error
    : `No hay ningún juego registrado con el id "${gameId}".`;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
      {error ? (
        <>
          <p className="text-lg font-medium text-destructive">
            No se pudo cargar el juego
          </p>
          <p className="max-w-md text-sm text-muted-foreground">{error}</p>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Cargando el juego</p>
      )}
    </div>
  );
}
