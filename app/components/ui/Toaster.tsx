"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from "lucide-react";
import { useToastStore, ToastKind } from "@/lib/ui/toast";

const KIND_STYLES: Record<ToastKind, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  success: { icon: CheckCircle2, color: "#34C759", bg: "rgba(52,199,89,0.10)" },
  error:   { icon: AlertCircle,  color: "#FF453A", bg: "rgba(255,69,58,0.10)" },
  warning: { icon: AlertTriangle, color: "#FF9500", bg: "rgba(255,149,0,0.10)" },
  info:    { icon: Info,         color: "#007AFF", bg: "rgba(0,122,255,0.10)" },
};

export function Toaster() {
  const [mounted, setMounted] = useState(false);
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-6 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0 sm:pb-0"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const style = KIND_STYLES[t.kind];
          const Icon = style.icon;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.15 } }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
              role="status"
            >
              <div className="flex items-start gap-3 p-3.5 pr-2">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: style.bg, color: style.color }}
                >
                  <Icon size={16} strokeWidth={2.4} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="font-poppins text-[13px] font-semibold text-[#0A0A0A] leading-snug">
                    {t.title}
                  </p>
                  {t.description && (
                    <p className="mt-0.5 text-[11px] text-[#52525B] leading-snug">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  aria-label="Benachrichtigung schließen"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#A1A1AA] hover:text-[#0A0A0A] hover:bg-black/[0.04] transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
}
