"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { 
  Trophy, 
  Music, 
  Flame, 
  Users, 
  Heart, 
  GraduationCap, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  BarChart3, 
  Clock 
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const detailedSolutions = [
  {
    id: "sport",
    icon: <Trophy className="w-10 h-10" />,
    title: "Sportvereine",
    subtitle: "Leistung & Gemeinschaft digital greifbar machen",
    desc: "Für Sportvereine ist Talo mehr als nur eine Liste. Es ist das Werkzeug, um Trainingsfleiß, ehrenamtliche Unterstützung am Spieltag und sportliche Erfolge in einem fairen System zu vereinen.",
    useCases: [
      {
        title: "Trainingsbeteiligung",
        description: "Trainer erfassen mit einem Klick die Anwesenheit. Spieler sehen ihren Fortschritt und werden durch Aktivitäts-Badges motiviert."
      },
      {
        title: "Spieltags-Unterstützung",
        description: "Eltern oder Mitglieder, die den Verkauf übernehmen oder als Linienrichter fungieren, erhalten Punkte als direkte Wertschätzung."
      },
      {
        title: "Saisonauswertung",
        description: "Automatisierte Berichte über die aktivsten Mitglieder erleichtern die Vergabe von Preisen oder die Beantragung von Fördermitteln."
      }
    ],
    accent: "#3B82F6",
    image: "https://i.ibb.co/FqXdb3Fk/IMG-8972.jpg"
  },
  {
    id: "kultur",
    icon: <Music className="w-10 h-10" />,
    title: "Musik- & Kulturvereine",
    subtitle: "Harmonie in der Organisation",
    desc: "Vom Jugendorchester bis zum Traditionschor: Talo hilft dabei, die Balance zwischen Probenarbeit und den vielen Aufgaben hinter der Bühne zu finden.",
    useCases: [
      {
        title: "Proben-Management",
        description: "Transparente Übersicht der Probenpräsenz. Besonders hilfreich für die Planung von Konzerten und die Besetzung von Soli."
      },
      {
        title: "Event-Logistik",
        description: "Auf- und Abbau-Teams sowie die Organisation von Notenmaterial werden durch Punktevergabe fair belohnt."
      },
      {
        title: "Jugendarbeit",
        description: "Junge Musiker werden spielerisch an die Vereinsarbeit herangeführt und für ihr Engagement außerhalb des Instruments belohnt."
      }
    ],
    accent: "#8B5CF6",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: "feuerwehr",
    icon: <Flame className="w-10 h-10" />,
    title: "Feuerwehr & Rettungsdienste",
    subtitle: "Zuverlässigkeit dokumentieren",
    desc: "Im Ehrenamt, wo es auf jede Sekunde ankommt, sorgt Talo für eine rechtssichere und einfache Dokumentation von Dienststunden und Fortbildungen.",
    useCases: [
      {
        title: "Dienstbeteiligung",
        description: "Einfache Erfassung von Übungsabenden und Sonderdiensten direkt über das Smartphone der Gruppenführer."
      },
      {
        title: "Lehrgangs-Tracking",
        description: "Dokumentation von besuchten Lehrgängen und deren Anerkennung innerhalb des vereinsinternen Punktesystems."
      },
      {
        title: "Nachweis für Arbeitgeber",
        description: "Schneller Export von geleisteten Stunden als Nachweis für Freistellungen oder zur Vorlage bei Behörden."
      }
    ],
    accent: "#EF4444",
    image: "https://images.unsplash.com/photo-1582213706173-fb6b1bed468e?auto=format&fit=crop&q=80&w=800"
  }
];

const smallScenarios = [
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Soziale Träger",
    description: "Helfer-Stunden in Tafeln oder Nachbarschaftshilfen präzise erfassen."
  },
  {
    icon: <GraduationCap className="w-6 h-6" />,
    title: "Studierenden-Initiativen",
    description: "Organisation von Campus-Events und internen Ämtern ohne Excel-Chaos."
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Bürgervereine",
    description: "Engagement im Kiez sichtbar machen und lokale Projekte vorantreiben."
  }
];

