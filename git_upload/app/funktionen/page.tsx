"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import FeatureCard from "@/app/components/FeatureCard";
import StickyScroll from "@/app/components/StickyScroll";
import Footer from "@/app/components/Footer";
import { CheckCircle2, LayoutDashboard, Users, Trophy, ClipboardCheck, Share2 } from "lucide-react";

export default function FeaturesPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative pt-[180px] pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-6 w-full text-center flex flex-col items-center">
          <ScrollReveal direction="up" delay={0.15} duration={0.8} distance={30}>
            <h1 className="text-[3.5rem] leading-[1.1] md:text-[5rem] lg:text-[6rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white mb-6 max-w-4xl mx-auto">
              Die Plattform im <br className="hidden md:block" /> Detail
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.3} duration={0.8} blur>
            <p className="text-lg md:text-xl font-poppins-regular leading-relaxed text-gray-600 dark:text-[#8A8A8A] max-w-2xl mx-auto mb-10">
              Talo ist mehr als nur eine Punkte-Liste. Es ist das digitale Rückgrat für modernes Vereinsengagement.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── WORKFLOW SECTION (NEW STICKY SCROLL) ────────────────── */}
      <StickyScroll />

      {/* ─── ROLE BASED FEATURES ──────────────────────────────────── */}
      <section className="py-24 relative bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-6xl mx-auto px-6">
          
          {/* Admin Role */}
          <div id="admin" className="mb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left" duration={0.8}>
                <div className="flex items-center gap-3 mb-4 text-[#8A8A8A]">
                  <LayoutDashboard className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-widest font-bold">Für Administratoren</span>
                </div>
                <h2 className="text-4xl font-bold font-logo text-gray-900 dark:text-white mb-6">
                  Volle Kontrolle über die Vereinsstruktur
                </h2>
                <div className="space-y-4">
                  {[
                    "Definition von A-, B-, C- und S-Kategorien für Punkte.",
                    "Festlegung von Saison-Zielen und Mindestbeiträgen.",
                    "Umfangreiches Dashboard mit Echtzeit-Statistiken.",
                    "Exportfunktion für die Jahresabschluss-Sitzung (CSV/PDF)."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8A8A8A] shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-[#8A8A8A]">{text}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" duration={0.8} blur>
                <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 aspect-video bg-[#f5f5f5] dark:bg-white/5 flex items-center justify-center">
                  <span className="text-gray-400 font-mono text-sm">[Admin Dashboard Mockup]</span>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Trainer Role */}
          <div id="workflow" className="mb-32">
            <div className="grid lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
              <div className="lg:order-2">
                <ScrollReveal direction="right" duration={0.8}>
                  <div className="flex items-center gap-3 mb-4 text-[#8A8A8A]">
                    <ClipboardCheck className="w-6 h-6" />
                    <span className="text-xs uppercase tracking-widest font-bold">Für Trainer & Leiter</span>
                  </div>
                  <h2 className="text-4xl font-bold font-logo text-gray-900 dark:text-white mb-6">
                    Genehmigungen mit einem Wisch
                  </h2>
                  <div className="space-y-4">
                    {[
                      "Intuitive Liste aller ausstehenden Engagement-Beiträge.",
                      "Direkte Genehmigung oder Ablehnung mit Kommentar.",
                      "Digitale Trainingslisten für schnelle Präsenzerfassung.",
                      "Verwaltung von Trainingsgruppen und Sparten."
                    ].map((text, i) => (
                      <div key={i} className="flex gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#8A8A8A] shrink-0 mt-0.5" />
                        <p className="text-gray-600 dark:text-[#8A8A8A]">{text}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              </div>
              <div className="lg:order-1">
                <ScrollReveal direction="left" duration={0.8} blur>
                  <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 aspect-video bg-[#f5f5f5] dark:bg-white/5 flex items-center justify-center">
                    <span className="text-gray-400 font-mono text-sm">[Trainer Workflow Mockup]</span>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>

          {/* Member Role */}
          <div id="community">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal direction="left" duration={0.8}>
                <div className="flex items-center gap-3 mb-4 text-[#8A8A8A]">
                  <Users className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-widest font-bold">Für Mitglieder</span>
                </div>
                <h2 className="text-4xl font-bold font-logo text-gray-900 dark:text-white mb-6">
                  Jeder Beitrag zählt – und wird gesehen
                </h2>
                <div className="space-y-4">
                  {[
                    "Einfaches Einreichen von Beiträgen über die mobile App.",
                    "Echtzeit-Leaderboard für gesunden Wettbewerb.",
                    "Transparente Ansicht des eigenen Punktestands.",
                    "Engagement-Profil mit Historie aller Tätigkeiten."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-[#8A8A8A] shrink-0 mt-0.5" />
                      <p className="text-gray-600 dark:text-[#8A8A8A]">{text}</p>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
              <ScrollReveal direction="right" duration={0.8} blur>
                <div className="glass-card rounded-3xl p-8 border border-gray-200 dark:border-white/10 aspect-video bg-[#f5f5f5] dark:bg-white/5 flex items-center justify-center">
                  <span className="text-gray-400 font-mono text-sm">[Member App Mockup]</span>
                </div>
              </ScrollReveal>
            </div>
          </div>

        </div>
      </section>

      {/* ─── ADDITIONAL TECH FEATURES ─────────────────────────────── */}
      <section className="py-24 relative bg-white dark:bg-[#080808]">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl font-bold font-logo text-gray-900 dark:text-white mb-4">
            Aber warte, da ist noch mehr.
          </h2>
        </div>
        <div className="max-w-6xl mx-auto px-6">
          <StaggerContainer staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StaggerItem>
              <FeatureCard 
                title="PWA & Mobile Ready" 
                description="Talo funktioniert als Web-App perfekt auf jedem Smartphone – ohne App-Store Zwang."
                icon={<Share2 className="w-5 h-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard 
                title="Sicheres Hosting" 
                description="Eure Daten liegen verschlüsselt in der Cloud. DSGVO-konform und sicher."
                icon={<CheckCircle2 className="w-5 h-5" />}
              />
            </StaggerItem>
            <StaggerItem>
              <FeatureCard 
                title="Multi-Verein Support" 
                description="Ein Nutzer kann in mehreren Vereinen Mitglied sein und einfach wechseln."
                icon={<Users className="w-5 h-5" />}
              />
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      <Footer />
    </main>
  );
}
