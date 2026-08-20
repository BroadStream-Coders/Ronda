"use client";

import { useEffect, useRef } from "react";

export interface GameKeyHandlers {
  /** Fila superior 0-9. Shift suma 10, Alt suma 20 (combinables). */
  onNumber?: (value: number) => void;
  /** Teclado numérico 0-9. */
  onNavigate?: (value: number) => void;
  /** Tecla N. */
  onNext?: () => void;
  /** Tecla B. */
  onBack?: () => void;
  /** Tecla M. */
  onShowAnswer?: () => void;
  /** Teclas Q/W/E/R. Si está definido, E deja de disparar onInteract. */
  onOption?: (index: number) => void;
  /** Tecla V. */
  onValidate?: () => void;
  /** Tecla F. */
  onMarkError?: () => void;
  /** Tecla E. */
  onInteract?: () => void;
  /** Tecla C. */
  onClear?: () => void;
  onInsert?: () => void;
  onHome?: () => void;
  onPageUp?: () => void;
  onDelete?: () => void;
  onEnd?: () => void;
  onPageDown?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  /** Numpad +. */
  onPlus?: () => void;
  /** Numpad −. */
  onMinus?: () => void;
}

const OPTION_KEYS: Record<string, number> = {
  KeyQ: 0,
  KeyW: 1,
  KeyE: 2,
  KeyR: 3,
};

const KEY_MAP: Record<string, keyof GameKeyHandlers> = {
  KeyN: "onNext",
  KeyV: "onValidate",
  KeyB: "onBack",
  KeyM: "onShowAnswer",
  KeyF: "onMarkError",
  KeyE: "onInteract",
  KeyC: "onClear",
  Insert: "onInsert",
  Home: "onHome",
  PageUp: "onPageUp",
  Delete: "onDelete",
  End: "onEnd",
  PageDown: "onPageDown",
  ArrowUp: "onArrowUp",
  ArrowDown: "onArrowDown",
  ArrowLeft: "onArrowLeft",
  ArrowRight: "onArrowRight",
  NumpadAdd: "onPlus",
  NumpadSubtract: "onMinus",
};

export function useGameKeys(handlers: GameKeyHandlers) {
  const ref = useRef(handlers);

  useEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.repeat || event.ctrlKey || event.metaKey) return;

      const current = ref.current;
      const code = event.code;

      if (/^Digit[0-9]$/.test(code)) {
        if (!current.onNumber) return;
        event.preventDefault();
        const offset = (event.shiftKey ? 10 : 0) + (event.altKey ? 20 : 0);
        current.onNumber(Number(code.slice(5)) + offset);
        return;
      }

      if (event.altKey) return;

      if (/^Numpad[0-9]$/.test(code)) {
        if (!current.onNavigate) return;
        event.preventDefault();
        current.onNavigate(Number(code.slice(6)));
        return;
      }

      if (current.onOption && code in OPTION_KEYS) {
        event.preventDefault();
        current.onOption(OPTION_KEYS[code]);
        return;
      }

      const key = KEY_MAP[code];
      if (!key) return;
      const handler = current[key] as (() => void) | undefined;
      if (!handler) return;
      event.preventDefault();
      handler();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
