"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { loadCollectorSession } from "@/data/collector-storage";
import { cn } from "@/lib/utils";
import { HostMessage } from "./HostMessage";
import type { HostView } from "./host";

type Status = "loading" | "ready" | "empty" | "error";

export function HostShell({
  programId,
  gameId,
  name,
  backHref,
  View,
}: {
  programId: string;
  gameId: string;
  name: string;
  backHref: string;
  View: HostView;
}) {
  const [reload, setReload] = useState(0);
  const [loaded, setLoaded] = useState<{
    key: string;
    status: Status;
    session: unknown;
  }>({ key: "", status: "loading", session: null });

  const key = `${programId}|${gameId}|${reload}`;
  const fresh = loaded.key === key;
  const status = fresh ? loaded.status : "loading";
  const session = fresh ? loaded.session : null;

  useEffect(() => {
    let alive = true;

    loadCollectorSession(programId, gameId)
      .then((data) => {
        if (!alive) return;
        setLoaded({
          key,
          status: data == null ? "empty" : "ready",
          session: data,
        });
      })
      .catch(() => {
        if (alive) setLoaded({ key, status: "error", session: null });
      });

    return () => {
      alive = false;
    };
  }, [programId, gameId, key]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
        <Link
          href={backHref}
          aria-label="Volver a la lista de juegos"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="font-heading min-w-0 flex-1 truncate text-xl font-semibold">
          {name}
        </h1>
        <button
          onClick={() => setReload((n) => n + 1)}
          disabled={status === "loading"}
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl px-4 text-base font-medium text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
        >
          <RefreshCw
            className={cn("size-4", status === "loading" && "animate-spin")}
          />
          Actualizar
        </button>
        <ThemeToggle className="size-11 shrink-0 rounded-xl" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        {status === "loading" && (
          <HostMessage title="Cargando" detail="Buscando los datos del programa." />
        )}
        {status === "empty" && (
          <HostMessage
            title="Todavía no hay datos"
            detail="Cuando el equipo guarde este juego en el colector, aparecerá acá."
          />
        )}
        {status === "error" && (
          <HostMessage
            title="No se pudieron cargar los datos"
            detail="Revisa la conexión y toca Actualizar."
          />
        )}
        {status === "ready" && <View session={session} />}
      </div>
    </div>
  );
}
