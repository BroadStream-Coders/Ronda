"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";

import { loadCollectorSession } from "@/data/collector-storage";
import { cn } from "@/lib/utils";
import type { HostView } from "./host";

type Status = "loading" | "ready" | "empty" | "error";

function Message({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-20 text-center">
      <p className="text-lg font-medium">{title}</p>
      <p className="max-w-md text-base text-muted-foreground">{detail}</p>
    </div>
  );
}

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
  const [session, setSession] = useState<unknown>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let alive = true;
    setStatus("loading");

    loadCollectorSession(programId, gameId)
      .then((data) => {
        if (!alive) return;
        setSession(data);
        setStatus(data == null ? "empty" : "ready");
      })
      .catch(() => {
        if (alive) setStatus("error");
      });

    return () => {
      alive = false;
    };
  }, [programId, gameId, reload]);

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
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {status === "loading" && (
          <Message title="Cargando" detail="Buscando los datos del programa." />
        )}
        {status === "empty" && (
          <Message
            title="Todavía no hay datos"
            detail="Cuando el equipo guarde este juego en el colector, aparecerá acá."
          />
        )}
        {status === "error" && (
          <Message
            title="No se pudieron cargar los datos"
            detail="Revisa la conexión y toca Actualizar."
          />
        )}
        {status === "ready" && <View session={session} />}
      </div>
    </div>
  );
}
