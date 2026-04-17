"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import StickyScroll from "./components/StickyScroll";
import {
  Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu,
  Sparkles, ChevronRight, Plus,
} from "lucide-react";
import Link from "next/link";
import ContactForm from "./components/ContactForm";
import { posts as blogPosts } from "./blog/page";
import { useDemo } from "@/lib/context/DemoContext";
import Counter from "./components/Counter";
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from "framer-motion";

/* ─── Word-by-word scroll reveal ─────────────────────────────────── */
function Word({
  word, progress, start, end,
}: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i} word={word} progress={scrollYProgress}
          start={i / words.length} end={Math.min((i + 2) / words.length, 1)}
        />
      ))}
    </p>
  );
}

/* ─── FAQ accordion ───────────────────────────────────────────────── */
function FAQItem({ q, a, isOpen, onToggle }: {
  q: string; a: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.06]">
      <button
        className="w-full flex items-center justify-between py-6 text-left gap-6"
        onClick={onToggle}
      >
        <span className="text-base font-semibold text-gray-900 dark:text-white">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"
        >
          <Plus size={11} className="text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 dark:text-[#8A8A8A] leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  return (
    <HomeContent
      showBanner={showBanner} isBannerVisible={isBannerVisible}
      setShowBanner={setShowBanner} setIsBannerVisible={setIsBannerVisible}
    />
  );
}

