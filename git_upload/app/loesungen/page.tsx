"use client";

import Navbar from "../components/Navbar";
import ScrollReveal from "../components/ScrollReveal";
import Footer from "../components/Footer";
import { Trophy, Music, Flame, Users, Heart, GraduationCap } from "lucide-react";

const solutions = [
  {
    icon: <Trophy className="w-8 h-8" />,
    title: "Sportvereine",
    desc: "Von Fußball bis Tennis. Trackt die Trainingspräsenz eurer Mannschaften und motiviert Spieler durch ein faires Punktesystem.",
    features: ["Trainingslisten", "Leistungs-Kategorien", "Saisonziele"]
  },
  {
    icon: <Music className="w-8 h-8" />,
    title: "Musikvereine & Chöre",
    desc: "Orchestrierung von Proben und Auftritten. Belohnt die regelmäßige Teilnahme und das Engagement bei Konzerten.",
    features: ["Proben-Tracking", "Auftritts-Verwaltung", "Stimmen-Guthaben"]
  },
  {
    icon: <Flame className="w-8 h-8" />,
    title: "Feuerwehr & Rettungsdienst",
    desc: "Transparente Dokumentation von Übungsdiensten und Einsätzen. Ideal zur Anerkennung von ehrenamtlichen Stunden.",
    features: ["Einsatz-Journal", "Übungs-Punkte", "Lehrgangs-Bonus"]
  },
  {
    icon: <Heart className="w-8 h-8" />,
    title: "Soziale Initiativen",
    desc: "Macht sichtbarer, wie viel Arbeit hinter den Kulissen eurem guten Zweck dient. Schafft Wertschätzung für jeden Helfer.",
    features: ["Projekt-Stunden", "Helfer-Börse", "Impact-Statistiken"]
  },
  {
    icon: <GraduationCap className="w-8 h-8" />,
    title: "Studentenverbindungen & Campus-Groups",
    desc: "Verwaltung von Hausdiensten, Veranstaltungen und Mitgliedspflichten in einer modernen, digitalen Oberfläche.",
    features: ["Hausämter-Tracking", "Event-Management", "Mitglieder-Historie"]
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Quartiers- & Bürgervereine",
    desc: "Förderung von Nachbarschaftshilfe und Engagement im Kiez. Talo hilft, die Beiträge der Bürger transparent zu machen.",
    features: ["Nachbarschafts-Punkte", "Kiez-Leaderboard", "Transparenzbericht"]
  }
];

export default function SolutionsPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 w-full text-center">
          <ScrollReveal direction="up" delay={0.15}>
            <h1 className="text-[3.5rem] leading-[1.1] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-6">
              Lösungen für <br /> jedes Engagement
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-[#8A8A8A] max-w-2xl mx-auto">
              Egal welche Art von Gemeinschaft ihr seid – Talo passt sich euren Bedürfnissen an und macht Engagement sichtbar.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {solutions.map((item, idx) => (
              <ScrollReveal key={idx} direction="up" delay={0.1 * idx}>
                <div id={item.title.toLowerCase().replace(/\s/g, "-")} className="glass-card rounded-3xl p-8 h-full flex flex-col border border-gray-200 dark:border-white/10">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-gray-100 dark:border-white/10 flex items-center justify-center mb-6 text-[#E87AA0]">
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold font-logo text-gray-900 dark:text-white mb-4">{item.title}</h3>
                  <p className="text-gray-600 dark:text-[#8A8A8A] mb-8 flex-grow">
                    {item.desc}
                  </p>
                  <ul className="space-y-3 pt-6 border-t border-gray-100 dark:border-white/5">
                    {item.features.map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-500 dark:text-[#555]">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#E87AA0]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal direction="up" distance={30}>
            <div className="rounded-[2.5rem] bg-[#0c0c0c] p-12 text-center text-white relative overflow-hidden">
              <div className="ambient-blob w-[400px] h-[400px] opacity-[0.2] bg-purple-500 blur-[120px] absolute -top-[200px] -right-[200px]" />
              <h2 className="text-4xl md:text-5xl font-bold font-logo mb-6 relative z-10">Dein Verein ist anders?</h2>
              <p className="text-xl text-gray-400 mb-10 relative z-10">
                Lass uns sprechen. Wir passen Talo gerne an deine speziellen Anforderungen an.
              </p>
              <a href="/kontakt" className="inline-block px-8 py-4 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-transform relative z-10">
                Kontakt aufnehmen
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
