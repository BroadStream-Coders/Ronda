"use client";

import { useEffect, useState } from "react";
import { Check, CloudCheck, Dot } from "lucide-react";

export type SaveStage =
  | { kind: "pristine" }
  | { kind: "dirty" }
  | { kind: "saved"; at: number }
  | { kind: "uploaded"; at: number };

function relative(at: number, now: number): string {
  const minutes = Math.floor((now - at) / 60000);
  if (minutes < 1) return "recién";
  if (minutes === 1) return "hace 1 minuto";
  if (minutes < 60) return `hace ${minutes} minutos`;
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "hace 1 hora" : `hace ${hours} horas`;
}

export function SaveState({ stage }: { stage: SaveStage }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  if (stage.kind === "pristine") {
    return (
      <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
        <Dot className="size-4" />
        Sin guardar todavía
      </span>
    );
  }

  if (stage.kind === "dirty") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
        <span className="size-1.5 rounded-full bg-accent" />
        Cambios sin guardar
      </span>
    );
  }

  const Icon = stage.kind === "uploaded" ? CloudCheck : Check;
  const label = stage.kind === "uploaded" ? "En la nube" : "Guardado";

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
      <Icon className="size-3.5 text-primary" />
      {label} {relative(stage.at, now)}
    </span>
  );
}