function HomeContent({ showBanner, isBannerVisible, setShowBanner, setIsBannerVisible }: any) {
  const { openDemo } = useDemo();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bodyHeight = document.documentElement.scrollHeight;
      setIsBannerVisible(bodyHeight - scrollPosition >= 250);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-32 md:pt-52 md:pb-44 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

          <ScrollReveal direction="up" delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Jetzt verfügbar für deutsche Vereine
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.13}>
            <h1 className="text-[2.8rem] sm:text-[4rem] md:text-[5.5rem] lg:text-[6.5rem] font-medium tracking-tight leading-[1.0] font-logo text-gray-950 dark:text-white mb-7" style={{ textWrap: "balance" } as any}>
              Vereinsmanagement,<br />
              <span className="text-gray-400 dark:text-white/30">endlich einfach.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.21}>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-[#888] leading-relaxed max-w-2xl mx-auto mb-12" style={{ textWrap: "pretty" } as any}>
              TALO übernimmt Punktevergabe, Genehmigungen und Mitgliederverwaltung –
              damit ihr euch auf das konzentriert, was zählt: euren Verein.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.28}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/anmelden"
                className="group hidden sm:inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200"
              >
                Kostenlos starten
                <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex sm:hidden w-full items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)] active:scale-[0.98] transition-all duration-200"
              >
                <svg width="15" height="15" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                App laden
              </a>
              <button
                onClick={openDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-200"
              >
                Demo anfragen
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-gray-400 dark:text-gray-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} strokeWidth={2} className="text-gray-300 dark:text-gray-700" />
                DSGVO-konform
              </span>
              <span className="w-px h-3.5 bg-gray-200 dark:bg-gray-800" />
              <span>Server in Deutschland</span>
              <span className="w-px h-3.5 bg-gray-200 dark:bg-gray-800" />
              <span>150+ Vereine vertrauen TALO</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Subtle ambient background */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-gray-100/80 to-transparent dark:from-white/[0.03] dark:to-transparent rounded-full blur-[100px]" />
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE STRIP ─────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 tracking-wide shrink-0">
              Sicherheit & Compliance
            </p>
            <StaggerContainer className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { label: "DSGVO", sub: "konform" },
                { label: "ISO 27001", sub: "zertifiziert" },
                { label: "EU-Server", sub: "Deutschland" },
                { label: "SOC 2", sub: "geprüft" },
                { label: "GDPR", sub: "compliant" },
              ].map(({ label, sub }) => (
                <StaggerItem key={label}>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-wider">{sub}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO: Scroll word reveal ────────────────────────── */}
      <section className="py-40 md:py-64 lg:py-80 relative bg-[#f7f7f7] dark:bg-white/[0.02] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-14 text-center">
              Warum TALO
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-[2.8rem] md:text-[6rem] lg:text-[8rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[0.93] mb-20 md:mb-32 text-center">
              Engagement.<br />
              <span className="text-gray-300 dark:text-white/10 italic font-logo">Orchestriert.</span>
            </h2>
          </ScrollReveal>
          <ScrollText
            text="Jeder Verein verdient eine Verwaltung, die mitdenkt. Kein Papierkram mehr, keine doppelte Buchführung, keine verlorenen Anträge. Nur ein System, das einfach funktioniert."
            className="text-xl md:text-3xl lg:text-[2.6rem] text-gray-900 dark:text-white font-medium leading-[1.3] tracking-tight max-w-4xl mx-auto text-center"
          />
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Unsere Grundsätze
                </p>
                <h2 className="text-[2rem] md:text-[3.5rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
                  Gebaut für Vertrauen.
                </h2>
              </div>
              <p className="text-gray-500 dark:text-[#888] leading-relaxed md:max-w-xs text-sm">
                Vereinssoftware, die eure Daten schützt, eure Mitglieder einbindet und mit euch wächst.
              </p>
            </div>
          </ScrollReveal>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {[
              {
                num: "01",
                icon: <Lock size={16} strokeWidth={1.75} />,
                title: "Sicherheit an erster Stelle.",
                desc: "DSGVO-konforme Datenspeicherung auf deutschen Servern. Verschlüsselt, auditierbar und jederzeit exportierbar.",
              },
              {
                num: "02",
                icon: <Globe size={16} strokeWidth={1.75} />,
                title: "Transparenz für alle Mitglieder.",
                desc: "Jedes Mitglied sieht seinen Fortschritt in Echtzeit. Keine Diskussionen, keine Unklarheiten – nur faire, nachvollziehbare Ergebnisse.",
              },
              {
                num: "03",
                icon: <Cpu size={16} strokeWidth={1.75} />,
                title: "Intelligente Automatisierung.",
                desc: "TALO übernimmt Routineaufgaben automatisch: Dokumentenprüfung, Benachrichtigungen, Auswertungen – ohne manuellen Aufwand.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <div className="group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10 md:gap-16 py-9 md:py-12 cursor-default">
                  <span className="text-[10px] font-semibold tracking-[0.3em] text-gray-300 dark:text-gray-800 shrink-0 w-7">{item.num}</span>
                  <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0 group-hover:bg-gray-950 group-hover:text-white group-hover:border-transparent dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-gray-950 dark:text-white font-logo tracking-tight flex-1 group-hover:translate-x-1 transition-transform duration-300">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 dark:text-[#888] leading-relaxed md:max-w-[260px] text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEM: STICKY SCROLL ────────────────────────────────── */}
      <section id="funktionen" className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-4">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">Das System</p>
            <h2 className="text-[2rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
              Vier Schritte. Ein System.
            </h2>
          </ScrollReveal>
        </div>
        <StickyScroll />
      </section>

      {/* ── ÖKOSYSTEM: BENTO GRID ────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-14 my-20 lg:my-40">
        <div className="py-20 lg:py-40 bg-[#f7f7f7] dark:bg-white/[0.02] rounded-[40px] md:rounded-[72px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <ScrollReveal direction="up">
              <div className="max-w-2xl mb-16 md:mb-28">
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Mehr als Punktevergabe
                </p>
                <h2 className="text-[2rem] md:text-[3.8rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo mb-6">
                  Ein komplettes Ökosystem für euren Verein.
                </h2>
                <p className="text-gray-500 dark:text-[#888] leading-relaxed text-base">
                  TALO ist das Betriebssystem für modernen Vereinsbetrieb. Durchdacht bis ins Detail.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

              {/* Card 1 — large 8 cols */}
              <div className="md:col-span-8">
                <ScrollReveal direction="up" delay={0}>
                  <div className="h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 md:p-10 flex flex-col min-h-[260px] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-7 text-blue-500">
                      <Globe size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-950 dark:text-white tracking-tight mb-3">Digitale Mitgliederakte</h3>
                    <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm flex-1 max-w-md">
                      Alle Daten, Dokumente und Historien an einem Ort — DSGVO-konform gespeichert und in Sekunden abrufbar.
                    </p>
                    <div className="mt-8 flex items-center gap-2 text-[10px] font-semibold text-blue-500/70 uppercase tracking-wider">
                      <span>DSGVO-konform</span>
                      <div className="flex-1 h-px bg-blue-100 dark:bg-blue-900/40" />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 2 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col min-h-[260px] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-7 text-amber-500">
                      <Zap size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-3">Automatisierte Mailings</h3>
                    <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm flex-1">
                      Personalisierte Benachrichtigungen, Erinnerungen und Bestätigungen – vollautomatisch.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 3 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.08}>
                  <div className="h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col min-h-[220px] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-7 text-emerald-500">
                      <Lock size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-3">Rollen & Berechtigungen</h3>
                    <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm flex-1">
                      Präzises Rechtesystem — vom Vorstand bis zum Übungsleiter.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 4 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.11}>
                  <div className="h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col min-h-[220px] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-7 text-purple-500">
                      <Cpu size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-3">Deep Analytics</h3>
                    <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm flex-1">
                      KI-gestützte Auswertungen, die Trends erkennen, bevor sie entstehen.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 5 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.14}>
                  <div className="h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col min-h-[220px] hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-7 text-rose-500">
                      <ArrowRight size={18} strokeWidth={1.75} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-3">Nahtlose Exporte</h3>
                    <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm flex-1">
                      DATEV, Excel oder PDF – eure Daten jederzeit in dem Format, das ihr braucht.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 6 — 12 cols wide */}
              <div className="md:col-span-12">
                <ScrollReveal direction="up" delay={0.17}>
                  <div className="rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-[0_8px_40px_rgba(0,0,0,0.06)] dark:hover:shadow-none transition-shadow duration-300">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500">
                      <Sparkles size={18} strokeWidth={1.75} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-1">API & Integrationen</h3>
                      <p className="text-gray-500 dark:text-[#888] text-sm leading-relaxed">
                        Verbindet TALO über unsere REST-API mit eurer Website, eurer Buchhaltungssoftware oder anderen Tools.
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-500 whitespace-nowrap">
                      REST API <ChevronRight size={13} strokeWidth={2} />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-16 md:mb-20 text-center">
              TALO in Zahlen
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-white/[0.05] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
            {[
              { label: "aktive Vereine", value: 150, suffix: "+" },
              { label: "Vereinsmitglieder", value: 12000, suffix: "+" },
              { label: "Punkte vergeben", value: 1.2, suffix: "M", decimalPlaces: 1 },
              { label: "weniger Verwaltung", value: 90, suffix: "%" },
            ].map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <div className="bg-white dark:bg-[#0a0a0a] px-6 py-12 md:py-16 text-center">
                  <p className="text-4xl md:text-5xl font-medium tracking-tight text-gray-950 dark:text-white mb-2 font-logo">
                    <Counter value={s.value} suffix={s.suffix} decimalPlaces={s.decimalPlaces || 0} />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-6 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Was Vereine sagen
                </p>
                <h2 className="text-[2rem] md:text-[3.5rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
                  Vertrauen, das zählt.
                </h2>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "Endlich verbringe ich meine Sonntage nicht mehr mit Excel-Listen. TALO hat unseren Verwaltungsaufwand deutlich reduziert.",
                author: "Markus Weber",
                role: "1. Vorsitzender, SV Grün-Weiß",
                image: "https://i.pravatar.cc/150?u=markus",
              },
              {
                quote: "Die Mitglieder lieben die Transparenz. Jeder sieht sofort, was er beigetragen hat – das motiviert ungemein.",
                author: "Sarah Schneider",
                role: "Schatzmeisterin, Musikverein Lyra",
                image: "https://i.pravatar.cc/150?u=sarah",
              },
              {
                quote: "Rechtssicher, einfach und modern. TALO ist genau das, worauf wir im Rettungsdienst gewartet haben.",
                author: "Thomas Meyer",
                role: "Bereitschaftsleiter, DRK Ortsverein",
                image: "https://i.pravatar.cc/150?u=thomas",
              },
            ].map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="h-full rounded-2xl bg-[#f7f7f7] dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col hover:shadow-[0_8px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-none transition-shadow duration-300">
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={13} fill="currentColor" strokeWidth={0} className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-[#999] leading-relaxed mb-8 flex-1 text-sm">
                    „{t.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <img src={t.image} alt={t.author} className="w-9 h-9 rounded-full grayscale object-cover" />
                    <div>
                      <p className="text-sm font-semibold text-gray-950 dark:text-white">{t.author}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <section id="kontakt" className="py-24 md:py-40 relative overflow-hidden bg-[#f7f7f7] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            <ScrollReveal direction="left">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Persönlich kennenlernen
                </p>
                <h2 className="text-[2rem] md:text-[3.8rem] font-medium tracking-tight leading-[1.1] text-gray-950 dark:text-white mb-8 font-logo">
                  Überzeug dich selbst.
                </h2>
                <p className="text-gray-500 dark:text-[#888] leading-relaxed mb-10 max-w-sm text-base">
                  Wir zeigen euch TALO in einer persönlichen Demo — 30 Minuten, live, auf eure Fragen zugeschnitten.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Keine Vertragsbindung",
                    "Einrichtung in unter 15 Minuten",
                    "Persönlicher Ansprechpartner",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.12}>
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-none">
                <ContactForm />
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-6 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">FAQ</p>
            <h2 className="text-[2rem] md:text-[3rem] font-medium tracking-tight text-gray-950 dark:text-white mb-3 font-logo">
              Häufige Fragen.
            </h2>
            <p className="text-gray-500 dark:text-[#888] mb-14 text-sm">Alles was ihr über TALO wissen müsst.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div>
              {[
                {
                  q: "Ist TALO DSGVO-konform?",
                  a: "Ja, vollständig. Unsere Server stehen ausschließlich in Deutschland, alle Daten werden verschlüsselt übertragen und gespeichert.",
                },
                {
                  q: "Wie lange dauert die Einrichtung?",
                  a: "Die meisten Vereine sind in unter 15 Minuten einsatzbereit. Unser Einrichtungsassistent führt euch Schritt für Schritt durch den Prozess.",
                },
                {
                  q: "Was kostet TALO?",
                  a: "Wir bieten faire Pakete für jede Vereinsgröße. Viele kleine Vereine starten kostenlos und wachsen mit TALO.",
                },
                {
                  q: "Kann ich meine Daten jederzeit exportieren?",
                  a: "Selbstverständlich. Alle Daten sind jederzeit als CSV, Excel oder PDF exportierbar – ihr seid nie an TALO gebunden.",
                },
                {
                  q: "Gibt es einen Support?",
                  a: "Ja. Unser deutschsprachiges Team steht per Chat und E-Mail zur Verfügung – mit echten Antworten, nicht nur Automatisierungen.",
                },
              ].map((faq, i) => (
                <FAQItem
                  key={i} q={faq.q} a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-14 md:mb-20">
              <h2 className="text-2xl md:text-4xl font-medium text-gray-950 dark:text-white tracking-tight leading-tight">
                Aus dem Blog
              </h2>
              <Link
                href="/blog"
                className="group hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors duration-200"
              >
                Alle Beiträge
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl bg-[#f7f7f7] dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-6 h-full hover:shadow-[0_8px_40px_rgba(0,0,0,0.05)] dark:hover:shadow-none transition-shadow duration-300"
                >
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-4">
                    {post.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-950 dark:text-white leading-snug mb-3 group-hover:underline decoration-gray-300 underline-offset-2 flex-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 dark:text-[#888] text-sm line-clamp-2 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2.5 mt-auto pt-5 border-t border-gray-100 dark:border-white/[0.05]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600 min-w-0">
                      <span className="font-medium text-gray-600 dark:text-gray-400 truncate">{post.author}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{post.date}</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOATING BANNER ──────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.92 }}
            animate={{
              y: isBannerVisible ? 0 : 100,
              opacity: isBannerVisible ? 1 : 0,
              scale: isBannerVisible ? 1 : 0.92,
              pointerEvents: isBannerVisible ? "auto" : "none",
            }}
            exit={{ y: 100, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9, delay: isBannerVisible ? 1.2 : 0 }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-32px)] sm:w-auto sm:max-w-[640px]"
          >
            <div className="relative flex items-center justify-between bg-[#080808] dark:bg-white text-white dark:text-black rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-2 gap-2">
              <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0 p-0.5 rounded-[12px]">
                  <img src="https://i.ibb.co/G4rrPn4n/klein-banner.png" alt="Neuster Beitrag" className="w-9 h-9 rounded-[10px] object-cover" />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 dark:text-black/40 leading-none mb-0.5">Neuster Beitrag</span>
                  <span className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-1 text-white dark:text-black">
                    {blogPosts[blogPosts.length - 1].title}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-[10px] bg-white/10 dark:bg-black/8 hover:bg-white/20 dark:hover:bg-black/15 transition-colors whitespace-nowrap">
                  Lesen
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="sm:hidden flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/10 dark:bg-black/8" aria-label="Lesen">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <button type="button" onClick={() => setShowBanner(false)} aria-label="Schließen" className="flex items-center justify-center w-8 h-8 rounded-[10px] text-white/30 dark:text-black/30 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/8 transition-all">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m1.75 1.75 8.5 8.5m0-8.5-8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
