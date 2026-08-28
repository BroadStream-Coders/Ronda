"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CloudDownload,
  Info,
  Maximize,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadCollectorData,
  getCollectorSessionInfo,
} from "@/data/collector-storage";
import type { GameType } from "./game";
import { useGameSession } from "./session";

interface GameTopbarProps {
  game: GameType;
  programId: string;
  onFullscreen: () => void;
}

interface Source {
  origin: string;
  at: number;
}

const SPLIT_TRIGGER =
  "inline-flex h-7 items-center justify-center rounded-lg rounded-l-none border border-l-0 border-border bg-background px-1.5 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5";

function formatDate(at: number): string {
  return new Date(at).toLocaleString("es-PE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function GameTopbar({ game, programId, onFullscreen }: GameTopbarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileName = useGameSession((s) => s.fileName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<Source | null>(null);
  const [hasCloudData, setHasCloudData] = useState(false);

  const collectorId = game.meta.id;

  useEffect(() => {
    let alive = true;
    void getCollectorSessionInfo(programId, collectorId).then((info) => {
      if (alive) setHasCloudData(info !== null);
    });
    return () => {
      alive = false;
    };
  }, [programId, collectorId]);

  const Icon = game.meta.icon;

  async function load(
    origin: string,
    get: () => Promise<{ file: File; at: number } | null>,
  ) {
    setError(null);
    setLoading(true);
    try {
      const found = await get();
      if (!found) {
        setHasCloudData(false);
        setError("Todavía no hay datos guardados en la nube para este juego.");
        return;
      }
      await game.load(found.file);
      setSource({ origin, at: found.at });
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "No se pudieron cargar los datos.",
      );
    } finally {
      setLoading(false);
    }
  }

  function loadFromCloud() {
    void load("Nube", async () => {
      const info = await getCollectorSessionInfo(programId, collectorId);
      const file = await downloadCollectorData(
        programId,
        collectorId,
        game.images ? "zip" : "json",
      );
      return (
        file && {
          file,
          at: info?.updatedAt ? Date.parse(info.updatedAt) : Date.now(),
        }
      );
    });
  }

  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </span>
      <span className="font-heading text-sm font-semibold">
        {game.meta.name}
      </span>

      <span className="flex min-w-0 flex-1 items-center gap-1.5 text-xs text-muted-foreground">
        {error ? (
          <span className="inline-flex min-w-0 items-center gap-1.5 text-destructive">
            <TriangleAlert className="size-3.5 shrink-0" />
            <span className="truncate">{error}</span>
          </span>
        ) : loading ? (
          "Cargando los datos…"
        ) : (
          <>
            <span className="truncate">{fileName ?? "Sin datos cargados"}</span>
            {fileName && source && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  aria-label="Detalles de los datos cargados"
                  className="shrink-0 rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <Info className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="px-2 py-1.5">
                  <div className="text-xs text-muted-foreground">
                    Origen: {source.origin}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Fecha: {formatDate(source.at)}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </>
        )}
      </span>

      <input
        ref={inputRef}
        type="file"
        accept=".json,.zip"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void load("Archivo local", async () => ({
              file,
              at: file.lastModified,
            }));
          }
          event.target.value = "";
        }}
      />

      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => inputRef.current?.click()}
          className={hasCloudData ? "rounded-r-none border-r-0" : ""}
        >
          <Upload />
          Cargar datos
        </Button>

        {hasCloudData && (
          <DropdownMenu>
            <DropdownMenuTrigger
              disabled={loading}
              aria-label="Más opciones de carga"
              className={SPLIT_TRIGGER}
            >
              <ChevronDown />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={loadFromCloud}>
                <CloudDownload /> Cargar de la nube
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Button size="sm" onClick={onFullscreen}>
        <Maximize />
        Pantalla completa
      </Button>
    </div>
  );
}
