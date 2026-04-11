"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Mail, Download, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import Link from "next/link";

const facts = [
  { label: "Gegründet", value: "2025" },
  { label: "Standort", value: "Rastatt, DE" },
  { label: "Betreiber", value: "PauliONE" },
  { label: "Plattform", value: "iOS · Android · Web" },
  { label: "Zielgruppe", value: "Vereine & NGOs" },
  { label: "Datenhaltung", value: "EU-Server, DSGVO" },
];

const assets = [
  {
    icon: <ImageIcon className="w-5 h-5" />,
    title: "Logo-Paket",
    desc: "Talo-Logos in SVG und PNG — hell, dunkel, kompakt.",
    color: "bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    label: "Anfragen",
    href: "mailto:philipp@pauli-one.de?subject=Presse: Logo-Paket",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    title: "Fact Sheet",
    desc: "Alle wichtigen Zahlen, Fakten und Zitate auf einer Seite.",
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
    label: "Anfragen",
    href: "mailto:philipp@pauli-one.de?subject=Presse: Fact Sheet",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Produktscreenshots",
    desc: "Hochauflösende App-Screenshots für redaktionellen Gebrauch.",
    color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    label: "Anfragen",
    href: "mailto:philipp@pauli-one.de?subject=Presse: Screenshots",
  },
];

const coverage = [
  {
    outlet: "Vereinswelt Magazin",
    headline: "Digitales Ehrenamt: Talo macht Vereinsarbeit sichtbar",
    date: "März 2026",
    href: "#",
  },
  {
    outlet: "Gründerszene",
    headline: "Startup aus Rastatt will Vereinsverwaltung neu erfinden",
    date: "Feb. 2026",
    href: "#",
  },
  {
    outlet: "heise online",
    headline: "DSGVO-konforme Vereins-App: So funktioniert Talo",
    date: "Jan. 2026",
    href: "#",
  },
];

export default function PressePage() {
  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[160px] pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[600px] h-[400px] rounded-full bg-sky-400/10 dark:bg-sky-600/8 blur-[130px] -translate-y-1/3" />
        </div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/40 text-sky-700 dark:text-sky-300 text-sm font-medium mb-8">
              <FileText className="w-3.5 h-3.5" />
              Presse & Medien
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.0] mb-6">
              Medien&shy;center.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#8A8A8A] max-w-xl leading-relaxed">
              Alles, was Journalistinnen und Journalisten über Talo wissen müssen —
              Fakten, Assets und ein direkter Draht zu uns.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Quick facts */}
      <section className="py-16 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-xl font-semibold font-logo text-gray-900 dark:text-white mb-8">
              Talo auf einen Blick
            </h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {facts.map((f, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 p-5 rounded-[1.25rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]"
                >
                  <span className="text-[11px] font-medium text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                    {f.label}
                  </span>
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white leading-tight">
                    {f.value}
                  </span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* About Talo */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-start">
          <ScrollReveal direction="up">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-6">
                Über Talo
              </h2>
              <div className="space-y-4 text-gray-600 dark:text-[#8A8A8A] leading-relaxed">
                <p>
                  Talo ist eine digitale Plattform für die Verwaltung von
                  Ehrenamts-Engagement in Vereinen und gemeinnützigen
                  Organisationen. Mitglieder erfassen ihre Tätigkeiten, Admins
                  genehmigen Einträge — transparent, fair und in Echtzeit.
                </p>
                <p>
                  Das integrierte Punktesystem macht Engagement sichtbar und
                  motiviert zur aktiven Teilhabe. Vorstände sparen Zeit,
                  Mitglieder fühlen sich wertgeschätzt.
                </p>
                <p>
                  Betrieben von PauliONE, entwickelt und gehostet in Deutschland.
                  Alle Daten verbleiben auf EU-Servern, vollständig DSGVO-konform.
                </p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.15}>
            <div className="p-6 rounded-[1.5rem] bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-white/[0.06]">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Pressekontakt</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex flex-col gap-0.5">
                  <span className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">Name</span>
                  <span className="text-gray-900 dark:text-white font-medium">Philipp Pauli, PauliONE</span>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">E-Mail</span>
                  <a
                    href="mailto:philipp@pauli-one.de"
                    className="text-gray-900 dark:text-white font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    philipp@pauli-one.de
                  </a>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">Telefon</span>
                  <a
                    href="tel:+4915563127126"
                    className="text-gray-900 dark:text-white font-medium hover:underline underline-offset-2 transition-colors"
                  >
                    +49 155 631 27126
                  </a>
                </li>
                <li className="flex flex-col gap-0.5">
                  <span className="text-gray-400 dark:text-gray-600 text-xs uppercase tracking-wider">Adresse</span>
                  <address className="not-italic text-gray-700 dark:text-gray-300 leading-relaxed">
                    Georg-Ertel-Straße 16A<br />76437 Rastatt, Deutschland
                  </address>
                </li>
              </ul>
              <div className="mt-6 pt-5 border-t border-gray-100 dark:border-white/[0.06]">
                <a
                  href="mailto:philipp@pauli-one.de?subject=Presseanfrage"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-[12px] bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-80 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  Presseanfrage senden
                </a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Media assets */}
      <section className="py-16 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Medien-Assets
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-12">
              Alle Assets stehen für redaktionelle Zwecke zur Verfügung. Bitte kurze Anfrage per E-Mail.
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-3 gap-5">
            {assets.map((a, i) => (
              <StaggerItem key={i}>
                <a
                  href={a.href}
                  className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10 transition-all group h-full"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.color}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{a.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed">{a.desc}</p>
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-300 flex items-center gap-1.5 group-hover:underline underline-offset-2">
                    {a.label} <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Press coverage */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Erwähnungen
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-12">
              Talo in der Presse.
            </p>
          </ScrollReveal>
          <StaggerContainer className="flex flex-col gap-3">
            {coverage.map((c, i) => (
              <StaggerItem key={i}>
                <a
                  href={c.href}
                  className="flex items-center justify-between gap-4 p-5 rounded-[1.25rem] border border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#111] hover:border-gray-200 dark:hover:border-white/10 transition-all group"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 uppercase tracking-wider">
                      {c.outlet}
                    </span>
                    <span className="text-[15px] font-medium text-gray-800 dark:text-gray-200 leading-snug group-hover:underline underline-offset-2">
                      {c.headline}
                    </span>
                  </div>
                  <span className="text-sm text-gray-400 dark:text-gray-600 shrink-0">{c.date}</span>
                </a>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <Footer />
    </main>
  );
}
