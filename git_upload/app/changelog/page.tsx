"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Sparkles, Zap, ShieldCheck, Bug, ArrowUpRight } from "lucide-react";

type ChangeType = "neu" | "verbesserung" | "fix" | "sicherheit";

const typeConfig: Record<ChangeType, { label: string; color: string }> = {
  neu:          { label: "Neu",          color: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  verbesserung: { label: "Verbesserung", color: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300" },
  fix:          { label: "Fix",          color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  sicherheit:   { label: "Sicherheit",   color: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
};

const releases: {
  version: string;
  date: string;
  highlight?: string;
  changes: { type: ChangeType; text: string }[];
}[] = [
  {
    version: "v1.4.0",
    date: "1. April 2026",
    highlight: "Mobile Navigation & Performance",
    changes: [
      { type: "neu",          text: "Burger-Menü optimiert für kleine Bildschirme (iPhone 13 mini & Co.)" },
      { type: "neu",          text: "Seiten /newsletter, /kontakt und /karriere live" },
      { type: "verbesserung", text: "Impressum neu gestaltet mit zweispaltigem Layout" },
      { type: "verbesserung", text: "Alle Kontaktdaten zentralisiert auf PauliONE" },
      { type: "fix",          text: "™-Symbol vollständig aus allen Seiten entfernt" },
    ],
  },
  {
    version: "v1.3.0",
    date: "25. März 2026",
    highlight: "Blog & Inhaltsseiten",
    changes: [
      { type: "neu",          text: "Blog mit dynamischen Beiträgen und Slug-Routing" },
      { type: "neu",          text: "Blog-Beitrag: Wie wir Talo bauen" },
      { type: "verbesserung", text: "Floating Blog-Banner auf der Startseite" },
      { type: "verbesserung", text: "Dark-Mode-Refinements auf allen Seiten" },
      { type: "fix",          text: "Navbar-Scroll-Verhalten auf langen Seiten korrigiert" },
    ],
  },
  {
    version: "v1.2.0",
    date: "10. März 2026",
    highlight: "Dashboard & Auth",
    changes: [
      { type: "neu",          text: "Dashboard mit Mitgliederverwaltung und Tätigkeits-Tracking" },
      { type: "neu",          text: "Firebase-Auth: Anmelden, Registrieren, Session-Persistenz" },
      { type: "neu",          text: "Genehmigungsworkflow für Tätigkeiten" },
      { type: "sicherheit",   text: "AuthGuard für alle geschützten Dashboard-Routen" },
      { type: "verbesserung", text: "Mobile Blocker im Dashboard (Desktop-Only-Hinweis)" },
    ],
  },
  {
    version: "v1.1.0",
    date: "20. Feb. 2026",
    highlight: "Kernseiten & Design-System",
    changes: [
      { type: "neu",          text: "Seiten Funktionen, Lösungen, Preise, Hilfe, Über uns" },
      { type: "neu",          text: "ScrollReveal-Animationssystem mit StaggerContainer" },
      { type: "neu",          text: "Footer mit allen Sektionen, KI-Links und Social-Icons" },
      { type: "verbesserung", text: "Responsive Navbar mit Pill-Morph-Animation auf Mobile" },
      { type: "fix",          text: "Hydration-Warnung im ThemeProvider behoben" },
    ],
  },
  {
    version: "v1.0.0",
    date: "1. Feb. 2026",
    highlight: "Erster Launch",
    changes: [
      { type: "neu", text: "Startseite mit Hero, Features, Demo-Formular und CTA" },
      { type: "neu", text: "Next.js 16, Tailwind CSS, Framer Motion, TypeScript" },
      { type: "neu", text: "Light-Mode-only, DE-Sprache, DSGVO-konform" },
      { type: "neu", text: "Impressum und Datenschutz" },
    ],
  },
];

const iconForType = (type: ChangeType) => {
  switch (type) {
    case "neu":          return <Sparkles className="w-3.5 h-3.5" />;
    case "verbesserung": return <Zap className="w-3.5 h-3.5" />;
    case "fix":          return <Bug className="w-3.5 h-3.5" />;
    case "sicherheit":   return <ShieldCheck className="w-3.5 h-3.5" />;
  }
};

export default function ChangelogPage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[160px] pb-16 border-b border-gray-100 dark:border-white/[0.06] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[500px] h-[300px] rounded-full bg-violet-400/8 dark:bg-violet-600/8 blur-[120px] -translate-y-1/4" />
        </div>
        <div className="max-w-3xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800/40 text-violet-700 dark:text-violet-300 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              Was ist neu
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3rem] md:text-[5rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.05] mb-5">
              Changelog
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg text-gray-500 dark:text-[#8A8A8A] max-w-lg leading-relaxed">
              Alle Änderungen, Verbesserungen und Fixes — offen und transparent
              dokumentiert.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Releases */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6">
          <StaggerContainer className="flex flex-col">
            {releases.map((release, ri) => (
              <StaggerItem key={ri}>
                <div className="relative grid md:grid-cols-[160px_1fr] gap-6 md:gap-12 pb-14">
                  {/* Timeline line */}
                  {ri < releases.length - 1 && (
                    <div className="hidden md:block absolute left-[72px] top-8 bottom-0 w-px bg-gray-100 dark:bg-white/[0.05]" />
                  )}

                  {/* Left: version + date */}
                  <div className="flex md:flex-col gap-3 md:gap-1.5 items-center md:items-start">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-[#111] border-2 border-gray-200 dark:border-white/[0.1] shrink-0 md:mb-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block font-mono">
                        {release.version}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-600 whitespace-nowrap">
                        {release.date}
                      </span>
                    </div>
                  </div>

                  {/* Right: changes */}
                  <div className="rounded-[1.5rem] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111] overflow-hidden">
                    {release.highlight && (
                      <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50 dark:bg-white/[0.02]">
                        <h2 className="font-semibold text-gray-900 dark:text-white text-[15px]">
                          {release.highlight}
                        </h2>
                      </div>
                    )}
                    <ul className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                      {release.changes.map((change, ci) => (
                        <li key={ci} className="flex items-start gap-3 px-6 py-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 mt-0.5 ${typeConfig[change.type].color}`}
                          >
                            {iconForType(change.type)}
                            {typeConfig[change.type].label}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
                            {change.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-12 border-t border-gray-100 dark:border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-[1.5rem] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  Immer auf dem neuesten Stand
                </p>
                <p className="text-sm text-gray-500 dark:text-[#8A8A8A]">
                  Abonniere den Newsletter und erfahre von Updates als Erster.
                </p>
              </div>
              <a
                href="/newsletter"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-80 active:scale-[0.97] transition-all whitespace-nowrap shrink-0"
              >
                Newsletter <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
