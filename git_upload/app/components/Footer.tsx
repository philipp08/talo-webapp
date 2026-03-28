"use client";

import ScrollReveal from "./ScrollReveal";

export default function Footer() {
  return (
    <ScrollReveal direction="up" duration={0.6} distance={20}>
      <footer className="py-20 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center">
                <span className="text-white dark:text-black font-bold text-[10px]">T</span>
              </div>
              <span className="font-logo text-gray-900 dark:text-white text-sm uppercase tracking-widest font-bold">
                Talo
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              {[
                { name: "Plattform", href: "/funktionen" },
                { name: "Lösungen", href: "/loesungen" },
                { name: "Preise", href: "/preise" },
                { name: "Datenschutz", href: "/datenschutz" },
                { name: "Impressum", href: "/impressum" }
              ].map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-[13px] font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              ))}
            </div>

            <p className="text-[13px] text-gray-400 font-medium">
              © 2026 Talo. Jeder Beitrag zählt.
            </p>
          </div>
        </div>
      </footer>
    </ScrollReveal>
  );
}
