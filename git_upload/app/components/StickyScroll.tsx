"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
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

export default function StickyScroll() {
  const [activeItem, setActiveItem] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position to update active index
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const itemCount = stickyItems.length;
    const index = Math.min(Math.floor(latest * itemCount), itemCount - 1);
    setActiveItem(Math.max(0, index));
  });

  const scrollToSection = (index: number) => {
    const sections = containerRef.current?.querySelectorAll(".sticky-content-section");
    if (sections && sections[index]) {
      sections[index].scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <section 
      ref={containerRef}
      className="max-w-7xl mx-auto px-5 sm:px-10 lg:px-20 py-20 lg:py-40 flex flex-col lg:grid lg:grid-cols-20 gap-x-10 relative"
    >
      {/* ─── LEFT SIDEBAR (STICKY) ─── */}
      <div className="hidden lg:flex flex-col col-span-7 h-screen sticky top-0 justify-center">
        <div className="relative pl-12 border-l border-gray-100 dark:border-white/5">
          {/* Moving Indicator */}
          <motion.div 
            className="absolute left-[-1.5px] w-[3px] bg-black dark:bg-white rounded-full z-10"
            animate={{ 
              top: `${(activeItem / stickyItems.length) * 100 + (100 / stickyItems.length / 4)}%`,
              height: `${100 / stickyItems.length / 2}%`
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />

          <ul className="space-y-6">
            {stickyItems.map((item, index) => (
              <li key={item.id}>
                <button
                  onClick={() => scrollToSection(index)}
                  className={`flex items-center gap-4 transition-all duration-300 outline-none text-left group ${
                    activeItem === index ? "opacity-100 translate-x-2" : "opacity-40 hover:opacity-100"
                  }`}
                >
                  <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center transition-colors group-hover:border-gray-300 dark:group-hover:border-white/20">
                    {item.icon}
                  </span>
                  <span className="text-sm font-bold tracking-tight uppercase">
                    {item.label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ─── RIGHT CONTENT (SCROLLING) ─── */}
      <div className="flex flex-col col-span-12 lg:col-start-9 gap-y-20 lg:gap-y-24">
        {stickyItems.map((item, index) => (
          <div 
            key={item.id} 
            className="sticky-content-section flex flex-col min-h-[50vh] lg:min-h-[70vh] justify-center transition-opacity duration-500"
            style={{ opacity: 1 }}
          >
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="flex items-center gap-4 lg:hidden mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                  {item.icon}
               </div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">{item.label}</span>
            </div>

            {/* Layout Box */}
            <div className="bg-gray-50 dark:bg-white/1 overflow-hidden border border-gray-100 dark:border-white/5 rounded-[2.5rem] sm:grid sm:grid-cols-2 items-stretch h-full min-h-[340px]">
              {/* Text Side */}
              <div className="p-6 sm:p-8 lg:p-12 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl lg:text-3xl font-medium tracking-tight text-gray-900 dark:text-white leading-tight mb-6">
                    {item.title}
                  </h3>
                  <p className="text-base lg:text-lg text-gray-500 dark:text-[#8A8A8A] leading-relaxed">
                    {item.description}
                  </p>
                </div>
                
                <Link 
                  href="/anmelden"
                  className="inline-flex items-center gap-2 font-medium mt-6 sm:mt-10 lg:mt-0 transition-opacity hover:opacity-70"
                  style={{ color: item.accent }}
                >
                  Loslegen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Visual Side */}
              <div className="h-80 sm:h-auto overflow-hidden relative">
                {item.visual}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
