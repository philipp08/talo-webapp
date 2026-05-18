"use client";

import { CSSProperties, Dispatch, SetStateAction, useState, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollReveal, { StaggerContainer, StaggerItem } from "./components/ScrollReveal";
import StickyScroll from "./components/StickyScroll";
import {
  Star, ShieldCheck, ArrowRight, Zap, Globe, Lock, Cpu,
  Plus,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ContactForm from "./components/ContactForm";
import { posts as blogPosts } from "./blog/posts";
import { useDemo } from "@/lib/context/DemoContext";
import Counter from "./components/Counter";
import { motion, AnimatePresence, useScroll, useTransform, MotionValue } from "framer-motion";
import dynamic from "next/dynamic";

const ActivityFeedPlayer = dynamic(
  () => import("./components/MiniAnimationPlayers").then((m) => m.ActivityFeedPlayer),
  { ssr: false }
);

const LeaderboardPlayer = dynamic(
  () => import("./components/MiniAnimationPlayers").then((m) => m.LeaderboardPlayer),
  { ssr: false }
);

const MailingPlayer = dynamic(
  () => import("./components/MiniAnimationPlayers").then((m) => m.MailingPlayer),
  { ssr: false }
);

const RolesPlayer = dynamic(
  () => import("./components/MiniAnimationPlayers").then((m) => m.RolesPlayer),
  { ssr: false }
);

const ExportPlayer = dynamic(
  () => import("./components/MiniAnimationPlayers").then((m) => m.ExportPlayer),
  { ssr: false }
);

/* ─── Word-by-word scroll reveal ─────────────────────────────────── */
function Word({
  word, progress, start, end,
}: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.12, 1]);
  const y = useTransform(progress, [start, end], [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block mr-[0.25em]">
      {word}
    </motion.span>
  );
}

function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.95", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word
          key={i} word={word} progress={scrollYProgress}
          start={i / words.length} end={Math.min((i + 2) / words.length, 1)}
        />
      ))}
    </p>
  );
}

