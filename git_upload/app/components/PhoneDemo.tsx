"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid, ShieldCheck, Users, Star, MoreHorizontal,
  Clock, CheckCircle, AlertCircle, Plus, ChevronRight,
  Search, FileDown, Settings, Megaphone, X, Calendar, Image as ImageIcon,
  Info, ClipboardList, Settings2, BarChart3, Share
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Screen = "dashboard" | "approval" | "members" | "activities" | "more" | "entry";

/* ─── UI COMPONENTS (Native Parity) ───────────────────────── */

const Colors = {
  bg: "#080808",
  bgSoft: "#0D0D0D",
  bgCard: "#101010",
  bgMuted: "#1A1A1A",
  teal: "#FFFFFF",
  green: "#34C759",
  orange: "#FF9500",
  red: "#FF453A",
  text: "#FFFFFF",
  textSub: "#8A8A8A",
  textMuted: "#383838",
  border: "#242424",
};

const AmbientBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div 
      className="absolute -top-[100px] -left-[50px] w-[300px] h-[200px] bg-white/5 rounded-full blur-[80px]"
      style={{ opacity: 0.6 }}
    />
    <div 
      className="absolute -top-[80px] -right-[60px] w-[250px] h-[180px] bg-white/[0.03] rounded-full blur-[70px]"
      style={{ opacity: 0.4 }}
    />
  </div>
);

const GlassSection = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-[20px] bg-[#101010]/70 backdrop-blur-md border border-white/[0.08] overflow-hidden">
    {children}
  </div>
);

const TLine = () => <div className="h-[1px] bg-[#242424] w-full" />;

const SectionHeader = ({ title, sub }: { title: String, sub?: String }) => (
  <div className="flex items-center justify-between px-1">
    <span className="text-[11px] font-bold text-[#8A8A8A] tracking-[0.15em] uppercase font-poppins">{title}</span>
    {sub && <span className="text-[11px] text-[#8A8A8A] font-poppins">{sub}</span>}
  </div>
);

/* ─── SCREEN: Dashboard (1:1 Native Parity) ───────────────── */
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col w-full gap-7 px-5 pt-4 pb-28 relative z-10">
      
      {/* Hero Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight font-logo">Hey, Anna 👋</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
            <span className="text-[14px] text-[#8A8A8A] font-medium font-poppins">TSV Musterstadt</span>
            <span className="text-[13px] text-[#383838]">·</span>
            <span className="text-[12px] text-[#383838] font-poppins">Fr, 24. Mär</span>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button className="relative w-[38px] h-[38px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center">
            <Megaphone size={15} className="text-[#8A8A8A]" />
            <div className="absolute top-0 right-0 w-[8px] h-[8px] rounded-full bg-white border-2 border-[#080808]" />
          </button>
          <div className="w-[32px] h-[32px] rounded-lg bg-white/10 border border-white/10 flex items-center justify-center">
             <Star size={16} className="text-white opacity-80" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "120", label: "MITGLIEDER", icon: <Users size={15} />, color: "#FFFFFF" },
          { value: "8", label: "AUSSTEHEND", icon: <Clock size={15} />, color: "#FF9500" },
          { value: "95", label: "ON TRACK", icon: <CheckCircle size={15} />, color: "#34C759" },
          { value: "25", label: "RÜCKSTAND", icon: <AlertCircle size={15} />, color: "#FF453A" },
        ].map((s, i) => (
          <div 
            key={i} 
            className="rounded-[18px] p-4 bg-[#101010]/70 backdrop-blur-sm border border-white/[0.08] flex flex-col gap-4"
            style={{
               background: `linear-gradient(135deg, ${s.color}08, transparent)`,
               boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)'
            }}
          >
            <div className="w-[36px] h-[36px] rounded-full flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[26px] font-bold text-white leading-none font-logo">{s.value}</p>
              <p className="text-[11px] font-bold tracking-wider text-[#8A8A8A] uppercase font-poppins">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fortschritt */}
      <div className="flex flex-col gap-3.5">
        <SectionHeader title="FORTSCHRITT" sub="95/120 on track" />
        <GlassSection>
          {[
            { name: "Max M.", pts: 68, target: 80, color: "#34C759" },
            { name: "Julia B.", pts: 42, target: 80, color: "#FF9500" },
            { name: "Tom H.", pts: 87, target: 80, color: "#34C759" },
          ].map((m, i) => (
            <div key={i} className="">
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-[28px] h-[28px] rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white/60">
                      {m.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <span className="text-[14px] font-semibold text-white/90 font-poppins">{m.name}</span>
                  </div>
                  <span className="text-[14px] font-bold text-white font-poppins">{m.pts}<span className="text-[#8A8A8A] font-normal">/{m.target}</span></span>
                </div>
                <div className="h-[4px] rounded-full bg-white/5 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((m.pts / m.target) * 100, 100)}%`, background: m.color }} />
                </div>
              </div>
              {i < 2 && <TLine />}
            </div>
          ))}
        </GlassSection>
      </div>
    </div>
  );
}

