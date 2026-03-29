"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or customized cookies
    const hasAccepted = localStorage.getItem("talo_cookies_accepted");
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("talo_cookies_accepted", "true");
    setIsVisible(false);
  };

  const customizeCookies = () => {
    // Basic dismiss action for now, could open a modal in the future
    localStorage.setItem("talo_cookies_accepted", "customized");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, pointerEvents: "none" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed rounded-[0.75rem] md:rounded-[1.25rem] w-[calc(100%-1.5rem)] md:w-full md:translate-x-0 bottom-[6.5rem] max-w-[260px] md:max-w-[308px] left-1/2 -translate-x-1/2 md:left-auto md:right-6 min-[1312px]:bottom-6 z-[100] bg-white/60 dark:bg-black/50 p-6 backdrop-blur-[36px] border border-black/5 dark:border-white/5 shadow-2xl text-[var(--t-text)]"
        >
          <div className="flex flex-col gap-y-[30px]">
            <p className="text-center text-[0.875rem] md:text-[0.9375rem] leading-snug">
              Diese Website verwendet Cookies, um dein Nutzererlebnis zu verbessern. Weitere Informationen findest du in unserer <Link className="underline font-medium hover:text-[var(--t-text-muted)] transition-colors" href="/datenschutz">Datenschutzerklärung</Link>.
            </p>
            <div className="flex items-center justify-center gap-x-5 text-[0.875rem] md:text-[0.9375rem] font-medium">
              <button 
                onClick={customizeCookies}
                className="underline cursor-pointer hover:text-[var(--t-text-muted)] transition-colors"
              >
                Anpassen
              </button>
              <button 
                onClick={acceptCookies}
                className="transition-all duration-300 text-center px-[12px] py-[10px] md:py-[7px] md:px-[10px] rounded-[0.375rem] md:rounded-[0.5rem] border leading-none cursor-pointer bg-[var(--t-text)] border-[var(--t-text)] text-[var(--t-bg)] hover:opacity-80 active:scale-95 shadow-sm"
              >
                Akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
