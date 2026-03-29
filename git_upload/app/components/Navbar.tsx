"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Menu as MenuIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store/useAppStore";
import { useDemo } from "../page";

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
        <nav
          className={`container mx-auto max-w-[1300px] flex items-center justify-between rounded-[20px] px-6 py-2 transition-all duration-500 transform-gpu border ${
            scrolled || mobileOpen
              ? "bg-white/70 dark:bg-[#0A0A0A]/70 backdrop-blur-2xl border-black/[0.08] dark:border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              : "bg-transparent border-transparent"
          }`}
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
          <div className="hidden md:flex items-center ml-8">
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
                        <div className="w-[580px] flex rounded-[24px] overflow-hidden bg-white/80 dark:bg-[#0D0D0D]/80 backdrop-blur-3xl border border-black/[0.08] dark:border-white/[0.1] shadow-[0_20px_50px_rgba(0,0,0,0.12)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
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

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
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

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-black/[0.05] dark:bg-white/[0.05] text-[#080808] dark:text-white"
          >
            {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[70] bg-white/90 dark:bg-[#080808]/90 backdrop-blur-2xl flex flex-col p-6 pt-28"
          >
            <div className="flex flex-col gap-0">
              {menus.map((menu) => (
                <div key={menu.label} className="border-b border-black/[0.05] dark:border-white/[0.05] last:border-none">
                  {menu.items ? (
                    <>
                      <button
                        onClick={() => toggleMobileExpanded(menu.label)}
                        className="w-full flex items-center justify-between py-5 text-[18px] font-bold text-[#080808] dark:text-white"
                      >
                        {menu.label}
                        <div className={`transition-transform duration-300 ${mobileExpanded === menu.label ? "rotate-180" : ""}`}>
                          <DropdownArrow isOpen={false} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {mobileExpanded === menu.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-4 pb-6"
                          >
                            {menu.items.map((item, idx) => (
                              <Link
                                key={idx}
                                href={item.href}
                                onClick={() => setMobileOpen(false)}
                                className="text-[15px] font-medium text-gray-500 dark:text-gray-400 pl-4 border-l border-black/[0.05] dark:border-white/[0.05]"
                              >
                                {item.title}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      href={menu.href}
                      onClick={() => setMobileOpen(false)}
                      className="block py-5 text-[18px] font-bold text-[#080808] dark:text-white"
                    >
                      {menu.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-auto flex flex-col gap-3 pb-8">
              <Link
                href="/anmelden"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-full py-4 rounded-xl text-[16px] font-bold bg-black/[0.05] dark:bg-white/[0.05] text-[#080808] dark:text-white"
              >
                Anmelden
              </Link>
              <button
                onClick={() => { setMobileOpen(false); openDemo(); }}
                className="flex items-center justify-center w-full py-4 rounded-xl text-[16px] font-bold bg-[#080808] dark:bg-white text-white dark:text-black shadow-xl mt-3"
              >
                Demo anfragen
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
