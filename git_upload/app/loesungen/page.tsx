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
    image: "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=800"
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
      <section className="relative pt-[180px] pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <ScrollReveal direction="up" delay={0.1}>
              <span className="inline-block px-4 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] text-sm font-semibold text-gray-500 dark:text-gray-400 mb-6">
                Einsatzgebiete
              </span>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="text-[3.5rem] leading-[1.05] md:text-[5.5rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-8">
                Talo passt sich <br /><span className="text-gray-400">deinem Verein an.</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.3}>
              <p className="text-xl md:text-2xl text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-12">
                Wir haben Talo so flexibel entwickelt, dass jede Gemeinschaft – vom kleinen Förderverein bis zur großen Hilfsorganisation – ihr Engagement perfekt abbilden kann.
              </p>
            </ScrollReveal>
          </div>
        </div>
        
        {/* Decorative background element */}
        <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* ─── DETAILED SOLUTIONS ───────────────────────────────────── */}
      <section className="pb-32">
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {detailedSolutions.map((solution, index) => (
            <div 
              key={solution.id} 
              id={solution.id}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-16 items-center`}
            >
              <div className="flex-1 w-full text-left">
                <ScrollReveal direction={index % 2 === 1 ? "right" : "left"} delay={0.1}>
                  <div className="flex items-center gap-4 mb-6">
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                      style={{ backgroundColor: solution.accent }}
                    >
                      {solution.icon}
                    </div>
                    <div>
                      <h2 className="text-[2.5rem] font-bold font-logo text-gray-900 dark:text-white leading-tight">
                        {solution.title}
                      </h2>
                      <p className="text-lg font-medium text-gray-500 dark:text-gray-400">
                        {solution.subtitle}
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal direction="up" delay={0.2}>
                  <p className="text-lg text-gray-600 dark:text-[#8A8A8A] mb-10 leading-relaxed">
                    {solution.desc}
                  </p>
                </ScrollReveal>

                <div className="space-y-6">
                  {solution.useCases.map((useCase, idx) => (
                    <ScrollReveal key={idx} direction="up" delay={0.3 + idx * 0.1}>
                      <div className="group flex gap-5 p-5 rounded-3xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] hover:border-gray-200 dark:hover:border-white/[0.1] transition-all">
                        <div className="mt-1">
                          <CheckCircle2 className="w-6 h-6" style={{ color: solution.accent }} />
                        </div>
                        <div>
                          <h4 className="text-[1.1rem] font-bold text-gray-900 dark:text-white mb-1">
                            {useCase.title}
                          </h4>
                          <p className="text-gray-500 dark:text-[#8A8A8A] leading-snug">
                            {useCase.description}
                          </p>
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              </div>

              <div className="flex-1 w-full">
                <ScrollReveal direction={index % 2 === 1 ? "left" : "right"} delay={0.2}>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent z-10 rounded-[2.5rem] overflow-hidden" />
                    <img 
                      src={solution.image} 
                      alt={solution.title}
                      className="w-full h-[500px] object-cover rounded-[2.5rem] shadow-2xl transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Glassy Stats overlay */}
                    <div className="absolute bottom-8 left-8 right-8 z-20 glass-card p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div className="text-white">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Zeitersparnis</p>
                            <p className="text-2xl font-bold">~12h / PK</p>
                          </div>
                          <div className="w-px h-10 bg-white/20" />
                          <div className="text-white">
                            <p className="text-[10px] uppercase tracking-widest font-bold opacity-60">Genauigkeit</p>
                            <p className="text-2xl font-bold">100%</p>
                          </div>
                        </div>
                        <ArrowRight className="text-white w-6 h-6 opacity-40" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FURTHER SCENARIOS ───────────────────────────────────── */}
      <section className="py-32 bg-gray-50 dark:bg-[#0c0c0c] border-y border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <ScrollReveal direction="up">
              <h2 className="text-[2.5rem] font-bold font-logo text-gray-900 dark:text-white mb-6">Weitere Anwendungsfälle</h2>
              <p className="text-gray-500 dark:text-[#8A8A8A] text-lg">
                Talo ist modular aufgebaut und lässt sich für nahezu jede Form von wiederkehrenden Aktivitäten konfigurieren.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {smallScenarios.map((scenario, idx) => (
              <ScrollReveal key={idx} direction="up" delay={idx * 0.1}>
                <div className="glass-card p-8 rounded-3xl bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:shadow-xl transition-all">
                  <div className="w-12 h-12 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center mb-6 text-gray-700 dark:text-gray-300">
                    {scenario.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{scenario.title}</h3>
                  <p className="text-gray-500 dark:text-[#8A8A8A]">{scenario.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRINCIPLES / WHY TALO ────────────────────────────────── */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { icon: <Clock />, title: "Echtzeit-Tracking", text: "Stunden werden sofort erfasst, kein Nachtragen am Monatsende nötig." },
              { icon: <ShieldCheck />, title: "DSGVO-Konform", text: "Höchste Sicherheitsstandards für sensible Mitgliederdaten aus Deutschland." },
              { icon: <BarChart3 />, title: "Transparenz", text: "Jedes Mitglied sieht seinen Beitrag und den Erfolg der Gemeinschaft." },
              { icon: <Users />, title: "Wertschätzung", text: "Engagement wird objektiv messbar und damit besser anerkennbar." }
            ].map((p, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.05}>
                <div className="flex flex-col items-start">
                  <div className="w-10 h-10 text-gray-400 mb-6">{p.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{p.title}</h4>
                  <p className="text-gray-500 dark:text-[#8A8A8A] text-sm leading-relaxed">{p.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ────────────────────────────────────────── */}
      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto">
          <ScrollReveal direction="up">
            <div className="rounded-[3rem] bg-[#0c0c0c] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
              <div className="ambient-blob w-[500px] h-[500px] opacity-[0.25] bg-blue-600 blur-[140px] absolute -top-[250px] -right-[250px] pointer-events-none" />
              <div className="ambient-blob w-[500px] h-[500px] opacity-[0.15] bg-purple-600 blur-[140px] absolute -bottom-[250px] -left-[250px] pointer-events-none" />
              
              <h2 className="text-4xl md:text-6xl font-bold font-logo mb-8 relative z-10">
                Dein Verein ist <br /><span className="text-gray-400">einzigartig?</span>
              </h2>
              <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
                Wir helfen dir dabei, das perfekte System für deine Gemeinschaft aufzusetzen. Unverbindlich und persönlich.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
                <button className="px-10 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all text-lg shadow-lg">
                  Demo anfragen
                </button>
                <Link href="/ueber-uns" className="text-white font-semibold hover:opacity-70 transition-opacity flex items-center gap-2">
                  Über unser Team erfahren <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
