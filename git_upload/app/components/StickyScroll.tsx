"use client";

import { useState, useRef } from "react";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  FileOutput, 
  ArrowRight,
  MousePointer2,
  Cpu,
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
   visual: React.ReactNode;
  accent: string;
}

/* ─── Shared visual wrapper ─────────────────────────────────────── */
function VisualCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full h-full flex items-center justify-center p-6 bg-[#f5f5f5] dark:bg-[#0d0d0d]">
      <div className="w-full max-w-[300px] bg-white dark:bg-[#111] rounded-[22px] border border-gray-100 dark:border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.4)] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

function CardHeader({ label, accent, icon }: { label: string; accent: string; icon: React.ReactNode }) {
  return (
    <div className="px-5 py-3.5 border-b border-gray-50 dark:border-white/[0.04] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: `${accent}18`, color: accent }}>
          <span className="scale-75">{icon}</span>
        </span>
        <span className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-600">{label}</span>
      </div>
      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accent }} />
    </div>
  );
}

export const stickyItems: StickyItem[] = [
  {
    id: "erfassung",
    label: "Schnelle Erfassung",
    title: "Beiträge einreichen in Sekunden.",
    description: "Mitglieder erfassen ihr Engagement direkt über die mobile App. Ob Training, Event oder Vorstandsarbeit – ein kurzes Foto vom Protokoll oder ein Text genügen. Talo übernimmt die Klassifizierung.",
    icon: <Zap className="w-4 h-4" />,
    accent: "#10b981",
    visual: (
      <VisualCard>
        <CardHeader label="Schnelle Erfassung" accent="#10b981" icon={<Zap className="w-4 h-4" />} />
        <div className="p-5 space-y-3">
          <div className="h-9 w-full bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 px-3 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 font-medium">Training • 15 Pkt.</span>
            <div className="w-4 h-4 rounded border border-gray-200 dark:border-white/10 flex items-center justify-center">
              <svg width="8" height="5" viewBox="0 0 8 5" fill="none"><path d="M1 1l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" className="text-gray-300 dark:text-gray-600"/></svg>
            </div>
          </div>
          <div className="h-16 w-full bg-gray-50 dark:bg-white/5 rounded-xl border border-dashed border-gray-200 dark:border-white/10 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-gray-200 dark:text-white/10" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-300 dark:text-gray-700">Beschreibung</span>
          </div>
          <div className="h-10 w-full rounded-xl flex items-center justify-center text-white text-[11px] font-black tracking-[0.18em]" style={{ backgroundColor: "#10b981" }}>
            EINREICHEN
          </div>
        </div>
      </VisualCard>
    ),
  },
  {
    id: "pruefung",
    label: "Intelligente Prüfung",
    title: "Der Admin-Assistent in der Cloud.",
    description: "Talo scannt eingereichte Beiträge auf Plausibilität. Überschneidungen werden markiert, Punkte automatisch berechnet. Du behältst die volle Kontrolle ohne den manuellen Aufwand.",
    icon: <ShieldCheck className="w-4 h-4" />,
    accent: "#3b82f6",
    visual: (
      <VisualCard>
        <CardHeader label="Intelligente Prüfung" accent="#3b82f6" icon={<ShieldCheck className="w-4 h-4" />} />
        <div className="p-4 space-y-2">
          {[
            { name: "M. Weber", pts: "15 Pkt", type: "Training", ok: true },
            { name: "S. Schneider", pts: "125 Pkt", type: "Vorstand", ok: false },
            { name: "T. Meyer", pts: "10 Pkt", type: "Event", ok: true },
          ].map((u, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                {u.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold text-gray-900 dark:text-white leading-none mb-0.5">{u.name}</div>
                <div className="text-[10px] text-gray-400">{u.pts} · {u.type}</div>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${u.ok ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
            </div>
          ))}
        </div>
      </VisualCard>
    ),
  },
  {
    id: "genehmigung",
    label: "Trainer Dashboard",
    title: "Mit einem Swipe alles erledigt.",
    description: "Trainer und Fachleiter erhalten Push-Benachrichtigungen und können Beiträge direkt im mobilen Dashboard freigeben. Transparenz für alle Beteiligten.",
    icon: <LayoutDashboard className="w-4 h-4" />,
    accent: "#8b5cf6",
    visual: (
      <VisualCard>
        <CardHeader label="Trainer Dashboard" accent="#8b5cf6" icon={<LayoutDashboard className="w-4 h-4" />} />
        <div className="p-4 space-y-2">
          {[
            { name: "P. Müller", task: "Training", val: "2.5 h" },
            { name: "L. Schmidt", task: "Event", val: "1.0 h" },
            { name: "K. Weber", task: "Vorstand", val: "4.0 h" },
          ].map((req, i) => (
            <div key={i} className="px-3 py-2.5 rounded-xl border border-gray-50 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[9px] font-bold text-gray-400">{req.name[0]}</div>
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white">{req.name}</span>
                </div>
                <span className="text-[10px] text-gray-400">{req.task} · {req.val}</span>
              </div>
              <div className="flex gap-1.5">
                <div className="h-6 flex-1 rounded-lg flex items-center justify-center text-white text-[9px] font-black tracking-wide" style={{ backgroundColor: "#8b5cf6" }}>
                  Freigeben
                </div>
                <div className="h-6 w-8 rounded-lg border border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 flex items-center justify-center">
                  <X className="w-2.5 h-2.5 text-gray-300 dark:text-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </VisualCard>
    ),
  },
  {
    id: "abrechnung",
    label: "Exports & Buchhaltung",
    title: "Am Saisonende tiefenentspannt.",
    description: "Kein Zettelchaos mehr. Talo generiert fertige Listen für die Buchhaltung, exportiert CSV-Dateien für die Mitgliederverwaltung und berechnet automatisierte Berichte.",
    icon: <FileOutput className="w-4 h-4" />,
    accent: "#f43f5e",
    visual: (
      <VisualCard>
        <CardHeader label="Exports & Buchhaltung" accent="#f43f5e" icon={<FileOutput className="w-4 h-4" />} />
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Mitglieder", val: "148" },
              { label: "Punkte", val: "12.4k" },
              { label: "Stunden", val: "3.2k" },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 dark:bg-white/[0.03] rounded-xl px-3 py-2.5 text-center border border-gray-100 dark:border-white/[0.04]">
                <div className="text-[13px] font-bold text-gray-950 dark:text-white leading-none">{s.val}</div>
                <div className="text-[9px] text-gray-400 uppercase tracking-widest font-bold mt-1">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.02] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#f43f5e18" }}>
              <FileOutput className="w-4 h-4" style={{ color: "#f43f5e" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-bold text-gray-900 dark:text-white truncate">Jahresbericht_2024.pdf</div>
              <div className="text-[9px] text-gray-400 tracking-wide">4.2 MB · bereit</div>
            </div>
            <div className="shrink-0 h-7 px-3 rounded-lg flex items-center justify-center text-white text-[9px] font-black tracking-widest" style={{ backgroundColor: "#f43f5e" }}>
              PDF
            </div>
          </div>
        </div>
      </VisualCard>
    ),
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
                className="overflow-hidden border border-gray-100 dark:border-white/[0.06] rounded-[2rem] sm:grid sm:grid-cols-2 items-stretch bg-gray-50 dark:bg-white/[0.025] min-h-[340px]"
              >
                {/* Text */}
                <div className="p-7 sm:p-9 lg:p-12 flex flex-col justify-between gap-8">
                  <div>
                    <h3 className="text-2xl lg:text-[1.75rem] font-medium tracking-tight text-gray-900 dark:text-white leading-[1.2] mb-5">
                      {item.title}
                    </h3>
                    <p className="text-base lg:text-[17px] text-gray-500 dark:text-[#8A8A8A] leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                  <Link
                    href="/anmelden"
                    className="inline-flex items-center gap-2 font-bold text-sm transition-opacity hover:opacity-60"
                    style={{ color: item.accent }}
                  >
                    Loslegen <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Visual */}
                <div className="h-72 sm:h-auto overflow-hidden relative">
                  {item.visual}
                </div>
              </motion.div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
