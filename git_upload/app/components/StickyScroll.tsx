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

const stickyItems: StickyItem[] = [
  {
    id: "erfassung",
    label: "Schnelle Erfassung",
    title: "Beiträge einreichen in Sekunden.",
    description: "Mitglieder erfassen ihr Engagement direkt über die mobile App. Ob Training, Event oder Vorstandsarbeit – ein kurzes Foto vom Protokoll oder ein Text genügen. Talo übernimmt die Klassifizierung.",
    icon: <Zap className="w-5 h-5" />,
    accent: "#10b981",
    visual: (
      <div className="w-full h-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center p-8 lg:p-12">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="w-full max-w-[260px] bg-white dark:bg-[#0c0c0c] rounded-[32px] shadow-2xl border border-emerald-100 dark:border-emerald-500/10 p-6 space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
          <div className="flex items-center justify-between">
            <div className="h-2 w-12 bg-gray-100 dark:bg-white/5 rounded-full" />
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-10 w-full bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/5 px-3 flex items-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">Kategorie wählen...</div>
            <div className="h-24 w-full bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center text-gray-300">
               <Zap className="w-6 h-6 mb-2 opacity-20" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Foto hochladen</span>
            </div>
          </div>
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="h-12 w-full bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xs font-black tracking-[0.2em] shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            EINREICHEN
          </motion.div>
        </motion.div>
      </div>
    )
  },
  {
    id: "pruefung",
    label: "Intelligente Prüfung",
    title: "Der Admin-Assistent in der Cloud.",
    description: "Talo scannt eingereichte Beiträge auf Plausibilität. Überschneidungen werden markiert, Punkte automatisch berechnet. Du behältst die volle Kontrolle ohne den manuellen Aufwand.",
    icon: <ShieldCheck className="w-5 h-5" />,
    accent: "#3b82f6",
    visual: (
      <div className="w-full h-full bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-[380px] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-500/10 overflow-hidden">
          <div className="bg-gray-50/50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5 p-4 flex items-center justify-between">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">Live Check</div>
          </div>
          <div className="p-5 space-y-4">
             {[
               { name: "M. Weber", pts: "15 Pkt", status: "ok" },
               { name: "S. Schneider", pts: "125 Pkt", status: "warning" },
               { name: "T. Meyer", pts: "10 Pkt", status: "ok" }
             ].map((u, i) => (
               <div key={i} className="flex items-center gap-4 p-3 rounded-2xl border border-gray-50 dark:border-white/5 group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                 <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-gray-400">{u.name[0]}</div>
                 <div className="flex-1">
                   <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">{u.name}</div>
                   <div className="text-[10px] text-gray-400">{u.pts} • Training</div>
                 </div>
                 <div className={`w-2 h-2 rounded-full ${u.status === 'ok' ? 'bg-emerald-500' : 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'}`} />
               </div>
             ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "genehmigung",
    label: "Trainer Dashboard",
    title: "Mit einem Swipe alles erledigt.",
    description: "Trainer und Fachleiter erhalten Push-Benachrichtigungen und können Beiträge direkt im mobilen Dashboard freigeben. Transparenz für alle Beteiligten.",
    icon: <LayoutDashboard className="w-5 h-5" />,
    accent: "#8b5cf6",
    visual: (
      <div className="w-full h-full bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center p-8 lg:p-12">
        <div className="relative scale-75 sm:scale-90 lg:scale-100 origin-center flex items-center justify-center">
           {/* Phone Frame */}
           <div className="w-[200px] h-[360px] bg-white dark:bg-[#0c0c0c] rounded-[38px] border-[2px] border-gray-900 dark:border-[#222] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] overflow-hidden relative flex flex-col">
              {/* Status Bar / Notch */}
              <div className="h-7 w-full flex items-center justify-center px-4 relative">
                 <div className="w-20 h-4 bg-gray-900 rounded-b-2xl absolute top-0" />
                 <div className="flex justify-between w-full mt-1">
                    <div className="text-[8px] font-bold">9:41</div>
                    <div className="flex gap-1">
                       <div className="w-2 h-2 rounded-full border-[0.5px] border-current opacity-40" />
                       <div className="w-2 h-2 rounded-sm bg-current opacity-40" />
                    </div>
                 </div>
              </div>

              {/* App Header */}
              <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="w-8 h-2 bg-gray-100 dark:bg-white/5 rounded-full" />
                <LayoutDashboard className="w-3 h-3 text-purple-500" />
              </div>

              {/* Feed */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {[
                  { name: "P. Müller", val: "2.5h", col: "bg-emerald-500", task: "Training" },
                  { name: "L. Schmidt", val: "1.0h", col: "bg-purple-500", task: "Event" },
                  { name: "K. Weber", val: "4.0h", col: "bg-emerald-500", task: "Vorstand" }
                ].map((req, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-[10px] font-bold dark:text-white">{req.name}</span>
                       <span className="text-[9px] font-medium text-emerald-500">{req.val}</span>
                    </div>
                    <div className="text-[8px] text-gray-400 mb-3">{req.task}</div>
                    <div className="flex gap-2">
                       <div className="h-7 flex-1 bg-emerald-500 text-white text-[7px] font-black flex items-center justify-center rounded-lg shadow-sm shadow-emerald-500/20 uppercase tracking-tighter">Approve</div>
                       <div className="h-7 w-10 bg-gray-50 dark:bg-white/10 flex items-center justify-center rounded-lg border border-gray-100 dark:border-white/5">
                          <X className="w-2.5 h-2.5 text-gray-400" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Bottom Nav */}
              <div className="h-12 border-t border-gray-100 dark:border-white/5 flex items-center justify-around px-4">
                 <div className="w-6 h-1 bg-gray-200 dark:bg-white/10 rounded-full" />
              </div>
           </div>

           {/* Floating Badge */}
           <div className="absolute -right-8 top-1/4 p-3 bg-white dark:bg-[#111] rounded-2xl shadow-xl border border-gray-100 dark:border-white/5 scale-90">
              <div className="flex items-center gap-2 mb-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <div className="h-1.5 w-12 bg-gray-100 dark:bg-white/5 rounded-full" />
              </div>
              <div className="h-1 w-16 bg-gray-50 dark:bg-white/5 rounded-full" />
           </div>
        </div>
      </div>
    )
  },
  {
    id: "abrechnung",
    label: "Exports & Buchhaltung",
    title: "Am Saisonende tiefenentspannt.",
    description: "Kein Zettelchaos mehr. Talo generiert fertige Listen für die Buchhaltung, exportiert CSV-Dateien für die Mitgliederverwaltung und berechnet automatisierte Berichte.",
    icon: <FileOutput className="w-5 h-5" />,
    accent: "#f43f5e",
    visual: (
      <div className="w-full h-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-[340px] sm:max-w-none bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl border border-rose-100 dark:border-rose-500/10 p-5 sm:p-8">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4 min-w-0">
                 <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0">
                    <FileOutput className="w-6 h-6" />
                 </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">Jahresbericht_2024.pdf</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-widest truncate">Saisonabschluss • 4.2 MB</div>
                  </div>
              </div>
              <div className="w-8 h-8 rounded-full border border-gray-100 dark:border-white/5 flex items-center justify-center shrink-0">
                 <ArrowRight className="w-4 h-4 text-gray-400" />
              </div>
           </div>
           <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-2">
                   <div className="h-1 bg-rose-200 dark:bg-rose-500/20 rounded-full w-full" />
                   <div className="h-1 bg-rose-50 dark:bg-rose-500/5 rounded-full w-2/3" />
                   <div className="h-1 bg-rose-50 dark:bg-rose-500/5 rounded-full w-3/4" />
                </div>
              ))}
           </div>
           <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 rounded-full" />
              <div className="h-9 px-4 bg-gray-950 dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center text-[10px] font-black italic tracking-widest">DOWNLOAD</div>
           </div>
        </div>
      </div>
    )
  }
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
