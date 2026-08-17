"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  CloudDownload,
  CloudUpload,
  Loader2,
  Save,
  TriangleAlert,
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
import { notifyError, notifySuccess } from "../notices/use-notices";
import { ValidationDialog } from "../validation/ValidationDialog";
import type { ValidationIssue } from "../validation/validation";
import { SaveState, type SaveStage } from "./SaveState";
import { useWorkspaceHeader } from "./use-workspace-header";

interface CollectorTopbarProps {
  backHref?: string;
  programId?: string;
  collectorId?: string;
}

type Confirmation = {
  title: string;
  body: string;
  actionLabel: string;
  action: () => void;
};

const SPLIT_TRIGGER =
  "inline-flex h-9 items-center justify-center rounded-lg rounded-l-none px-1.5 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5";

export function CollectorTopbar({
  backHref,
  programId,
  collectorId,
}: CollectorTopbarProps) {
  const { title, icon, format, onSave, onLoad, validate, getData, getFiles } =
    useWorkspaceHeader();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingActionRef = useRef<() => void>(() => {});
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [stage, setStage] = useState<SaveStage>({ kind: "pristine" });
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  const firstDataRef = useRef(true);
  useEffect(() => {
    if (!getData) return;
    if (firstDataRef.current) {
      firstDataRef.current = false;
      return;
    }
    setStage({ kind: "dirty" });
  }, [getData]);

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

  const doSave = () => {
    onSave?.();
    setStage({ kind: "saved", at: Date.now() });
  };

  const doUpload = async () => {
    if (!programId || !collectorId || !getData) return;
    setBusy("Subiendo…");
    try {
      await uploadCollectorData(
        programId,
        collectorId,
        getData(),
        getFiles?.() ?? [],
      );
      setStage({ kind: "uploaded", at: Date.now() });
      notifySuccess("Los datos quedaron guardados en la nube.");
    } catch (error) {
      notifyError(
        error instanceof Error
          ? `No se pudo subir: ${error.message}`
          : "No se pudo subir a la nube. Revisa tu conexión e intenta de nuevo.",
      );
    } finally {
      setBusy(null);
    }
  };

  const doDownload = async () => {
    if (!programId || !collectorId || !onLoad) return;
    setBusy("Cargando…");
    try {
      const file = await downloadCollectorData(
        programId,
        collectorId,
        format === "zip" ? "zip" : "json",
      );
      if (!file) {
        notifyError("Todavía no hay nada guardado en la nube para este juego.");
        return;
      }
      onLoad(file);
      setStage({ kind: "uploaded", at: Date.now() });
      notifySuccess("Se cargó lo último que había en la nube.");
    } catch {
      notifyError("No se pudo cargar desde la nube. Intenta de nuevo.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3 sm:px-4">
      {backHref && (
        <Button
          variant="ghost"
          size="sm"
          nativeButton={false}
          className="h-9 gap-1.5 text-muted-foreground"
          render={<Link href={backHref} />}
        >
          <ArrowLeft />
          <span className="hidden sm:inline">Volver</span>
        </Button>
      )}

      <span className="h-6 w-px bg-border" aria-hidden />

      <div className="flex min-w-0 items-center gap-2.5">
        {icon && (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
            {icon}
          </span>
        )}
        <span className="font-heading truncate text-base font-semibold tracking-tight">
          {title}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {busy ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3.5 animate-spin" />
            {busy}
          </span>
        ) : (
          <SaveState stage={stage} />
        )}

        {onLoad && (
          <div className="flex items-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy !== null}
              className={`h-9 gap-1.5 ${cloudEnabled ? "rounded-r-none border-r-0" : ""}`}
            >
              <Upload />
              <span className="hidden sm:inline">Cargar</span>
            </Button>

            {cloudEnabled && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={busy !== null}
                  aria-label="Más opciones de carga"
                  className={`${SPLIT_TRIGGER} border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground`}
                >
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation({
                        title: "Cargar de la nube",
                        body: "Se reemplaza lo que tienes en pantalla por lo último guardado en la nube. Lo que no hayas guardado se pierde.",
                        actionLabel: "Cargar de la nube",
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
              onClick={() => runValidated(doSave)}
              disabled={busy !== null}
              className={`h-9 gap-1.5 ${cloudEnabled ? "rounded-r-none" : ""}`}
            >
              <Save />
              Guardar
            </Button>

            {cloudEnabled && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  disabled={busy !== null}
                  aria-label="Más opciones de guardado"
                  className={`${SPLIT_TRIGGER} border-l border-primary-foreground/25 bg-primary text-primary-foreground hover:bg-primary/80`}
                >
                  <ChevronDown />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      setConfirmation({
                        title: "Subir a la nube",
                        body: "Se reemplaza lo que esté guardado en la nube para este programa por lo que tienes en pantalla.",
                        actionLabel: "Subir a la nube",
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
        onForceSave={() => {
          setIssues([]);
          pendingActionRef.current();
        }}
        issues={issues}
      />

      <Dialog
        open={confirmation !== null}
        onOpenChange={(isOpen) => !isOpen && setConfirmation(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TriangleAlert className="size-5 text-accent" />
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