/* ─── SCREEN: More (1:1 AdminMehrView Alignment) ────────── */
function MoreScreen() {
  return (
    <div className="flex flex-col w-full gap-7 px-5 pt-4 pb-28 relative z-10">
      
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight font-logo">Mehr</h1>
          <p className="text-[14px] text-[#8A8A8A] font-medium font-poppins">Export & Einstellungen</p>
        </div>
        <div className="w-[44px] h-[44px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center">
             <span className="text-[20px] font-medium font-logo text-white">T</span>
        </div>
      </div>

      {/* Menu Sections (Glass Row style) */}
      <div className="flex flex-col gap-3">
        {[
          { icon: <BarChart3 size={22} />, title: "Export", subtitle: "Berichte & Daten exportieren", accent: "#34C759" },
          { icon: <Settings2 size={22} />, title: "Einstellungen", subtitle: "Profil, Verein & App verwalten", accent: "#8A8A8A" },
        ].map((item, i) => (
          <div 
            key={i} 
            className="rounded-[18px] p-4 bg-[#101010] border border-white/[0.08] flex items-center gap-4 active:bg-white/[0.02] transition-colors"
            style={{
               boxShadow: 'inset 0 0 0 0.5px rgba(255,255,255,0.05)'
            }}
          >
            <div className="w-[52px] h-[52px] rounded-xl flex items-center justify-center" style={{ background: `${item.accent}15`, color: item.accent }}>
              {item.icon}
            </div>
            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
              <span className="text-[16px] font-semibold text-white font-poppins leading-tight">{item.title}</span>
              <span className="text-[12px] text-[#8A8A8A] font-poppins truncate">{item.subtitle}</span>
            </div>
            <ChevronRight size={12} className="text-[#383838]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
const tabs = [
  { id: "dashboard", label: "Home", icon: LayoutGrid },
  { id: "approval", label: "Check", icon: ShieldCheck },
  { id: "members", label: "Team", icon: Users },
  { id: "activities", label: "Aktiv", icon: ClipboardList },
  { id: "more", label: "Mehr", icon: MoreHorizontal },
];

export default function PhoneDemo({ initialScreen = "dashboard" }: { initialScreen?: Screen }) {
  const [activeScreen, setActiveScreen] = useState<Screen>(initialScreen);

  useEffect(() => {
    setActiveScreen(initialScreen);
  }, [initialScreen]);

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative z-10 py-4">
      <div
        className="relative w-[300px] h-[620px] rounded-[48px] p-[10px] overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #222 0%, #000 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="w-full h-full rounded-[40px] overflow-hidden relative flex flex-col" style={{ background: Colors.bg }}>
          
          <AmbientBackground />

          {/* iOS Status bar */}
          <div className="flex-none flex items-center justify-between px-7 pt-5 pb-2 relative z-20">
            <span className="text-[12px] font-bold text-white font-logo tracking-tight">9:41</span>
            <div className="w-[80px] h-[20px] rounded-full absolute left-1/2 -translate-x-1/2 top-[10px] bg-black" />
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="flex items-center gap-[2px]">
                 {[1,2,3,4].map(i => <div key={i} className="w-[3px] h-[10px] bg-white rounded-[1px]" style={{ opacity: i === 4 ? 0.3 : 1, height: 4 + (i*1.5) }} />)}
              </div>
              <div className="w-[20px] h-[10px] rounded-[3px] border border-white opacity-40 relative">
                 <div className="absolute top-[2px] left-[2px] bottom-[2px] w-[60%] bg-white rounded-[1px]" />
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreen}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeScreen === "dashboard" && <DashboardScreen onNavigate={setActiveScreen} />}
                {activeScreen === "more" && <MoreScreen />}
                {["approval", "members", "activities"].includes(activeScreen) && (
                   <div className="flex items-center justify-center h-full text-[#8A8A8A] text-[14px] font-poppins">Coming soon</div>
                )}
                {activeScreen === "entry" && (
                   <div className="p-8 text-center text-white h-full flex flex-col items-center justify-center font-poppins">Eintragsformular</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Native Style Tab Bar (Sticky Bottom, 1:1 Parity) */}
          <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-[#0c0c0c]/80 backdrop-blur-2xl border-t border-white/[0.04] flex items-start justify-between px-6 pt-3 z-50">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeScreen === tab.id;
                return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveScreen(tab.id as Screen)}
                     className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? "text-white" : "text-[#8A8A8A]"}`}
                   >
                     <Icon size={isActive ? 20 : 19} strokeWidth={isActive ? 2.5 : 2} />
                     <span className="text-[10px] font-bold tracking-tight font-poppins">{tab.label}</span>
                   </button>
                );
             })}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] rounded-full bg-white opacity-20 z-[60]" />
        </div>
      </div>
    </div>
  );
}
