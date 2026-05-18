"use client";

/**
 * Lightweight toast notification system.
 *
 * Usage:
 *   import { toast } from "@/lib/ui/toast";
 *   toast.success("Gespeichert!");
 *   toast.error("Fehler beim Speichern");
 *   toast.info("Hochgeladen.", { description: "127 Mitglieder verarbeitet." });
 *
 * Render the <Toaster /> once in the root layout.
 */

import { create } from "zustand";

export type ToastKind = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  durationMs: number;
}

interface ToastStore {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    if (t.durationMs > 0) {
      setTimeout(() => get().dismiss(id), t.durationMs);
    }
    return id;
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

type ToastOptions = { description?: string; durationMs?: number };

function show(kind: ToastKind, title: string, opts?: ToastOptions): string {
  return useToastStore.getState().push({
    kind,
    title,
    description: opts?.description,
    durationMs: opts?.durationMs ?? (kind === "error" ? 6000 : 4000),
  });
}

export const toast = {
  success: (title: string, opts?: ToastOptions) => show("success", title, opts),
  error: (title: string, opts?: ToastOptions) => show("error", title, opts),
  info: (title: string, opts?: ToastOptions) => show("info", title, opts),
  warning: (title: string, opts?: ToastOptions) => show("warning", title, opts),
  dismiss: (id: string) => useToastStore.getState().dismiss(id),
};
