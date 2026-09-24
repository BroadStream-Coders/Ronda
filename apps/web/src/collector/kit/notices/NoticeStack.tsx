"use client";

import { useState } from "react";
import { Check, CheckCircle2, Copy, Info, TriangleAlert, X } from "lucide-react";

import { useNotices, type Notice, type NoticeKind } from "./use-notices";

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

type CopyState = "idle" | "copied" | "failed";

const COPY_LABEL: Record<CopyState, string> = {
  idle: "Copiar detalle",
  copied: "Copiado",
  failed: "No se pudo copiar",
};

function NoticeCard({ notice }: { notice: Notice }) {
  const dismiss = useNotices((s) => s.dismiss);
  const [copy, setCopy] = useState<CopyState>("idle");
  const { icon: Icon, ring, tint, iconColor } = STYLES[notice.kind];
  const detail = notice.detail;

  const copyDetail = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(detail);
      setCopy("copied");
    } catch (error) {
      console.error("No se pudo copiar el detalle del error.", error);
      setCopy("failed");
    }
  };

  return (
    <div
      className={`pointer-events-auto flex w-full items-start gap-3 rounded-xl border ${ring} bg-card p-3 pr-2 shadow-lg shadow-foreground/5 animate-in fade-in slide-in-from-bottom-2`}
    >
      <span
        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${tint} ${iconColor}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="flex flex-1 flex-col items-start gap-2 pt-1.5">
        <p className="text-sm leading-snug text-card-foreground">
          {notice.text}
        </p>
        {detail && (
          <button
            onClick={copyDetail}
            className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copy === "copied" ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
            {COPY_LABEL[copy]}
          </button>
        )}
      </div>
      <button
        onClick={() => dismiss(notice.id)}
        aria-label="Cerrar aviso"
        className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function NoticeStack() {
  const notices = useNotices((s) => s.notices);

  if (notices.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm"
    >
      {notices.map((notice) => (
        <NoticeCard key={notice.id} notice={notice} />
      ))}
    </div>
  );
}