export default function SolutionsPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO SECTION ────────────────────────────────────────── */}
      <section className="relative pt-[200px] pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8A8A8A] font-bold text-[11px] uppercase tracking-widest mb-8">
               Branchen-Lösungen
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[2rem] sm:text-[3.2rem] md:text-[6rem] lg:text-[7.5rem] leading-[1.05] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-10 max-w-5xl mx-auto">
              <span className="block whitespace-nowrap">Für jede Form des</span> 
              <span className="text-gray-400 dark:text-white/20 italic block whitespace-nowrap">Engagements.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-3xl mx-auto">
              Talo ist hochgradig modular. Wir orchestrieren eure Prozesse – vom kleinen Förderverein bis zur komplexen Hilfsorganisation.
            </p>
          </ScrollReveal>
        </div>
        
        {/* Background glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[80%] h-[60%] bg-blue-500/[0.02] dark:bg-white/[0.02] blur-[140px] pointer-events-none -z-10" />
      </section>

      {/* ─── DETAILED SOLUTIONS: THE GRID ─────────────────────────── */}
      <section className="pb-32 border-t border-gray-100 dark:border-white/5 pt-32">
        <div className="max-w-7xl mx-auto px-6 space-y-48">
          {detailedSolutions.map((solution, index) => (
            <div 
              key={solution.id} 
              id={solution.id}
              className="space-y-20"
            >
              {/* Header & Intro */}
              <div className="grid lg:grid-cols-2 gap-16 items-start">
                <ScrollReveal direction="up">
                   <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl"
                      style={{ backgroundColor: solution.accent }}
                    >
                      {solution.icon}
                    </div>
                    <h2 className="text-[3rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-900 dark:text-white leading-[1] mb-8 font-logo">
                      {solution.title}
                    </h2>
                    <p className="text-xl font-bold text-gray-400 uppercase tracking-[0.2em] mb-8">
                       {solution.subtitle}
                    </p>
                </ScrollReveal>
                
                <ScrollReveal direction="up" delay={0.2}>
                  <div className="pt-4">
                    <p className="text-xl md:text-2xl text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-10">
                      {solution.desc}
                    </p>
                    <div className="flex flex-wrap gap-8">
                       <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Effizienz</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">~12h / PK</p>
                       </div>
                       <div className="w-px h-10 bg-gray-200 dark:bg-white/10" />
                       <div className="space-y-1">
                          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Präzision</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                       </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Benefits Section - No Cards */}
              <div className="grid md:grid-cols-3 gap-12 lg:gap-24 relative">
                {/* Horizontal Divider Line */}
                <div className="absolute -top-10 left-0 right-0 h-px bg-gray-100 dark:bg-white/5" />
                
                {solution.useCases.map((useCase, idx) => (
                  <ScrollReveal key={idx} direction="up" delay={0.1 + idx * 0.1}>
                    <div className="space-y-6">
                      <div className="text-[3.5rem] font-black text-gray-100 dark:text-white/[0.03] leading-none mb-2">
                        0{idx + 1}
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                        {useCase.title}
                      </h4>
                      <p className="text-lg text-gray-500 dark:text-[#8A8A8A] leading-relaxed">
                        {useCase.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              {/* Visualization */}
              <ScrollReveal direction="up" delay={0.3}>
                <div className="relative group overflow-hidden rounded-[40px] border border-gray-100 dark:border-white/5">
                   <img 
                      src={solution.image} 
                      alt={solution.title}
                      className="w-full h-[400px] md:h-[650px] object-cover transition-transform duration-[2s] group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-12 left-12">
                       <span className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-bold text-sm uppercase tracking-widest">
                          Application View
                       </span>
                    </div>
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FURTHER SCENARIOS: BEYOND CARDS ─────────────────────── */}
      <section className="py-48 bg-gray-50/50 dark:bg-white/[0.01] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-32">
            <div className="max-w-2xl">
              <ScrollReveal direction="up">
                <h2 className="text-[2.5rem] md:text-[4rem] font-medium font-logo text-gray-900 dark:text-white leading-[1.1] mb-8">
                  Vielseitig <span className="text-gray-400">einsetzbar.</span>
                </h2>
                <p className="text-xl text-gray-500 dark:text-[#8A8A8A] font-medium">
                  Talo ist modular aufgebaut und lässt sich für nahezu jede Form von wiederkehrenden Aktivitäten konfigurieren.
                </p>
              </ScrollReveal>
            </div>
            <ScrollReveal direction="up" delay={0.2}>
               <Link href="/anmelden" className="px-8 py-4 bg-gray-950 dark:bg-white text-white dark:text-gray-950 rounded-2xl font-bold text-sm tracking-widest uppercase hover:scale-105 transition-all">
                  Alle Features
               </Link>
            </ScrollReveal>
          </div>

          <div className="grid lg:grid-cols-2 gap-x-32 gap-y-16">
            {smallScenarios.map((scenario, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="group flex gap-8 pb-12 border-b border-gray-200 dark:border-white/10 last:border-0 lg:last:border-b">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-900 dark:text-white group-hover:scale-110 transition-transform">
                    {scenario.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{scenario.title}</h3>
                    <p className="text-lg text-gray-500 dark:text-[#8A8A8A] leading-relaxed max-w-md">{scenario.description}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
            
            {/* Principles Recap (Integrated instead of separate section) */}
            <div className="lg:col-span-2 mt-24">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                  {[
                    { icon: <Clock size={20} />, title: "Echtzeit" },
                    { icon: <ShieldCheck size={20} />, title: "Sicher" },
                    { icon: <BarChart3 size={20} />, title: "Transparent" },
                    { icon: <Users size={20} />, title: "Fokus" }
                  ].map((p, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-4">
                       <div className="w-12 h-12 flex items-center justify-center text-gray-400">{p.icon}</div>
                       <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">{p.title}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ────────────────────────────────────────── */}
      <section className="py-48 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal direction="up">
            <h2 className="text-[3rem] md:text-[5.5rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-10 leading-[1.1]">
              Bereit für die <br /><span className="italic text-gray-400">Transformation?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-16 max-w-2xl mx-auto">
              Wir helfen dir dabei, das perfekte System für deine Gemeinschaft aufzusetzen. Unverbindlich und persönlich.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <button className="px-12 py-6 bg-gray-950 dark:bg-white text-white dark:text-gray-950 font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all text-lg shadow-2xl">
                Demo anfragen
              </button>
              <Link href="/ueber-uns" className="text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-3">
                Team kennenlernen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
