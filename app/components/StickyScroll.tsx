"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  FileOutput, 
  ArrowRight,
  LayoutDashboard,
  X
} from "lucide-react";
import Link from "next/link";

interface StickyItem {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
}

export const stickyItems: StickyItem[] = [
  {
    id: "erfassung",
    label: "Schnelle Erfassung",
    title: "Beiträge einreichen in Sekunden.",
    description: "Mitglieder erfassen ihr Engagement direkt über die mobile App. Ob Training, Event oder Vorstandsarbeit – Kategorie wählen, Datum bestätigen, fertig. TALO berechnet die Punkte automatisch aus dem Katalog.",
    icon: <Zap className="w-4 h-4" />,
    accent: "#10b981",
  },
  {
    id: "pruefung",
    label: "Intelligente Prüfung",
    title: "Der Admin-Assistent in der Cloud.",
    description: "Eingereichte Beiträge landen direkt in der Genehmigungsqueue. Punkte werden automatisch berechnet, der Admin sieht alle Details auf einen Blick. Freigeben oder ablehnen – du behältst die volle Kontrolle.",
    icon: <ShieldCheck className="w-4 h-4" />,
    accent: "#3b82f6",
  },
  {
    id: "genehmigung",
    label: "Trainer Dashboard",
    title: "Mit einem Swipe alles erledigt.",
    description: "Trainer und Fachleiter erhalten Push-Benachrichtigungen und können Beiträge direkt im mobilen Dashboard freigeben. Transparenz für alle Beteiligten.",
    icon: <LayoutDashboard className="w-4 h-4" />,
    accent: "#8b5cf6",
  },
  {
    id: "abrechnung",
    label: "Exports & Buchhaltung",
    title: "Am Saisonende tiefenentspannt.",
    description: "Kein Zettelchaos mehr. Alle Mitgliederdaten, Punktelisten und Saisonauswertungen exportierst du per Klick als Excel oder PDF – fertig für die nächste Jahreshauptversammlung.",
    icon: <FileOutput className="w-4 h-4" />,
    accent: "#f43f5e",
  },
];

/* ─── Single section tracker ───────────────────────────────── */
function SectionTracker({ index, onVisible }: { index: number; onVisible: (i: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.6", "end 0.6"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (v > 0 && v < 1) onVisible(index);
  });

  return <div ref={ref} className="absolute inset-0 pointer-events-none" />;
}

export default function StickyScroll() {
  const [activeItem, setActiveItem] = useState(0);

  const scrollToSection = (index: number) => {
    const el = document.querySelectorAll(".sticky-content-section")[index];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-16 py-16 lg:py-32">
      <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 xl:gap-24">

        {/* ─── LEFT SIDEBAR (STICKY) ─── */}
        <div className="hidden lg:block w-[220px] xl:w-[240px] shrink-0">
          <div className="sticky top-[38vh]">
            <div className="relative pl-10 border-l-2 border-gray-100 dark:border-white/[0.06]">

              {/* Animated active indicator on the border */}
              <motion.div
                className="absolute left-[-2px] w-[3px] rounded-full bg-gray-950 dark:bg-white"
                animate={{ top: `${activeItem * 25 + 3}%`, height: "19%" }}
                transition={{ type: "spring", stiffness: 400, damping: 38 }}
              />

              <ul className="space-y-7">
                {stickyItems.map((item, index) => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(index)}
                      className={`flex items-center gap-3.5 w-full text-left outline-none transition-all duration-300 group ${
                        activeItem === index
                          ? "opacity-100 translate-x-1.5"
                          : "opacity-35 hover:opacity-70"
                      }`}
                    >
                      <span className="shrink-0 w-9 h-9 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-400">
                        {item.icon}
                      </span>
                      <span className="text-[12px] font-black tracking-widest uppercase text-gray-700 dark:text-white leading-tight">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ─── RIGHT CONTENT (SCROLLING) ─── */}
        <div className="flex-1 flex flex-col gap-y-16 lg:gap-y-20 min-w-0">
          {stickyItems.map((item, index) => (
            <div
              key={item.id}
              className="sticky-content-section relative flex flex-col min-h-[60vh] lg:min-h-[75vh] justify-center"
            >
              {/* Scroll position tracker */}
              <SectionTracker index={index} onVisible={setActiveItem} />

              {/* Mobile label */}
              <div className="flex items-center gap-3 lg:hidden mb-6">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-600">
                  {item.label}
                </span>
              </div>

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.65, ease: [0.25, 0.4, 0.25, 1] }}
                className="overflow-hidden border border-gray-100 dark:border-white/[0.06] rounded-[2rem] flex flex-col items-center min-h-[340px] text-center bg-gray-50 dark:bg-white/[0.025] min-h-[340px]"
              >
                {/* Text */}
                <div className="p-7 sm:p-12 lg:p-16 flex flex-col justify-center items-center gap-10 text-center w-full h-full my-auto">
                  <div className="max-w-xl mx-auto">
                    <h3 className="text-3xl lg:text-[2rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.2] mb-6">
                      {item.title}
                    </h3>
                    <p className="text-lg lg:text-[19px] text-gray-500 dark:text-[#8A8A8A] leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href="/anmelden"
                    className="inline-flex items-center gap-2 font-bold text-base transition-opacity hover:opacity-60"
                    style={{ color: item.accent }}
                  >
                    Loslegen <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>

                
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
