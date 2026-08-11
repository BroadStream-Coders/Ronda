"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWorkspaceHeader } from "./use-workspace-header";

export function CollectorTopbar({ backHref }: { backHref?: string }) {
  const { title, icon, format, onSave, onLoad } = useWorkspaceHeader();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!title) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onLoad) onLoad(file);
    e.target.value = "";
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
        {onLoad && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload /> Cargar
          </Button>
        )}
        {onSave && (
          <Button size="sm" onClick={onSave}>
            <Download /> Guardar
          </Button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={format === "zip" ? ".zip" : ".json"}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </header>
  );
}
