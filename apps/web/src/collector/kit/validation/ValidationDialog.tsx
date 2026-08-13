"use client";

import { AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ValidationIssue } from "./validation";

interface ValidationDialogProps {
  open: boolean;
  onClose: () => void;
  onForceSave: () => void;
  issues: ValidationIssue[];
}

export function ValidationDialog({
  open,
  onClose,
  onForceSave,
  issues,
}: ValidationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-destructive" />
            No se puede guardar
          </DialogTitle>
          <DialogDescription>
            Hay {issues.length}{" "}
            {issues.length === 1 ? "campo pendiente" : "campos pendientes"} por
            completar antes de guardar.
          </DialogDescription>
        </DialogHeader>

        <ul className="max-h-72 space-y-1.5 overflow-y-auto pr-1">
          {issues.map((issue, index) => (
            <li
              key={index}
              className="flex flex-col rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2"
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-destructive">
                {issue.path}
              </span>
              <span className="text-xs text-foreground">{issue.message}</span>
            </li>
          ))}
        </ul>

        <DialogFooter>
          <Button variant="outline" onClick={onForceSave}>
            Guardar de todos modos
          </Button>
          <Button onClick={onClose}>Entendido</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
