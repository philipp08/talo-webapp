"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import FeatureCard from "./components/FeatureCard";
import StepCard from "./components/StepCard";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import { Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu, Sparkles, Megaphone, ChevronRight, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { posts as blogPosts } from "./blog/page";

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8A8A8A] font-bold text-[11px] uppercase tracking-widest mb-8">
               <Sparkles size={12} /> Talo ist jetzt live
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
              <Link
                href="#demo"
                className="w-full sm:w-auto px-10 py-5 rounded-full font-bold text-sm bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-center"
              >
                Demo ansehen
              </Link>
            </div>
          </ScrollReveal>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#34C759]/5 dark:bg-[#34C759]/10 opacity-30 blur-[160px] pointer-events-none -z-10" />
      </section>

      {/* ─── TRUST SECTION ───────────────────────────────────────── */}
      <section className="py-20 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
             <div className="max-w-md">
                <h3 className="text-[12px] font-black tracking-[0.2em] text-[#34C759] uppercase mb-3">SICHER & KONFORM</h3>
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

      {/* ─── FEATURES: THE CORE SYSTEM ────────────────────────────── */}
      <section id="demo" className="py-24 lg:py-48 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 space-y-32 lg:space-y-64">

          {/* Feature 1: Modernisierung */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
             <div className="flex-1 order-2 lg:order-1 self-stretch">
                <ScrollReveal direction="left">
                   <div className="bg-[#f0f9f1] dark:bg-[#0c0c0c] rounded-[48px] p-6 md:p-12 border border-gray-100 dark:border-white/5 flex justify-center relative group min-h-[500px] h-full items-center">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#34C759]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="w-full max-w-[280px] aspect-[9/19.5] bg-white dark:bg-[#121212] rounded-[32px] border-[6px] border-gray-950 dark:border-white/10 shadow-2xl flex flex-col items-center justify-center p-6 text-center">
                         <div className="w-12 h-12 rounded-full bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mb-4">
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
                   <div className="w-14 h-14 rounded-2xl bg-[#34C759]/10 flex items-center justify-center text-[#34C759] mb-8">
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
                   <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-8">
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
                   <Link href="/funktionen" className="inline-flex items-center gap-3 text-[14px] font-bold text-blue-500 hover:gap-5 transition-all group">
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
                   <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500 mb-8">
                      <BarChart3 size={28} />
                   </div>
                   <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] mb-8">
                      Automatisierte<br /><span>Abrechnung</span>
                   </h2>
                   <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10">
                      Am Ende der Saison generiert Talo mit nur einem Klick alle relevanten Berichte für den Vorstand, das Finanzamt oder die Mitgliederversammlung. 
                   </p>
                   <Link href="/funktionen" className="inline-flex items-center gap-3 text-[14px] font-bold text-purple-500 hover:gap-5 transition-all group">
                      Export-Optionen <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </ScrollReveal>
             </div>
          </div>

        </div>
      </section>

      {/* ─── NEWS / INSIGHTS SECTION ─────────────────────────────── */}
      <section className="py-24 sm:py-48 bg-gray-50 dark:bg-[#0c0c0c] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20 sm:mb-24">
              <div className="max-w-xl">
                <span className="text-[11px] font-black tracking-[0.2em] text-[#8A8A8A] uppercase mb-4 block">NEWS & INSIGHTS</span>
                <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.05] mb-6">
                   Neues aus der <span>Talo Schmiede</span>
                </h2>
                <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium font-logo">
                   Wie Talo das Ehrenamt modernisiert und was als nächstes kommt.
                </p>
              </div>
              <Link href="/blog" className="flex items-center gap-3 text-[14px] font-bold text-gray-950 dark:text-white group border-b-2 border-gray-950 dark:border-white pb-1 font-logo">
                 Unsere Story <ArrowRight className="group-hover:translate-x-2 transition-all" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.15}>
                <Link href={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white dark:bg-[#121212] rounded-[40px] p-10 border border-gray-100 dark:border-white/5 hover:scale-[1.02] transition-all hover:shadow-2xl">
                   <div className="flex items-center justify-between mb-8">
                      <div className="px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest bg-gray-500">
                         {post.category}
                      </div>
                      <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">{post.date}</span>
                   </div>
                   <h1 className="text-2xl font-bold font-logo text-gray-950 dark:text-white mb-4 leading-tight transition-colors">{post.title}</h1>
                   <p className="text-gray-500 dark:text-[#8A8A8A] leading-relaxed mb-10 flex-1 line-clamp-3">{post.excerpt}</p>
                   <div className="flex items-center gap-2 text-xs font-black text-gray-400 dark:hover:text-white transition-colors uppercase tracking-widest font-logo">
                      Vollständiger Artikel <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER (FLOATING) ───────────────────────────────── */}
      {showBanner && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] w-auto max-w-[90vw]">
          <div className="relative flex items-center bg-[#080808] dark:bg-white text-white dark:text-black rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md border border-white/10 dark:border-black/5 group transition-all duration-500 animate-in fade-in slide-in-from-bottom-5 p-1.5 pr-4">
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
                
                <span className="text-[13px] font-semibold tracking-tight whitespace-nowrap flex items-center gap-2 mr-2">
                   Neu im Blog: <span className="opacity-60 font-medium">{blogPosts[0].title}</span>
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
