"use client";

import { useRef } from "react";
import Navbar from "@/app/components/Navbar";
import ScrollReveal, { StaggerContainer, StaggerItem } from "@/app/components/ScrollReveal";
import Footer from "@/app/components/Footer";
import Counter from "@/app/components/Counter";
import {
  Trophy, Music, Flame, Users, Heart, GraduationCap,
  ArrowRight, ShieldCheck, BarChart3, Clock, Zap, Lock,
  Globe, Sparkles, CheckCircle2, ChevronRight, FileOutput,
} from "lucide-react";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useDemo } from "@/lib/context/DemoContext";

/* ─── Word-by-word scroll-linked text reveal ─────────────────── */
function Word({
  word, progress, start, end,
}: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.1, 1]);
  const y = useTransform(progress, [start, end], [10, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.24em]">
      {word}
    </motion.span>
  );
}

function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.25"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i}
          word={word}
          progress={scrollYProgress}
          start={i / words.length}
          end={Math.min((i + 2) / words.length, 1)}
        />
      ))}
    </p>
  );
}

/* ─── Data ────────────────────────────────────────────────────── */
const solutions = [
  {
    id: "sport",
    num: "01",
    icon: <Trophy className="w-5 h-5" />,
    label: "Sportvereine",
    title: "Leistung & Gemeinschaft digital greifbar.",
    desc: "Für Sportvereine ist Talo mehr als nur eine Liste. Es ist das Werkzeug, um Trainingsfleiß, ehrenamtliche Unterstützung am Spieltag und sportliche Erfolge in einem fairen System zu vereinen – automatisch und transparent.",
    accent: "#3B82F6",
    accentBg: "bg-blue-500/8 dark:bg-blue-500/10",
    accentText: "text-blue-500",
    stats: [
      { value: 94, suffix: "%", label: "Zeitersparnis" },
      { value: 12, suffix: "h", label: "pro Pkt.-Runde gespart", decimals: 0 },
      { value: 100, suffix: "%", label: "Transparenz" },
    ],
    useCases: [
      {
        title: "Trainingsbeteiligung",
        desc: "Trainer erfassen mit einem Klick die Anwesenheit. Spieler sehen ihren Fortschritt in Echtzeit und werden durch Aktivitäts-Badges motiviert.",
        icon: <Users className="w-5 h-5" />,
      },
      {
        title: "Spieltags-Unterstützung",
        desc: "Eltern oder Mitglieder, die den Verkauf übernehmen oder als Linienrichter fungieren, erhalten sofort Punkte als direkte Wertschätzung.",
        icon: <Trophy className="w-5 h-5" />,
      },
      {
        title: "Saisonauswertung",
        desc: "Automatisierte Berichte über die aktivsten Mitglieder erleichtern die Vergabe von Preisen oder die Beantragung von Fördermitteln.",
        icon: <FileOutput className="w-5 h-5" />,
      },
    ],
    image: "https://i.ibb.co/FqXdb3Fk/IMG-8972.jpg",
    bgSection: "bg-white dark:bg-[#080808]",
  },
  {
    id: "kultur",
    num: "02",
    icon: <Music className="w-5 h-5" />,
    label: "Musik- & Kulturvereine",
    title: "Harmonie in der Organisation.",
    desc: "Vom Jugendorchester bis zum Traditionschor: Talo findet die Balance zwischen Probenarbeit und den vielen Aufgaben hinter der Bühne – und macht jede Form des Engagements sichtbar.",
    accent: "#8B5CF6",
    accentBg: "bg-purple-500/8 dark:bg-purple-500/10",
    accentText: "text-purple-500",
    stats: [
      { value: 3, suffix: "×", label: "höhere Motivation", decimals: 0 },
      { value: 80, suffix: "%", label: "weniger Verwaltung" },
      { value: 360, suffix: "°", label: "Engagement-Übersicht", decimals: 0 },
    ],
    useCases: [
      {
        title: "Proben-Management",
        desc: "Transparente Übersicht der Probenpräsenz – besonders hilfreich für die Planung von Konzerten und die Besetzung von Soli.",
        icon: <Music className="w-5 h-5" />,
      },
      {
        title: "Event-Logistik",
        desc: "Auf- und Abbau-Teams sowie die Organisation von Notenmaterial werden durch Punktevergabe fair belohnt und sichtbar gemacht.",
        icon: <Zap className="w-5 h-5" />,
      },
      {
        title: "Jugendarbeit",
        desc: "Junge Musiker werden spielerisch an die Vereinsarbeit herangeführt und für Engagement außerhalb des Instruments belohnt.",
        icon: <Sparkles className="w-5 h-5" />,
      },
    ],
    image: "https://i.ibb.co/gFfXqzLk/IMG-8974.jpg",
    bgSection: "bg-[#f2f4f7] dark:bg-white/[0.02]",
  },
  {
    id: "feuerwehr",
    num: "03",
    icon: <Flame className="w-5 h-5" />,
    label: "Feuerwehr & Rettungsdienste",
    title: "Zuverlässigkeit lückenlos dokumentiert.",
    desc: "Im Ehrenamt, wo es auf jede Sekunde ankommt, sorgt Talo für eine rechtssichere und einfache Dokumentation von Dienststunden und Fortbildungen – mobil, DSGVO-konform und jederzeit exportierbar.",
    accent: "#EF4444",
    accentBg: "bg-red-500/8 dark:bg-red-500/10",
    accentText: "text-red-500",
    stats: [
      { value: 100, suffix: "%", label: "Rechtssicher" },
      { value: 0, suffix: " Fehler", label: "bei Exportberichten", decimals: 0 },
      { value: 15, suffix: " Min.", label: "bis Jahresbericht", decimals: 0 },
    ],
    useCases: [
      {
        title: "Dienstbeteiligung",
        desc: "Einfache Erfassung von Übungsabenden und Sonderdiensten direkt über das Smartphone der Gruppenführer – ohne Papier.",
        icon: <Clock className="w-5 h-5" />,
      },
      {
        title: "Lehrgangs-Tracking",
        desc: "Dokumentation von besuchten Lehrgängen und deren Anerkennung innerhalb des vereinsinternen Punktesystems.",
        icon: <ShieldCheck className="w-5 h-5" />,
      },
      {
        title: "Nachweis für Arbeitgeber",
        desc: "Schneller Export von geleisteten Stunden als Nachweis für Freistellungen oder zur Vorlage bei Behörden.",
        icon: <FileOutput className="w-5 h-5" />,
      },
    ],
    image: "https://i.ibb.co/TMVDDwbs/IMG-8976.jpg",
    bgSection: "bg-white dark:bg-[#080808]",
  },
];

