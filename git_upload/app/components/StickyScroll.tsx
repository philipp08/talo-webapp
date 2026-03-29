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
  LayoutDashboard
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
    description: "Mitglieder erfassen ihr Engagement direkt über die mobile App. Ob Training, Event oder Vorstandsarbeit – ein Foto vom Protokoll oder ein kurzer Text genügt.",
    icon: <Zap className="w-5 h-5" />,
    accent: "#8A8A8A",
    visual: (
      <div className="w-full h-full bg-[#E4F3E8] dark:bg-[#1A261F] flex items-center justify-center p-12">
        <div className="w-full max-w-[280px] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 p-6 space-y-4">
           <div className="h-4 w-1/3 bg-gray-100 dark:bg-white/5 rounded-full" />
           <div className="h-32 w-full bg-gray-50 dark:bg-white/5 rounded-2xl flex items-center justify-center">
             <Zap className="w-8 h-8 text-[#8A8A8A] opacity-20" />
           </div>
           <div className="flex gap-2">
             <div className="h-8 flex-1 bg-[#8A8A8A] rounded-xl" />
             <div className="h-8 w-8 bg-gray-100 dark:bg-white/5 rounded-xl" />
           </div>
        </div>
      </div>
    )
  },
  {
    id: "pruefung",
    label: "Intelligente Prüfung",
    title: "Der Admin-Assistent in der Cloud.",
    description: "Talo scannt eingereichte Beiträge auf Plausibilität. Überschneidungen werden markiert, Punkte automatisch berechnet. Du behältst die volle Kontrolle ohne den manuellen Aufwand.",
    icon: <ShieldCheck className="w-5 h-5" />,
    accent: "#3B82F6",
    visual: (
      <div className="w-full h-full bg-[#DEE7FF] dark:bg-[#1A1F2E] flex items-center justify-center p-12">
        <div className="w-full max-w-[340px] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div className="h-4 w-24 bg-gray-100 dark:bg-white/5 rounded-full" />
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-500/20" />
          </div>
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 dark:border-white/5">
                 <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex-shrink-0" />
                 <div className="h-3 flex-1 bg-gray-50 dark:bg-white/5 rounded-full" />
                 <CheckCircle2 className="w-4 h-4 text-[#8A8A8A]" />
               </div>
             ))}
          </div>
        </div>
      </div>
    )
  },
  {
    id: "genehmigung",
    label: "Einfache Genehmigung",
    title: "Mit einem Tap alles erledigt.",
    description: "Trainer und Fachleiter erhalten Push-Benachrichtigungen und können Beiträge direkt im Dashboard oder per App freigeben. Transparenz für alle Beteiligten.",
    icon: <CheckCircle2 className="w-5 h-5" />,
    accent: "#8A8A8A",
    visual: (
      <div className="w-full h-full bg-[#FCE7F3] dark:bg-[#2E1A23] flex items-center justify-center p-12">
        <div className="relative">
           <div className="w-[180px] h-[360px] bg-white dark:bg-[#0c0c0c] rounded-[40px] border-[6px] border-gray-900 dark:border-[#222] shadow-2xl p-4 overflow-hidden">
              <div className="h-5 w-1/2 bg-gray-100 dark:bg-white/5 rounded-full mb-8 mt-4 mx-auto" />
              <div className="space-y-4">
                <div className="h-24 w-full bg-pink-50 dark:bg-pink-500/10 rounded-2xl flex items-center justify-center">
                   <MousePointer2 className="w-6 h-6 text-[#8A8A8A]" />
                </div>
                <div className="h-8 w-full bg-[#8A8A8A] rounded-xl text-white text-[10px] flex items-center justify-center font-bold">GENEHMIGEN</div>
              </div>
           </div>
        </div>
      </div>
    )
  },
  {
    id: "abrechnung",
    label: "Automatisierte Abrechnung",
    title: "Exports auf Knopfdruck.",
    description: "Kein Zettelchaos am Saisonende. Talo generiert fertige Listen für die Buchhaltung, exportiert CSV-Dateien für die Mitgliederverwaltung und berechnet Belastungen automatisch.",
    icon: <FileOutput className="w-5 h-5" />,
    accent: "#A855F7",
    visual: (
      <div className="w-full h-full bg-[#F0EBFF] dark:bg-[#211D2E] flex items-center justify-center p-12">
        <div className="w-full max-w-[400px] bg-white dark:bg-[#0c0c0c] rounded-3xl shadow-2xl border border-gray-100 dark:border-white/5 p-8 flex flex-col gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                 <FileOutput className="w-6 h-6 text-[#A855F7]" />
              </div>
              <div className="flex-1">
                 <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded-full mb-2" />
                 <div className="h-2 w-24 bg-gray-50 dark:bg-white/5 rounded-full" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-3">
              <div className="h-20 bg-gray-50 dark:bg-white/5 rounded-2xl" />
              <div className="h-20 bg-gray-50 dark:bg-white/5 rounded-2xl" />
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
      <div className="flex flex-col col-span-12 lg:col-start-9 gap-y-20 lg:gap-y-40">
        {stickyItems.map((item, index) => (
          <div 
            key={item.id} 
            className="sticky-content-section flex flex-col min-h-[50vh] lg:min-h-screen justify-center transition-opacity duration-500"
            style={{ opacity: 1 }} // Managed by global scroll highlight but could add more refined opacity
          >
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="flex items-center gap-4 lg:hidden mb-8">
               <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                  {item.icon}
               </div>
               <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">{item.label}</span>
            </div>

            {/* Layout Box */}
            <div className="bg-gray-50 dark:bg-white/1 overflow-hidden border border-gray-100 dark:border-white/5 rounded-[2.5rem] lg:grid lg:grid-cols-2 items-stretch h-full min-h-[400px]">
              {/* Text Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-between">
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
                  className="inline-flex items-center gap-2 font-medium mt-10 lg:mt-0 transition-opacity hover:opacity-70"
                  style={{ color: item.accent }}
                >
                  Loslegen <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Visual Side */}
              <div className="h-64 lg:h-auto overflow-hidden relative">
                {item.visual}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
