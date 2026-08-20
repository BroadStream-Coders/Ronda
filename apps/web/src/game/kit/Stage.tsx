"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

interface StageProps {
  children: ReactNode;
  hideCursorOnFullscreen?: boolean;
  onReady?: (toggleFullscreen: () => void) => void;
}

export function Stage({
  children,
  hideCursorOnFullscreen = true,
  onReady,
}: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      await containerRef.current?.requestFullscreen();
      containerRef.current?.focus();
    } catch {
      setIsFullscreen(!!document.fullscreenElement);
    }
  }, []);

  useEffect(() => {
    onReady?.(toggleFullscreen);
  }, [onReady, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      className={cn(
        "relative flex select-none items-center justify-center overflow-hidden bg-black outline-none [container-type:size]",
        isFullscreen ? "h-screen w-screen" : "min-h-0 w-full flex-1",
        isFullscreen && hideCursorOnFullscreen && "cursor-none",
      )}
    >
      <div
        className="relative aspect-video overflow-hidden [container-type:size]"
        style={
          isFullscreen
            ? { height: "100%", width: "auto", maxWidth: "100%" }
            : { width: "min(100cqi, 100cqb * 16 / 9)" }
        }
      >
        {children}
      </div>
    </div>
  );
}
