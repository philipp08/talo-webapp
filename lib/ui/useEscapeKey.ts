"use client";

import { useEffect } from "react";

/**
 * Calls `onEscape` when the user presses Escape — but only while `active`.
 * Useful for any custom modal that doesn't go through the global Dialog.
 *
 * Pass capture=true if you need to win over child handlers (e.g. nested inputs).
 */
export function useEscapeKey(
  active: boolean,
  onEscape: () => void,
  capture = false
) {
  useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
      }
    };
    window.addEventListener("keydown", handler, capture);
    return () => window.removeEventListener("keydown", handler, capture);
  }, [active, onEscape, capture]);
}
