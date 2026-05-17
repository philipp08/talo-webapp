"use client";
import React from "react";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { ArrowRight, Check, Info, Sparkles } from "lucide-react";
import { PLAN_TIERS } from "@/lib/firebase/models";

const tierCta: Record<string, { cta: string; href: string }> = {
  starter: { cta: "Kostenlos starten", href: "/anmelden" },
  club: { cta: "Club-Lizenz aktivieren", href: "/anmelden" },
  pro: { cta: "Pro-Lizenz aktivieren", href: "/anmelden" },
};

function PricingCard({ tier, cta }: { tier: typeof PLAN_TIERS[0], cta: { cta: string, href: string } }) {
  const [showAll, setShowAll] = React.useState(false);
  const visibleFeatures = showAll ? tier.features : tier.features.slice(0, 5);
  const hasMore = tier.features.length > 5;

  return (
    <div className={`relative h-full rounded-[2.5rem] p-8 border ${
      tier.popular 
        ? "bg-[#0c0c0c] text-white border-white/10 shadow-2xl md:scale-105" 
        : "bg-white dark:bg-white/[0.03] text-gray-900 dark:text-white border-gray-100 dark:border-white/10"
    } flex flex-col`}>
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

      <div className="space-y-4 mb-6 flex-1">
        {visibleFeatures.map((feat, i) => (
          <div key={i} className="flex gap-3">
            <Check className={`w-5 h-5 shrink-0 ${tier.popular ? "text-white" : "text-gray-900 dark:text-white"}`} />
            <span className="text-sm">{feat}</span>
          </div>
        ))}
        {hasMore && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className={`text-sm font-semibold underline underline-offset-4 decoration-black/20 hover:decoration-black transition-all ${tier.popular ? "text-white/70 hover:text-white decoration-white/30 hover:decoration-white" : "text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white dark:decoration-white/20"}`}
          >
            {showAll ? "Weniger anzeigen" : `+ ${tier.features.length - 5} weitere`}
          </button>
        )}
      </div>

      {/* Desktop CTA */}
      <div className="mt-4">
        <a
          href={cta.href}
          className={`${cta.href === "/anmelden" ? "hidden sm:block" : "block"} w-full py-4 text-center font-bold rounded-2xl transition-all hover:scale-[1.02] ${
            tier.popular
              ? "bg-white text-black shadow-lg"
              : "bg-[#0c0c0c] text-white dark:bg-white dark:text-black"
          }`}
        >
          {cta.cta}
        </a>
        {/* Mobile CTA */}
        {cta.href === "/anmelden" && (
          <a
            href="/anmelden"
            className={`flex sm:hidden items-center justify-center gap-2 w-full py-4 text-center font-bold rounded-2xl transition-all hover:scale-[1.02] ${
              tier.popular
                ? "bg-white text-black shadow-lg"
                : "bg-[#0c0c0c] text-white dark:bg-white dark:text-black"
            }`}
          >
            <ArrowRight size={14} />
            Starten
          </a>
        )}
      </div>
    </div>
  );
}

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
        <div className="max-w-[1500px] mx-auto px-6">
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PLAN_TIERS.map((tier) => {
              const cta = tierCta[tier.key];
              return (
              <StaggerItem key={tier.key}>
                <PricingCard tier={tier} cta={cta} />
              </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── FAQ MINI ─────────────────────────────────────────────── */}
      <section className="py-24 border-t border-gray-100 dark:border-white/10">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mb-12 text-center">Häufig gestellte Fragen</h2>
          <div className="space-y-8">
            {[
              { q: "Muss jedes Mitglied einzeln bezahlen?", a: "Nein, bei TALO zahlt immer der Verein. Es wird ein Lizenzschlüssel erworben, den ein Admin aktiviert, um den Plan für alle Mitglieder freizuschalten." },
              { q: "Was passiert, wenn die Lizenz abläuft?", a: "Alle eure erfassten Daten bleiben sicher erhalten. Ihr könnt weiterhin auf das System zugreifen, jedoch sind bestimmte Funktionen sowie das Hinzufügen weiterer Mitglieder auf den Starter-Plan eingeschränkt, bis eine neue Lizenz aktiviert wird." },
              { q: "Können wir als kleiner Verein trotzdem starten?", a: "Absolut! Der Starter-Plan ist dauerhaft kostenlos für bis zu 20 Mitglieder. Danach könnt ihr unproblematisch auf den Club- oder Pro-Plan upgraden, wenn der Verein wächst." },
              { q: "Bietet ihr Hilfe bei der Ersteinrichtung an?", a: "Ja! Für einen kleinen Aufpreis helfen wir euch bei der Datenübernahme (Import) und beim Onboarding-Prozess. Sprecht uns einfach darauf an." }
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
