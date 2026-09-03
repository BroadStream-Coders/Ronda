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
  pointer?: boolean;
  onReady?: (toggleFullscreen: () => void) => void;
}

export function Stage({ children, pointer = false, onReady }: StageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pointerVisible, setPointerVisible] = useState(pointer);

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      if (event.code !== "KeyP") return;
      event.preventDefault();
      setPointerVisible((visible) => !visible);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      onContextMenu={(event) => event.preventDefault()}
      className={cn(
        "relative flex touch-none select-none items-center justify-center overflow-hidden bg-black outline-none [container-type:size]",
        isFullscreen ? "h-screen w-screen" : "min-h-0 w-full flex-1",
        isFullscreen && !pointerVisible && "cursor-none",
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
