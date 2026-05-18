"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle, Info, CheckCircle2, AlertCircle, HelpCircle,
} from "lucide-react";
import { useDialogStore, DialogVariant } from "@/lib/ui/dialog";

const VARIANT_STYLES: Record<DialogVariant, {
  icon: typeof Info;
  color: string;
  bg: string;
  confirmBg: string;
  confirmHoverBg: string;
  confirmText: string;
}> = {
  default: {
    icon: HelpCircle,
    color: "#0A0A0A",
    bg: "rgba(0,0,0,0.06)",
    confirmBg: "#0A0A0A",
    confirmHoverBg: "#1F1F23",
    confirmText: "#FFFFFF",
  },
  danger: {
    icon: AlertTriangle,
    color: "#FF453A",
    bg: "rgba(255,69,58,0.10)",
    confirmBg: "#FF453A",
    confirmHoverBg: "#E03A30",
    confirmText: "#FFFFFF",
  },
  info: {
    icon: Info,
    color: "#007AFF",
    bg: "rgba(0,122,255,0.10)",
    confirmBg: "#0A0A0A",
    confirmHoverBg: "#1F1F23",
    confirmText: "#FFFFFF",
  },
  warning: {
    icon: AlertCircle,
    color: "#FF9500",
    bg: "rgba(255,149,0,0.10)",
    confirmBg: "#FF9500",
    confirmHoverBg: "#E68500",
    confirmText: "#FFFFFF",
  },
  success: {
    icon: CheckCircle2,
    color: "#34C759",
    bg: "rgba(52,199,89,0.10)",
    confirmBg: "#34C759",
    confirmHoverBg: "#2DA84A",
    confirmText: "#FFFFFF",
  },
};

export function DialogRoot() {
  const [mounted, setMounted] = useState(false);
  const pending = useDialogStore((s) => s.pending);
  const resolveTop = useDialogStore((s) => s.resolveTop);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => setMounted(true), []);

  // Focus the confirm button when a new dialog appears (for keyboard users).
  useEffect(() => {
    if (pending.length > 0) {
      const t = setTimeout(() => confirmBtnRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [pending.length]);

  // Escape closes / cancels; Enter confirms.
  useEffect(() => {
    if (pending.length === 0) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        const top = pending[0];
        // Alerts: Escape == OK. Confirms: Escape == Cancel.
        resolveTop(top.hideCancel ? true : false);
      } else if (e.key === "Enter") {
        e.stopPropagation();
        resolveTop(true);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [pending, resolveTop]);

  if (!mounted) return null;

  const top = pending[0];

  return createPortal(
    <AnimatePresence>
      {top && (
        <motion.div
          key={top.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby={`dialog-${top.id}-title`}
          aria-describedby={top.description ? `dialog-${top.id}-desc` : undefined}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              // Backdrop click cancels confirms, dismisses alerts.
              resolveTop(top.hideCancel ? true : false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="w-full max-w-sm overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(0,0,0,0.18)]"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const style = VARIANT_STYLES[top.variant];
              const Icon = style.icon;
              return (
                <div className="flex flex-col items-center gap-3 p-7 text-center">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: style.bg, color: style.color }}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <h3
                    id={`dialog-${top.id}-title`}
                    className="font-poppins text-[17px] font-bold leading-snug text-[#0A0A0A]"
                  >
                    {top.title}
                  </h3>
                  {top.description && (
                    <p
                      id={`dialog-${top.id}-desc`}
                      className="text-[13px] leading-relaxed text-[#52525B] whitespace-pre-line"
                    >
                      {top.description}
                    </p>
                  )}
                  <div className="mt-4 flex w-full flex-col gap-2">
                    <button
                      ref={confirmBtnRef}
                      onClick={() => resolveTop(true)}
                      className="w-full rounded-full px-6 py-3.5 font-poppins text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A0A0A]"
                      style={{
                        background: style.confirmBg,
                        color: style.confirmText,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = style.confirmHoverBg)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = style.confirmBg)}
                    >
                      {top.confirmLabel}
                    </button>
                    {!top.hideCancel && (
                      <button
                        onClick={() => resolveTop(false)}
                        className="w-full rounded-full bg-black/[0.05] px-6 py-3.5 font-poppins text-sm font-semibold text-[#0A0A0A] transition-colors hover:bg-black/[0.08] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0A0A0A]"
                      >
                        {top.cancelLabel ?? "Abbrechen"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
