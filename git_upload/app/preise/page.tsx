"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Check, Info, Sparkles } from "lucide-react";

const tiers = [
  {
    name: "Start",
    price: "0€",
    desc: "Für kleine Gruppen und erste Schritte.",
    features: [
      "Bis zu 15 Mitglieder",
      "Alle Kern-Features inkl.",
      "1 Verein",
      "Standard Support"
    ],
    cta: "Kostenlos starten",
    href: "/anmelden",
    popular: false
  },
  {
    name: "Pro",
    price: "9€",
    period: "/ Monat",
    desc: "Der perfekte Standard für ambitionierte Vereine.",
    features: [
      "Unbegrenzte Mitglieder",
      "Erweiterte Statistiken",
      "Individuelle Kategorien",
      "Vorrangiger Support",
      "Export für Jahresversammlung"
    ],
    cta: "Jetzt testen",
    href: "/anmelden",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Auf Anfrage",
    desc: "Für Verbände und große Organisationen.",
    features: [
      "Mehrere Standorte",
      "Zentrales Admin-Dashboard",
      "API-Zugriff",
      "Eigener Account-Manager",
      "SLA-Garantien"
    ],
    cta: "Kontaktieren",
    href: "/kontakt",
    popular: false
  }
];

export default function PricingPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 w-full text-center">
          <ScrollReveal direction="up" delay={0.15}>
            <h1 className="text-[3.5rem] leading-[1.1] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-6">
              Transparente <br /> Preise
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-lg md:text-xl text-gray-600 dark:text-[#8A8A8A] max-w-2xl mx-auto">
              Wähle den Plan, der am besten zu deinem Verein passt. <br className="hidden md:block" /> 
              Faire Preise für wertvolles Engagement.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-6xl mx-auto px-6">
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tiers.map((tier, idx) => (
              <StaggerItem key={idx}>
                <div className={`relative h-full rounded-[2.5rem] p-8 border ${
                  tier.popular 
                    ? "bg-[#0c0c0c] text-white border-white/10 shadow-2xl scale-105" 
                    : "bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white border-gray-100 dark:border-white/10"
                }`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles className="w-3 h-3" /> DER FAVORIT
                    </div>
                  )}
                  
                  <div className="mb-6">
                    <h3 className="text-xl font-bold font-logo mb-2 tracking-wide uppercase">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-medium tracking-tighter">{tier.price}</span>
                      {tier.period && <span className="text-sm opacity-50">{tier.period}</span>}
                    </div>
                    <p className={`text-sm mt-4 ${tier.popular ? "text-gray-400" : "text-gray-500 dark:text-[#8A8A8A]"}`}>
                      {tier.desc}
                    </p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex gap-3">
                        <Check className={`w-5 h-5 shrink-0 ${tier.popular ? "text-white" : "text-gray-900 dark:text-white"}`} />
                        <span className="text-sm">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Desktop CTA */}
                  <a
                    href={tier.href}
                    className={`${tier.href === "/anmelden" ? "hidden sm:block" : "block"} w-full py-4 text-center font-bold rounded-2xl transition-all hover:scale-[1.02] ${
                      tier.popular
                        ? "bg-white text-black shadow-lg"
                        : "bg-[#0c0c0c] text-white dark:bg-white dark:text-black"
                    }`}
                  >
                    {tier.cta}
                  </a>
                  {/* Mobile CTA → App Store (nur für Anmelde-Links) */}
                  {tier.href === "/anmelden" && (
                    <a
                      href="https://apps.apple.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex sm:hidden items-center justify-center gap-2 w-full py-4 text-center font-bold rounded-2xl transition-all hover:scale-[1.02] ${
                        tier.popular
                          ? "bg-white text-black shadow-lg"
                          : "bg-[#0c0c0c] text-white dark:bg-white dark:text-black"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                      App laden
                    </a>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── FAQ MINI ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-gray-100 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mb-12 text-center">Häufig gestellte Fragen</h2>
          <div className="space-y-8">
            {[
              { q: "Gibt es eine kostenlose Testphase?", a: "Ja, der Start-Plan ist dauerhaft kostenlos. Für den Pro-Plan bieten wir eine 30-tägige Testphase an." },
              { q: "Können wir jederzeit kündigen?", a: "Absolut. Unsere Abonnements sind monatlich kündbar, ohne lange Vertragslaufzeiten." },
              { q: "Was passiert, wenn wir mehr Mitglieder haben?", a: "Du kannst jederzeit in den Pro-Plan wechseln, um unbegrenzt viele Mitglieder zu verwalten." }
            ].map((faq, i) => (
              <div key={i}>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 opacity-50" /> {faq.q}
                </h4>
                <p className="text-gray-600 dark:text-[#8A8A8A] text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
