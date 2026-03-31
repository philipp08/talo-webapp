"use client";

import { useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import FeatureCard from "./components/FeatureCard";
import StepCard from "./components/StepCard";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import { Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu, Sparkles, Megaphone, ChevronRight, BarChart3, Users, Send, X } from "lucide-react";
import Link from "next/link";
import ContactForm from "./components/ContactForm";
import { posts as blogPosts } from "./blog/page";
import { useDemo } from "@/lib/context/DemoContext";
import Counter from "./components/Counter";
import { motion, AnimatePresence } from "framer-motion";

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

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        // Calculate distance from bottom
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.documentElement.scrollHeight;
        
        // Hide the banner if within 250px of the bottom
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
              {/* Desktop: Kostenlos starten → /anmelden */}
              <Link
                href="/anmelden"
                className="hidden sm:inline-flex px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20 text-center"
              >
                Kostenlos starten
              </Link>
              {/* Mobile: App kostenlos laden → App Store */}
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

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gray-500/5 dark:bg-white/5 opacity-30 blur-[160px] pointer-events-none -z-10" />
      </section>

      {/* ─── TRUST SECTION ───────────────────────────────────────── */}
      <section className="py-24 md:py-48 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
             <div className="max-w-md">
                <h3 className="text-[12px] font-black tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-3 text-center md:text-left">SICHER & KONFORM</h3>
                <p className="text-xl font-bold text-gray-950 dark:text-white font-logo">EU-Server. DSGVO-Sicher. <br />Vereins-geprüft.</p>
             </div>
             <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale contrast-125 font-bold">
                <div className="text-2xl tracking-tighter">GDPR</div>
                <div className="text-3xl tracking-tighter">SOC2</div>
                <div className="text-2xl tracking-tighter">ISO27001</div>
                <div className="text-3xl tracking-tighter">TALO AI</div>
             </div>
          </div>
        </div>
      </section>

      {/* ─── BRAND RESONANCE (EXPERIENCE TALO) ────────────────────── */}
      <section className="py-48 lg:py-72 relative bg-[#f2f4f7] dark:bg-white/[0.04] [clip-path:polygon(0_5%,100%_0,100%_95%,0_100%)] -mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
           <ScrollReveal direction="up">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-8 inline-block italic">The TALO Experience</span>
              <h2 className="text-[2.8rem] md:text-[6rem] lg:text-[7.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[0.95] mb-12">
                 Engagement.<br /><span className="text-gray-300 dark:text-white/10 italic font-logo">Orchestriert.</span>
              </h2>
              <p className="text-lg md:text-2xl text-[#8A8A8A] font-medium max-w-2xl mx-auto leading-relaxed">
                 Die Essenz moderner Vereinsarbeit. Reduziert auf das <br className="hidden md:block" /> Wesentliche, konzipiert für maximales Wachstum.
              </p>
           </ScrollReveal>
        </div>
      </section>

      {/* ─── WHY TALO (VALUES) ───────────────────────────────────── */}
      <section className="py-24 md:py-48 px-6 bg-white dark:bg-[#080808]">
         <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
               <ScrollReveal direction="up" delay={0.1}>
                  <div className="space-y-6">
                     <div className="w-12 h-12 rounded-2xl bg-gray-950 dark:bg-white flex items-center justify-center text-white dark:text-black">
                        <Lock size={20} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-950 dark:text-white font-logo tracking-tight">Sicherheit an<br />erster Stelle.</h3>
                     <p className="text-[#8A8A8A] font-medium leading-relaxed">
                        DSGVO-konforme Datenspeicherung auf deutschen Servern. Verschlüsselt, sicher und jederzeit exportierbar.
                     </p>
                  </div>
               </ScrollReveal>
               <ScrollReveal direction="up" delay={0.2}>
                  <div className="space-y-6">
                     <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white">
                        <Globe size={20} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-950 dark:text-white font-logo tracking-tight">Transparenz für<br />alle Mitglieder.</h3>
                     <p className="text-[#8A8A8A] font-medium leading-relaxed">
                        Jeder sieht seine Fortschritte in Echtzeit. Keine Diskussionen mehr über Punkte – absolute Fairfield im Verein.
                     </p>
                  </div>
               </ScrollReveal>
               <ScrollReveal direction="up" delay={0.3}>
                  <div className="space-y-6">
                     <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white">
                        <Cpu size={20} />
                     </div>
                     <h3 className="text-2xl font-bold text-gray-950 dark:text-white font-logo tracking-tight">KI-gestützte<br />Infrastruktur.</h3>
                     <p className="text-[#8A8A8A] font-medium leading-relaxed">
                        TALO lernt mit. Automatisierte Dokumentenscans und Predictive Analytics für eure Vereinsentwicklung.
                     </p>
                  </div>
               </ScrollReveal>
            </div>
         </div>
      </section>

      {/* ─── FEATURES: THE CORE SYSTEM ────────────────────────────── */}
      <section id="demo" className="py-24 lg:py-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-32 lg:space-y-64">

          {/* Feature 1: Modernisierung */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
             <div className="flex-1 order-2 lg:order-1 self-stretch">
                <ScrollReveal direction="left">
                   <div className="bg-[#f0f9f1] dark:bg-[#0c0c0c] rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-white/5 flex justify-center relative group min-h-[500px] h-full items-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-full max-w-[280px] aspect-[9/19.5] bg-white dark:bg-[#121212] rounded-[32px] border-[6px] border-gray-950 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                         <div className="w-12 h-12 rounded-full bg-[#8A8A8A]/10 flex items-center justify-center text-[#8A8A8A] mb-4">
                            <Sparkles size={24} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SCREENSHOT</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Hier erscheint bald die neue Punktevergabe</p>
                      </div>
                   </div>
                </ScrollReveal>
             </div>
             <div className="flex-1 order-1 lg:order-2">
                <ScrollReveal direction="right" delay={0.2}>
                   <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-gray-900 dark:text-white mb-8">
                      <Zap size={28} />
                   </div>
                   <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-8">
                      Punktevergabe &<br /><span>Modernisierung.</span>
                   </h2>
                   <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10">
                      Eliminiert Excel-Tabellen und Zettelwirtschaft. Vergebt hunderte von Punkten parallel – für Training, Events & Engagement. Talo übernimmt die Arbeit, ihr habt die volle Übersicht.
                   </p>
                   <ul className="space-y-4 mb-12">
                      {["Automatisierte Berechnung", "Echtzeit-Leaderboards", "Transparenz für Mitglieder"].map((t, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest">
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> {t}
                        </li>
                      ))}
                   </ul>
                   <Link href="/funktionen" className="inline-flex items-center gap-3 text-[14px] font-bold text-gray-950 dark:text-white hover:gap-5 transition-all group">
                      System kennenlernen <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </ScrollReveal>
             </div>
          </div>

          {/* Feature 2: Genehmigung */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
             <div className="flex-1">
                <ScrollReveal direction="left">
                   <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-gray-950 dark:text-white mb-8">
                      <ShieldCheck size={28} />
                   </div>
                   <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-8">
                      Intelligente<br /><span>Genehmigung</span>
                   </h2>
                   <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10">
                      Talo schlägt Genehmigungen vor und prüft auf Plausibilität. Admins und Trainer können mit nur einem Wisch hunderte Einträge pro Woche orchestrirere.
                   </p>
                   <div className="grid grid-cols-2 gap-4 mb-12">
                      <div className="p-6 rounded-3xl bg-gray-100 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                         <div className="text-2xl font-bold text-gray-950 dark:text-white mb-1">94%</div>
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zeit gespart</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-100 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                         <div className="text-2xl font-bold text-gray-950 dark:text-white mb-1">0%</div>
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fehlerrate</div>
                      </div>
                   </div>
                   <Link href="/funktionen" className="inline-flex items-center gap-3 text-[14px] font-bold text-gray-950 dark:text-white hover:gap-5 transition-all group">
                      Prozess ansehen <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </ScrollReveal>
             </div>
             <div className="flex-1 self-stretch">
                <ScrollReveal direction="right" delay={0.2}>
                   <div className="bg-[#f2f4f7] dark:bg-[#0c0c0c] rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-white/5 flex justify-center relative group min-h-[500px] h-full items-center">
                      <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-full max-w-[280px] aspect-[9/19.5] bg-white dark:bg-[#121212] rounded-[32px] border-[6px] border-gray-950 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                         <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <ShieldCheck size={24} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SCREENSHOT</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Workflows im Überblick</p>
                      </div>
                   </div>
                </ScrollReveal>
             </div>
          </div>

          {/* Feature 3: Abrechnung */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
             <div className="flex-1 order-2 lg:order-1 self-stretch">
                <ScrollReveal direction="left">
                   <div className="bg-[#f2f1f5] dark:bg-[#0c0c0c] rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-white/5 flex justify-center relative group min-h-[500px] h-full items-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-full max-w-[280px] aspect-[9/19.5] bg-white dark:bg-[#121212] rounded-[32px] border-[6px] border-gray-950 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                         <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <BarChart3 size={24} />
                         </div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">SCREENSHOT</p>
                         <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Präzise Mitgliederübersicht</p>
                      </div>
                   </div>
                </ScrollReveal>
             </div>
             <div className="flex-1 order-1 lg:order-2">
                <ScrollReveal direction="right" delay={0.2}>
                   <div className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 flex items-center justify-center text-gray-950 dark:text-white mb-8">
                      <BarChart3 size={28} />
                   </div>
                   <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-8">
                      Automatisierte<br /><span>Abrechnung</span>
                   </h2>
                   <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10">
                      Am Ende der Saison generiert Talo mit nur einem Klick alle relevanten Berichte für den Vorstand, das Finanzamt oder die Mitgliederversammlung. 
                   </p>
                   <Link href="/funktionen" className="inline-flex items-center gap-3 text-[14px] font-bold text-gray-950 dark:text-white hover:gap-5 transition-all group">
                      Export-Optionen <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </ScrollReveal>
             </div>
          </div>

        </div>
      </section>

      {/* ─── CONTACT SECTION (DEMO REQUEST) ───────────────────────── */}
      <section id="demo" className="py-32 lg:py-64 relative overflow-hidden bg-white dark:bg-[#080808]">
         <div className="absolute top-0 right-[20%] w-[800px] h-[800px] bg-blue-500/5 blur-[160px] pointer-events-none" />
         <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-24">
            
            <div className="flex-1 max-w-2xl">
               <ScrollReveal direction="left">
                  <span className="text-[12px] font-black tracking-[0.3em] text-gray-500 uppercase mb-6 inline-block italic">Interesse an TALO?</span>
                  <h2 className="text-[2.5rem] md:text-[5.5rem] font-medium tracking-tighter leading-[1] text-gray-950 dark:text-white mb-10">
                     Sichere dir eine<br /><span className="text-gray-400 dark:text-[#8A8A8A]">persönliche Demo.</span>
                  </h2>
                  <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-14 max-w-xl">
                     Schließe dich über 150 Vereinen an, die ihren administrativen Aufwand bereits heute um über 90% reduziert haben. Wir zeigen dir TALO™ in Action.
                  </p>
                  
                  <div className="flex flex-col gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 dark:text-gray-500">
                           <ShieldCheck size={20} />
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-widest italic">DSGVO-Sicher & Made in Germany</span>
                     </div>
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

      {/* ─── TESTIMONIALS: STIMMEN AUS DEM EHRENAMT ───────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="text-center mb-24">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Referenzen</span>
              <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo">
                Stimmen aus dem<br /><span className="text-gray-400 italic">Ehrenamt.</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                quote: "Endlich verbringe ich meine Sonntage nicht mehr mit Excel-Listen. Talo hat unseren Verwaltungsaufwand halbiert.",
                author: "Markus Weber",
                role: "1. Vorsitzender, SV Grün-Weiß",
                image: "https://i.pravatar.cc/150?u=markus"
              },
              {
                quote: "Die Mitglieder lieben die App. Jeder sieht sofort, was er beigetragen hat – das motiviert ungemein.",
                author: "Sarah Schneider",
                role: "Schatzmeisterin, Musikverein Lyra",
                image: "https://i.pravatar.cc/150?u=sarah"
              },
              {
                quote: "Rechtssicher, einfach und modern. Talo ist genau das, worauf wir im Rettungsdienst gewartet haben.",
                author: "Thomas Meyer",
                role: "Bereitschaftsleiter, DRK Ortsverein",
                image: "https://i.pravatar.cc/150?u=thomas"
              }
            ].map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="p-10 rounded-[32px] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full flex flex-col justify-between">
                  <p className="text-xl font-medium text-gray-600 dark:text-[#8A8A8A] leading-relaxed italic mb-10">
                    "{t.quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <img src={t.image} alt={t.author} className="w-12 h-12 rounded-full grayscale" />
                    <div>
                      <p className="text-sm font-bold text-gray-950 dark:text-white">{t.author}</p>
                      <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{t.role}</p>
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
        <div className="py-48 lg:py-64 relative bg-[#f2f4f7] dark:bg-white/[0.03] rounded-[64px] md:rounded-[140px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-24 text-center">
               {[
                 { label: "Vereine", value: 150, suffix: "+" },
                 { label: "Mitglieder", value: 12000, suffix: "+" },
                 { label: "Punkte vergeben", value: 1.2, suffix: "M", decimalPlaces: 1 },
                 { label: "Zeit gespart", value: 90, suffix: "%" }
               ].map((s, i) => (
                 <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                   <p className="text-4xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-gray-950 dark:text-white mb-2 md:mb-4">
                     <Counter value={s.value} suffix={s.suffix} decimalPlaces={s.decimalPlaces || 0} />
                   </p>
                   <p className="text-[11px] md:text-sm font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
                 </ScrollReveal>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ SECTION ─────────────────────────────────────────── */}
      <section className="py-32 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-3xl mx-auto text-center mb-24">
          <ScrollReveal direction="up">
            <h2 className="text-[2.5rem] md:text-5xl font-medium tracking-tighter text-gray-950 dark:text-white mb-6 font-logo">Häufige Fragen.</h2>
            <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium">Was du über TALO wissen musst.</p>
          </ScrollReveal>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {[
            {
              q: "Ist Talo DSGVO-konform?",
              a: "Ja, zu 100%. Unsere Server stehen ausschließlich in Deutschland und wir arbeiten mit modernen Verschlüsselungsstandards."
            },
            {
              q: "Wie lange dauert die Einrichtung?",
              a: "Die meisten Vereine sind in weniger als 15 Minuten startklar. Unser Assistent führt dich Schritt für Schritt durch den Prozess."
            },
            {
              q: "Was kostet Talo?",
              a: "Wir haben faire Pakete für jede Vereinsgröße. Kleine Vereine starten oft völlig kostenfrei oder mit minimalen Gebühren."
            }
          ].map((faq, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.05}>
              <div className="p-8 rounded-2xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-3">{faq.q}</h3>
                <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">{faq.a}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── NEWS / INSIGHTS SECTION ─────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-3xl md:text-5xl text-center font-medium text-gray-950 dark:text-white mb-16 md:mb-24 tracking-tighter max-w-4xl mx-auto leading-[1.1]">
              Neueste Highlights aus unserem <Link href="/blog" className="text-gray-950 dark:text-white underline decoration-[#8A8A8A]/30 underline-offset-4 hover:decoration-[#8A8A8A] transition-colors">Blog</Link>
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

              {/* Left: label + title */}
              <Link
                href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                className="flex items-center gap-3 min-w-0 flex-1 outline-none"
              >
                {/* Thumbnail */}
                <div className="shrink-0 p-0.5 rounded-[12px]">
                  <img
                    src="https://i.ibb.co/G4rrPn4n/klein-banner.png"
                    alt="Neuster Post"
                    className="w-9 h-9 rounded-[10px] object-cover"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/40 dark:text-black/40 leading-none mb-0.5">
                    Neuster Beitrag
                  </span>
                  <span className="text-[13px] sm:text-[14px] font-semibold leading-snug line-clamp-1 text-white dark:text-black">
                    {blogPosts[blogPosts.length - 1].title}
                  </span>
                </div>
              </Link>

              {/* Right: CTA + Close */}
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {/* Read CTA pill */}
                <Link
                  href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                  className="hidden sm:flex items-center gap-1.5 text-[12px] font-bold px-3.5 py-2 rounded-[10px] bg-white/10 dark:bg-black/8 hover:bg-white/20 dark:hover:bg-black/15 transition-colors whitespace-nowrap"
                >
                  Lesen
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                    <path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                {/* Mobile: arrow only */}
                <Link
                  href={`/blog/${blogPosts[blogPosts.length - 1].slug}`}
                  className="sm:hidden flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/10 dark:bg-black/8"
                  aria-label="Lesen"
                >
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
                    <path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Link>

                {/* Close button */}
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
