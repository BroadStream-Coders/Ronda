"use client";

import { useEffect, useState } from "react";

import { HostShell, type HostView } from "@/host/kit";
import { views } from "./views";

export function HostMount({
  programId,
  gameId,
  name,
  backHref,
}: {
  programId: string;
  gameId: string;
  name: string;
  backHref: string;
}) {
  const [loaded, setLoaded] = useState<{ id: string; View: HostView } | null>(
    null,
  );

  useEffect(() => {
    let alive = true;
    views[gameId]?.().then((View) => {
      if (alive) setLoaded({ id: gameId, View });
    });
    return () => {
      alive = false;
    };
  }, [gameId]);

  if (loaded?.id !== gameId) return null;

  return (
    <HostShell
      programId={programId}
      gameId={gameId}
      name={name}
      backHref={backHref}
      View={loaded.View}
    />
  );
}
