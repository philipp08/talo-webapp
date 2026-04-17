"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu as MenuIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store/useAppStore";
import { useDemo } from "@/lib/context/DemoContext";

interface MenuItem {
  title: string;
  description?: string;
  href: string;
}

interface FeaturedContent {
  label: string;
  title: string;
  cta: string;
  ctaHref: string;
}

interface Menu {
  label: string;
  href: string;
  items?: MenuItem[];
  featured?: FeaturedContent;
}

const DropdownArrow = ({ isOpen }: { isOpen: boolean }) => (
  <i className={`ml-1.5 flex transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
    <svg className="w-3.5 h-3.5" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 17">
      <path d="m5.332 7.167 2.667 2.666 2.666-2.666" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  </i>
);

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const user = useAppStore((state) => state.user);
  const isLoading = useAppStore((state) => state.isLoadingAuthedState);
  const { openDemo } = useDemo();

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
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
        { title: "Punktevergabe", description: "Automatisierte Erfassung von Aktivitäten", href: "/funktionen#punkte" },
        { title: "Genehmigungsworkflow", description: "Sicherer Prozess für Nachweise", href: "/funktionen#workflow" },
        { title: "Mitgliederverwaltung", description: "Alle Profile an einem Ort", href: "/dashboard" },
        { title: "Statistiken", description: "Datengesteuerte Einblicke in den Verein", href: "/funktionen#admin" },
        { title: "Export & Berichte", description: "Ready für die Steuererklärung", href: "/funktionen" },
      ],
      featured: {
        label: "NEU",
        title: "Talo App 2.0 ist da – jetzt mit nativem Design",
        cta: "Zum Changelog",
        ctaHref: "/blog",
      },
    },
    {
      label: "Lösungen",
      href: "/loesungen",
      items: [
        { title: "Sportvereine", description: "Effiziente Trainings- & Spielverwaltung", href: "/loesungen#sport" },
        { title: "Musik & Kultur", description: "Probenplanung und Auftritt-Management", href: "/loesungen#kultur" },
        { title: "Rettungsdienste", description: "Einsatznachweise für Feuerwehr & THW", href: "/loesungen#feuerwehr" },
        { title: "Campus-Gruppen", description: "Organisation von Studierenden-Initiativen", href: "/loesungen" },
      ],
      featured: {
        label: "CASE STUDY",
        title: "Wie der SV Musterstadt 12h/Woche Admin spart",
        cta: "Erfolgsstory lesen",
        ctaHref: "/blog",
      },
    },
    { label: "Über uns", href: "/ueber-uns" },
    { label: "Preise", href: "/preise" },
    { label: "Hilfe", href: "/hilfe" },
  ];

  if (!mounted) return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-[60] transition-all duration-500 transform-gpu ${
          scrolled || mobileOpen
            ? "py-3 px-4 lg:px-10"
            : "py-6 px-4 lg:px-10"
        }`}
      >
        {/* DESKTOP NAVBAR */}
        <nav
          className={`hidden xl:flex container mx-auto max-w-[1300px] items-center justify-between transition-all duration-500 transform-gpu border ${
            scrolled
              ? "bg-[rgba(245,245,247,0.8)] dark:bg-[#0A0A0A]/80 backdrop-blur-[8px] border-[rgb(234,236,239)] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)]"
              : "bg-transparent border-transparent"
          } rounded-[24px] px-6 py-3`}
        >
          <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <Image
                src="/talo-logo.png"
                alt="TALO logo"
                width={28}
                height={28}
                className="invert dark:invert-0 object-contain transition-all"
              />
            </div>
            <span className="font-logo font-medium text-[19px] tracking-[0.2em] text-[#080808] dark:text-white uppercase leading-none">
              TALO
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="flex items-center ml-8">
            <ul className="flex items-center gap-0.5">
              {menus.map((menu) => (
                <li
                  key={menu.label}
                  className="relative flex items-center"
                  onMouseEnter={() => handleMouseEnter(menu.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href={menu.href}
                    className={`flex items-center px-4 py-2 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                      activeMenu === menu.label
                        ? "text-[#080808] dark:text-white bg-black/[0.04] dark:bg-white/[0.06]"
                        : "text-gray-500 hover:text-[#080808] dark:text-gray-400 dark:hover:text-white"
                    }`}
                  >
                    {menu.label}
                    {menu.items && <DropdownArrow isOpen={activeMenu === menu.label} />}
                  </Link>

                  {/* Mega Menu Dropdown */}
                  <AnimatePresence>
                    {menu.items && activeMenu === menu.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full left-1/2 -translate-x-1/2 pt-4 flex flex-col items-center pointer-events-auto"
                      >
                        {/* Dropdown Card */}
                        <div className="w-[580px] flex rounded-[24px] overflow-hidden bg-white dark:bg-[#111] backdrop-blur-2xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                          {/* Links Side */}
                          <div className="flex-1 p-5 grid grid-cols-1 gap-0.5">
                            {menu.items.map((item, idx) => (
                              <Link
                                key={idx}
                                href={item.href}
                                className="group p-3 rounded-xl transition-all duration-200 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                              >
                                <div className="text-[14.5px] font-semibold text-[#080808] dark:text-white group-hover:translate-x-0.5 transition-transform duration-200">
                                  {item.title}
                                </div>
                                {item.description && (
                                  <div className="text-[12.5px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                                    {item.description}
                                  </div>
                                )}
                              </Link>
                            ))}
                          </div>

                          {/* Featured Side */}
                          {menu.featured && (
                            <div className="w-[220px] p-6 bg-black/[0.02] dark:bg-white/[0.02] border-l border-black/[0.05] dark:border-white/[0.05] flex flex-col justify-between">
                              <div>
                                <span className="text-[10px] font-bold tracking-[0.1em] text-gray-400 dark:text-gray-500 uppercase">
                                  {menu.featured.label}
                                </span>
                                <h4 className="text-[15px] font-bold text-[#080808] dark:text-white mt-2 leading-tight">
                                  {menu.featured.title}
                                </h4>
                              </div>
                              <Link
                                href={menu.featured.ctaHref}
                                className="group inline-flex items-center gap-2 text-[13px] font-bold text-[#080808] dark:text-white mt-4"
                              >
                                {menu.featured.cta}
                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-8 ml-auto">
            {!isLoading && user ? (
              <Link
                href="/dashboard"
                className="text-[14px] font-bold px-6 py-2.5 rounded-full bg-[#080808] dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/5"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/anmelden"
                  className="text-[14px] font-medium text-gray-500 hover:text-[#080808] dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  Anmelden
                </Link>
                <button
                  onClick={openDemo}
                  className="text-[14px] font-bold px-6 py-2.5 rounded-full bg-[#080808] dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-black/5"
                >
                  Demo anfragen
                </button>
              </>
            )}
          </div>
        </nav>

        {/* MOBILE NAVBAR (Joy_ Style – Pill morphs to expanded panel) */}
        <motion.nav
          initial={false}
          animate={{
            backgroundColor: (scrolled || mobileOpen)
              ? "rgba(245,245,247,0.95)"
              : "transparent",
            borderColor: (scrolled || mobileOpen)
              ? "rgb(234,236,239)"
              : "transparent",
            borderRadius: mobileOpen ? "32px" : "100px",
            boxShadow: (scrolled || mobileOpen)
              ? "0 12px 40px rgba(0,0,0,0.08)"
              : "0 0 0 rgba(0,0,0,0)",
          }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 28,
            mass: 0.9,
          }}
          className={`xl:hidden flex flex-col mx-auto w-full max-w-full overflow-hidden border ${
            (scrolled || mobileOpen) ? "backdrop-blur-[12px]" : ""
          } dark:bg-[#0A0A0A]/95 dark:border-white/[0.08]`}
        >
          {/* Top Bar (Always Visible) */}
          <div className="flex items-center justify-between px-4 py-3 relative z-10 w-full">
            <Link href="/" className="flex items-center gap-3 pl-2 transition-transform hover:scale-[1.02] active:scale-[0.98]" onClick={() => setMobileOpen(false)}>
              <div className="relative w-7 h-7 flex items-center justify-center">
                <Image
                  src="/talo-logo.png"
                  alt="TALO logo"
                  width={28}
                  height={28}
                  className="invert dark:invert-0 object-contain transition-all"
                />
              </div>
              <span className="font-logo font-medium text-[19px] tracking-[0.2em] text-[#080808] dark:text-white uppercase leading-none">
                TALO
              </span>
            </Link>

            <div className="flex items-center gap-2">
              {/* CTA pill – fades out in place when menu opens, no layout shift */}
              <motion.button
                animate={{
                  opacity: mobileOpen ? 0 : 1,
                  scale: mobileOpen ? 0.8 : 1,
                  width: mobileOpen ? 0 : "auto",
                  marginRight: mobileOpen ? 0 : undefined,
                  filter: mobileOpen ? "blur(4px)" : "blur(0px)",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                onClick={openDemo}
                className="text-[13px] font-medium px-4 py-[8px] rounded-[24px] bg-[#000000] dark:bg-white text-white dark:text-black border-none whitespace-nowrap overflow-hidden"
                style={{ pointerEvents: mobileOpen ? "none" : "auto" }}
                tabIndex={mobileOpen ? -1 : 0}
              >
                Demo anfragen
              </motion.button>

              {/* Hamburger / Close – white circle button like Joy_ */}
              <motion.button
                onClick={() => setMobileOpen((v) => !v)}
                className="relative flex items-center justify-center w-[40px] h-[40px] rounded-[20px] bg-white dark:bg-white/10 text-[#1a1a1a] dark:text-white shadow-sm flex-shrink-0"
                aria-label={mobileOpen ? "Menü schließen" : "Menü öffnen"}
                whileTap={{ scale: 0.9 }}
              >
                <motion.div
                  animate={{ rotate: mobileOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileOpen ? (
                      <motion.div
                        key="close"
                        initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X size={20} strokeWidth={2} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
                        transition={{ duration: 0.2 }}
                      >
                        <MenuIcon size={20} strokeWidth={2} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.button>
            </div>
          </div>

          {/* Expanded Menu Content – Joy_ style with staggered links */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{
                  height: { type: "spring", stiffness: 260, damping: 28, mass: 0.9 },
                  opacity: { duration: 0.25 },
                }}
                className="overflow-hidden w-full"
              >
                <div className="flex flex-col px-6 pb-8 pt-2 w-full overflow-y-auto max-h-[calc(100dvh-72px)]">
                  {/* Divider line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.1, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="h-px bg-black/[0.08] dark:bg-white/[0.08] w-full origin-left mb-6"
                  />

                  {/* Main navigation links – large, staggered fade-in like Joy_ */}
                  <div className="flex flex-col gap-1 w-full">
                    {menus.map((menu, index) => (
                      <motion.div
                        key={menu.label}
                        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        transition={{
                          delay: 0.08 + index * 0.06,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        className="w-full"
                      >
                        {menu.items ? (
                          <>
                            <button
                              onClick={() => toggleMobileExpanded(menu.label)}
                              className="w-full flex items-center justify-between py-4 text-left group"
                            >
                              <span className="text-[28px] font-semibold text-[#1a1a1a] dark:text-white leading-tight tracking-[-0.02em]">
                                {menu.label}
                              </span>
                              <motion.div
                                animate={{ rotate: mobileExpanded === menu.label ? 45 : 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="w-8 h-8 rounded-full bg-black/[0.05] dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0"
                              >
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#1a1a1a] dark:text-white">
                                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                </svg>
                              </motion.div>
                            </button>
                            <AnimatePresence>
                              {mobileExpanded === menu.label && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{
                                    height: { type: "spring", stiffness: 300, damping: 28 },
                                    opacity: { duration: 0.2 },
                                  }}
                                  className="overflow-hidden w-full"
                                >
                                  <div className="flex flex-col gap-3 pb-4 pl-1">
                                    {menu.items.map((item, idx) => (
                                      <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.04, duration: 0.25 }}
                                      >
                                        <Link
                                          href={item.href}
                                          onClick={() => setMobileOpen(false)}
                                          className="block py-1.5 text-[16px] font-medium text-[#8a9199] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white transition-colors"
                                        >
                                          {item.title}
                                        </Link>
                                      </motion.div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Link
                            href={menu.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-4 text-[28px] font-semibold text-[#1a1a1a] dark:text-white leading-tight tracking-[-0.02em] hover:opacity-60 transition-opacity"
                          >
                            {menu.label}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {/* Bottom section – CTAs + Social like Joy_ */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35, type: "spring", stiffness: 260, damping: 25 }}
                    className="mt-8 flex flex-col gap-3 w-full"
                  >
                    {/* CTA Buttons – Ghost + Dark like Joy_ */}
                    <div className="flex items-center gap-3 w-full">
                      <a
                        href="https://apps.apple.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMobileOpen(false)}
                        className="flex-1 flex items-center justify-center gap-2 py-[14px] rounded-[24px] text-[15px] font-medium border border-[#b6bcc2] dark:border-white/20 text-[#1a1a1a] dark:text-white active:scale-[0.97] transition-all"
                      >
                        <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                        App laden
                      </a>
                      <button
                        onClick={() => { setMobileOpen(false); openDemo(); }}
                        className="flex-1 flex items-center justify-center py-[14px] rounded-[24px] text-[15px] font-medium bg-[#000000] dark:bg-white text-white dark:text-black active:scale-[0.97] transition-all"
                      >
                        Demo anfragen
                      </button>
                    </div>

                    {/* Social icons row like Joy_ */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45, duration: 0.3 }}
                      className="flex items-center justify-center gap-5 pt-6"
                    >
                      {[
                        {
                          label: "LinkedIn",
                          href: "https://linkedin.com",
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M16.375 2.5H3.625A1.125 1.125 0 0 0 2.5 3.625v12.75A1.125 1.125 0 0 0 3.625 17.5h12.75a1.125 1.125 0 0 0 1.125-1.125V3.625A1.125 1.125 0 0 0 16.375 2.5ZM7 15.25H4.75V8.5H7v6.75ZM5.875 7.187a1.313 1.313 0 1 1 1.35-1.312 1.335 1.335 0 0 1-1.35 1.313Zm9.375 8.063H13v-3.555c0-1.065-.45-1.447-1.035-1.447a1.304 1.304 0 0 0-1.215 1.395.498.498 0 0 0 0 .104v3.503H8.5V8.5h2.175v.975a2.332 2.332 0 0 1 2.025-1.05c1.163 0 2.52.645 2.52 2.745l.03 4.08Z" />
                            </svg>
                          ),
                        },
                        {
                          label: "GitHub",
                          href: "https://github.com",
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M10.001 1.625a8.331 8.331 0 0 1 8.334 8.334 8.346 8.346 0 0 1-5.677 7.906c-.417.083-.573-.177-.573-.396 0-.281.01-1.177.01-2.291 0-.782-.26-1.282-.562-1.542 1.854-.208 3.802-.917 3.802-4.115 0-.916-.323-1.656-.855-2.24.084-.208.375-1.062-.083-2.208 0 0-.698-.229-2.292.855a7.733 7.733 0 0 0-2.083-.282c-.708 0-1.417.094-2.083.282-1.594-1.073-2.292-.855-2.292-.855-.458 1.146-.167 2-.083 2.209a3.243 3.243 0 0 0-.854 2.24c0 3.187 1.937 3.906 3.791 4.114-.24.208-.458.573-.53 1.115-.48.218-1.678.572-2.428-.688-.156-.25-.625-.865-1.281-.854-.698.01-.282.396.01.552.354.198.76.937.854 1.177.167.469.709 1.365 2.802.98 0 .697.01 1.353.01 1.551 0 .219-.155.469-.572.396A8.329 8.329 0 0 1 1.668 9.96a8.331 8.331 0 0 1 8.333-8.334Z" />
                            </svg>
                          ),
                        },
                        {
                          label: "YouTube",
                          href: "https://youtube.com",
                          icon: (
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M16.837 3.34c.753.233 1.345.918 1.547 1.789.364 1.577.366 4.87.366 4.87s0 3.294-.366 4.872c-.202.871-.794 1.556-1.547 1.789-1.364.423-6.837.423-6.837.423s-5.473 0-6.837-.423c-.753-.233-1.345-.918-1.547-1.79C1.25 13.294 1.25 10 1.25 10s0-3.294.366-4.871c.202-.871.794-1.556 1.547-1.79C4.527 2.918 10 2.918 10 2.918s5.473 0 6.837.423ZM12.927 10l-4.762 2.75v-5.5L12.928 10Z" />
                            </svg>
                          ),
                        },
                        {
                          label: "X",
                          href: "https://x.com",
                          icon: (
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M14.503 2.917h2.401l-5.246 6 6.172 8.166h-4.833l-3.785-4.952-4.332 4.952H2.477l5.612-6.418-5.921-7.748h4.956l3.421 4.526 3.958-4.526Zm-.843 12.728h1.33L6.4 4.279H4.974l8.687 11.366Z" />
                            </svg>
                          ),
                        },
                      ].map((social) => (
                        <a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.label}
                          className="text-[#8a9199] dark:text-gray-500 hover:text-[#1a1a1a] dark:hover:text-white transition-colors p-1"
                        >
                          {social.icon}
                        </a>
                      ))}
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.nav>
      </header>

      {/* Dimmed Overlay Background for Mobile */}
      <AnimatePresence>
         {mobileOpen && (
            <motion.div
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               transition={{ duration: 0.3 }}
               className="fixed inset-0 bg-black/10 dark:bg-black/60 z-[50] xl:hidden"
               onClick={() => setMobileOpen(false)}
            />
         )}
      </AnimatePresence>
    </>
  );
}