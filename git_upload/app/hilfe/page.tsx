"use client";

import Navbar from "../components/Navbar";
import ScrollReveal from "../components/ScrollReveal";
import Footer from "../components/Footer";
import { Search, HelpCircle, Mail, MessageCircle, FileText } from "lucide-react";

const faqs = [
  {
    category: "Allgemein",
    items: [
      { q: "Was ist Talo?", a: "Talo ist eine Plattform zur Verwaltung und Wertschätzung von Vereinsengagement. Mitglieder können ihre Beiträge (z. B. Trainingsleitung, Hilfe bei Events) erfassen und Punkte sammeln." },
      { q: "Wie trete ich einem Verein bei?", a: "Dein Vereins-Administrator stellt dir einen Beitrittscode zur Verfügung. Diesen gibst du in der Talo-App ein, um dich mit deinem Verein zu verknüpfen." },
      { q: "Welche Rollen gibt es?", a: "Es gibt drei Hauptrollen: Administrator (voller Zugriff), Trainer/Leiter (Genehmigung von Beiträgen) und Mitglied (Aufzeichnung von Beiträgen)." }
    ]
  },
  {
    category: "Technik & Sicherheit",
    items: [
      { q: "Wo werden meine Daten gespeichert?", a: "Alle Daten werden sicher auf Google Cloud-Servern verschlüsselt gespeichert, um höchste Verfügbarkeit und Sicherheit zu garantieren." },
      { q: "Ist Talo DSGVO-konform?", a: "Ja. Wir legen großen Wert auf Datenschutz. Es werden nur die für den Vereinsbetrieb notwendigen Daten erhoben und verarbeitet." },
      { q: "Gibt es eine mobile App?", a: "Ja, Talo ist als Progressive Web App (PWA) optimiert und kann direkt auf dem Homescreen deines Smartphones installiert werden." }
    ]
  },
  {
    category: "Abrechnung",
    items: [
      { q: "Was kostet Talo?", a: "Es gibt einen dauerhaft kostenlosen Start-Plan für bis zu 15 Mitglieder. Für größere Vereine bieten wir den Pro-Plan an." },
      { q: "Muss ich meine Kreditkarte angeben?", a: "Nur wenn du ein zahlungspflichtiges Abonnement abschließt. Der Start-Plan ist ohne Zahlungsinformationen nutzbar." }
    ]
  }
];

export default function HelpPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 w-full text-center">
          <ScrollReveal direction="up" delay={0.15}>
            <h1 className="text-[3.5rem] leading-[1.1] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-6">
              Wie können wir <br /> helfen?
            </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.3}>
            <div className="max-w-xl mx-auto relative group">
              <input 
                type="text" 
                placeholder="Suche nach Antworten..." 
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E87AA0]/50 transition-all pl-14"
              />
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#E87AA0] transition-colors" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Sidebar Categories */}
            <div className="lg:col-span-1 border-r border-gray-200 dark:border-white/10 hidden lg:block pr-8">
              <h3 className="text-sm font-bold tracking-widest text-[#E87AA0] uppercase mb-6">Kategorien</h3>
              <ul className="space-y-4">
                {faqs.map((cat, i) => (
                  <li key={i}>
                    <button className="text-gray-600 hover:text-black dark:text-[#8A8A8A] dark:hover:text-white transition-colors flex items-center gap-2">
                       <HelpCircle className="w-4 h-4" /> {cat.category}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-12 p-6 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 shadow-sm">
                <h4 className="font-bold mb-2">Noch Fragen?</h4>
                <p className="text-xs text-gray-500 mb-4 font-poppins-regular">Unser Team ist immer bereit zu helfen.</p>
                <a href="mailto:support@talo.de" className="text-xs font-bold text-[#E87AA0] hover:underline flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> support@talo.de
                </a>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-16">
              {faqs.map((cat, i) => (
                <div key={i}>
                  <h3 className="text-2xl font-bold font-logo text-gray-900 dark:text-white mb-8 border-b border-gray-100 dark:border-white/5 pb-2">{cat.category}</h3>
                  <div className="space-y-8">
                    {cat.items.map((item, j) => (
                      <div key={j} className="group">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-start gap-3">
                          <span className="text-[#E87AA0] mt-1 shrink-0 font-logo">Q.</span>
                          {item.q}
                        </h4>
                        <p className="text-gray-600 dark:text-[#8A8A8A] leading-relaxed pl-8">
                          {item.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── CONTACT CHANNELS ────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 text-center hover:scale-[1.02] transition-transform cursor-pointer">
              <Mail className="w-8 h-8 mx-auto mb-4 text-[#FF9500]" />
              <h4 className="font-bold mb-2">E-Mail</h4>
              <p className="text-xs text-gray-500">Wir antworten meistens innerhalb von 24h.</p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 text-center hover:scale-[1.02] transition-transform cursor-pointer">
              <MessageCircle className="w-8 h-8 mx-auto mb-4 text-[#34C759]" />
              <h4 className="font-bold mb-2">Live Chat</h4>
              <p className="text-xs text-gray-500">Für schnelle Fragen direkt in der App.</p>
            </div>
            <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 text-center hover:scale-[1.02] transition-transform cursor-pointer">
              <FileText className="w-8 h-8 mx-auto mb-4 text-blue-500" />
              <h4 className="font-bold mb-2">Dokumentation</h4>
              <p className="text-xs text-gray-500">Detaillierte Anleitungen für Admins.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
