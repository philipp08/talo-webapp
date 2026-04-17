"use client";

import { useRef } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import { stickyItems } from "@/app/components/StickyScroll";
import Footer from "@/app/components/Footer";
import {
  CheckCircle2,
  Users,
  ShieldCheck,
  Globe,
  Zap,
  Lock,
  Cpu,
  ArrowRight,
  BarChart3,
  FileOutput,
  Bell,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

/* ─── Word-by-word scroll-linked text reveal (same as homepage) ── */
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
    offset: ["start 0.85", "end 0.25"],
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

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-[200px] pb-24 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-500/5 blur-[130px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-8 block italic">
              Die TALO Plattform
            </span>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] leading-[1.02] md:text-[6rem] lg:text-[7.5rem] font-medium tracking-tighter font-logo text-gray-900 dark:text-white mb-10">
              Maximale <span className="text-gray-300 dark:text-white/20 italic">Effizienz.</span>
              <br />Null Aufwand.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-xl md:text-2xl font-medium leading-relaxed text-gray-500 dark:text-[#8A8A8A] max-w-2xl mx-auto mb-14">
              TALO nimmt dem Ehrenamt die Verwaltungslast. Entdecke, wie unsere Technologie deinen Verein transformiert.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/anmelden"
                className="px-8 py-4 rounded-full font-bold text-sm bg-gray-950 dark:bg-white text-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20"
              >
                Kostenlos starten
              </Link>
              <Link
                href="#workflow"
                className="px-8 py-4 rounded-full font-bold text-sm border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                So funktioniert's
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── WHAT TALO DOES — simple feature strip ────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
            {[
              { icon: <Zap size={20} />, label: "Punktevergabe", color: "text-emerald-500" },
              { icon: <ShieldCheck size={20} />, label: "Genehmigungen", color: "text-blue-500" },
              { icon: <BarChart3 size={20} />, label: "Analytics", color: "text-purple-500" },
              { icon: <FileOutput size={20} />, label: "Exports", color: "text-rose-500" },
            ].map((item, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col items-center gap-3 opacity-60 hover:opacity-100 transition-opacity cursor-default">
                  <div className={`${item.color}`}>{item.icon}</div>
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-gray-500">{item.label}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── WORKFLOW: static 2×2 demo grid ──────────────────────── */}
      <section id="workflow" className="py-24 md:py-40 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            {/* Workflow stepper */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-0 mb-16 overflow-x-auto">
              {[
                { num: "01", label: "Erfassen", accent: "#10b981" },
                { num: "02", label: "Prüfen",   accent: "#3b82f6" },
                { num: "03", label: "Analysieren", accent: "#a855f7" },
                { num: "04", label: "Abrechnen", accent: "#f43f5e" },
              ].map((step, i, arr) => (
                <div key={step.num} className="flex flex-row sm:flex-row items-center">
                  <div className="flex flex-col items-center gap-2 px-5 py-4 sm:py-0">
                    <span
                      className="text-[10px] font-black tracking-[0.25em] uppercase"
                      style={{ color: step.accent }}
                    >
                      {step.num}
                    </span>
                    <span className="text-[1.1rem] sm:text-[1.35rem] font-semibold tracking-tight text-gray-900 dark:text-white whitespace-nowrap">
                      {step.label}
                    </span>
                  </div>
                  {i < arr.length - 1 && (
                    <svg
                      className="w-8 h-8 text-gray-200 dark:text-white/10 shrink-0 mx-1"
                      viewBox="0 0 32 32" fill="none"
                    >
                      <path d="M8 16h14M18 11l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </ScrollReveal>

          {/* 2×2 on md+, single column on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {stickyItems.map((item, i) => (
              <ScrollReveal key={item.id} direction="up" delay={i * 0.08}>
                <div className="rounded-[32px] overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] flex flex-col h-full">
                  {/* Visual — fixed height, no scroll */}
                  <div className="h-64 sm:h-72 lg:h-80 flex-shrink-0 overflow-hidden pointer-events-none select-none">
                    {item.visual}
                  </div>

                  {/* Text */}
                  <div className="p-7 md:p-8 flex flex-col gap-2 border-t border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-2.5 mb-1">
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.accent}18`, color: item.accent }}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                        {item.label}
                      </span>
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-950 dark:text-white leading-snug tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCROLL-LINKED STATEMENT ──────────────────────────────── */}
      <section className="py-32 md:py-56 bg-[#f2f4f7] dark:bg-white/[0.03] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-10 inline-block italic">
              Unsere Philosophie
            </span>
          </ScrollReveal>
          <ScrollText
            text="Verwaltung soll unsichtbar sein. TALO übernimmt alles im Hintergrund — damit euer Verein das tun kann, wofür er gegründet wurde."
            className="text-2xl md:text-4xl lg:text-5xl text-gray-900 dark:text-white font-medium leading-[1.3] tracking-tight"
          />
        </div>
      </section>

      {/* ─── ROLLEN: clean numbered rows ──────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">
              Für jeden die richtige Ansicht
            </span>
            <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05] mb-16">
              Maßgeschneidert für<br /><span className="text-gray-300 dark:text-white/20 italic">jede Rolle.</span>
            </h2>
          </ScrollReveal>

          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {[
              {
                num: "01",
                icon: <ShieldCheck size={20} />,
                role: "Administratoren",
                title: "Strategische Steuerung.",
                desc: "Definiert Kategorien, setzt Ziele und behaltet den finanziellen Überblick. Das Steuer fest in der Hand.",
                items: ["Punkte-Kataloge", "Saison-Management", "Finanz-Prognosen", "Rechte-Management"],
                color: "text-blue-500",
                bg: "bg-blue-500/8 dark:bg-blue-500/10",
              },
              {
                num: "02",
                icon: <Zap size={20} />,
                role: "Trainer & Spartenleiter",
                title: "Operative Exzellenz.",
                desc: "Kein Papierkram nach dem Training. Genehmigungen und Listen werden mobil in Sekunden erledigt.",
                items: ["Quick-Approval", "Digitale Anwesenheit", "Sparten-Übersicht", "Team-Kommunikation"],
                color: "text-amber-500",
                bg: "bg-amber-500/8 dark:bg-amber-500/10",
              },
              {
                num: "03",
                icon: <Users size={20} />,
                role: "Mitglieder",
                title: "Einfache Teilhabe.",
                desc: "Die App macht Engagement sichtbar. Mitglieder sehen ihre Fortschritte und reichen Beiträge spielerisch ein.",
                items: ["Mobile App (PWA)", "Echtzeit-Leaderboard", "Point-History", "Digitaler Ausweis"],
                color: "text-emerald-500",
                bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="group py-10 md:py-14">
                  <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                    {/* Number + Icon */}
                    <div className="flex items-center gap-4 md:w-48 shrink-0">
                      <span className="text-[11px] font-black tracking-[0.3em] text-gray-300 dark:text-gray-700">{item.num}</span>
                      <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        {item.icon}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.color} md:hidden`}>{item.role}</span>
                    </div>

                    {/* Main content */}
                    <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-16">
                      <div className="md:w-72 shrink-0">
                        <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.color} mb-2 hidden md:block`}>{item.role}</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-950 dark:text-white font-logo tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                          {item.title}
                        </h3>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-6">{item.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.items.map((tag, j) => (
                            <span key={j} className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 text-gray-500 dark:text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH & SECURITY ──────────────────────────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-10 lg:my-20">
        <div className="py-24 md:py-40 bg-gray-950 rounded-[64px] md:rounded-[120px] overflow-hidden relative">
          {/* subtle grid */}
          <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 blur-[140px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row gap-20 lg:gap-32">
              {/* Left */}
              <div className="lg:w-1/2">
                <ScrollReveal direction="up">
                  <span className="text-[11px] font-black tracking-[0.4em] text-white/30 uppercase mb-6 inline-block italic">Infrastruktur</span>
                  <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-white leading-[1.02] font-logo mb-10">
                    Sicherheit,<br />auf die ihr<br /><span className="text-white/20 italic">vertrauen könnt.</span>
                  </h2>
                  <p className="text-gray-400 font-medium leading-relaxed text-lg max-w-md">
                    DSGVO-konform, verschlüsselt und auf deutschen Servern. Wir machen keine Kompromisse bei der Sicherheit eurer Mitgliederdaten.
                  </p>
                </ScrollReveal>
              </div>

              {/* Right: specs grid */}
              <div className="lg:w-1/2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {[
                    { title: "Hosting in Deutschland", desc: "Zertifizierte Rechenzentren in Frankfurt am Main.", icon: <Globe size={18} />, color: "text-blue-400" },
                    { title: "AES-256 Verschlüsselung", desc: "Militärische Verschlüsselung für alle Daten at rest & in transit.", icon: <Lock size={18} />, color: "text-emerald-400" },
                    { title: "99.9 % Uptime", desc: "Redundante Infrastruktur — euer Verein ist immer erreichbar.", icon: <Zap size={18} />, color: "text-amber-400" },
                    { title: "KI-Plausibilitätsprüfung", desc: "Automatische Erkennung von Duplikaten und Fehleingaben.", icon: <Cpu size={18} />, color: "text-purple-400" },
                    { title: "DSGVO-Konformität", desc: "100 % compliant. Datenschutzbeauftragter auf Anfrage.", icon: <ShieldCheck size={18} />, color: "text-rose-400" },
                    { title: "Vollständige Exportierbarkeit", desc: "Eure Daten gehören euch — jederzeit als CSV, Excel oder PDF.", icon: <FileOutput size={18} />, color: "text-indigo-400" },
                  ].map((spec, i) => (
                    <ScrollReveal key={i} direction="up" delay={i * 0.06}>
                      <div className="p-6 rounded-[24px] bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07] transition-colors">
                        <div className={`${spec.color} mb-4`}>{spec.icon}</div>
                        <h4 className="font-bold text-white text-sm mb-2">{spec.title}</h4>
                        <p className="text-gray-500 text-xs leading-relaxed">{spec.desc}</p>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── INTEGRATIONEN ────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="max-w-2xl mb-20">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">Konnektivität</span>
              <h2 className="text-[2.5rem] md:text-[4rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05]">
                Nahtlos <span className="text-gray-300 dark:text-white/20 italic">integriert</span><br />in euren Alltag.
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
            {[
              { name: "Slack", label: "Push-Benachrichtigungen", icon: <Bell size={22} />, color: "text-purple-500", bg: "bg-purple-500/8 dark:bg-purple-500/10" },
              { name: "WhatsApp", label: "Schnell einreichen", icon: <Zap size={22} />, color: "text-emerald-500", bg: "bg-emerald-500/8 dark:bg-emerald-500/10" },
              { name: "Excel / CSV", label: "Daten synchronisieren", icon: <Layers size={22} />, color: "text-blue-500", bg: "bg-blue-500/8 dark:bg-blue-500/10" },
              { name: "E-Mail", label: "Automatisierung", icon: <FileOutput size={22} />, color: "text-amber-500", bg: "bg-amber-500/8 dark:bg-amber-500/10" },
            ].map((integ, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="group p-8 rounded-[28px] bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 cursor-default">
                  <div className={`w-12 h-12 rounded-2xl ${integ.bg} ${integ.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {integ.icon}
                  </div>
                  <h4 className="font-bold text-gray-950 dark:text-white mb-1 text-base">{integ.name}</h4>
                  <p className="text-[11px] text-gray-400 uppercase tracking-widest font-black">{integ.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ONBOARDING / CTA ─────────────────────────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-10 lg:my-20 mb-24 lg:mb-32">
        <div className="py-24 lg:py-40 bg-[#f2f4f7] dark:bg-white/[0.03] rounded-[64px] md:rounded-[120px] overflow-hidden relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">

            {/* Header */}
            <ScrollReveal direction="up">
              <div className="text-center mb-20 md:mb-28">
                <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">So geht's los</span>
                <h2 className="text-[2.5rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white font-logo leading-[1.02]">
                  In 3 Schritten<br /><span className="text-gray-300 dark:text-white/20 italic">live.</span>
                </h2>
              </div>
            </ScrollReveal>

            {/* Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
              {[
                {
                  step: "01",
                  title: "Demo vereinbaren",
                  desc: "Wir zeigen euch TALO ganz unverbindlich in 20 Minuten.",
                  icon: <Bell size={20} />,
                },
                {
                  step: "02",
                  title: "Daten importieren",
                  desc: "Wir helfen euch beim Import eurer bestehenden Mitgliederlisten.",
                  icon: <Layers size={20} />,
                },
                {
                  step: "03",
                  title: "Live gehen",
                  desc: "Am nächsten Tag sammeln eure Mitglieder bereits Punkte.",
                  icon: <Zap size={20} />,
                },
              ].map((step, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <div className="p-8 rounded-[32px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-4xl font-black text-gray-100 dark:text-white/10 leading-none">{step.step}</span>
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-center text-gray-400">
                        {step.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-950 dark:text-white mb-3">{step.title}</h3>
                    <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* CTA */}
            <ScrollReveal direction="up" delay={0.3}>
              <div className="text-center">
                <Link
                  href="/anmelden"
                  className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gray-950 dark:bg-white text-white dark:text-black font-bold text-sm tracking-wide hover:scale-105 transition-transform shadow-2xl shadow-black/20"
                >
                  Jetzt kostenfrei starten <ArrowRight size={16} />
                </Link>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
