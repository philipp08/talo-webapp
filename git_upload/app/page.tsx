"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import StickyScroll from "./components/StickyScroll";
import PhoneDemo, { type Screen } from "./components/PhoneDemo";
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

/* ─── Word-by-word scroll-linked text reveal ──────────────────────── */
function Word({
  word, progress, start, end,
}: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.24em]">
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
function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.06]">
      <button className="w-full flex items-center justify-between py-7 text-left gap-6" onClick={onToggle}>
        <span className="text-lg font-bold text-gray-950 dark:text-white">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"
        >
          <Plus size={12} className="text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Eyebrow pill ────────────────────────────────────────────────── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] border border-gray-100 dark:border-white/[0.06] text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 dark:text-gray-600 mb-7">
      {children}
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
  const [demoScreen, setDemoScreen] = useState<Screen>("dashboard");

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

  const tabs = [
    { label: "Dashboard", screen: "dashboard" as Screen },
    { label: "Genehmigung", screen: "approval" as Screen },
    { label: "Rangliste", screen: "members" as Screen },
    { label: "Aktivitäten", screen: "activities" as Screen },
  ];

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ── HERO: Editorial Split ─────────────────────────────────── */}
      <section className="relative min-h-[100dvh] flex items-center pt-28 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-14 lg:gap-24">

            {/* Left: type */}
            <div className="max-w-2xl">
              <ScrollReveal direction="up" delay={0.05}>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-950/[0.05] dark:bg-white/[0.05] border border-gray-950/[0.07] dark:border-white/10 text-[10px] uppercase tracking-[0.2em] font-bold text-gray-500 dark:text-gray-400 mb-10">
                  <Sparkles size={9} strokeWidth={2} /> TALO ist jetzt live
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.13}>
                <h1 className="text-[3rem] sm:text-[4.5rem] md:text-[6rem] font-medium tracking-tight leading-[0.94] font-logo text-gray-950 dark:text-white mb-8">
                  Die Plattform<br />für euer<br />
                  <span className="text-gray-300 dark:text-white/20 italic">Vereins&shy;engagement.</span>
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.21}>
                <p className="text-lg sm:text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-md mb-12">
                  Punkte, Genehmigungen und Mitglieder-Wachstum in einer Cloud — orchestriert, fair und transparent.
                </p>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.29}>
                <div className="flex flex-wrap gap-3 mb-12">
                  {/* Primary CTA — Button-in-Button */}
                  <Link
                    href="/anmelden"
                    className="group hidden sm:inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black font-bold text-sm shadow-[0_8px_32px_rgba(0,0,0,0.14)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    Kostenlos starten
                    <span className="w-6 h-6 rounded-full bg-white/10 dark:bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:scale-105 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                      <ArrowRight size={11} strokeWidth={2.5} />
                    </span>
                  </Link>
                  <a
                    href="https://apps.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex sm:hidden items-center gap-2.5 px-6 py-3.5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black font-bold text-sm shadow-[0_8px_32px_rgba(0,0,0,0.14)] active:scale-[0.98] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                    App kostenlos laden
                  </a>
                  <button
                    onClick={openDemo}
                    className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full border border-gray-200 dark:border-white/15 text-gray-700 dark:text-white font-bold text-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.98] transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  >
                    Demo anfragen
                  </button>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest">
                  <ShieldCheck size={13} strokeWidth={2} />
                  <span>DSGVO-konform</span>
                  <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <span>Made in Germany</span>
                  <span className="w-1 h-1 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <span>150+ Vereine</span>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Phone with Double-Bezel */}
            <div className="flex flex-col items-center gap-6 lg:items-end">
              <ScrollReveal direction="right" delay={0.18}>
                <div className="relative">
                  <div className="absolute -inset-16 bg-gray-200/30 dark:bg-white/[0.02] blur-3xl rounded-full pointer-events-none" />
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[180px] h-[22px] bg-black/[0.07] dark:bg-black/30 blur-2xl rounded-full" />
                  {/* Outer shell */}
                  <div className="relative p-2 rounded-[3rem] bg-gray-100/70 dark:bg-white/[0.04] ring-1 ring-black/[0.07] dark:ring-white/[0.08]">
                    {/* Inner core */}
                    <div className="rounded-[calc(3rem-0.5rem)] overflow-hidden shadow-[inset_0_1px_2px_rgba(255,255,255,0.7)] dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.04)]">
                      <PhoneDemo initialScreen={demoScreen} />
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={0.32}>
                <div className="flex flex-wrap justify-center gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.screen}
                      onClick={() => setDemoScreen(tab.screen)}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                        demoScreen === tab.screen
                          ? "bg-gray-950 dark:bg-white text-white dark:text-black shadow-sm"
                          : "bg-gray-100 dark:bg-white/[0.05] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>

        {/* Background radial gradients */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[900px] h-[900px] bg-gray-100/60 dark:bg-white/[0.015] rounded-full blur-[180px] -translate-y-1/3 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-100/70 dark:bg-white/[0.01] rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4" />
        </div>
      </section>

      {/* ── TRUST STRIP ──────────────────────────────────────────── */}
      <section className="py-10 border-t border-b border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer className="flex flex-wrap items-center justify-center md:justify-between gap-6 md:gap-8">
            <StaggerItem>
              <p className="text-[10px] font-black tracking-[0.25em] text-gray-300 dark:text-gray-700 uppercase">Vertraut von 150+ Vereinen</p>
            </StaggerItem>
            {["GDPR-Konform", "ISO 27001", "EU-Server", "DSGVO", "SOC2"].map((label) => (
              <StaggerItem key={label}>
                <span className="text-sm font-black tracking-tighter text-gray-200 dark:text-gray-800">{label}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ── BRAND RESONANCE: Scroll word reveal ──────────────────── */}
      <section className="py-40 md:py-64 lg:py-80 relative bg-[#f5f6f8] dark:bg-white/[0.02] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up">
            <Eyebrow>The TALO Experience</Eyebrow>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-[3rem] md:text-[6.5rem] lg:text-[9rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[0.9] mb-20 md:mb-32">
              Engagement.<br />
              <span className="text-gray-200 dark:text-white/8 italic font-logo">Orchestriert.</span>
            </h2>
          </ScrollReveal>
          <ScrollText
            text="Die Essenz moderner Vereinsarbeit. Reduziert auf das Wesentliche, konzipiert für maximales Wachstum und absolute Transparenz."
            className="text-2xl md:text-4xl lg:text-[3.2rem] text-gray-900 dark:text-white font-medium leading-[1.25] tracking-tight max-w-4xl mx-auto"
          />
        </div>
      </section>

      {/* ── VALUES: WHY TALO ─────────────────────────────────────── */}
      <section className="py-32 md:py-48 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <Eyebrow>Unsere Werte</Eyebrow>
            <h2 className="text-[2.4rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05] font-logo mb-20 md:mb-28">
              Gebaut für<br /><span className="text-gray-300 dark:text-white/20 italic">Vertrauen.</span>
            </h2>
          </ScrollReveal>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {[
              {
                num: "01", icon: <Lock size={18} strokeWidth={1.5} />,
                title: "Sicherheit an erster Stelle.",
                desc: "DSGVO-konforme Datenspeicherung auf deutschen Servern. Verschlüsselt, sicher und jederzeit exportierbar.",
              },
              {
                num: "02", icon: <Globe size={18} strokeWidth={1.5} />,
                title: "Transparenz für alle Mitglieder.",
                desc: "Jeder sieht seine Fortschritte in Echtzeit. Keine Diskussionen mehr über Punkte – absolute Fairness.",
              },
              {
                num: "03", icon: <Cpu size={18} strokeWidth={1.5} />,
                title: "KI-gestützte Infrastruktur.",
                desc: "TALO lernt mit. Automatisierte Dokumentenscans und Predictive Analytics für eure Vereinsentwicklung.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <div className="group flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-12 md:gap-20 py-10 md:py-16 cursor-default">
                  <span className="text-[10px] font-black tracking-[0.3em] text-gray-200 dark:text-gray-800 shrink-0 w-8">{item.num}</span>
                  <div className="w-10 h-10 rounded-2xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0 group-hover:bg-gray-950 group-hover:text-white group-hover:border-transparent dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-white font-logo tracking-tight flex-1 group-hover:translate-x-1.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed md:max-w-[280px] text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES: STICKY SCROLL ──────────────────────────────── */}
      <section id="demo" className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-4">
          <ScrollReveal direction="up">
            <Eyebrow>Das System</Eyebrow>
            <h2 className="text-[2.4rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05] font-logo">
              Vier Schritte.<br />
              <span className="text-gray-200 dark:text-white/20 italic">Ein System.</span>
            </h2>
          </ScrollReveal>
        </div>
        <StickyScroll />
      </section>

      {/* ── ECOSYSTEM: ASYMMETRIC BENTO ──────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-14 my-24 lg:my-48 relative z-10">
        <div className="py-32 lg:py-56 bg-[#f5f6f8] dark:bg-white/[0.02] rounded-[56px] md:rounded-[96px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mb-20 md:mb-32">
                <Eyebrow>Mehr als nur Punkte</Eyebrow>
                <h2 className="text-[2.4rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo mb-8">
                  Ein komplettes<br /><span className="text-gray-300 dark:text-white/20 italic">Ökosystem</span> für<br />euren Verein.
                </h2>
                <p className="text-lg text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-xl">
                  Das Betriebssystem für modernes Vereinsleben — jedes Detail durchdacht, damit eure Verwaltung unsichtbar wird.
                </p>
              </div>
            </ScrollReveal>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

              {/* Card 1 — large (8 cols) */}
              <div className="md:col-span-8">
                <ScrollReveal direction="up" delay={0}>
                  <div className="h-full p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 md:p-10 h-full flex flex-col min-h-[280px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-8 text-blue-500">
                        <Globe size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-white tracking-tight mb-4">Digitale Mitgliederakte</h3>
                      <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm md:text-base max-w-md flex-1">
                        Zentralisierte Speicherung aller relevanten Daten, Dokumente und Historien – DSGVO-konform und in Sekunden auffindbar.
                      </p>
                      <div className="mt-10 flex items-center gap-3 text-[10px] font-black text-blue-400 uppercase tracking-widest">
                        <span>DSGVO-konform</span>
                        <div className="flex-1 h-px bg-blue-100 dark:bg-blue-900/30" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 2 — small (4 cols) */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.05}>
                  <div className="h-full p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 h-full flex flex-col min-h-[280px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-6 text-amber-500">
                        <Zap size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight mb-3">Automatisierte Mailings</h3>
                      <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm flex-1">
                        Personalisierte Benachrichtigungen und Bestätigungen – vollautomatisch.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 3 (4 cols) */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.08}>
                  <div className="h-full p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 h-full flex flex-col min-h-[220px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6 text-emerald-500">
                        <Lock size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight mb-3">Rollen & Berechtigungen</h3>
                      <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm flex-1">
                        Präzises Rechtesystem – vom Vorstand bis zum Trainer.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 4 (4 cols) */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.11}>
                  <div className="h-full p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 h-full flex flex-col min-h-[220px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-6 text-purple-500">
                        <Cpu size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight mb-3">Deep Analytics</h3>
                      <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm flex-1">
                        KI-gestützte Berichte – erkennt Trends bevor sie entstehen.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 5 (4 cols) */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.14}>
                  <div className="h-full p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 h-full flex flex-col min-h-[220px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-6 text-rose-500">
                        <ArrowRight size={20} strokeWidth={1.5} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-950 dark:text-white tracking-tight mb-3">Nahtlose Exporte</h3>
                      <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm flex-1">
                        DATEV, Excel oder PDF – jederzeit ohne Datenverlust.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 6 — full width (12 cols) */}
              <div className="md:col-span-12">
                <ScrollReveal direction="up" delay={0.17}>
                  <div className="p-[6px] rounded-[2rem] bg-white/70 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                    <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center shrink-0 text-indigo-500">
                        <Sparkles size={20} strokeWidth={1.5} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-950 dark:text-white tracking-tight mb-2">API & Integrationen</h3>
                        <p className="text-gray-400 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm">
                          Verbindet TALO mit eurer bestehenden Website oder anderen Tools über unsere moderne REST-Schnittstelle.
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-1.5 text-[10px] font-black text-indigo-400 uppercase tracking-widest whitespace-nowrap">
                        <span>REST API</span>
                        <ChevronRight size={12} strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <section id="kontakt" className="py-32 lg:py-64 relative overflow-hidden bg-white dark:bg-[#080808]">
        <div className="absolute top-0 right-[15%] w-[700px] h-[700px] bg-blue-400/[0.04] blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-start gap-20 lg:gap-32">
          <div className="flex-1 lg:max-w-lg">
            <ScrollReveal direction="left">
              <Eyebrow>Interesse an TALO?</Eyebrow>
              <h2 className="text-[2.5rem] md:text-[5rem] font-medium tracking-tighter leading-[0.97] text-gray-950 dark:text-white mb-10 font-logo">
                Sichere dir eine<br />
                <span className="text-gray-300 dark:text-[#8A8A8A] italic">persönliche Demo.</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-12 max-w-sm">
                Schließe dich über 150 Vereinen an, die ihren administrativen Aufwand bereits heute um über 90% reduziert haben.
              </p>
              {/* Trust badge — Double-Bezel inline */}
              <div className="p-[6px] rounded-2xl bg-gray-50 dark:bg-white/[0.02] ring-1 ring-black/[0.05] dark:ring-white/[0.06] inline-flex">
                <div className="rounded-[calc(1rem-6px)] bg-white dark:bg-[#111] px-5 py-3 flex items-center gap-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                  <ShieldCheck size={15} strokeWidth={1.5} className="text-gray-400 shrink-0" />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">DSGVO-Sicher · Made in Germany</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <ScrollReveal direction="right" delay={0.15}>
              {/* Double-Bezel form */}
              <div className="p-[6px] rounded-[2rem] bg-gray-50/80 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06]">
                <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-6 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)]">
                  <ContactForm />
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="mb-20 md:mb-28">
              <Eyebrow>Referenzen</Eyebrow>
              <h2 className="text-[2.4rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05] font-logo">
                Stimmen aus dem<br /><span className="text-gray-200 dark:text-white/15 italic">Ehrenamt.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "Endlich verbringe ich meine Sonntage nicht mehr mit Excel-Listen. Talo hat unseren Verwaltungsaufwand halbiert.",
                author: "Markus Weber", role: "1. Vorsitzender, SV Grün-Weiß",
                image: "https://i.pravatar.cc/150?u=markus",
              },
              {
                quote: "Die Mitglieder lieben die App. Jeder sieht sofort, was er beigetragen hat – das motiviert ungemein.",
                author: "Sarah Schneider", role: "Schatzmeisterin, Musikverein Lyra",
                image: "https://i.pravatar.cc/150?u=sarah",
              },
              {
                quote: "Rechtssicher, einfach und modern. Talo ist genau das, worauf wir im Rettungsdienst gewartet haben.",
                author: "Thomas Meyer", role: "Bereitschaftsleiter, DRK Ortsverein",
                image: "https://i.pravatar.cc/150?u=thomas",
              },
            ].map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                {/* Double-Bezel card */}
                <div className="h-full p-[6px] rounded-[2rem] bg-gray-50/80 dark:bg-white/[0.02] ring-1 ring-black/[0.06] dark:ring-white/[0.06] group hover:-translate-y-1 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <div className="rounded-[calc(2rem-6px)] bg-white dark:bg-[#111] p-8 h-full flex flex-col shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] min-h-[280px]">
                    <div className="flex gap-1 mb-8">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star key={si} size={12} fill="currentColor" strokeWidth={0} className="text-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10 flex-1 text-base">
                      „{t.quote}"
                    </p>
                    <div className="flex items-center gap-3.5">
                      <img src={t.image} alt={t.author} className="w-10 h-10 rounded-full grayscale object-cover" />
                      <div>
                        <p className="text-sm font-bold text-gray-950 dark:text-white">{t.author}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS: TALO IN ZAHLEN ────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-14 my-10 lg:my-20">
        <div className="py-32 lg:py-56 relative bg-gray-950 dark:bg-white/[0.02] rounded-[56px] md:rounded-[120px] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ScrollReveal direction="up">
              <p className="text-center text-[10px] font-black tracking-[0.3em] text-white/25 uppercase mb-24">Talo in Zahlen</p>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 text-center">
              {[
                { label: "Vereine", value: 150, suffix: "+" },
                { label: "Mitglieder", value: 12000, suffix: "+" },
                { label: "Punkte vergeben", value: 1.2, suffix: "M", decimalPlaces: 1 },
                { label: "Zeit gespart", value: 90, suffix: "%" },
              ].map((s, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                  {/* Double-Bezel stat */}
                  <div className="p-[5px] rounded-[1.5rem] bg-white/[0.04] ring-1 ring-white/[0.08]">
                    <div className="rounded-[calc(1.5rem-5px)] bg-white/[0.03] px-6 py-10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
                      <p className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tighter text-white mb-3">
                        <Counter value={s.value} suffix={s.suffix} decimalPlaces={s.decimalPlaces || 0} />
                      </p>
                      <p className="text-[10px] font-black text-white/25 uppercase tracking-widest">{s.label}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal direction="up">
            <Eyebrow>FAQ</Eyebrow>
            <h2 className="text-[2.4rem] md:text-5xl font-medium tracking-tighter text-gray-950 dark:text-white mb-4 font-logo">
              Häufige Fragen.
            </h2>
            <p className="text-lg text-gray-400 dark:text-[#8A8A8A] font-medium mb-16">Was du über TALO wissen musst.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div>
              {[
                { q: "Ist Talo DSGVO-konform?", a: "Ja, zu 100%. Unsere Server stehen ausschließlich in Deutschland und wir arbeiten mit modernen Verschlüsselungsstandards." },
                { q: "Wie lange dauert die Einrichtung?", a: "Die meisten Vereine sind in weniger als 15 Minuten startklar. Unser Assistent führt dich Schritt für Schritt durch den Prozess." },
                { q: "Was kostet Talo?", a: "Wir haben faire Pakete für jede Vereinsgröße. Kleine Vereine starten oft völlig kostenfrei oder mit minimalen Gebühren." },
                { q: "Kann ich meine Daten jederzeit exportieren?", a: "Selbstverständlich. Alle eure Daten lassen sich jederzeit in gängigen Formaten (CSV, Excel, PDF) exportieren – ohne Datenverlust." },
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
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex items-end justify-between mb-16 md:mb-24">
              <h2 className="text-3xl md:text-5xl font-medium text-gray-950 dark:text-white tracking-tighter leading-[1.1]">
                Neueste Highlights
              </h2>
              <Link href="/blog" className="group hidden md:inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-300">
                Alle Beiträge
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="flex flex-col gap-3 max-w-[52rem] mx-auto">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="p-[5px] rounded-[1.5rem] bg-gray-50/60 dark:bg-white/[0.01] ring-1 ring-black/[0.05] dark:ring-white/[0.04] group hover:-translate-y-0.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="flex flex-col rounded-[calc(1.5rem-5px)] bg-white dark:bg-[#0e0e0e] p-6 md:p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                  >
                    <h3 className="text-xl md:text-2xl font-bold font-logo text-gray-950 dark:text-white leading-[1.15] group-hover:underline decoration-gray-300">
                      {post.title}
                    </h3>
                    <p className="text-gray-400 dark:text-[#8A8A8A] mt-3 line-clamp-2 font-medium text-sm">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between gap-3 mt-8">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500">
                          {post.author.charAt(0)}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 truncate">{post.author}</span>
                        <span className="text-gray-200 dark:text-gray-800">·</span>
                        <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">{post.date}</span>
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-500 px-3 py-1.5 rounded-full flex-shrink-0">
                        {post.category}
                      </span>
                    </div>
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOATING CTA BANNER ──────────────────────────────────── */}
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
            <div className="relative flex items-center justify-between bg-[#080808] dark:bg-white text-white dark:text-black rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] group p-2 pl-2 pr-2 sm:pr-3 gap-2">
              <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="flex items-center gap-3 min-w-0 flex-1 outline-none">
                <div className="shrink-0 p-0.5 rounded-[12px]">
                  <img src="https://i.ibb.co/G4rrPn4n/klein-banner.png" alt="Neuster Post" className="w-9 h-9 rounded-[10px] object-cover" />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40 dark:text-black/40 leading-none mb-0.5">Neuster Beitrag</span>
                  <span className="text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-1 text-white dark:text-black">
                    {blogPosts[blogPosts.length - 1].title}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-2 rounded-[10px] bg-white/10 dark:bg-black/8 hover:bg-white/20 dark:hover:bg-black/15 transition-colors whitespace-nowrap">
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
