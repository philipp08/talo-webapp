"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import FeatureCard from "@/app/components/FeatureCard";
import StickyScroll from "@/app/components/StickyScroll";
import Footer from "@/app/components/Footer";
import { 
  CheckCircle2, 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  Share2, 
  Cpu, 
  Globe, 
  Zap, 
  Lock,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-[200px] pb-24 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-500/5 blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-8 block text-center italic">Die TALO Plattform</span>
            <h1 className="text-[3.5rem] leading-[1.05] md:text-[6rem] lg:text-[7.5rem] font-medium tracking-tighter font-logo text-gray-900 dark:text-white mb-10 text-center">
              Maximale <span className="text-gray-400 italic">Effizienz.</span><br />Null Aufwand.
            </h1>
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-gray-500 dark:text-[#8A8A8A] max-w-3xl mx-auto text-center mb-16">
              Wir haben TALO entwickelt, um die administrative Last vom Ehrenamt zu nehmen. Entdecke, wie unsere Technologie deinen Verein transformiert.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── STICKY SCROLL WORKFLOW ───────────────────────────────── */}
      <section className="bg-white dark:bg-[#080808]">
        <StickyScroll />
      </section>

      {/* ─── DEEP DIVE: ROLLEN & BERECHTIGUNGEN ───────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-24 lg:my-48 relative z-10">
        <div className="py-32 lg:py-48 bg-[#f2f4f7] dark:bg-white/[0.03] rounded-[64px] md:rounded-[120px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal direction="up">
              <div className="max-w-3xl mb-24">
                <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Struktur & Klarheit</span>
                <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo mb-8">
                  Maßgeschneidert für<br />jede <span className="text-gray-400 italic">Rolle</span> im Verein.
                </h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  role: "Administratoren",
                  title: "Strategische Steuerung",
                  desc: "Definiert Kategorien, setzt Ziele und behaltet den finanziellen Überblick. Mit Talo habt ihr das Steuer fest in der Hand.",
                  items: ["Punkte-Kataloge (A-S)", "Saison-Management", "Finanz-Prognosen", "Rechte-Management"],
                  icon: <ShieldCheck className="text-blue-500" size={24} />
                },
                {
                  role: "Trainer & Spartenleiter",
                  title: "Operative Exzellenz",
                  desc: "Kein Papierkram mehr nach dem Training. Genehmigungen und Listen werden mobil in Sekunden erledigt.",
                  items: ["Quick-Approval System", "Digitale Anwesenheit", "Sparten-Übersicht", "Team-Kommunikation"],
                  icon: <Zap className="text-amber-500" size={24} />
                },
                {
                  role: "Mitglieder",
                  title: "Einfache Teilhabe",
                  desc: "Die App macht Engagement sichtbar. Mitglieder sehen ihre Fortschritte und reichen Beiträge spielerisch ein.",
                  items: ["Mobile App (PWA)", "Echtzeit-Leaderboard", "Point-History", "Digitaler Ausweis"],
                  icon: <Users className="text-emerald-500" size={24} />
                }
              ].map((box, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="p-10 rounded-[40px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mb-8">
                      {box.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{box.role}</span>
                    <h3 className="text-2xl font-bold text-gray-950 dark:text-white mb-6 leading-tight">{box.title}</h3>
                    <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-10">{box.desc}</p>
                    <ul className="mt-auto space-y-4 pt-6 border-t border-gray-50 dark:border-white/5">
                      {box.items.map((item, j) => (
                        <li key={j} className="flex items-center gap-3 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest leading-none">
                          <CheckCircle2 size={14} className="text-gray-300 dark:text-gray-600" /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TECHNOLOGY & SECURITY ────────────────────────────────── */}
      <section className="py-24 lg:py-48 px-6 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-24">
          <div className="flex-1">
            <ScrollReveal direction="left">
               <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Infrastruktur</span>
               <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1] font-logo mb-10">
                 Technologie, die <br /><span className="text-gray-400 italic">Sicherheit</span> garantiert.
               </h2>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                  {[
                    { title: "Hosting in DE", desc: "Zertifizierte Rechenzentren in Frankfurt am Main.", icon: <Globe size={20} /> },
                    { title: "AES-256", desc: "Militärische Verschlüsselung für alle privaten Daten.", icon: <Lock size={20} /> },
                    { title: "99.9% Uptime", desc: "Euer Verein ist immer online – ohne Ausfallzeiten.", icon: <Zap size={20} /> },
                    { title: "KI-Engine", desc: "Automatisierte Plausibilitätsprüfungen für höchste Datenqualität.", icon: <Cpu size={20} /> }
                  ].map((tech, i) => (
                    <div key={i} className="flex flex-col gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400">{tech.icon}</div>
                      <h4 className="font-bold text-gray-950 dark:text-white leading-none">{tech.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">{tech.desc}</p>
                    </div>
                  ))}
               </div>
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full flex items-center justify-center relative">
            <ScrollReveal direction="right" delay={0.2}>
               <div className="w-full aspect-square max-w-[500px] bg-gradient-to-br from-blue-500/10 to-transparent rounded-[80px] p-1 border border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                  <div className="w-full h-full bg-white dark:bg-[#0c0c0c] rounded-[76px] flex items-center justify-center p-12">
                     <ShieldCheck size={120} className="text-blue-500 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                  </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATIONS & CONNECTIVITY ──────────────────────────── */}
      <section className="py-24 lg:py-48 bg-[#fafafa] dark:bg-white/[0.02] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <ScrollReveal direction="up">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Konnektivität</span>
              <h2 className="text-[2.5rem] md:text-5xl lg:text-7xl font-medium tracking-tighter text-gray-950 dark:text-white font-logo mb-6">
                Nahtlos <span className="text-gray-400 italic">integriert.</span>
              </h2>
              <p className="text-lg text-gray-500 dark:text-[#8A8A8A] max-w-xl mx-auto">
                Talo arbeitet dort, wo ihr seid. Wir verbinden eure bestehenden Prozesse mit unserer intelligenten Engine.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Slack", label: "Notifications" },
              { name: "WhatsApp", label: "Quick Submit" },
              { name: "Excel", label: "Data Sync" },
              { name: "E-Mail", label: "Automation" }
            ].map((integ, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                <div className="group p-8 rounded-[40px] bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 text-center hover:border-blue-500/30 transition-all duration-500 cursor-default">
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-blue-500/5 transition-all duration-500">
                    <Share2 className="text-gray-400 group-hover:text-blue-500 transition-colors" size={24} />
                  </div>
                  <h4 className="font-bold text-gray-950 dark:text-white mb-1 leading-none">{integ.name}</h4>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black italic">{integ.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ONBOARDING PROCESS ───────────────────────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-24 lg:my-32">
         <div className="py-24 lg:py-32 bg-gray-950 rounded-[64px] md:rounded-[100px] overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/10 blur-[140px] pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
               <ScrollReveal direction="up">
                  <h2 className="text-[2.5rem] md:text-5xl lg:text-7xl font-medium tracking-tighter text-white font-logo mb-16">
                     Bereit für den <span className="text-blue-400 italic">nächsten Schritt?</span>
                  </h2>
               </ScrollReveal>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                  {[
                    { step: "01", title: "Demo vereinbaren", desc: "Wir zeigen euch Talo ganz unverbindlich in 20 Minuten." },
                    { step: "02", title: "Daten importieren", desc: "Wir helfen euch beim Import eurer Mitgliederlisten." },
                    { step: "03", title: "Live gehen", desc: "Am nächsten Tag sammeln eure Mitglieder bereits Punkte." }
                  ].map((on, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                       <span className="text-5xl font-black text-white/10 mb-6 block leading-none">{on.step}</span>
                       <h3 className="text-xl font-bold text-white mb-4 leading-none">{on.title}</h3>
                       <p className="text-gray-400 max-w-[240px] mx-auto text-sm leading-relaxed">{on.desc}</p>
                    </ScrollReveal>
                  ))}
               </div>

               <ScrollReveal direction="up" delay={0.4}>
                  <Link 
                    href="/anmelden" 
                    className="mt-20 inline-flex h-16 items-center px-10 rounded-full bg-white text-gray-950 font-bold text-sm tracking-widest hover:scale-105 transition-transform italic"
                  >
                     JETZT KOSTENFREI STARTEN <ArrowRight size={16} className="ml-3" />
                  </Link>
               </ScrollReveal>
            </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
