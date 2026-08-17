"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  CloudDownload,
  CloudUpload,
  Download,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  downloadCollectorData,
  uploadCollectorData,
} from "@/data/collector-storage";
import { ValidationDialog } from "../validation/ValidationDialog";
import type { ValidationIssue } from "../validation/validation";
import { useWorkspaceHeader } from "./use-workspace-header";

interface CollectorTopbarProps {
  backHref?: string;
  programId?: string;
  collectorId?: string;
}

type Status = { kind: "busy" | "done" | "error"; text: string };

type Confirmation = {
  title: string;
  body: string;
  actionLabel: string;
  action: () => void;
};

const STATUS_COLOR = {
  busy: "text-muted-foreground",
  done: "text-emerald-500",
  error: "text-destructive",
};

const TRIGGER_BASE =
  "inline-flex h-7 items-center justify-center rounded-[min(var(--radius-md),12px)] rounded-l-none px-1 outline-none transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5";

export function CollectorTopbar({
  backHref,
  programId,
  collectorId,
}: CollectorTopbarProps) {
  const { title, icon, format, onSave, onLoad, validate, getData } =
    useWorkspaceHeader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingActionRef = useRef<() => void>(() => {});
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [status, setStatus] = useState<Status | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  if (!title) return null;

  const cloudEnabled = Boolean(programId && collectorId && getData);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLoad) onLoad(file);
    e.target.value = "";
  };

  const runValidated = (action: () => void) => {
    const found = validate?.() ?? [];
    if (found.length > 0) {
      pendingActionRef.current = action;
      setIssues(found);
      return;
    }
    action();
  };

  const handleForceSave = () => {
    setIssues([]);
    pendingActionRef.current();
  };

  const doUpload = async () => {
    if (!programId || !collectorId || !getData) return;
    setStatus({ kind: "busy", text: "Subiendo…" });
    try {
      await uploadCollectorData(programId, collectorId, getData());
      setStatus({ kind: "done", text: "Subido" });
      setTimeout(() => setStatus(null), 4000);
    } catch (error) {
      setStatus({
        kind: "error",
        text: error instanceof Error ? error.message : "Error al subir",
      });
    }
  };

  const doDownload = async () => {
    if (!programId || !collectorId || !onLoad) return;
    setStatus({ kind: "busy", text: "Cargando…" });
    try {
      const file = await downloadCollectorData(programId, collectorId);
      if (!file) {
        setStatus({ kind: "error", text: "No hay nada guardado en la nube" });
        return;
      }
      onLoad(file);
      setStatus({ kind: "done", text: "Cargado" });
      setTimeout(() => setStatus(null), 4000);
    } catch {
      setStatus({ kind: "error", text: "Error al cargar" });
    }
  };

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
        )}
        {icon && (
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/20 text-primary ring-1 ring-primary/10">
            {icon}
          </div>
        )}
        <span className="text-sm font-semibold tracking-tight">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {status && (
          <span
            className={`max-w-48 truncate text-[10px] font-bold uppercase ${STATUS_COLOR[status.kind]}`}
            title={status.text}
          >
            {status.text}
          </span>
        )}

        {onLoad && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className={cloudEnabled ? "rounded-r-none" : undefined}
            >
              <Upload /> Cargar
            </Button>

            {cloudEnabled && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={status?.kind === "busy"}
                  aria-label="Más opciones de carga"
                  className={`${TRIGGER_BASE} border-l border-border text-muted-foreground hover:bg-accent hover:text-foreground`}
                >
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation({
                        title: "Cargar de la nube",
                        body: "Esto reemplaza lo que tienes en pantalla con lo guardado en la nube. Lo que no hayas guardado se pierde.",
                        actionLabel: "Cargar",
                        action: doDownload,
                      })
                    }
                  >
                    <CloudDownload /> Cargar de la nube
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        {onSave && (
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={() => runValidated(() => onSave())}
              className={cloudEnabled ? "rounded-r-none" : undefined}
            >
              <Download /> Guardar
            </Button>

            {cloudEnabled && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={status?.kind === "busy"}
                  aria-label="Más opciones de guardado"
                  className={`${TRIGGER_BASE} border-l border-primary-foreground/25 bg-primary text-primary-foreground hover:bg-primary/80`}
                >
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation({
                        title: "Subir a la nube",
                        body: "Esto reemplaza lo que esté guardado en la nube para este programa.",
                        actionLabel: "Subir",
                        action: () => runValidated(doUpload),
                      })
                    }
                  >
                    <CloudUpload /> Subir a la nube
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={format === "zip" ? ".zip" : ".json"}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <ValidationDialog
        open={issues.length > 0}
        onClose={() => setIssues([])}
        onForceSave={handleForceSave}
        issues={issues}
      />

      <Dialog
        open={confirmation !== null}
        onOpenChange={(isOpen) => !isOpen && setConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" />
              {confirmation?.title}
            </DialogTitle>
            <DialogDescription>{confirmation?.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmation(null)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                confirmation?.action();
                setConfirmation(null);
              }}
            >
              {confirmation?.actionLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