const furtherScenarios = [
  {
    icon: <Heart className="w-5 h-5" />,
    title: "Soziale Träger",
    desc: "Helfer-Stunden in Tafeln oder Nachbarschaftshilfen präzise erfassen und transparent ausweisen.",
    color: "text-rose-500",
    bg: "bg-rose-500/8 dark:bg-rose-500/10",
  },
  {
    icon: <GraduationCap className="w-5 h-5" />,
    title: "Studierenden-Initiativen",
    desc: "Organisation von Campus-Events und internen Ämtern ohne Excel-Chaos – digital und fair.",
    color: "text-amber-500",
    bg: "bg-amber-500/8 dark:bg-amber-500/10",
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: "Bürgervereine",
    desc: "Engagement im Kiez sichtbar machen und lokale Projekte vorantreiben – mit Echtzeit-Transparenz.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/8 dark:bg-emerald-500/10",
  },
  {
    icon: <Globe className="w-5 h-5" />,
    title: "Internationale Verbände",
    desc: "Mehrsprachige Plattform für Verbände mit Ortsgruppen in verschiedenen Ländern.",
    color: "text-blue-500",
    bg: "bg-blue-500/8 dark:bg-blue-500/10",
  },
  {
    icon: <Lock className="w-5 h-5" />,
    title: "Berufsverbände",
    desc: "Fortbildungspunkte und Mitgliederpflichten sicher und revisionsfest dokumentieren.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/8 dark:bg-indigo-500/10",
  },
  {
    icon: <BarChart3 className="w-5 h-5" />,
    title: "Fördervereine",
    desc: "Spendenaktionen und projektbezogene Tätigkeiten für Zuwendungsbescheide lückenlos erfassen.",
    color: "text-purple-500",
    bg: "bg-purple-500/8 dark:bg-purple-500/10",
  },
];

const process = [
  { num: "01", title: "Aktivität eintragen", desc: "Mitglied oder Trainer erfasst die Leistung per App in Sekunden." },
  { num: "02", title: "KI-Prüfung", desc: "Talo analysiert, klassifiziert und berechnet Punkte automatisch." },
  { num: "03", title: "Ein-Klick-Genehmigung", desc: "Admins bestätigen Hunderte Einträge mit einem Wisch." },
  { num: "04", title: "Auswertung bereit", desc: "Berichte, PDFs und Exporte stehen sofort zur Verfügung." },
];

