"use client";

import { useState } from "react";
import { ClipboardPaste, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { parseExcelPaste } from "../data-processing";

interface QuickLoadProps {
  onLoad: (data: string[][]) => void;
  placeholder?: string;
  className?: string;
}

export function QuickLoad({
  onLoad,
  placeholder = "Pega aquí las celdas copiadas de tu planilla…",
  className = "",
}: QuickLoadProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const close = () => {
    setOpen(false);
    setValue("");
  };

  const handleLoad = () => {
    if (!value.trim()) return;
    const matrix = parseExcelPaste(value);
    if (matrix.length > 0) onLoad(matrix);
    close();
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={`h-9 w-full justify-start gap-2 text-muted-foreground ${className}`}
      >
        <ClipboardPaste />
        Pegar desde planilla
      </Button>
    );
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">Pegar desde planilla</span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={close}
          aria-label="Cancelar pegado"
          className="text-muted-foreground"
        >
          <X />
        </Button>
      </div>

      <textarea
        autoFocus
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleLoad();
        }}
        className="w-full resize-none rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />

      <Button onClick={handleLoad} disabled={!value.trim()} className="h-9">
        Llenar filas
      </Button>
    </div>
  );
}
