"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nContext";
import { LOCALES } from "@/lib/i18n/translations";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/[0.04] hover:bg-black/[0.07] border border-black/10 transition-all w-full"
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="flex-1 text-left text-[12px] font-poppins font-bold text-[#52525B]">{current.label}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={`shrink-0 text-[#A1A1AA] transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-full mb-2 left-0 w-full bg-white border border-black/10 rounded-2xl shadow-xl overflow-hidden z-[9999]"
          >
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => { setLocale(l.code); setOpen(false); }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left transition-colors hover:bg-black/[0.04] ${locale === l.code ? "bg-black/[0.04]" : ""}`}
              >
                <span className="text-base leading-none">{l.flag}</span>
                <span className={`text-[12px] font-poppins font-bold ${locale === l.code ? "text-[#0A0A0A]" : "text-[#52525B]"}`}>{l.label}</span>
                {locale === l.code && (
                  <svg className="ml-auto shrink-0 text-[#0A0A0A]" width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
