"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Search, HelpCircle, Mail, MessageCircle, FileText, ChevronRight, Zap, ShieldCheck, CreditCard, Users, Settings2, Sparkles } from "lucide-react";

const sections = [
  {
    id: "setup",
    title: "Einrichtung & Setup",
    icon: <Zap className="w-5 h-5" />,
    items: [
      { q: "Wie erstelle ich einen neuen Verein?", a: "Nach der Registrierung kannst du über 'Verein erstellen' deinen Verein anlegen. Du benötigst lediglich den Namen und optional ein Logo. Talo generiert dann automatisch deine Vereins-ID." },
      { q: "Wie lade ich Mitglieder ein?", a: "Im Dashboard unter 'Mitglieder' findest du den Button 'Neues Mitglied'. Du kannst Mitglieder einzeln per E-Mail einladen oder eine CSV-Liste importieren. Talo versendet automatisch die Zugangsdaten." },
      { q: "Was ist der Vereins-Code?", a: "Der Vereins-Code ist ein eindeutiger 6-stelliger Schlüssel, mit dem sich Mitglieder direkt in der App deinem Verein zuordnen können, ohne dass du sie manuell anlegen musst." },
      { q: "Kann ich bestehende Daten importieren?", a: "Ja, wir unterstützen den CSV-Import für Mitglieder und historische Tätigkeiten. Vorlagen dafür findest du direkt in der Import-Funktion im Admin-Bereich." }
    ]
  },
  {
    id: "engagement",
    title: "Engagement & Punkte",
    icon: <Sparkles className="w-5 h-5" />,
    items: [
      { q: "Wie funktioniert das Punktesystem?", a: "Talo basiert auf Kategorien (A, B, C, S). Du definierst, wie viele Punkte pro Stunde oder Pauschal pro Tätigkeit vergeben werden. Mitglieder erfassen ihre Zeit, Admins genehmigen." },
      { q: "Was bedeuten die Kategorien A, B, C und S?", a: "Diese sind frei konfigurierbar. Standardmäßig: A (Training/Regelbetrieb), B (Events/Helfen), C (Material/Sonstiges), S (Sonderaufgaben/Vorstand). Jede Kategorie kann einen eigenen Stundensatz haben." },
      { q: "Wann werden die Punkte gutgeschrieben?", a: "Punkte erscheinen als 'ausstehend', sobald das Mitglied sie einträgt. Erst nach der Genehmigung durch einen Trainer oder Admin zählen sie für das Leaderboard und die Jahressumme." },
      { q: "Können Punkte verfallen?", a: "Standardmäßig werden Punkte am Ende einer Saison (Kalenderjahr) archiviert. Du kannst jedoch Überträge ins nächste Jahr in den Einstellungen aktivieren." }
    ]
  },
  {
    id: "roles",
    title: "Rollen & Rechte",
    icon: <Users className="w-5 h-5" />,
    items: [
      { q: "Welche Rollen gibt es in Talo?", a: "Administrator (voller Zugriff), Trainer (darf Beiträge der eigenen Gruppe genehmigen) und Mitglied (darf eigene Beiträge erfassen und Statistiken sehen)." },
      { q: "Kann ich eigene Rollen erstellen?", a: "In der Pro-Version kannst du individuelle Berechtigungen vergeben, z.B. einen 'Kassenwart', der nur Zugriff auf die Export-Funktionen hat." },
      { q: "Wie ändere ich die Rolle eines Mitglieds?", a: "Gehe auf das Profil des Mitglieds im Dashboard. Dort kannst du über die Schalter 'Admin' oder 'Trainer' die Rechte sofort anpassen." }
    ]
  },
  {
    id: "security",
    title: "Sicherheit & Datenschutz",
    icon: <ShieldCheck className="w-5 h-5" />,
    items: [
      { q: "Wo werden die Daten gespeichert?", a: "Alle Daten werden auf ISO-zertifizierten Servern in Frankfurt am Main (Deutschland) gespeichert. Wir erfüllen alle Anforderungen der DSGVO." },
      { q: "Werden Daten für Werbung genutzt?", a: "Absolut nicht. Talo ist ein werbefreies SaaS-Produkt. Deine Daten gehören ausschließlich deinem Verein und werden niemals an Dritte verkauft." },
      { q: "Was passiert, wenn ich meinen Verein lösche?", a: "Beim Löschen eines Vereins werden alle verknüpften Mitgliederdaten, Einträge und Bilder unwiderruflich von unseren Servern entfernt (gemäß Löschkonzept)." }
    ]
  },
  {
    id: "billing",
    title: "Preise & Abrechnung",
    icon: <CreditCard className="w-5 h-5" />,
    items: [
      { q: "Was kostet Talo?", a: "Für Vereine bis 20 Mitglieder ist Talo dauerhaft kostenlos (Free Plan). Darüber hinaus gibt es faire monatliche oder jährliche Pauschalpreise je nach Vereinsgröße." },
      { q: "Gibt es Rabatte für Gemeinnützigkeit?", a: "Talo ist speziell für ehrenamtliche Strukturen gebaut. Unsere Preise sind bereits so kalkuliert, dass sie auch für kleine Spartenvereine erschwinglich sind." },
      { q: "Wie kann ich kündigen?", a: "Du kannst monatlich im Admin-Bereich kündigen. Es gibt keine Knebelverträge. Nach Ablauf des Zeitraums wird dein Konto automatisch auf den Free-Plan herabgestuft." }
    ]
  },
  {
    id: "technical",
    title: "Technik & Probleme",
    icon: <Settings2 className="w-5 h-5" />,
    items: [
      { q: "Gibt es eine native App?", a: "Ja! Talo ist als native iOS- und Android-App verfügbar. Zudem ist die Web-Plattform voll responsiv und kann auf jedem Gerät genutzt werden." },
      { q: "Die App lädt nicht – was tun?", a: "Prüfe deine Internetverbindung. Meist hilft ein einfacher Neustart der App oder das Leeren des Browser-Caches. Bei permanenten Problemen kontaktiere unseren Support." },
      { q: "Kann ich Talo offline nutzen?", a: "Die native App erlaubt das Erfassen von Beiträgen im Offline-Modus. Sobald du wieder online bist, synchronisiert Talo die Daten automatisch mit der Cloud." }
    ]
  }
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState(sections[0].id);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-[160px] pb-12 lg:pb-20 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-6 w-full">
          <ScrollReveal direction="up" delay={0.1}>
             <span className="text-[11px] font-bold tracking-[0.2em] text-[#00E0D1] uppercase mb-4 block">HILFECENTER</span>
             <h1 className="text-[3rem] md:text-[4.5rem] font-medium tracking-tight font-logo text-gray-950 dark:text-white mb-8 leading-[1.05]">
                Wie können wir<br />euch heute <span className="text-[#00E0D1]">unterstützen?</span>
             </h1>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={0.25}>
            <div className="max-w-xl relative group">
              <input 
                type="text" 
                placeholder="Suche nach Themen (z.B. Punkte, DSGVO, Import)..." 
                className="w-full px-6 py-5 rounded-2xl bg-gray-50 border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-white focus:outline-none focus:ring-4 focus:ring-[#00E0D1]/10 transition-all pl-14 font-medium"
              />
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#00E0D1] transition-colors" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sidebar Navigation */}
            <div className="lg:w-1/4 shrink-0">
               <div className="sticky top-32 space-y-2">
                  <h3 className="text-[10px] font-bold tracking-[0.15em] text-gray-400 dark:text-gray-500 uppercase mb-6 px-4">KATEGORIEN</h3>
                  {sections.map((section) => (
                    <button 
                      key={section.id}
                      onClick={() => {
                        setActiveSection(section.id);
                        document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-medium ${
                        activeSection === section.id 
                          ? "bg-[#00E0D1]/10 text-[#00E0D1] dark:bg-white/5 dark:text-white" 
                          : "text-gray-500 dark:text-[#8A8A8A] hover:bg-gray-50 dark:hover:bg-white/[0.03] hover:text-black dark:hover:text-white"
                      }`}
                    >
                      <div className={`p-2 rounded-lg transition-colors ${activeSection === section.id ? "bg-[#00E0D1]/20" : "bg-gray-100 dark:bg-white/5"}`}>
                        {section.icon}
                      </div>
                      <span className="text-[14px]">{section.title}</span>
                      {activeSection === section.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  ))}
               </div>
            </div>

            {/* Content Area */}
            <div className="lg:w-3/4 flex flex-col gap-24">
               {sections.map((section) => (
                 <div key={section.id} id={section.id} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-10 pb-4 border-b border-gray-100 dark:border-white/5">
                       <div className="w-12 h-12 rounded-2xl bg-[#00E0D1] flex items-center justify-center text-white">
                          {section.icon}
                       </div>
                       <h2 className="text-3xl font-bold font-logo text-gray-950 dark:text-white">{section.title}</h2>
                    </div>

                    <div className="grid md:grid-cols-1 gap-10">
                       {section.items.map((item, j) => (
                         <div key={j} className="group flex flex-col gap-3">
                            <h4 className="text-[18px] font-bold text-gray-900 dark:text-white group-hover:text-[#00E0D1] transition-colors">
                               {item.q}
                            </h4>
                            <p className="text-[16px] text-gray-600 dark:text-[#8A8A8A] leading-relaxed font-poppins-regular">
                               {item.a}
                            </p>
                         </div>
                       ))}
                    </div>
                 </div>
               ))}
               
               {/* Contact CTA */}
               <div className="bg-[#080808] dark:bg-[#101010] rounded-[40px] p-8 md:p-14 text-center mt-12 relative overflow-hidden border border-white/5">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E0D1]/10 rounded-full blur-[80px] -mr-32 -mt-32" />
                  <div className="relative z-10">
                     <h3 className="text-2xl md:text-4xl font-bold text-white mb-6 font-logo">Immer noch unsicher?</h3>
                     <p className="text-gray-400 mb-10 text-lg max-w-lg mx-auto">Unser Team steht euch Mo-Fr von 09:00 bis 18:00 Uhr zur Verfügung.</p>
                     <div className="flex flex-wrap items-center justify-center gap-4">
                        <a href="mailto:support@talo.de" className="flex items-center gap-2 px-8 py-4 rounded-full bg-white text-black font-bold hover:scale-105 transition-all">
                           <Mail size={18} /> support@talo.de
                        </a>
                        <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-bold border border-white/10 hover:bg-white/20 transition-all">
                           <MessageCircle size={18} /> Live-Support starten
                        </button>
                     </div>
                  </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="py-24 border-t border-gray-100 dark:border-white/10">
        <div className="max-w-6xl mx-auto px-6">
           <h3 className="text-[10px] font-bold tracking-[0.2em] text-gray-400 dark:text-gray-500 uppercase mb-12 text-center">WEITERE RESSOURCEN</h3>
           <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Video Tutorials", desc: "Lernt Talo in unter 5 Minuten kennen.", icon: <Zap className="text-yellow-500" /> },
                { title: "Admin Handbuch", desc: "Alle Funktionen im Detail erklärt.", icon: <FileText className="text-blue-500" /> },
                { title: "Zertifizierung", desc: "Wie Talo eure IT-Sicherheit stärkt.", icon: <ShieldCheck className="text-green-500" /> },
              ].map((res, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-gray-50 dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 hover:border-[#00E0D1]/30 transition-all cursor-pointer group">
                   <div className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center mb-6 shadow-sm">
                      {res.icon}
                   </div>
                   <h4 className="text-xl font-bold text-gray-950 dark:text-white mb-2">{res.title}</h4>
                   <p className="text-sm text-gray-500 dark:text-[#8A8A8A] mb-4">{res.desc}</p>
                   <div className="flex items-center gap-2 text-xs font-bold text-[#00E0D1]">
                      Ansehen <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
