"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";

import { useFontRegistry } from "../font-context";
import type { LayerPart } from "../layer";

export type TextAlignH = "left" | "center" | "right";
export type TextAlignV = "top" | "middle" | "bottom";
export type TextOverflow = "wrap" | "overflow" | "clip";

export interface TextPart extends LayerPart {
  type: "text";
  text: string;
  fontSize: number;
  autoSize?: boolean;
  fontSizeMin?: number;
  fontSizeMax?: number;
  color?: string;
  fontKey?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  letterSpacing?: number;
  lineSpacing?: number;
  alignH?: TextAlignH;
  alignV?: TextAlignV;
  overflow?: TextOverflow;
}

const JUSTIFY: Record<TextAlignH, CSSProperties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const ALIGN: Record<TextAlignV, CSSProperties["alignItems"]> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

const TEXT_ALIGN: Record<TextAlignH, CSSProperties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};

export function TextView({ part }: { part: TextPart }) {
  const {
    text,
    fontSize,
    autoSize = false,
    fontSizeMin = 1,
    fontSizeMax = 20,
    color = "#ffffff",
    fontKey,
    bold = false,
    italic = false,
    underline = false,
    letterSpacing = 0,
    lineSpacing = 0,
    alignH = "center",
    alignV = "middle",
    overflow = "wrap",
  } = part;

  const wrap = overflow === "wrap";
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fittedSize, setFittedSize] = useState(fontSize);

  const fonts = useFontRegistry();
  const fontClass = fontKey ? fonts[fontKey]?.className : undefined;

  useLayoutEffect(() => {
    if (!autoSize) return;
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const prev = el.style.fontSize;

    const measure = () => {
      const maxW = box.clientWidth;
      const maxH = box.clientHeight;
      if (maxW === 0 || maxH === 0) return;

      const min = Math.max(0, Math.min(fontSizeMin, fontSizeMax));
      const max = Math.max(fontSizeMin, fontSizeMax);

      const fits = (size: number) => {
        el.style.fontSize = `${size}cqh`;
        return (
          el.scrollHeight <= maxH + 0.5 && el.scrollWidth <= maxW + 0.5
        );
      };

      let best = min;
      if (fits(max)) {
        best = max;
      } else if (fits(min)) {
        let lo = min;
        let hi = max;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) {
            best = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
      }
      el.style.fontSize = `${best}cqh`;
      setFittedSize(best);
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(box);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      el.style.fontSize = prev;
    };
  }, [
    autoSize,
    fontSizeMin,
    fontSizeMax,
    text,
    fontClass,
    bold,
    italic,
    wrap,
    letterSpacing,
    lineSpacing,
  ]);

  const size = autoSize ? fittedSize : fontSize;

  return (
    <div
      ref={boxRef}
      className="flex h-full w-full"
      style={{
        justifyContent: JUSTIFY[alignH],
        alignItems: ALIGN[alignV],
        overflow: overflow === "overflow" ? "visible" : "hidden",
      }}
    >
      <div
        ref={textRef}
        className={fontClass}
        style={{
          minWidth: 0,
          color,
          fontSize: `${size}cqh`,
          fontWeight: bold ? "bold" : "normal",
          fontStyle: italic ? "italic" : "normal",
          textDecoration: underline ? "underline" : "none",
          letterSpacing: `${letterSpacing / 100}em`,
          lineHeight: lineSpacing === 0 ? "normal" : 1.2 + lineSpacing / 100,
          textAlign: TEXT_ALIGN[alignH],
          whiteSpace: wrap ? "pre-wrap" : "pre",
        }}
      >
        {text}
      </div>
    </div>
  );
}
