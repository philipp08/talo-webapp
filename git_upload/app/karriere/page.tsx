"use client";

import { useState } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Heart, Zap, Globe, Coffee, ArrowRight, ChevronDown, Users, Laptop } from "lucide-react";
import Link from "next/link";

const perks = [
  {
    icon: <Laptop className="w-5 h-5" />,
    title: "Remote-First",
    desc: "Arbeite von wo du willst. Wir treffen uns einmal pro Quartal in Person.",
    color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Sinnvolle Arbeit",
    desc: "Du baust Werkzeuge, die echtes Ehrenamt in Deutschland voranbringen.",
    color: "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Schnelle Iteration",
    desc: "Keine endlosen Abstimmungsrunden. Deine Ideen landen schnell in Production.",
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "EU-Impact",
    desc: "Wir bauen für Vereine in ganz Europa — mit datenschutzkonformer Infrastruktur.",
    color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <Coffee className="w-5 h-5" />,
    title: "Gute Ausstattung",
    desc: "Wunsch-Hardware, Home-Office-Budget und ein Lern-Budget für Konferenzen & Kurse.",
    color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Kleines Team",
    desc: "Du arbeitest direkt mit den Gründern. Kein mittleres Management, kein Bullshit.",
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  },
];

const jobs = [
  {
    title: "Senior Full-Stack Engineer",
    team: "Engineering",
    location: "Remote (DE/EU)",
    type: "Vollzeit",
    desc: "Du entwickelst Features von Konzept bis Deployment. React, Next.js, TypeScript — unser Stack. Du gestaltest Architektur-Entscheidungen mit und bist nah an unseren Nutzern.",
    tags: ["TypeScript", "React", "Next.js", "PostgreSQL"],
  },
  {
    title: "Product Designer (UX/UI)",
    team: "Design",
    location: "Remote (DE/EU)",
    type: "Vollzeit",
    desc: "Du gestaltest die Nutzererfahrung von Talo — von der App bis zur Webseite. Du arbeitest eng mit Engineering zusammen und triffst gestalterische Entscheidungen selbstständig.",
    tags: ["Figma", "Design Systems", "Prototyping"],
  },
  {
    title: "Community & Growth Manager",
    team: "Growth",
    location: "Remote (DE/EU)",
    type: "Vollzeit",
    desc: "Du baust unsere Vereins-Community auf, entwickelst Content-Strategien und hilfst dabei, Talo in Deutschland bekannt zu machen.",
    tags: ["Content", "Social Media", "Community"],
  },
];

export default function KarrierePage() {
  const [openJob, setOpenJob] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-[160px] pb-20 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 flex items-start justify-center">
          <div className="w-[700px] h-[500px] rounded-full bg-rose-400/10 dark:bg-rose-600/8 blur-[150px] -translate-y-1/3" />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800/40 text-rose-700 dark:text-rose-300 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {jobs.length} offene Stellen
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.0] mb-6">
              Bau etwas,<br className="hidden md:block" /> das zählt.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#8A8A8A] max-w-xl leading-relaxed mb-10">
              Bei Talo arbeitest du an echter Software für echte Menschen —
              Vereine, Vorstände und Ehrenamtliche, die etwas bewegen wollen.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.45}>
            <a
              href="#stellen"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] bg-black dark:bg-white text-white dark:text-black font-medium text-[15px] hover:opacity-80 active:scale-[0.97] transition-all"
            >
              Offene Stellen
              <ArrowRight className="w-4 h-4" />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Values / culture */}
      <section className="py-20 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Wie wir arbeiten
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-14 max-w-lg">
              Kein Kicker-Tisch-Theater. Dafür echte Eigenverantwortung, direkte Kommunikation und eine Kultur, in der gute Arbeit gesehen wird.
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {perks.map((p, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${p.color}`}>
                    {p.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{p.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Team quote */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal direction="up">
            <blockquote className="text-2xl md:text-3xl font-medium font-logo text-gray-900 dark:text-white leading-snug mb-6">
              „Wir bauen Talo, weil wir selbst in Vereinen engagiert sind — und wissen, wie kaputt der Status quo ist."
            </blockquote>
            <p className="text-gray-400 dark:text-gray-600 text-sm">— Das Talo-Gründungsteam</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Open positions */}
      <section id="stellen" className="py-20 bg-gray-50 dark:bg-[#0c0c0c] scroll-mt-24">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Offene Stellen
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-12">
              Alle Positionen sind Remote-First. Bewerbungen aus ganz Europa willkommen.
            </p>
          </ScrollReveal>

          <StaggerContainer className="flex flex-col gap-4">
            {jobs.map((job, i) => (
              <StaggerItem key={i}>
                <div
                  className="rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenJob(openJob === i ? null : i)}
                    className="w-full flex items-start justify-between gap-4 p-6 text-left group"
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">
                          {job.team}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">
                          {job.location}
                        </span>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400">
                          {job.type}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {job.title}
                      </h3>
                    </div>
                    <ChevronDown
                      className={`w-5 h-5 text-gray-400 dark:text-gray-600 mt-1 shrink-0 transition-transform duration-200 ${openJob === i ? "rotate-180" : ""}`}
                    />
                  </button>

                  {openJob === i && (
                    <div className="px-6 pb-6 border-t border-gray-100 dark:border-white/[0.05] pt-5">
                      <p className="text-sm text-gray-600 dark:text-[#8A8A8A] leading-relaxed mb-4">
                        {job.desc}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {job.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-medium px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.07] text-gray-600 dark:text-gray-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link
                        href={`/kontakt?betreff=Bewerbung: ${encodeURIComponent(job.title)}`}
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-[12px] bg-black dark:bg-white text-white dark:text-black font-medium text-sm hover:opacity-80 active:scale-[0.97] transition-all"
                      >
                        Jetzt bewerben
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* No match CTA */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-8 p-6 rounded-[1.5rem] border border-dashed border-gray-200 dark:border-white/[0.08] text-center">
              <p className="text-gray-500 dark:text-[#8A8A8A] text-sm mb-3">
                Keine passende Stelle dabei? Wir freuen uns trotzdem über deine Initiativ-Bewerbung.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-200 hover:opacity-70 transition-opacity"
              >
                Initiativ bewerben <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
