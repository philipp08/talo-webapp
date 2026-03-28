"use client";

import Navbar from "./components/Navbar";
import PhoneDemo from "./components/PhoneDemo";
import FeatureCard from "./components/FeatureCard";
import StepCard from "./components/StepCard";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import { Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 md:pt-48 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center relative z-10">
          <h1 className="text-[2.6rem] leading-[1.05] sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] font-medium tracking-tight font-logo mb-6 sm:mb-8 max-w-6xl mx-auto [word-break:break-word] bg-clip-text text-transparent bg-gradient-to-br from-gray-950 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-gray-500">
            Die Plattform für euer<br />Vereinsengagement
          </h1>

          <p className="text-base sm:text-xl md:text-2xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-2xl mx-auto mb-8 sm:mb-12">
            Ein Team aus Vereinsmitgliedern und Administratoren in der Cloud managen. Orchestriert, fair, und transparent am Kern.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/anmelden"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-xl shadow-black/10 text-center"
            >
              Kostenlos starten
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-full font-bold text-sm bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:scale-105 transition-all text-center"
            >
              Demo ansehen
            </Link>
          </div>
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[600px] bg-[#F1F4F8] dark:bg-white/5 opacity-50 blur-[140px] pointer-events-none -z-10" />
      </section>

      {/* ─── TRUST / ENTERPRISE ──────────────────────────────────── */}
      <section className="py-14 sm:py-24 border-t border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-12">
            <div className="max-w-md">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">Vereins-ready.</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed text-sm sm:text-base">
                Konform, zertifiziert und von führenden Sportverbänden empfohlen.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              <div className="flex flex-col items-center gap-1">
                <div className="text-xl sm:text-2xl font-bold tracking-tighter">GDPR</div>
                <div className="text-[8px] font-bold uppercase tracking-widest text-center">Compliant</div>
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tighter uppercase whitespace-nowrap">SOC 2</div>
              <div className="text-xl sm:text-2xl font-bold tracking-tighter uppercase whitespace-nowrap">Safety First</div>
              <div className="text-2xl sm:text-3xl font-black tracking-tighter uppercase whitespace-nowrap">W3C</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CUSTOMER VOICE / QUOTE ──────────────────────────────── */}
      <section className="py-14 sm:py-24 bg-white dark:bg-[#080808]">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <ScrollReveal direction="up" duration={0.8}>
            <div className="text-center">
              <p className="text-[11px] sm:text-[13px] font-semibold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-6 sm:mb-8">
                Top 100 Vereine weltweit vertrauen Talo
              </p>
              <h2 className="text-[1.6rem] sm:text-[2.4rem] md:text-[3.3rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.15] mb-8 sm:mb-10">
                „90-95% der Vereinsarbeit wird durch Talo automatisiert. Ihr müsst nur noch die finalen Klicks machen."
              </h2>
              <Link
                href="/funktionen"
                className="inline-flex items-center gap-2 text-[#34C759] font-medium hover:gap-3 transition-all"
              >
                Mehr erfahren <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FEATURES: SIDE-BY-SIDE ──────────────────────────────── */}
      <section id="features" className="py-14 sm:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-20 sm:space-y-32">

          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
            <div className="flex-1 w-full order-2 lg:order-1">
              <ScrollReveal direction="left" duration={0.8}>
                <div className="bg-[#DEE7FF] dark:bg-[#1A1F2E] rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 overflow-hidden flex justify-center">
                  <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
                    <PhoneDemo />
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5 sm:mb-8">
                  Punktevergabe &<br />Modernisierung
                </h2>
                <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 sm:mb-10">
                  Vergebt hunderte von Punkten parallel – für Training, Vorstandsarbeit & Events. Talo übernimmt die Arbeit. Ihr prüft nur die Einträge.
                </p>
                <Link
                  href="/funktionen"
                  className="inline-flex items-center gap-2 text-[#34C759] font-medium hover:gap-3 transition-all"
                >
                  Mehr erfahren <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
            <div className="flex-1">
              <ScrollReveal direction="left" duration={0.8}>
                <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5 sm:mb-8">
                  Intelligente<br />Genehmigung
                </h2>
                <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 sm:mb-10">
                  Talo scannt nicht nur Einträge – es versteht den Kontext, prüft auf Plausibilität und schlägt Genehmigungen vor. Alles in Echtzeit.
                </p>
                <Link
                  href="/funktionen"
                  className="inline-flex items-center gap-2 text-[#34C759] font-medium hover:gap-3 transition-all"
                >
                  Mehr erfahren <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>
            <div className="flex-1 w-full">
              <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                <div className="bg-[#E4F3E8] dark:bg-[#1A261F] rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 overflow-hidden flex justify-center">
                  <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
                    <PhoneDemo />
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-24">
            <div className="flex-1 w-full order-2 lg:order-1">
              <ScrollReveal direction="left" duration={0.8}>
                <div className="bg-[#F0EBFF] dark:bg-[#211D2E] rounded-[28px] sm:rounded-[40px] p-6 sm:p-8 md:p-12 overflow-hidden flex justify-center">
                  <div className="scale-75 sm:scale-90 md:scale-100 origin-top">
                    <PhoneDemo />
                  </div>
                </div>
              </ScrollReveal>
            </div>
            <div className="flex-1 order-1 lg:order-2">
              <ScrollReveal direction="right" delay={0.2} duration={0.8}>
                <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-5 sm:mb-8">
                  Automatisierte<br />Abrechnung
                </h2>
                <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6 sm:mb-10">
                  Korrigiert, was der Admin übersieht – über hunderte Mitglieder hinweg. Geprüft, mit fertigen Exporten zum Review.
                </p>
                <Link
                  href="/funktionen"
                  className="inline-flex items-center gap-2 text-[#34C759] font-medium hover:gap-3 transition-all"
                >
                  Mehr erfahren <ArrowRight className="w-4 h-4" />
                </Link>
              </ScrollReveal>
            </div>
          </div>

        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="py-20 sm:py-32 bg-[#F1F4F8] dark:bg-[#0F0F0F]">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-16">
            <ScrollReveal direction="up" delay={0.1} duration={0.8}>
              <div className="text-center">
                <p className="text-6xl sm:text-7xl md:text-8xl font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">4x</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base sm:text-xl">höhere Mitgliederaktivität</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2} duration={0.8}>
              <div className="text-center">
                <p className="text-6xl sm:text-7xl md:text-8xl font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">83%</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base sm:text-xl">weniger Verwaltungsaufwand</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3} duration={0.8}>
              <div className="text-center">
                <p className="text-6xl sm:text-7xl md:text-8xl font-medium text-gray-900 dark:text-white mb-4 sm:mb-6">400+</p>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-base sm:text-xl">erfolgreich digitalisierte Vereine</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── THE WORKFORCE GRID ──────────────────────────────────── */}
      <section className="py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <ScrollReveal direction="up" duration={0.8}>
            <div className="mb-12 sm:mb-20">
              <h2 className="text-[2rem] sm:text-[2.5rem] md:text-[3.5rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-4 sm:mb-6">
                Die Engineering-Workforce<br />für euren Verein.
              </h2>
              <p className="text-base sm:text-xl text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
                Gebt die Richtung vor. Talo übernimmt die Ausführung. Kontinuierlich und autonom.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              {
                title: "Hintergrund-Agenten",
                desc: "Aufgabe rein, Ergebnis raus. Talo führt eure Vereinsarbeit im Hintergrund aus. Behaltet den Fokus.",
                color: "bg-[#E4F3E8] dark:bg-[#1A261F]",
                icon: <Cpu className="w-6 h-6 text-[#34C759]" />,
              },
              {
                title: "Automatisierungen",
                desc: "Mitglieder-Flotten auf Knopfdruck. Getriggert durch Aktivitäten, die Code schreiben und die Datenbank pflegen.",
                color: "bg-[#F0EBFF] dark:bg-[#211D2E]",
                icon: <Zap className="w-6 h-6 text-[#A855F7]" />,
              },
              {
                title: "Vernetzte Umgebungen",
                desc: "Mehr als nur eine Cloud. Jeder Verein erhält eine isolierte Umgebung mit eigenen Tools und Workflows.",
                color: "bg-[#E4F3E8] dark:bg-[#1A261F]",
                icon: <Globe className="w-6 h-6 text-[#34C759]" />,
              },
              {
                title: "Garantierte Sicherheit",
                desc: "Läuft in eurem geschlossenen Bereich mit voller Netzwerk-Kontrolle. Audit-Trails, sichere Anmeldedaten.",
                color: "bg-[#DEE7FF] dark:bg-[#1A1F2E]",
                icon: <Lock className="w-6 h-6 text-[#3B82F6]" />,
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.1} duration={0.8}>
                <div className={`${item.color} rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 h-full flex flex-col justify-between min-h-[220px] sm:min-h-0`}>
                  <div className="mb-8 sm:mb-12">
                    <div className="w-36 h-36 sm:w-48 sm:h-48 mb-6 sm:mb-8 opacity-20">
                      <div className="grid grid-cols-6 grid-rows-6 gap-1.5 sm:gap-2 w-full h-full">
                        {[...Array(36)].map((_, j) => (
                          <div key={j} className="w-full h-full rounded-full bg-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">{item.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-xs sm:text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ANNOUNCEMENT BANNER ─────────────────────────────────── */}
      <div className="fixed bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] sm:w-auto max-w-[calc(100vw-2.5rem)]">
        <ScrollReveal direction="up" delay={1} duration={0.8} distance={20}>
          <Link
            href="/blog/introducing-veto"
            className="flex items-center gap-3 sm:gap-4 bg-[#0F0F0F] dark:bg-white text-white dark:text-black px-4 sm:px-6 py-3 rounded-2xl shadow-2xl border border-white/10 dark:border-black/5 hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] sm:text-xs font-bold opacity-60 uppercase tracking-widest">Neu von Talo</span>
              <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 truncate">
                Wir stellen vor: Veto – Sicherheit für Vereine <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
              </span>
            </div>
          </Link>
        </ScrollReveal>
      </div>

      <Footer />
    </main>
  );
}