/* ─── Page Component ──────────────────────────────────────────── */
export default function SolutionsPage() {
  const { openDemo } = useDemo();

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#080808]">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative pt-[160px] md:pt-[220px] pb-24 md:pb-40 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-400/5 blur-[160px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <ScrollReveal direction="up" delay={0.1}>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-[#8A8A8A] font-bold text-[11px] uppercase tracking-widest mb-8">
              <Sparkles size={11} /> Branchen-Lösungen
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.2} blur duration={1}>
            <h1 className="text-[2.4rem] sm:text-[3.5rem] md:text-[6.5rem] lg:text-[8rem] leading-[1.02] font-medium tracking-tighter font-logo text-gray-900 dark:text-white mb-10 max-w-6xl mx-auto">
              Für jede Form<br />
              <span className="text-gray-300 dark:text-white/20 italic">des Engagements.</span>
            </h1>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.3}>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-3xl mx-auto mb-12">
              Talo ist hochgradig modular. Wir orchestrieren eure Prozesse – vom kleinen Förderverein bis zur komplexen Hilfsorganisation.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/anmelden"
                className="px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20"
              >
                Kostenlos starten
              </Link>
              <button
                onClick={openDemo}
                className="px-10 py-5 rounded-full font-bold text-sm bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Demo anfragen
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── SCROLL TEXT MANIFESTO ────────────────────────────── */}
      <section className="py-32 md:py-56 relative overflow-hidden bg-[#f2f4f7] dark:bg-white/[0.03]">
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-10 inline-block italic">
              Die TALO Philosophie
            </span>
          </ScrollReveal>
          <ScrollText
            text="Jede Gemeinschaft ist anders. Deshalb passt sich Talo an euch an – nicht umgekehrt."
            className="text-3xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white font-medium leading-[1.2] tracking-tight max-w-5xl mx-auto"
          />
        </div>
        <div className="absolute top-1/3 left-[5%] w-[500px] h-[400px] bg-blue-400/4 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-[5%] w-[400px] h-[300px] bg-purple-400/4 blur-[100px] pointer-events-none" />
      </section>

      {/* ─── DETAILED SOLUTIONS ───────────────────────────────── */}
      {solutions.map((solution, sIndex) => (
        <section
          key={solution.id}
          id={solution.id}
          className={`${solution.bgSection} py-24 md:py-40 overflow-hidden`}
        >
          <div className="max-w-7xl mx-auto px-6">
            {/* ── Top label row */}
            <div className="flex items-center gap-4 mb-14 md:mb-20">
              <ScrollReveal direction="up">
                <div className="flex items-center gap-4">
                  <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase italic">
                    {solution.num} / Lösung
                  </span>
                  <div className={`w-8 h-8 rounded-xl ${solution.accentBg} flex items-center justify-center ${solution.accentText}`}>
                    {solution.icon}
                  </div>
                  <span className={`text-[11px] font-black tracking-[0.3em] uppercase ${solution.accentText}`}>
                    {solution.label}
                  </span>
                </div>
              </ScrollReveal>
            </div>

            {/* ── Main grid: headline left, description right */}
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start mb-20 md:mb-32">
              <ScrollReveal direction="left">
                <h2 className="text-[2.5rem] md:text-[4.5rem] lg:text-[5.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.02] font-logo">
                  {solution.title}
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={0.15}>
                <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-12">
                  {solution.desc}
                </p>
                {/* Stats */}
                <div className="flex flex-wrap gap-6">
                  {solution.stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.2 + i * 0.08, duration: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
                      className="flex flex-col gap-1"
                    >
                      <span
                        className="text-3xl md:text-4xl font-medium tracking-tighter text-gray-950 dark:text-white"
                        style={{ color: i === 0 ? solution.accent : undefined }}
                      >
                        <Counter value={stat.value} suffix={stat.suffix} decimalPlaces={stat.decimals ?? 0} />
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {stat.label}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* ── Full-width image */}
            <ScrollReveal direction="up" blur scale={0.97} duration={1.2}>
              <div className="relative group overflow-hidden rounded-[28px] md:rounded-[48px] border border-gray-100 dark:border-white/5 mb-20 md:mb-32">
                <img
                  src={solution.image}
                  alt={solution.label}
                  className="w-full h-[320px] md:h-[580px] lg:h-[680px] object-cover transition-transform duration-[2.5s] group-hover:scale-105"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                {/* Bottom left badge */}
                <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 flex items-center gap-4">
                  <span className="px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest">
                    Talo im Einsatz
                  </span>
                  <span
                    className="px-5 py-2.5 backdrop-blur-md rounded-full border border-white/20 text-white font-black text-[10px] md:text-[11px] uppercase tracking-widest"
                    style={{ backgroundColor: `${solution.accent}40`, borderColor: `${solution.accent}60` }}
                  >
                    {solution.label}
                  </span>
                </div>
                {/* Top right accent glow */}
                <div
                  className="absolute top-0 right-0 w-[300px] h-[200px] blur-[80px] opacity-30 pointer-events-none"
                  style={{ backgroundColor: solution.accent }}
                />
              </div>
            </ScrollReveal>

            {/* ── 3 use case cards */}
            <StaggerContainer className="grid md:grid-cols-3 gap-5">
              {solution.useCases.map((uc, idx) => (
                <StaggerItem key={idx} direction="up" distance={24}>
                  <div className="group p-8 md:p-10 rounded-[28px] bg-gray-50 dark:bg-white/[0.025] border border-gray-100 dark:border-white/[0.06] h-full flex flex-col gap-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                    {/* Number */}
                    <div className="flex items-center justify-between">
                      <span className="text-[48px] font-black text-gray-100 dark:text-white/[0.04] leading-none tracking-tighter">
                        0{idx + 1}
                      </span>
                      <div
                        className={`w-10 h-10 rounded-xl ${solution.accentBg} flex items-center justify-center ${solution.accentText} group-hover:scale-110 transition-transform duration-300`}
                      >
                        {uc.icon}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-950 dark:text-white mb-3 tracking-tight">
                        {uc.title}
                      </h4>
                      <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm">
                        {uc.desc}
                      </p>
                    </div>
                    <div className="mt-auto">
                      <Link
                        href="/funktionen"
                        className={`inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-widest transition-all ${solution.accentText} opacity-0 group-hover:opacity-100`}
                      >
                        Mehr erfahren <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      ))}

      {/* ─── HOW IT WORKS: PROCESS STEPS ─────────────────────── */}
      <section className="py-24 md:py-40 border-t border-gray-100 dark:border-white/5 bg-[#f2f4f7] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-16 md:mb-24">
            <ScrollReveal direction="up">
              <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase italic mb-6 inline-block">
                So funktioniert's
              </span>
              <h2 className="text-[2.5rem] md:text-[5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-[1.05]">
                Vier Schritte.<br />
                <span className="text-gray-300 dark:text-white/20 italic font-logo">Ein System.</span>
              </h2>
            </ScrollReveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {process.map((step, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div className="group relative p-8 rounded-[28px] bg-white dark:bg-white/[0.025] border border-gray-100 dark:border-white/[0.06] h-full flex flex-col gap-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  {/* Large decorative number */}
                  <div className="absolute top-4 right-4 text-[72px] font-black text-gray-50 dark:text-white/[0.03] leading-none select-none pointer-events-none">
                    {step.num}
                  </div>
                  {/* Connector line (desktop) */}
                  {i < process.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-[12px] w-6 h-px bg-gray-200 dark:bg-white/10 z-10" />
                  )}
                  <div className="w-10 h-10 rounded-xl bg-gray-950 dark:bg-white flex items-center justify-center">
                    <span className="text-[11px] font-black text-white dark:text-black">{step.num}</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-950 dark:text-white mb-2 tracking-tight">
                      {step.title}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WEITERE SZENARIEN: BENTO GRID ───────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 my-24 lg:my-48 relative z-10">
        <div className="py-28 lg:py-44 bg-[#f2f4f7] dark:bg-white/[0.03] rounded-[64px] md:rounded-[100px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-12 mb-20 md:mb-28">
              <div className="max-w-2xl">
                <ScrollReveal direction="up">
                  <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-6 inline-block italic">
                    Und noch viel mehr
                  </span>
                  <h2 className="text-[2.5rem] md:text-[4.5rem] font-medium tracking-tighter text-gray-950 dark:text-white leading-tight font-logo">
                    Vielseitig<br />
                    <span className="text-gray-400 italic">einsetzbar.</span>
                  </h2>
                </ScrollReveal>
              </div>
              <ScrollReveal direction="up" delay={0.15}>
                <p className="text-lg text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed max-w-sm">
                  Talo ist modular aufgebaut und lässt sich für nahezu jede Form wiederkehrender Aktivitäten konfigurieren.
                </p>
              </ScrollReveal>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {furtherScenarios.map((item, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.06}>
                  <div className="p-8 rounded-[28px] bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 h-full group hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-11 h-11 rounded-2xl ${item.bg} flex items-center justify-center mb-6 ${item.color} group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-950 dark:text-white mb-3">{item.title}</h3>
                    <p className="text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed text-sm">
                      {item.desc}
                    </p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS: TALO IN ZAHLEN (dark) ────────────────────── */}
      <section className="px-4 md:px-10 lg:px-16 mb-24 lg:mb-48">
        <div className="py-32 lg:py-56 relative bg-gray-950 dark:bg-white/[0.03] rounded-[64px] md:rounded-[140px] overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <ScrollReveal direction="up">
              <p className="text-center text-[11px] font-black tracking-[0.4em] text-white/30 uppercase mb-6 italic">
                Talo in Zahlen
              </p>
              <h2 className="text-center text-3xl md:text-5xl font-medium tracking-tighter text-white mb-20 leading-tight">
                Zahlen, die für sich sprechen.
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-8 text-center">
              {[
                { label: "Vereine vertrauen Talo", value: 150, suffix: "+" },
                { label: "Mitglieder aktiv", value: 12000, suffix: "+" },
                { label: "Zeit gespart", value: 90, suffix: "%" },
                { label: "Lösungstypen", value: 9, suffix: "+", decimals: 0 },
              ].map((s, i) => (
                <ScrollReveal key={i} direction="up" delay={i * 0.1}>
                  <p className="text-5xl md:text-6xl lg:text-7xl font-medium tracking-tighter text-white mb-3">
                    <Counter value={s.value} suffix={s.suffix} decimalPlaces={s.decimals ?? 0} />
                  </p>
                  <p className="text-[11px] font-black text-white/30 uppercase tracking-widest">{s.label}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUES STRIP ─────────────────────────────────────── */}
      <section className="py-16 md:py-24 border-t border-b border-gray-100 dark:border-white/5 bg-white dark:bg-[#080808]">
        <div className="max-w-7xl mx-auto px-6">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
            {[
              { icon: <Clock size={20} />, title: "Echtzeit", sub: "Daten sofort verfügbar" },
              { icon: <ShieldCheck size={20} />, title: "DSGVO-Sicher", sub: "Deutsche Server" },
              { icon: <BarChart3 size={20} />, title: "Transparent", sub: "100% Nachvollziehbar" },
              { icon: <Zap size={20} />, title: "Schnell", sub: "15 Min. bis live" },
            ].map((p, i) => (
              <StaggerItem key={i} direction="up" distance={20}>
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 flex items-center justify-center text-gray-600 dark:text-gray-400">
                    {p.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-950 dark:text-white mb-1">{p.title}</p>
                    <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{p.sub}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ─── CTA SECTION ──────────────────────────────────────── */}
      <section className="py-32 lg:py-64 relative overflow-hidden bg-white dark:bg-[#080808]">
        <div className="absolute top-0 left-[20%] w-[700px] h-[700px] bg-blue-500/4 blur-[160px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[500px] h-[500px] bg-purple-500/4 blur-[140px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <ScrollReveal direction="up">
            <span className="text-[11px] font-black tracking-[0.4em] text-gray-400 dark:text-gray-600 uppercase mb-8 inline-block italic">
              Bereit loszulegen?
            </span>
            <h2 className="text-[2.5rem] md:text-[6rem] lg:text-[7rem] font-medium tracking-tighter font-logo text-gray-900 dark:text-white mb-8 leading-[1.02]">
              Bereit für die<br />
              <span className="italic text-gray-300 dark:text-white/20">Transformation?</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-500 dark:text-[#8A8A8A] font-medium leading-relaxed mb-14 max-w-2xl mx-auto">
              Wir helfen dir dabei, das perfekte System für deine Gemeinschaft aufzusetzen. Unverbindlich, persönlich und kostenlos.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={openDemo}
                className="px-10 py-5 rounded-full font-bold text-sm bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-all shadow-2xl shadow-black/20"
              >
                Demo anfragen
              </button>
              <Link
                href="/ueber-uns"
                className="px-10 py-5 rounded-full font-bold text-sm bg-white dark:bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5 transition-all inline-flex items-center gap-3"
              >
                Team kennenlernen <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Social proof strip */}
          <ScrollReveal direction="up" delay={0.2}>
            <div className="mt-20 flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {["GDPR", "SOC2", "ISO27001", "Made in Germany"].map((label) => (
                <span key={label} className="text-lg font-black tracking-tighter text-gray-200 dark:text-gray-800">
                  {label}
                </span>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
