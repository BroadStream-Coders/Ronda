"use client";

import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

import { useNotices, type NoticeKind } from "./use-notices";

const STYLES: Record<
  NoticeKind,
  { icon: typeof Info; ring: string; tint: string; iconColor: string }
> = {
  error: {
    icon: TriangleAlert,
    ring: "border-destructive/40",
    tint: "bg-destructive/10",
    iconColor: "text-destructive",
  },
  success: {
    icon: CheckCircle2,
    ring: "border-primary/40",
    tint: "bg-primary/10",
    iconColor: "text-primary",
  },
  info: {
    icon: Info,
    ring: "border-border",
    tint: "bg-muted",
    iconColor: "text-muted-foreground",
  },
};

export function NoticeStack() {
  const notices = useNotices((s) => s.notices);
  const dismiss = useNotices((s) => s.dismiss);

  if (notices.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
    >
      {notices.map(({ id, kind, text }) => {
        const { icon: Icon, ring, tint, iconColor } = STYLES[kind];
        return (
          <div
            key={id}
            className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border ${ring} bg-card p-3 pr-2 shadow-lg shadow-foreground/5 animate-in fade-in slide-in-from-bottom-2`}
          >
            <span
              className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tint} ${iconColor}`}
            >
              <Icon className="size-4" />
            </span>
            <p className="flex-1 pt-1.5 text-sm leading-snug text-card-foreground">
              {text}
            </p>
            <button
              onClick={() => dismiss(id)}
              aria-label="Cerrar aviso"
              className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
