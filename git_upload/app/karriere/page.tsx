"use client";

import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import { Heart, Zap, Globe, Coffee, Users, Laptop, Mail } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: <Laptop className="w-5 h-5" />,
    title: "Remote-First",
    desc: "Wir glauben, dass gute Arbeit nicht an einen Ort gebunden ist.",
    color: "bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Sinnvolle Arbeit",
    desc: "Jede Zeile Code, die wir schreiben, hilft echten Menschen im Ehrenamt.",
    color: "bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Schnelle Iteration",
    desc: "Direkte Wege, keine langen Abstimmungsrunden, Ideen kommen in Production.",
    color: "bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "EU-Impact",
    desc: "Wir bauen für Vereine in ganz Europa, datenschutzkonform und mit Haltung.",
    color: "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    icon: <Coffee className="w-5 h-5" />,
    title: "Gute Ausstattung",
    desc: "Wunsch-Hardware und ein Budget für Weiterbildung – du wächst, wir wachsen.",
    color: "bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Kleines Team",
    desc: "Kurze Wege, direkte Kommunikation, keine Politik.",
    color: "bg-sky-100 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400",
  },
];

export default function KarrierePage() {
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/[0.07] text-gray-500 dark:text-gray-400 text-sm font-medium mb-8">
              Karriere bei Talo
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2}>
            <h1 className="text-[3.5rem] md:text-[5.5rem] lg:text-[7rem] font-medium tracking-tight font-logo text-gray-900 dark:text-white leading-[1.0] mb-6">
              Bau etwas,<br className="hidden md:block" /> das zählt.
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.35}>
            <p className="text-lg md:text-xl text-gray-500 dark:text-[#8A8A8A] max-w-xl leading-relaxed">
              Wir sind ein kleines, fokussiertes Team, das Vereinsverwaltung
              endlich so baut, wie sie sein sollte — einfach, fair und modern.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-5xl mx-auto px-6">
          <ScrollReveal direction="up">
            <h2 className="text-2xl md:text-3xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
              Wie wir arbeiten
            </h2>
            <p className="text-gray-500 dark:text-[#8A8A8A] mb-14 max-w-lg">
              Kein Kicker-Tisch-Theater. Dafür echte Eigenverantwortung,
              direkte Kommunikation und eine Kultur, in der gute Arbeit gesehen wird.
            </p>
          </ScrollReveal>
          <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((v, i) => (
              <StaggerItem key={i}>
                <div className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.color}`}>
                    {v.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">{v.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Quote */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <ScrollReveal direction="up">
            <blockquote className="text-2xl md:text-3xl font-medium font-logo text-gray-900 dark:text-white leading-snug mb-6">
              „Wir bauen Talo, weil wir selbst in Vereinen engagiert sind — und wissen, wie kaputt der Status quo ist."
            </blockquote>
            <p className="text-gray-400 dark:text-gray-600 text-sm">— Das Talo-Team</p>
          </ScrollReveal>
        </div>
      </section>

      {/* No open positions */}
      <section className="py-20 bg-gray-50 dark:bg-[#0c0c0c]">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="text-center p-12 md:p-16 rounded-[2rem] border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-[#111]">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.07] flex items-center justify-center mx-auto mb-6">
                <Users className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-xl md:text-2xl font-semibold font-logo text-gray-900 dark:text-white mb-3">
                Aktuell keine offenen Stellen
              </h2>
              <p className="text-gray-500 dark:text-[#8A8A8A] max-w-sm mx-auto mb-8 leading-relaxed">
                Wir stecken gerade mitten im Aufbau. Wenn du glaubst, dass du
                ins Team passt, meld dich einfach direkt — wir freuen uns über
                jede Initiativ-Bewerbung.
              </p>
              <Link
                href="/kontakt"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-[14px] bg-black dark:bg-white text-white dark:text-black font-medium text-[15px] hover:opacity-80 active:scale-[0.97] transition-all"
              >
                <Mail className="w-4 h-4" />
                Initiativ melden
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
