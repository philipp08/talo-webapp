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
import { motion, AnimatePresence } from "framer-motion";
import { DemoProvider, useDemo } from "@/lib/context/DemoContext";

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);

  return (
    <DemoProvider>
      <HomeContent 
        showBanner={showBanner} 
        isBannerVisible={isBannerVisible} 
        setShowBanner={setShowBanner} 
        setIsBannerVisible={setIsBannerVisible} 
      />
    </DemoProvider>
  );
}

function HomeContent({ showBanner, isBannerVisible, setShowBanner, setIsBannerVisible }: any) {
  const { isDemoOpen, openDemo, closeDemo } = useDemo();

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        // Calculate distance from bottom
        const scrollPosition = window.innerHeight + window.scrollY;
        const bodyHeight = document.documentElement.scrollHeight;
        
        // Hide the banner if within 250px of the absolute bottom (footer area)
        if (bodyHeight - scrollPosition < 250) {
          setIsBannerVisible(false);
        } else {
          setIsBannerVisible(true);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial scroll position
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

        {/* ─── DEMO MODAL ────────────────────────────────────────── */}
        <AnimatePresence>
          {isDemoOpen && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeDemo}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full max-w-xl z-10"
              >
                <button 
                  onClick={closeDemo}
                  className="absolute -top-12 right-0 text-white/50 hover:text-white transition-colors flex items-center gap-2 group font-bold text-xs uppercase tracking-widest"
                >
                  Schließen <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
                <ContactForm />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-48 md:pb-32 overflow-hidden">
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
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20 text-center"
              >
                Kostenlos starten
              </Link>
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
      <section className="py-20 border-t border-gray-100 dark:border-white/5">
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
      <section className="py-32 lg:py-64 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-500/[0.03] dark:bg-white/[0.03] blur-[160px] pointer-events-none" />
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
      <section className="py-32 lg:py-48 bg-gray-50/50 dark:bg-white/[0.01] border-y border-gray-100 dark:border-white/5">
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
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                         <div className="text-2xl font-bold text-gray-950 dark:text-white mb-1">94%</div>
                         <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zeit gespart</div>
                      </div>
                      <div className="p-6 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
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
                   <div className="bg-[#f0f4f9] dark:bg-[#0c0c0c] rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-white/5 flex justify-center relative group min-h-[500px] h-full items-center">
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
                     Schließe dich über 150 Vereinen an, die ihren administrativen Aufwand bereits heute um über 90% reduziert haben. Wir zeigen dir TALO in Action.
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

      {/* ─── NEWS / INSIGHTS SECTION ─────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-xl md:text-2xl text-center font-medium text-gray-900 dark:text-white mb-10 md:mb-16">
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
      {showBanner && (
        <div 
          className={`fixed bottom-10 left-1/2 z-[100] w-auto max-w-[90vw] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
            isBannerVisible 
              ? "-translate-x-1/2 translate-y-0 opacity-100" 
              : "-translate-x-1/2 translate-y-24 opacity-0 pointer-events-none"
          }`}
        >
          <div className="relative flex items-center bg-[#080808] dark:bg-white text-white dark:text-black rounded-[20px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md group transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 p-2 pr-6">
            <Link 
               href={`/blog/${blogPosts[0].slug}`}
               className="flex items-center gap-3 transition-all outline-none"
            >
                <div className="p-1 rounded-xl shrink-0">
                  <img 
                    src="https://i.ibb.co/G4rrPn4n/klein-banner.png" 
                    alt="Latest Blog"
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                </div>
                
                <span className="text-[14px] font-bold tracking-tight whitespace-nowrap flex items-center gap-2">
                   {blogPosts[0].title}
                </span>
                
                {/* Tail Icons Container */}
                <div className="flex items-center">
                   {/* Arrow */}
                   <span className="transition-all duration-300 group-hover:mr-8" aria-hidden="true">
                      <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                      </svg>
                   </span>
                </div>
            </Link>

            <button 
              type="button"
              onClick={() => setShowBanner(false)}
              aria-label="Schließen"
              className="absolute right-3 w-8 h-8 flex items-center justify-center rounded-lg opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 text-white/40 dark:text-black/40 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/5 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="m1.75 1.75 8.5 8.5m0-8.5-8.5 8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"></path>
              </svg>
            </button>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
