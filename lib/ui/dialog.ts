"use client";

/**
 * Promise-based confirm/alert replacement for native window.confirm/alert.
 *
 * Usage:
 *   import { confirmDialog, alertDialog } from "@/lib/ui/dialog";
 *
 *   const ok = await confirmDialog({
 *     title: "Verein löschen?",
 *     description: "Alle zugehörigen Daten werden ebenfalls gelöscht.",
 *     confirmLabel: "Endgültig löschen",
 *     variant: "danger",
 *   });
 *   if (!ok) return;
 *
 *   await alertDialog({ title: "Hinweis", description: "Limit erreicht." });
 *
 * Render <DialogRoot /> once in the root layout. Pending dialogs live in a
 * Zustand store so any component can open one without prop-drilling.
 */

import { create } from "zustand";

export type DialogVariant = "default" | "danger" | "info" | "warning" | "success";

export interface DialogRequest {
  id: string;
  title: string;
  description?: string;
  variant: DialogVariant;
  confirmLabel: string;
  cancelLabel?: string; // null/undefined = single-button alert
  hideCancel?: boolean;
  resolve: (ok: boolean) => void;
}

interface DialogStore {
  pending: DialogRequest[];
  enqueue: (req: Omit<DialogRequest, "id">) => string;
  resolveTop: (ok: boolean) => void;
}

export const useDialogStore = create<DialogStore>((set, get) => ({
  pending: [],
  enqueue: (req) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ pending: [...s.pending, { ...req, id }] }));
    return id;
  },
  resolveTop: (ok: boolean) => {
    const pending = get().pending;
    if (pending.length === 0) return;
    const top = pending[0];
    top.resolve(ok);
    set((s) => ({ pending: s.pending.slice(1) }));
  },
}));

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

export function confirmDialog(opts: ConfirmOptions): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    useDialogStore.getState().enqueue({
      title: opts.title,
      description: opts.description,
      variant: opts.variant ?? "default",
      confirmLabel: opts.confirmLabel ?? "Bestätigen",
      cancelLabel: opts.cancelLabel ?? "Abbrechen",
      resolve,
    });
  });
}

interface AlertOptions {
  title: string;
  description?: string;
  okLabel?: string;
  variant?: DialogVariant;
}

export function alertDialog(opts: AlertOptions): Promise<void> {
  return new Promise<void>((resolve) => {
    useDialogStore.getState().enqueue({
      title: opts.title,
      description: opts.description,
      variant: opts.variant ?? "info",
      confirmLabel: opts.okLabel ?? "OK",
      hideCancel: true,
      resolve: () => resolve(),
    });
  });
}
