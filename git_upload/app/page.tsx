"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import FeatureCard from "./components/FeatureCard";
import StepCard from "./components/StepCard";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import StickyScroll from "./components/StickyScroll";
import PhoneDemo, { type Screen } from "./components/PhoneDemo";
import { Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu, Sparkles, Megaphone, ChevronRight, BarChart3, Users, Send, X, Plus } from "lucide-react";
import Link from "next/link";
import ContactForm from "./components/ContactForm";
import { posts as blogPosts } from "./blog/page";
import { useDemo } from "@/lib/context/DemoContext";
import Counter from "./components/Counter";
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from "framer-motion";

/* ─── Word-by-word scroll-linked text reveal ─────────────────────── */
function Word({ word, progress, start, end }: { word: string; progress: MotionValue<number>; start: number; end: number }) {
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
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "end 0.55"],
  });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={i} word={word} progress={scrollYProgress} start={i / words.length} end={Math.min((i + 2) / words.length, 1)} />
      ))}
    </p>
  );
}

/* ─── Animated FAQ accordion ─────────────────────────────────────── */
function FAQItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.06]">
      <button className="w-full flex items-center justify-between py-7 text-left gap-6" onClick={onToggle}>
        <span className="text-lg font-bold text-gray-950 dark:text-white">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }}
          className="flex-shrink-0 w-6 h-6 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center"
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
            transition={{ duration: 0.35, ease: [0.25, 0.4, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">{a}</p>
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
      showBanner={showBanner}
      isBannerVisible={isBannerVisible}
      setShowBanner={setShowBanner}
      setIsBannerVisible={setIsBannerVisible}
    />
  );
}

function HomeContent({ showBanner, isBannerVisible, setShowBanner, setIsBannerVisible }: any) {
  const { openDemo } = useDemo();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [demoScreen, setDemoScreen] = useState<Screen>("dashboard");

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.documentElement.scrollHeight;
        if (bodyHeight - scrollPosition < 250) {
          setIsBannerVisible(false);
        } else {
          setIsBannerVisible(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-36 pb-16 sm:pt-44 sm:pb-24 md:pt-52 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8A8A8A] font-bold text-[11px] uppercase tracking-widest mb-8">
               <Sparkles size={12} /> TALO ist jetzt live
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[2.2rem] leading-[1.05] sm:text-[4rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo mb-6 sm:mb-10 max-w-7xl mx-auto text-gray-950 dark:text-white">
              Die Plattform für euer<br /><span>Vereinsengagement.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-base sm:text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-3xl mx-auto mb-10 sm:mb-14">
              Punkte, Genehmigungen und Mitglieder-Wachstum in einer Cloud. Orchestriert, fair und transparent am Puls der Zeit.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/anmelden"
                className="hidden sm:inline-flex px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20 text-center"
              >
                Kostenlos starten
              </Link>
              <a
                href="https://apps.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex sm:hidden items-center justify-center gap-2 w-full px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20 text-center"
              >
                <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                App kostenlos laden
              </a>
              <button
                onClick={openDemo}
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-sm bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-center"
              >
                Demo anfragen
              </button>
            </div>
          </ScrollReveal>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gray-500/5 dark:bg-white/5 opacity-30 blur-[160px] pointer-events-none -z-10" />
      </section>

      {/* ─── TRUST SECTION ───────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            <div className="max-w-sm">
              <h3 className="text-[11px] font-black tracking-[0.2em] text-gray-400 dark:text-gray-600 uppercase mb-3">SICHER & KONFORM</h3>
              <p className="text-xl font-bold text-gray-950 dark:text-white font-logo">EU-Server. DSGVO-Sicher. <br />Vereins-geprüft.</p>
            </div>
            <StaggerContainer className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {["GDPR", "SOC2", "ISO27001", "TALO AI"].map((label) => (
                <StaggerItem key={label}>
                  <span className="text-2xl font-black tracking-tighter text-gray-300 dark:text-gray-700">{label}</span>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ─── APP DEMO SHOWCASE ───────────────────────────────────── */}
      <section className="py-8 pb-32 md:pb-48 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gray-400/[0.06] dark:bg-white/[0.03] blur-[140px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-10 md:mb-14">
              <span className="text-[10px] font-black tracking-[0.35em] uppercase text-gray-400 dark:text-gray-600 inline-block mb-4 italic">
                Die App im Detail
              </span>
              <h2 className="text-3xl md:text-5xl font-medium tracking-tighter text-gray-950 dark:text-white leading-tight">
                Erlebe TALO live.
              </h2>
            </div>
          </ScrollReveal>

          {/* Screen selector tabs */}
          <ScrollReveal direction="up" delay={0.1}>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
              {(
                [
                  { label: "Dashboard", screen: "dashboard" },
                  { label: "Genehmigung", screen: "approval" },
                  { label: "Rangliste", screen: "members" },
                  { label: "Aktivitäten", screen: "activities" },
                ] as { label: string; screen: Screen }[]
              ).map((tab) => (
                <button
                  key={tab.screen}
                  onClick={() => setDemoScreen(tab.screen)}
                  className={`px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all duration-200 ${
                    demoScreen === tab.screen
                      ? "bg-gray-950 dark:bg-white text-white dark:text-black shadow-lg"
                      : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200/50 dark:border-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </ScrollReveal>

          {/* Phone */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="flex justify-center">
              <motion.div
                className="relative"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.25, 0.4, 0.25, 1], delay: 0.2 }}
              >
                {/* Floor shadow */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[240px] h-[40px] bg-black/15 dark:bg-black/40 blur-2xl rounded-full" />
                {/* Glow halo */}
                <div className="absolute -inset-12 bg-gray-400/10 dark:bg-white/[0.04] blur-3xl rounded-full pointer-events-none" />
                <div className="relative transform scale-[1.15] sm:scale-[1.3] md:scale-[1.45] lg:scale-[1.6] origin-top">
                  <PhoneDemo initialScreen={demoScreen} />
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── BRAND RESONANCE: scroll-linked word reveal ─────────── */}
      <section className="py-32 md:py-56 lg:py-72 relative bg-[#f2f4f7] dark:bg-white/[0.03] overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-10 inline-block italic">The TALO Experience</span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-[2.8rem] md:text-[6rem] lg:text-[8rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[0.93] mb-16 md:mb-24">
              Engagement.<br />
              <span className="text-gray-300 dark:text-white/10 italic font-logo">Orchestriert.</span>
            </h2>
          </ScrollReveal>
          <ScrollText
            text="Die Essenz moderner Vereinsarbeit. Reduziert auf das Wesentliche, konzipiert für maximales Wachstum und absolute Transparenz."
            className="text-2xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white font-medium leading-[1.3] tracking-tight max-w-4xl mx-auto"
          />
        </div>
        {/* Decorative blur orbs */}
        <div className="absolute top-1/3 left-[10%] w-[500px] h-[500px] bg-blue-400/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[400px] bg-purple-400/5 blur-[120px] pointer-events-none" />
      </section>

      {/* ─── WHY TALO (VALUES) ───────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Unsere Werte</span>
          </ScrollReveal>
          <div className="mt-16 divide-y divide-gray-100 dark:divide-white/5">
            {[
              {
                num: "01",
                icon: <Lock size={20} />,
                title: "Sicherheit an erster Stelle.",
                desc: "DSGVO-konforme Datenspeicherung auf deutschen Servern. Verschlüsselt, sicher und jederzeit exportierbar.",
              },
              {
                num: "02",
                icon: <Globe size={20} />,
                title: "Transparenz für alle Mitglieder.",
                desc: "Jeder sieht seine Fortschritte in Echtzeit. Keine Diskussionen mehr über Punkte – absolute Fairness im Verein.",
              },
              {
                num: "03",
                icon: <Cpu size={20} />,
                title: "KI-gestützte Infrastruktur.",
                desc: "TALO lernt mit. Automatisierte Dokumentenscans und Predictive Analytics für eure Vereinsentwicklung.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="group flex flex-col md:flex-row md:items-center gap-6 md:gap-16 py-10 md:py-14 cursor-default">
                  <span className="text-[11px] font-black tracking-[0.3em] text-gray-300 dark:text-gray-700 w-12 shrink-0">{item.num}</span>
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-700 dark:text-gray-300 shrink-0 group-hover:bg-gray-950 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-white font-logo tracking-tight flex-1 group-hover:translate-x-1 transition-transform duration-300">{item.title}</h3>
                  <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed md:max-w-xs">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES: STICKY SCROLL SHOWCASE ───────────────────── */}
      <section id="demo" className="overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-4">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">
              Das System
            </span>
            <h2 className="text-[2.5rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05]">
              Vier Schritte.<br />
              <span className="text-gray-300 dark:text-white/20 italic font-logo">Ein System.</span>
            </h2>
          </ScrollReveal>
        </div>
        <StickyScroll />
      </section>

      {/* ─── CONTACT SECTION (DEMO REQUEST) ───────────────────────── */}
      <section id="kontakt" className="py-32 lg:py-64 relative overflow-hidden bg-white dark:bg-[#080808]">
        <div className="absolute top-0 right-[20%] w-[800px] h-[800px] bg-blue-500/5 blur-[160px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1 max-w-2xl">
            <ScrollReveal direction="left">
              <span className="text-[12px] font-black tracking-[0.3em] text-gray-500 uppercase mb-6 inline-block italic">Interesse an TALO?</span>
              <h2 className="text-[2.5rem] md:text-[5.5rem] font-medium tracking-tighter leading-[1] text-gray-950 dark:text-white mb-10">
                Sichere dir eine<br /><span className="text-gray-400 dark:text-[#8A8A8A]">persönliche Demo.</span>
              </h2>
              <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-14 max-w-xl">
                Schließe dich über 150 Vereinen an, die ihren administrativen Aufwand bereits heute um über 90% reduziert haben.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest italic">DSGVO-Sicher & Made in Germany</span>
              </div>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <ScrollReveal direction="right" delay={0.2}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── PLATFORM ECOSYSTEM: DAS TALO ÖKOSYSTEM ──────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-24 lg:my-48 relative z-10">
        <div className="py-32 lg:py-48 bg-[#f2f4f7] dark:bg-white/[0.03] rounded-[64px] md:rounded-[120px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mb-24">
                <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Mehr als nur Punkte</span>
                <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo mb-8">
                  Ein komplettes<br /><span className="text-gray-400 italic">Ökosystem</span> für euren Verein.
                </h2>
                <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">
                  Talo ist das Betriebssystem für modernes Vereinsleben. Wir haben jedes Detail durchdacht, um eure Verwaltung unsichtbar zu machen.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  title: "Digitale Mitgliederakte",
                  desc: "Zentralisierte Speicherung aller relevanten Daten, Dokumente und Historien – DSGVO-konform und in Sekunden auffindbar.",
                  icon: <Globe size={22} />,
                  color: "text-blue-500",
                  bg: "bg-blue-500/8 dark:bg-blue-500/10",
                },
                {
                  title: "Automatisierte Mailings",
                  desc: "Personalisierte Benachrichtigungen, Erinnerungen und Bestätigungen basierend auf Aktivitäten – vollautomatisch.",
                  icon: <Zap size={22} />,
                  color: "text-amber-500",
                  bg: "bg-amber-500/8 dark:bg-amber-500/10",
                },
                {
                  title: "Rollen & Berechtigungen",
                  desc: "Präzises Rechtesystem: genau steuern, wer auf welche Daten zugreifen kann – vom Vorstand bis zum Trainer.",
                  icon: <Lock size={22} />,
                  color: "text-emerald-500",
                  bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
                },
                {
                  title: "Deep Analytics",
                  desc: "KI-gestützte Berichte. Versteht das Engagement eurer Mitglieder und erkennt Trends, bevor sie entstehen.",
                  icon: <Cpu size={22} />,
                  color: "text-purple-500",
                  bg: "bg-purple-500/8 dark:bg-purple-500/10",
                },
                {
                  title: "Nahtlose Exporte",
                  desc: "Ob DATEV, Excel oder PDF – exportiert eure Daten in allen Formaten für eure nächste Prüfung oder Sitzung.",
                  icon: <ArrowRight size={22} />,
                  color: "text-rose-500",
                  bg: "bg-rose-500/8 dark:bg-rose-500/10",
                },
                {
                  title: "API & Integrationen",
                  desc: "Verbindet Talo mit eurer bestehenden Website oder anderen Tools über unsere moderne REST-Schnittstelle.",
                  icon: <Sparkles size={22} />,
                  color: "text-indigo-500",
                  bg: "bg-indigo-500/8 dark:bg-indigo-500/10",
                },
              ].map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.06}>
                  <div className="p-8 rounded-[28px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full group hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center mb-7 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-3">{item.title}</h3>
                    <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ────────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="mb-20">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-5 inline-block italic">Referenzen</span>
              <h2 className="text-[2.5rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo">
                Stimmen aus dem<br /><span className="text-gray-300 dark:text-white/20 italic">Ehrenamt.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                quote: "Endlich verbringe ich meine Sonntage nicht mehr mit Excel-Listen. Talo hat unseren Verwaltungsaufwand halbiert.",
                author: "Markus Weber",
                role: "1. Vorsitzender, SV Grün-Weiß",
                image: "https://i.pravatar.cc/150?u=markus",
              },
              {
                quote: "Die Mitglieder lieben die App. Jeder sieht sofort, was er beigetragen hat – das motiviert ungemein.",
                author: "Sarah Schneider",
                role: "Schatzmeisterin, Musikverein Lyra",
                image: "https://i.pravatar.cc/150?u=sarah",
              },
              {
                quote: "Rechtssicher, einfach und modern. Talo ist genau das, worauf wir im Rettungsdienst gewartet haben.",
                author: "Thomas Meyer",
                role: "Bereitschaftsleiter, DRK Ortsverein",
                image: "https://i.pravatar.cc/150?u=thomas",
              },
            ].map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="relative p-10 rounded-[32px] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full flex flex-col justify-between group hover:-translate-y-1 transition-all duration-300 hover:shadow-lg hover:shadow-black/5">
                  {/* Large quote mark */}
                  <div className="absolute top-8 right-10 text-[80px] leading-none text-gray-100 dark:text-white/[0.04] font-serif select-none">"</div>
                  <p className="relative text-xl font-medium text-gray-700 dark:text-[#8A8A8A] leading-relaxed mb-10">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={t.image} alt={t.author} className="w-11 h-11 rounded-full grayscale" />
                    <div>
                      <p className="text-sm font-bold text-gray-950 dark:text-white">{t.author}</p>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS: TALO IN ZAHLEN ───────────────────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-10 lg:my-20">
        <div className="py-32 lg:py-56 relative bg-gray-950 dark:bg-white/[0.03] rounded-[64px] md:rounded-[140px] overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ScrollReveal direction="up">
              <p className="text-center text-[11px] font-black tracking-[0.4em] text-white/30 uppercase mb-20">Talo in Zahlen</p>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 text-center">
              {[
                { label: "Vereine", value: 150, suffix: "+" },
                { label: "Mitglieder", value: 12000, suffix: "+" },
                { label: "Punkte vergeben", value: 1.2, suffix: "M", decimalPlaces: 1 },
                { label: "Zeit gespart", value: 90, suffix: "%" },
              ].map((s, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <p className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-white mb-3">
                    <Counter value={s.value} suffix={s.suffix} decimalPlaces={s.decimalPlaces || 0} />
                  </p>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─────────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-[2.5rem] md:text-5xl font-medium tracking-tighter text-gray-950 dark:text-white mb-4 font-logo">Häufige Fragen.</h2>
            <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium mb-16">Was du über TALO wissen musst.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div>
              {[
                {
                  q: "Ist Talo DSGVO-konform?",
                  a: "Ja, zu 100%. Unsere Server stehen ausschließlich in Deutschland und wir arbeiten mit modernen Verschlüsselungsstandards.",
                },
                {
                  q: "Wie lange dauert die Einrichtung?",
                  a: "Die meisten Vereine sind in weniger als 15 Minuten startklar. Unser Assistent führt dich Schritt für Schritt durch den Prozess.",
                },
                {
                  q: "Was kostet Talo?",
                  a: "Wir haben faire Pakete für jede Vereinsgröße. Kleine Vereine starten oft völlig kostenfrei oder mit minimalen Gebühren.",
                },
                {
                  q: "Kann ich meine Daten jederzeit exportieren?",
                  a: "Selbstverständlich. Alle eure Daten lassen sich jederzeit in gängigen Formaten (CSV, Excel, PDF) exportieren – ohne Datenverlust.",
                },
              ].map((faq, i) => (
                <FAQItem
                  key={i}
                  q={faq.q}
                  a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── NEWS / INSIGHTS SECTION ─────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl text-center font-medium text-gray-950 dark:text-white mb-16 md:mb-24 tracking-tighter max-w-4xl mx-auto leading-[1.1]">
              Neueste Highlights aus unserem{" "}
              <Link href="/blog" className="text-gray-950 dark:text-white underline decoration-[#8A8A8A]/30 underline-offset-4 hover:decoration-[#8A8A8A] transition-colors">
                Blog
              </Link>
            </h2>
          </ScrollReveal>

          <div className="flex flex-col gap-3 md:gap-4 max-w-[51rem] mx-auto">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="flex flex-col group rounded-2xl border border-gray-100 dark:border-white/5 bg-white dark:bg-white/[0.01] p-6 md:p-8 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-none dark:hover:bg-white/[0.03]"
                >
                  <h3 className="text-xl md:text-2xl font-bold font-logo text-gray-950 dark:text-white leading-[1.15] group-hover:underline">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 dark:text-[#8A8A8A] mt-3 line-clamp-2 font-medium">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between gap-x-3 mt-8">
                    <div className="flex items-center gap-x-3 min-w-0">
                      <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500">
                        {post.author.charAt(0)}
                      </div>
                      <span className="text-[12px] font-bold text-gray-900 dark:text-gray-300 truncate">{post.author}</span>
                      <span className="text-[12px] text-gray-400 dark:text-gray-600 flex-shrink-0">•</span>
                      <span className="text-[12px] font-bold text-gray-400 dark:text-gray-500 whitespace-nowrap">{post.date}</span>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-lg border border-gray-200/50 dark:border-white/5">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER (FLOATING) ───────────────────────────────── */}
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
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 28,
              mass: 0.9,
              delay: isBannerVisible ? 1.2 : 0,
            }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-32px)] sm:w-auto sm:max-w-[640px]"
          >
            <div className="relative flex items-center justify-between bg-[#080808] dark:bg-white text-white dark:text-black rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] group p-2 pl-2 pr-2 sm:pr-3 gap-2">
              <Link
                href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                className="flex items-center gap-3 min-w-0 flex-1 outline-none"
              >
                <div className="shrink-0 p-0.5 rounded-[12px]">
                  <img
                    src="https://i.ibb.co/G4rrPn4n/klein-banner.png"
                    alt="Neuster Post"
                    className="w-9 h-9 rounded-[10px] object-cover"
                  />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40 dark:text-black/40 leading-none mb-0.5">
                    Neuster Beitrag
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-1 text-white dark:text-black">
                    {blogPosts[blogPosts.length - 1].title}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Link
                  href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                  className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-2 rounded-[10px] bg-white/10 dark:bg-black/8 hover:bg-white/20 dark:hover:bg-black/15 transition-colors whitespace-nowrap"
                >
                  Lesen
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <Link
                  href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/10 dark:bg-black/8"
                  aria-label="Lesen"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  aria-label="Schließen"
                  className="flex items-center justify-center w-8 h-8 rounded-[10px] text-white/30 dark:text-black/30 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/8 transition-all"
                >
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="m1.75 1.75 8.5 8.5m0-8.5-8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
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