/* ─── FAQ accordion ───────────────────────────────────────────────── */
function FAQItem({ q, a, isOpen, onToggle }: {
  q: string; a: string; isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 dark:border-white/[0.06]">
      <button
        className="w-full flex items-center justify-between py-6 text-left gap-6"
        onClick={onToggle}
      >
        <span className="text-base font-semibold text-gray-900 dark:text-white">{q}</span>
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
          className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center"
        >
          <Plus size={11} className="text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-500 dark:text-[#8A8A8A] leading-relaxed text-sm">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Home() {
  const [showBanner, setShowBanner] = useState(true);
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  return (
    <HomeContent
      showBanner={showBanner} isBannerVisible={isBannerVisible}
      setShowBanner={setShowBanner} setIsBannerVisible={setIsBannerVisible}
    />
  );
}

type HomeContentProps = {
  showBanner: boolean;
  isBannerVisible: boolean;
  setShowBanner: Dispatch<SetStateAction<boolean>>;
  setIsBannerVisible: Dispatch<SetStateAction<boolean>>;
};

function HomeContent({ showBanner, isBannerVisible, setShowBanner, setIsBannerVisible }: HomeContentProps) {
  const { openDemo } = useDemo();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.innerHeight + window.scrollY;
      const bodyHeight = document.documentElement.scrollHeight;
      setIsBannerVisible(bodyHeight - scrollPosition >= 250);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [setIsBannerVisible]);

  return (
    <main className="relative min-h-screen bg-white dark:bg-[#0a0a0a]">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section className="relative pt-40 pb-32 md:pt-52 md:pb-44 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">

          <ScrollReveal direction="up" delay={0.05}>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-[11px] font-semibold text-gray-500 dark:text-gray-400 tracking-wide mb-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Jetzt verfügbar für deutsche Vereine
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.13}>
            <h1 className="text-center not-italic font-medium tracking-tight leading-[1.08] font-logo text-gray-950 dark:text-white mb-7 [font-size:clamp(2.5rem,6vw,5.5rem)] [text-wrap:balance]">
              Die All-in-One App für{" "}
              <span className="text-gray-400 dark:text-white/30">euren Verein.</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.21}>
            <p className="text-lg sm:text-xl text-gray-500 dark:text-[#888] leading-relaxed max-w-2xl mx-auto mb-12" style={{ textWrap: "pretty" } as CSSProperties}>
              TALO übernimmt Punktevergabe, Genehmigungen und Mitgliederverwaltung –
              damit ihr euch auf das konzentriert, was zählt: euren Verein.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.28}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
              <Link
                href="/anmelden"
                className="group hidden sm:inline-flex items-center gap-2.5 px-7 py-4 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.18)] hover:-translate-y-px active:scale-[0.97] active:shadow-none"
                style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), box-shadow 160ms cubic-bezier(0.23,1,0.32,1)" }}
              >
                Kostenlos starten
                <ArrowRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5" style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)" }} />
              </Link>
              <Link
                href="/anmelden"
                className="flex sm:hidden w-full items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-gray-950 dark:bg-white text-white dark:text-black font-semibold text-sm shadow-[0_4px_24px_rgba(0,0,0,0.12)] active:scale-[0.97]"
                style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1)" }}
              >
                <ArrowRight size={14} strokeWidth={2.5} />
                Kostenlos starten
              </Link>
              <button
                onClick={openDemo}
                className="w-full sm:w-auto px-7 py-4 rounded-xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-white/5 active:scale-[0.97]"
                style={{ transition: "transform 160ms cubic-bezier(0.23,1,0.32,1), background-color 150ms ease-out" }}
              >
                Demo anfragen
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-xs font-medium text-gray-400 dark:text-gray-600">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={13} strokeWidth={2} className="text-gray-300 dark:text-gray-700" />
                Datenschutz im Fokus
              </span>
              <span className="w-px h-3.5 bg-gray-200 dark:bg-gray-800" />
              <span>Google Cloud (Frankfurt)</span>
              <span className="w-px h-3.5 bg-gray-200 dark:bg-gray-800" />
              <span>Made in Germany</span>
            </div>
          </ScrollReveal>
        </div>

        {/* Dashboard animation */}
        <ScrollReveal direction="up" delay={0.4}>
          <div className="max-w-4xl mx-auto px-6 mt-20 relative">
            <div className="relative rounded-2xl md:rounded-3xl border border-gray-200/80 dark:border-white/[0.08] overflow-hidden shadow-2xl bg-white dark:bg-[#111]">
              <Image
                src="/dashboard-mockup.png"
                alt="Talo Dashboard für Punktevergabe, Genehmigungen und Mitgliederverwaltung im Verein"
                width={1024}
                height={609}
                priority
                sizes="(min-width: 1024px) 896px, calc(100vw - 48px)"
                className="w-full h-auto object-contain block"
              />
            </div>
            {/* Reflection glow */}
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-indigo-500/10 dark:bg-indigo-500/20 blur-2xl pointer-events-none" />
          </div>
        </ScrollReveal>

        {/* Subtle ambient background */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-gradient-to-b from-gray-100/80 to-transparent dark:from-white/[0.03] dark:to-transparent rounded-full blur-[100px]" />
        </div>
      </section>

      {/* ── TRUST / COMPLIANCE STRIP ─────────────────────────────── */}
      <section className="border-t border-gray-100 dark:border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-600 tracking-wide shrink-0">
              Sicherheit & Compliance
            </p>
            <StaggerContainer className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
              {[
                { label: "DSGVO", sub: "konform" },
                { label: "AES-256", sub: "verschlüsselt" },
                { label: "Google Cloud", sub: "Frankfurt" },
                { label: "Made in", sub: "Germany" },
                { label: "Kein Lock-in", sub: "exportierbar" },
              ].map(({ label, sub }) => (
                <StaggerItem key={label}>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">{label}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-wider">{sub}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* ── MANIFESTO: Scroll word reveal ────────────────────────── */}
      <section className="py-40 md:py-64 lg:py-80 relative bg-[#f7f7f7] dark:bg-white/[0.02] overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-14 text-center">
              Warum TALO
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <h2 className="text-[2.8rem] md:text-[6rem] lg:text-[8rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[0.93] mb-20 md:mb-32 text-center">
              Engagement.<br />
              <span className="text-gray-300 dark:text-white/10 italic font-logo">Orchestriert.</span>
            </h2>
          </ScrollReveal>
          <ScrollText
            text="Jeder Verein verdient eine Verwaltung, die mitdenkt. Kein Papierkram mehr, keine doppelte Buchführung, keine verlorenen Anträge. Nur ein System, das einfach funktioniert."
            className="text-xl md:text-3xl lg:text-[2.6rem] text-gray-900 dark:text-white font-medium leading-[1.3] tracking-tight max-w-4xl mx-auto text-center"
          />
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Unsere Grundsätze
                </p>
                <h2 className="text-[2rem] md:text-[3.5rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
                  Gebaut für Vertrauen.
                </h2>
              </div>
              <p className="text-gray-500 dark:text-[#888] leading-relaxed md:max-w-xs text-sm">
                Vereinssoftware, die eure Daten schützt, eure Mitglieder einbindet und mit euch wächst.
              </p>
            </div>
          </ScrollReveal>

          <div className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {[
              {
                num: "01",
                icon: <Lock size={16} strokeWidth={1.75} />,
                title: "Sicherheit an erster Stelle.",
                desc: "Datenschutzbewusste Datenverarbeitung mit klaren Rollen, geschützten Zugängen und jederzeit exportierbaren Vereinsdaten.",
              },
              {
                num: "02",
                icon: <Globe size={16} strokeWidth={1.75} />,
                title: "Transparenz für alle Mitglieder.",
                desc: "Jedes Mitglied sieht seinen Fortschritt in Echtzeit. Keine Diskussionen, keine Unklarheiten – nur faire, nachvollziehbare Ergebnisse.",
              },
              {
                num: "03",
                icon: <Cpu size={16} strokeWidth={1.75} />,
                title: "Intelligente Automatisierung.",
                desc: "TALO übernimmt Routineaufgaben automatisch: Dokumentenprüfung, Benachrichtigungen, Auswertungen – ohne manuellen Aufwand.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <div className="group flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-10 md:gap-16 py-9 md:py-12 cursor-default">
                  <span className="text-[10px] font-semibold tracking-[0.3em] text-gray-300 dark:text-gray-800 shrink-0 w-7">{item.num}</span>
                  <div
                    className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center text-gray-400 dark:text-gray-500 shrink-0 group-hover:bg-gray-950 group-hover:text-white group-hover:border-transparent dark:group-hover:bg-white dark:group-hover:text-black"
                    style={{ transition: "background-color 200ms ease-out, color 200ms ease-out, border-color 200ms ease-out" }}
                  >
                    {item.icon}
                  </div>
                  <h3
                    className="text-xl md:text-2xl font-semibold text-gray-950 dark:text-white font-logo tracking-tight flex-1 group-hover:translate-x-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-500 dark:text-[#888] leading-relaxed md:max-w-[260px] text-sm">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEM: STICKY SCROLL ────────────────────────────────── */}
      <section id="funktionen">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-4">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">Das System</p>
            <h2 className="text-[2rem] md:text-[4rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
              Vier Schritte. Ein System.
            </h2>
          </ScrollReveal>
        </div>
        <StickyScroll />
      </section>

      {/* ── ÖKOSYSTEM: BENTO GRID ────────────────────────────────── */}
      <section className="px-4 md:px-8 lg:px-14 my-20 lg:my-40">
        <div className="py-20 lg:py-40 bg-[#f7f7f7] dark:bg-white/[0.02] rounded-[40px] md:rounded-[72px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-10">

            <ScrollReveal direction="up">
              <div className="max-w-2xl mb-16 md:mb-28">
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Mehr als Punktevergabe
                </p>
                <h2 className="text-[2rem] md:text-[3.8rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo mb-6">
                  Ein komplettes Ökosystem für euren Verein.
                </h2>
                <p className="text-gray-500 dark:text-[#888] leading-relaxed text-base">
                  TALO ist das Betriebssystem für modernen Vereinsbetrieb. Durchdacht bis ins Detail.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

              {/* Card 1 — large 8 cols — with live activity feed */}
              <div className="md:col-span-8">
                <ScrollReveal direction="up" delay={0}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 md:p-10 pb-4 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-7 text-blue-500 group-hover:-translate-y-0.5"
                        style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      >
                        <Globe size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Digitale Mitgliederakte</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm max-w-md">
                        Alle Aktivitäten, Einträge und Punktehistorien — übersichtlich und immer aktuell.
                      </p>
                    </div>
                    {/* Live activity feed animation */}
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e]">
                      <ActivityFeedPlayer />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 2 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.05}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-7 text-amber-500 group-hover:-translate-y-0.5"
                        style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      >
                        <Zap size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Automatische Benachrichtigungen</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Push-Benachrichtigungen bei Genehmigungen, Ablehnungen und Saisonfristen – kein manuelles Nachhaken.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e]">
                      <MailingPlayer />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 3 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.08}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-7 text-emerald-500 group-hover:-translate-y-0.5"
                        style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      >
                        <Lock size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Rollen & Berechtigungen</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Präzises Rechtesystem — vom Vorstand bis zum Übungsleiter.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e]">
                      <RolesPlayer />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 4 — 4 cols — with leaderboard animation */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.11}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-7 text-purple-500 group-hover:-translate-y-0.5"
                        style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      >
                        <Cpu size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Deep Analytics</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Live Rankings, Bestenlisten und Saisonübersichten — auf einen Blick.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e]">
                      <LeaderboardPlayer />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Card 5 — 4 cols */}
              <div className="md:col-span-4">
                <ScrollReveal direction="up" delay={0.14}>
                  <div
                    className="group h-full rounded-2xl bg-white dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] overflow-hidden flex flex-col hover:-translate-y-1"
                    style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                  >
                    <div className="p-8 pb-3 flex flex-col items-center text-center">
                      <div
                        className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-7 text-rose-500 group-hover:-translate-y-0.5"
                        style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                      >
                        <ArrowRight size={18} strokeWidth={1.75} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-950 dark:text-white tracking-tight mb-2">Nahtlose Exporte</h3>
                      <p className="text-gray-500 dark:text-[#888] leading-relaxed text-sm">
                        Excel oder PDF – eure Daten jederzeit in dem Format, das ihr braucht.
                      </p>
                    </div>
                    <div className="border-t border-gray-100 dark:border-white/[0.06] bg-white dark:bg-[#0e0e0e]">
                      <ExportPlayer />
                    </div>
                  </div>
                </ScrollReveal>
              </div>


            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-16 md:mb-20 text-center">
              TALO in Zahlen
            </p>
          </ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-gray-100 dark:bg-white/[0.05] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/[0.05]">
            {[
              { label: "Kernbereiche", value: 4, suffix: "" },
              { label: "Rollenebenen", value: 3, suffix: "" },
              { label: "Exportwege", value: 3, suffix: "" },
              { label: "Werbedaten", value: 0, suffix: "" },
            ].map((s, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <div className="bg-white dark:bg-[#0a0a0a] px-6 py-12 md:py-16 text-center">
                  <p className="text-4xl md:text-5xl font-medium tracking-tight text-gray-950 dark:text-white mb-2 font-logo">
                    <Counter value={s.value} suffix={s.suffix} decimalPlaces={0} />
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 uppercase tracking-wider">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-6 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Was Vereine sagen
                </p>
                <h2 className="text-[2rem] md:text-[3.5rem] font-medium tracking-tight text-gray-950 dark:text-white leading-[1.1] font-logo">
                  Vertrauen, das zählt.
                </h2>
              </div>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                quote: "Genau dieses Gefühl soll Talo auslösen: weniger Suchen, weniger Tabellen, mehr Klarheit für den Vorstand.",
                author: "Produktnotiz",
                role: "Talo",
                image: "/talo-logo.png",
              },
              {
                quote: "Engagement wird nicht lauter, nur weil es wichtig ist. Talo macht es sichtbar, ohne den Verein mit Verwaltung zu belasten.",
                author: "Produktnotiz",
                role: "Talo",
                image: "/talo-logo.png",
              },
              {
                quote: "Die Oberfläche soll so ruhig bleiben, dass auch komplexe Abläufe im Alltag nicht kompliziert wirken.",
                author: "Produktnotiz",
                role: "Talo",
                image: "/talo-logo.png",
              },
            ].map((t, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.08}>
                <div
                  className="group h-full rounded-2xl bg-[#f7f7f7] dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-8 flex flex-col hover:-translate-y-1"
                  style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                >
                  <div className="flex gap-0.5 mb-6">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <Star key={si} size={13} fill="currentColor" strokeWidth={0} className="text-amber-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 dark:text-[#999] leading-relaxed mb-8 flex-1 text-sm">
                    „{t.quote}“
                  </p>
                  <div className="flex items-center gap-3">
                    <Image src={t.image} alt={t.author} width={36} height={36} className="w-9 h-9 rounded-full grayscale object-cover invert dark:invert-0" />
                    <div>
                      <p className="text-sm font-semibold text-gray-950 dark:text-white">{t.author}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-600 mt-0.5 uppercase tracking-wider">{t.role}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ──────────────────────────────────────────────── */}
      <section id="kontakt" className="py-24 md:py-40 relative overflow-hidden bg-[#f7f7f7] dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            <ScrollReveal direction="left">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">
                  Persönlich kennenlernen
                </p>
                <h2 className="text-[2rem] md:text-[3.8rem] font-medium tracking-tight leading-[1.1] text-gray-950 dark:text-white mb-8 font-logo">
                  Überzeug dich selbst.
                </h2>
                <p className="text-gray-500 dark:text-[#888] leading-relaxed mb-10 max-w-sm text-base">
                  Wir zeigen euch TALO in einer persönlichen Demo — 30 Minuten, live, auf eure Fragen zugeschnitten.
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    "Keine Vertragsbindung",
                    "Geführte Einrichtung",
                    "Persönlicher Ansprechpartner",
                  ].map((point) => (
                    <div key={point} className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      </div>
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" delay={0.12}>
              <div className="bg-white dark:bg-[#111] rounded-2xl border border-gray-100 dark:border-white/[0.06] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-none">
                <ContactForm />
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-24 md:py-40 px-6 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-2xl mx-auto">
          <ScrollReveal direction="up">
            <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-[0.2em] uppercase mb-5">FAQ</p>
            <h2 className="text-[2rem] md:text-[3rem] font-medium tracking-tight text-gray-950 dark:text-white mb-3 font-logo">
              Häufige Fragen.
            </h2>
            <p className="text-gray-500 dark:text-[#888] mb-14 text-sm">Alles was ihr über TALO wissen müsst.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div>
              {[
                {
                  q: "Wie geht Talo mit Datenschutz um?",
                  a: "Talo ist auf Datenschutz, klare Rollen und transparente Datenverarbeitung ausgelegt. Die konkreten Informationen zur Auftragsverarbeitung stellen wir im Onboarding bereit.",
                },
                {
                  q: "Wie lange dauert die Einrichtung?",
                  a: "Die Einrichtung ist geführt und auf typische Vereinsabläufe ausgelegt. Wir helfen euch dabei, Mitglieder, Rollen und Punkte sauber aufzusetzen.",
                },
                {
                  q: "Was kostet TALO?",
                  a: "Wir bieten faire Pakete für jede Vereinsgröße. Kleine Vereine starten kostenlos mit bis zu 20 Mitgliedern und können jederzeit auf Club oder Pro upgraden, wenn der Verein wächst.",
                },
                {
                  q: "Kann ich meine Daten jederzeit exportieren?",
                  a: "Selbstverständlich. Alle Daten sind jederzeit als CSV, Excel oder PDF exportierbar – ihr seid nie an TALO gebunden.",
                },
                {
                  q: "Gibt es einen Support?",
                  a: "Ja. Unser deutschsprachiges Team steht per E-Mail zur Verfügung – mit echten Antworten, nicht nur Automatisierungen.",
                },
              ].map((faq, i) => (
                <FAQItem
                  key={i} q={faq.q} a={faq.a}
                  isOpen={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── BLOG ─────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32 px-6 bg-white dark:bg-[#0a0a0a] border-t border-gray-100 dark:border-white/[0.05]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal direction="up">
            <div className="flex items-center justify-between mb-14 md:mb-20">
              <h2 className="text-2xl md:text-4xl font-medium text-gray-950 dark:text-white tracking-tight leading-tight">
                Aus dem Blog
              </h2>
              <Link
                href="/blog"
                className="group hidden md:inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-500 dark:hover:text-white transition-colors duration-200"
              >
                Alle Beiträge
                <ArrowRight size={13} className="group-hover:translate-x-0.5" style={{ transition: "transform 200ms cubic-bezier(0.23,1,0.32,1)" }} />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogPosts.slice(0, 3).map((post, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.07}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-2xl bg-[#f7f7f7] dark:bg-[#111] border border-gray-100 dark:border-white/[0.06] p-6 h-full hover:-translate-y-1"
                  style={{ transition: "transform 250ms cubic-bezier(0.23,1,0.32,1)" }}
                >
                  <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-600 mb-4">
                    {post.category}
                  </span>
                  <h3 className="text-base font-semibold text-gray-950 dark:text-white leading-snug mb-3 group-hover:underline decoration-gray-300 underline-offset-2 flex-1">
                    {post.title}
                  </h3>
                  <p className="text-gray-500 dark:text-[#888] text-sm line-clamp-2 leading-relaxed mb-6">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2.5 mt-auto pt-5 border-t border-gray-100 dark:border-white/[0.05]">
                    <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[11px] font-semibold text-gray-600 dark:text-gray-300">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-600 min-w-0">
                      <span className="font-medium text-gray-600 dark:text-gray-400 truncate">{post.author}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{post.date}</span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLOATING BANNER ──────────────────────────────────────── */}
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.92 }}
            animate={{
              y: isBannerVisible ? 0 : 100,
              opacity: isBannerVisible ? 1 : 0,
              scale: isBannerVisible ? 1 : 0.92,
              pointerEvents: isBannerVisible ? "auto" : "none",
            }}
            exit={{ y: 100, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9, delay: isBannerVisible ? 1.2 : 0 }}
            className="fixed bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-[100] w-[calc(100vw-32px)] sm:w-auto sm:max-w-[640px]"
          >
            <div className="relative flex items-center justify-between bg-[#080808] dark:bg-white text-white dark:text-black rounded-[18px] shadow-[0_20px_60px_rgba(0,0,0,0.35)] p-2 gap-2">
              <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="flex items-center gap-3 min-w-0 flex-1">
                <div className="shrink-0 p-0.5 rounded-[12px]">
                  <Image src="https://i.ibb.co/G4rrPn4n/klein-banner.png" alt="Neuster Beitrag" width={36} height={36} className="w-9 h-9 rounded-[10px] object-cover" />
                </div>
                <div className="flex flex-col min-w-0 pr-1">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40 dark:text-black/40 leading-none mb-0.5">Neuster Beitrag</span>
                  <span className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-1 text-white dark:text-black">
                    {blogPosts[blogPosts.length - 1].title}
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-1 shrink-0">
                <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold px-3.5 py-2 rounded-[10px] bg-white/10 dark:bg-black/8 hover:bg-white/20 dark:hover:bg-black/15 whitespace-nowrap" style={{ transition: "background-color 160ms ease-out" }}>
                  Lesen
                  <svg width="12" height="12" viewBox="0 0 20 20" fill="none"><path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <Link href={`/blog/${blogPosts[blogPosts.length - 1].slug}`} className="sm:hidden flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/10 dark:bg-black/8" aria-label="Lesen">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><path d="M4.167 10h11.666M10.833 5l5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </Link>
                <button type="button" onClick={() => setShowBanner(false)} aria-label="Schließen" className="flex items-center justify-center w-8 h-8 rounded-[10px] text-white/30 dark:text-black/30 hover:text-white dark:hover:text-black hover:bg-white/10 dark:hover:bg-black/8" style={{ transition: "background-color 160ms ease-out, color 160ms ease-out" }}>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="m1.75 1.75 8.5 8.5m0-8.5-8.5 8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
