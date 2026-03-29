"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ArrowRight, Menu as MenuIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store/useAppStore";

interface MenuItem {
  title: string;
  href: string;
}

interface FeaturedContent {
  label: string;
  title: string;
  cta: string;
  ctaHref: string;
  bgColor: string;
  darkBgColor: string;
  accentColor: string;
  icon: string;
}

interface Menu {
  label: string;
  href: string;
  items?: MenuItem[];
  featured?: FeaturedContent;
}

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.isLoadingAuthedState);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when mobile menu is open (iOS-compatible)
  useEffect(() => {
    if (mobileOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY, 10) * -1);
      }
    }
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 150);
  };

  const toggleMobileExpanded = (label: string) => {
    setMobileExpanded((prev) => (prev === label ? null : label));
  };

  const menus: Menu[] = [
    {
      label: "Plattform",
      href: "/funktionen",
      items: [
        { title: "Punktevergabe", href: "/funktionen#punkte" },
        { title: "Genehmigungsworkflow", href: "/funktionen#workflow" },
        { title: "Dashboard & Statistiken", href: "/funktionen#admin" },
        { title: "Rangliste & Community", href: "/funktionen#community" },
        { title: "Export & Berichte", href: "/funktionen" },
      ],
      featured: {
        label: "HIGHLIGHTS",
        title: "Wie Talo Vereinsarbeit um 83% effizienter macht",
        cta: "Alle Features entdecken",
        ctaHref: "/funktionen",
        bgColor: "#F1F4F8",
        darkBgColor: "#141414",
        accentColor: "#34C759",
        icon: "⚡",
      },
    },
    {
      label: "Lösungen",
      href: "/loesungen",
      items: [
        { title: "Sportvereine", href: "/loesungen#sport" },
        { title: "Musikvereine & Chöre", href: "/loesungen#kultur" },
        { title: "Feuerwehr & Rettung", href: "/loesungen#feuerwehr" },
        { title: "Soziale Initiativen", href: "/loesungen" },
        { title: "Campus-Gruppen", href: "/loesungen" },
      ],
      featured: {
        label: "USE CASE",
        title: "400+ Vereine nutzen Talo – von Sport bis Feuerwehr",
        cta: "Lösungen ansehen",
        ctaHref: "/loesungen",
        bgColor: "#F1F4F8",
        darkBgColor: "#141414",
        accentColor: "#E87AA0",
        icon: "🏆",
      },
    },
    { label: "Über uns", href: "/ueber-uns" },
    { label: "Preise", href: "/preise" },
    { label: "Hilfe", href: "/hilfe" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-white/95 dark:bg-[#080808]/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/5"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between relative">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <Image
              src="/talo-logo.png"
              alt="Talo"
              width={32}
              height={32}
              className="rounded-lg invert dark:invert-0"
            />
            <span className="font-logo font-medium text-[19px] tracking-[0.2em] text-[#080808] dark:text-white uppercase">
              Talo
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center">
            <div className="flex items-center gap-1 border border-gray-200 dark:border-white/10 rounded-full px-1.5 py-1">
              {menus.map((menu) => (
                <div
                  key={menu.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(menu.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={menu.href || "#"}
                    className={`flex items-center gap-1 text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                      activeMenu === menu.label
                        ? "text-gray-900 dark:text-white bg-gray-100 dark:bg-white/10"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {menu.label}
                    {menu.items && (
                      <ChevronDown
                        className={`w-3 h-3 opacity-50 transition-transform duration-200 ${
                          activeMenu === menu.label ? "rotate-180" : ""
                        }`}
                      />
                    )}
                  </Link>

                  {menu.items && menu.featured && (
                    <AnimatePresence>
                      {activeMenu === menu.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.98 }}
                          transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                          className="absolute top-full left-0 pt-3"
                          onMouseEnter={() => handleMouseEnter(menu.label)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="w-[520px] bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/8 rounded-xl shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden flex">
                            <div className="w-[200px] py-3 px-1.5 border-r border-gray-100 dark:border-white/5">
                              {menu.items.map((item, idx) => (
                                <Link
                                  href={item.href}
                                  key={idx}
                                  className="block px-4 py-2.5 text-[13.5px] font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  {item.title}
                                </Link>
                              ))}
                            </div>
                            <div className="flex-1 p-3">
                              <div
                                className="rounded-lg p-5 h-full flex flex-col justify-between"
                                style={{ background: `var(--mega-featured-bg, ${menu.featured.bgColor})` }}
                              >
                                <div>
                                  <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-500 dark:text-gray-400">
                                    {menu.featured.label}
                                  </span>
                                  <h4 className="text-[15px] font-semibold text-gray-900 dark:text-white mt-2 leading-snug">
                                    {menu.featured.title}
                                  </h4>
                                </div>
                                <Link
                                  href={menu.featured.ctaHref}
                                  className="inline-flex items-center gap-1.5 text-[13px] font-medium mt-4 transition-all hover:gap-2.5"
                                  style={{ color: menu.featured.accentColor }}
                                >
                                  {menu.featured.cta} <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right side: Desktop CTAs + Mobile Burger */}
          <div className="flex items-center gap-3">
            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-3">
              {!isLoading && user ? (
                <Link
                  href="/dashboard"
                  className="text-[13px] font-semibold px-5 py-2 rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/anmelden"
                    className="text-[13px] font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                  >
                    Anmelden
                  </Link>
                  <Link
                    href="#demo"
                    className="text-[13px] font-semibold px-5 py-2 rounded-full border border-gray-900 dark:border-white bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    Demo ansehen
                  </Link>
                </>
              )}
            </div>

            {/* Burger Button – mobile only */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-white"
              aria-label="Menu öffnen"
            >
              {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ─── MOBILE MENU OVERLAY ────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/20 dark:bg-black/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide-in panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-sm bg-white dark:bg-[#0A0A0A] shadow-2xl lg:hidden flex flex-col"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/5 flex-shrink-0">
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5">
                  <Image
                    src="/talo-logo.png"
                    alt="Talo"
                    width={28}
                    height={28}
                    className="rounded-lg invert dark:invert-0"
                  />
                  <span className="font-logo font-medium text-[17px] tracking-[0.2em] text-[#080808] dark:text-white uppercase">
                    Talo
                  </span>
                </Link>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex-1 overflow-y-auto px-4 py-4">
                {menus.map((menu, i) => (
                  <motion.div
                    key={menu.label}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  >
                    {menu.items ? (
                      <div className="mb-1">
                        <button
                          onClick={() => toggleMobileExpanded(menu.label)}
                          className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-left text-[15px] font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                        >
                          {menu.label}
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
                              mobileExpanded === menu.label ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        <AnimatePresence initial={false}>
                          {mobileExpanded === menu.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="pb-2 px-2">
                                {menu.items.map((item, idx) => (
                                  <Link
                                    key={idx}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                                    {item.title}
                                  </Link>
                                ))}
                                {/* Featured CTA inside accordion */}
                                {menu.featured && (
                                  <Link
                                    href={menu.featured.ctaHref}
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-2 px-4 py-3 mt-1 rounded-xl text-[13px] font-semibold transition-colors"
                                    style={{ color: menu.featured.accentColor }}
                                  >
                                    <span>{menu.featured.icon}</span>
                                    {menu.featured.cta}
                                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                                  </Link>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={menu.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center px-4 py-3.5 mb-1 rounded-2xl text-[15px] font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        {menu.label}
                      </Link>
                    )}
                  </motion.div>
                ))}

                {/* Divider */}
                <div className="my-4 border-t border-gray-100 dark:border-white/5" />

                {/* Secondary links */}
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35, duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  className="space-y-1"
                >
                  {!isLoading && user ? null : (
                    <Link
                      href="/anmelden"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-4 py-3 rounded-2xl text-[14px] font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Anmelden
                    </Link>
                  )}
                </motion.div>
              </div>

              {/* Bottom CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className="px-6 py-6 border-t border-gray-100 dark:border-white/5 flex-shrink-0 space-y-3"
              >
                {!isLoading && user ? (
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-full py-3.5 rounded-2xl text-[15px] font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/anmelden"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full py-3.5 rounded-2xl text-[15px] font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-opacity"
                    >
                      Kostenlos starten
                    </Link>
                    <Link
                      href="#demo"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center w-full py-3.5 rounded-2xl text-[15px] font-semibold border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                    >
                      Demo ansehen
                    </Link>
                  </>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
