"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid, ShieldCheck, Users, Star, MoreHorizontal,
  Clock, CheckCircle, AlertCircle, Plus, ChevronRight,
  Search, FileDown, Settings, Megaphone, X, Calendar, Image as ImageIcon,
  Info, ClipboardList, Settings2, BarChart3, Share, Trophy, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type Screen = "dashboard" | "approval" | "members" | "activities" | "more" | "announcements" | "entry";

/* ─── UI COMPONENTS (Native Parity) ───────────────────────── */

const Colors = {
  bg: "#080808",
  bgSoft: "#0D0D0D",
  bgCard: "#101010",
  bgMuted: "#1A1A1A",
  teal: "#00E0D1",
  green: "#FFFFFF",
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
      className="absolute -top-[100px] -left-[50px] w-[350px] h-[250px] bg-white/[0.04] rounded-full blur-[90px]"
    />
    <div 
      className="absolute bottom-1/4 -right-[60px] w-[250px] h-[180px] bg-white/[0.02] rounded-full blur-[70px]"
    />
  </div>
);

const GlassSection = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
  <div className={`rounded-[22px] bg-[#101010]/75 backdrop-blur-xl border border-white/[0.08] overflow-hidden ${className}`}>
    {children}
  </div>
);

const TLine = () => <div className="h-[0.5px] bg-[#242424] w-full" />;

const SectionHeader = ({ title, sub }: { title: string, sub?: string }) => (
  <div className="flex items-center justify-between px-1">
    <span className="text-[10px] font-bold text-[#8A8A8A] tracking-[0.18em] uppercase font-poppins">{title}</span>
    {sub && <span className="text-[10px] text-[#444] font-poppins uppercase tracking-widest">{sub}</span>}
  </div>
);

const TCatBadge = ({ cat }: { cat: string }) => {
  const colors: Record<string, string> = {
    "A": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "B": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "C": "bg-orange-500/10 text-orange-400 border-orange-500/20",
    "S": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };
  return (
    <div className={`w-7 h-7 rounded-lg border flex items-center justify-center font-bold text-[13px] ${colors[cat] || "bg-white/10 text-white border-white/10"}`}>
      {cat}
    </div>
  );
};

/* ─── SCREEN: Dashboard (1:1 Native Parity) ───────────────── */
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col w-full gap-7 px-5 pt-4 pb-28 relative z-10">
      
      {/* Hero Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight font-logo">Hey, Philipp 👋</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
            <span className="text-[14px] text-[#8A8A8A] font-medium font-poppins">TSV Musterstadt</span>
            <span className="text-[13px] text-[#222]">·</span>
            <span className="text-[12px] text-[#383838] font-poppins font-bold">28. MÄRZ</span>
          </div>
        </div>
        <button 
           onClick={() => onNavigate("announcements")}
           className="relative w-[42px] h-[42px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center group active:scale-95 transition-all"
        >
          <Megaphone size={16} className="text-white opacity-80" />
          <div className="absolute top-0 right-0 w-[10px] h-[10px] rounded-full bg-white border-2 border-[#080808]" />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3.5">
        {[
          { value: "152", label: "TEILNEHMER", icon: <Users size={16} />, color: "#FFFFFF" },
          { value: "4", label: "AUSSTEHEND", icon: <Clock size={16} />, color: "#FF9500" },
          { value: "118", label: "ON TRACK", icon: <CheckCircle size={16} />, color: "#FFFFFF" },
          { value: "34", label: "RÜCKSTAND", icon: <AlertCircle size={16} />, color: "#FF453A" },
        ].map((s, i) => (
          <div 
            key={i} 
            className="rounded-[22px] p-4 bg-[#101010]/80 border border-white/[0.08] flex flex-col gap-5"
            style={{ boxShadow: 'inset 0 0 20px rgba(255,255,255,0.02)' }}
          >
            <div className="w-[38px] h-[38px] rounded-full flex items-center justify-center" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[26px] font-bold text-white leading-none font-logo">{s.value}</p>
              <p className="text-[9px] font-bold tracking-[0.1em] text-[#8A8A8A] uppercase font-poppins">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Fortschritt Section */}
      <div className="flex flex-col gap-4">
        <SectionHeader title="Top Performer" sub="März 2026" />
        <GlassSection>
          {[
            { name: "Lukas K.", pts: 72, target: 80, color: "#FFFFFF" },
            { name: "Sarah M.", pts: 45, target: 80, color: "#FF9500" },
            { name: "Tom H.", pts: 89, target: 80, color: "#FFFFFF" },
          ].map((m, i) => (
            <div key={i}>
              <div className="px-5 py-[18px] flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-bold text-white/50">
                  {m.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 flex flex-col gap-2">
                   <div className="flex items-center justify-between">
                      <span className="text-[15px] font-bold text-white font-poppins">{m.name}</span>
                      <span className="text-[13px] font-bold text-white font-mono">{m.pts}<span className="text-[#383838] font-normal">/{m.target}</span></span>
                   </div>
                   <div className="h-[4.5px] rounded-full bg-white/[0.04] overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((m.pts / m.target) * 100, 100)}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full" 
                        style={{ background: m.color }} 
                      />
                   </div>
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

/* ─── SCREEN: Approval (Native ApprovalView Alignment) ─────── */
function ApprovalScreen() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-8 pb-32 text-center relative z-10">
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }} 
         className="flex flex-col items-center gap-10"
       >
          <div className="relative">
             <div className="absolute inset-0 bg-green-500/20 rounded-full blur-2xl animate-pulse" />
             <div className="w-[100px] h-[100px] rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center relative">
                <CheckCircle size={48} className="text-[#FFFFFF]" strokeWidth={1.5} />
             </div>
          </div>
          <div className="flex flex-col gap-3">
             <h2 className="text-[24px] font-bold text-white font-poppins tracking-tight">Alles erledigt!</h2>
             <p className="text-[15px] text-[#8A8A8A] font-medium leading-relaxed max-w-[200px] mx-auto">
                Keine ausstehenden Einträge zur Genehmigung vorhanden.
             </p>
          </div>
       </motion.div>
    </div>
  );
}

/* ─── SCREEN: Members (Leaderboard Podium) ────────────────── */
function MembersScreen() {
  return (
    <div className="flex flex-col w-full gap-7 px-5 pt-4 pb-28 relative z-10">
       <div className="flex items-end justify-between px-1">
          <h1 className="text-[26px] font-bold text-white leading-tight tracking-tight font-logo">Rangliste</h1>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
             <Trophy size={12} className="text-yellow-500" />
             <span className="text-[11px] font-bold text-white/60">Top 10</span>
          </div>
       </div>

       {/* Podium */}
       <div className="flex items-end justify-center gap-3 pt-6 pb-2">
          {/* Rank 2 */}
          <div className="flex flex-col items-center gap-3 w-[84px]">
             <div className="w-12 h-12 rounded-full border-2 border-slate-400 p-[2px]">
                <div className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div className="w-full h-20 bg-slate-400/10 border border-slate-400/20 rounded-t-2xl relative flex items-start justify-center pt-3">
                <span className="text-[18px]">🥈</span>
             </div>
          </div>
          {/* Rank 1 */}
          <div className="flex flex-col items-center gap-3 w-[96px]">
             <div className="w-16 h-16 rounded-full border-2 border-yellow-500 p-[2px]">
                <div className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div className="w-full h-32 bg-yellow-500/10 border border-yellow-500/20 rounded-t-2xl relative flex items-start justify-center pt-4">
                <span className="text-[24px]">🥇</span>
             </div>
          </div>
          {/* Rank 3 */}
          <div className="flex flex-col items-center gap-3 w-[84px]">
             <div className="w-12 h-12 rounded-full border-2 border-amber-800 p-[2px]">
                <div className="w-full h-full rounded-full bg-white/10" />
             </div>
             <div className="w-full h-16 bg-amber-800/10 border border-amber-800/20 rounded-t-2xl relative flex items-start justify-center pt-3">
                <span className="text-[18px]">🥉</span>
             </div>
          </div>
       </div>

       <GlassSection>
          {[
            { rank: 4, name: "Maria S.", pts: "62.5", color: "#FFFFFF" },
            { rank: 5, name: "David L.", pts: "58.0", color: "#FFFFFF" },
            { rank: 6, name: "Elena V.", pts: "54.2", color: "#FFFFFF" },
          ].map((m, i) => (
             <div key={i}>
                <div className="px-5 py-4 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <span className="text-[13px] font-mono text-[#383838] w-4">#{m.rank}</span>
                      <div className="w-9 h-9 rounded-full bg-white/5 border border-white/5" />
                      <span className="text-[15px] font-bold text-white font-poppins">{m.name}</span>
                   </div>
                   <span className="text-[15px] font-bold text-[#FFFFFF] font-mono">{m.pts}</span>
                </div>
                {i < 2 && <TLine />}
             </div>
          ))}
       </GlassSection>
    </div>
  );
}

/* ─── SCREEN: Activities (List + Filters) ─────────────────── */
function ActivitiesScreen() {
  return (
    <div className="flex flex-col w-full gap-5 px-5 pt-4 pb-28 relative z-10">
       <div className="flex items-center justify-between px-1">
          <h1 className="text-[26px] font-bold text-white font-logo">Aktivitäten</h1>
          <button className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
             <Plus size={20} className="text-white opacity-60" />
          </button>
       </div>

       {/* Category Pills */}
       <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {["Alle", "Kat. A", "Kat. B", "Kat. C", "Kat. S"].map((cat, i) => (
             <div key={i} className={`px-4 py-2 rounded-full border whitespace-nowrap text-[11px] font-bold uppercase tracking-widest ${i === 0 ? "bg-white text-black border-white" : "bg-white/5 border-white/10 text-white/40"}`}>
                {cat}
             </div>
          ))}
       </div>

       <GlassSection>
          {[
            { cat: "A", title: "Trainingsleitung", sub: "1.5 Pkt / Std.", count: 24 },
            { cat: "B", title: "Wettkampfhilfe", sub: "2.5 Pkt / Event", count: 8 },
            { cat: "S", title: "Vorstandssitzung", sub: "5.0 Pkt / Sitzung", count: 2 },
            { cat: "C", title: "Materialpflege", sub: "1.0 Pkt / Std.", count: 12 },
          ].map((a, i) => (
             <div key={i}>
                <div className="p-5 flex items-center gap-4">
                   <TCatBadge cat={a.cat} />
                   <div className="flex-1 flex flex-col gap-0.5">
                      <span className="text-[15px] font-bold text-white font-poppins">{a.title}</span>
                      <span className="text-[11px] text-[#8A8A8A] font-poppins">{a.sub}</span>
                   </div>
                   <ChevronRight size={14} className="text-[#383838]" />
                </div>
                {i < 3 && <TLine />}
             </div>
          ))}
       </GlassSection>
    </div>
  );
}

/* ─── SCREEN: Announcements (Native Card style) ────────────── */
function AnnouncementsScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col w-full h-full bg-[#080808] relative z-20">
       <div className="px-5 pt-4 pb-6 flex items-center gap-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#8A8A8A]">
             <ChevronRight size={20} className="rotate-180" />
          </button>
          <h1 className="text-[22px] font-bold text-white font-poppins">Ankündigungen</h1>
       </div>

       <div className="flex-1 px-5 flex flex-col gap-6">
          <SectionHeader title="WICHTIG" />
          <div className="rounded-[24px] p-6 bg-yellow-500/[0.03] border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.05)] relative overflow-hidden">
             <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-white/10" />
                <div className="flex flex-col">
                   <span className="text-[14px] font-bold text-white font-poppins">Philipp Wolf</span>
                   <span className="text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest">VORSTAND</span>
                </div>
             </div>
             <p className="text-[15px] text-white leading-relaxed font-poppins font-medium">
                Herzliche Einladung zur außerordentlichen Mitgliederversammlung am kommenden Freitag. Wir besprechen die neuen Förderanträge.
             </p>
             <div className="mt-5 flex items-center justify-between">
                <span className="text-[10px] text-[#383838] font-bold">VOR 2 STD.</span>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                   <Megaphone size={10} className="text-yellow-500" />
                   <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">PINNED</span>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}

/* ─── SCREEN: More (Auth/Profile row style) ────────────────── */
function MoreScreen() {
  return (
    <div className="flex flex-col w-full gap-7 px-5 pt-4 pb-28 relative z-10">
       <h1 className="text-[26px] font-bold text-white font-logo">Mehr</h1>

       {/* Profile Row */}
       <div className="flex items-center gap-4 px-2">
          <div className="w-[60px] h-[60px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center relative">
             <span className="text-[22px] font-logo text-white">PW</span>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-[#242424] flex items-center justify-center text-[12px]">👑</div>
          </div>
          <div className="flex flex-col gap-0.5">
             <span className="text-[18px] font-bold text-white font-poppins">Philipp Wolf</span>
             <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-[0.15em]">ADMINISTRATOR</span>
          </div>
       </div>

       <div className="flex flex-col gap-3">
          {[
            { icon: <BarChart3 size={20} />, title: "Export", sub: "CSV & PDF Berichte", color: "#FFFFFF" },
            { icon: <Settings2 size={20} />, title: "Einstellungen", sub: "App & Account", color: "#8A8A8A" },
            { icon: <Megaphone size={20} />, title: "News", sub: "Letzte Updates", color: "#00E0D1" },
          ].map((item, i) => (
             <div key={i} className="rounded-[20px] p-4 bg-[#101010] border border-white/[0.08] flex items-center gap-4 active:scale-95 transition-all">
                <div className="w-[48px] h-[48px] rounded-[14px] flex items-center justify-center" style={{ background: `${item.color}15`, color: item.color }}>
                   {item.icon}
                </div>
                <div className="flex-1 flex flex-col">
                   <span className="text-[16px] font-bold text-white font-poppins leading-tight">{item.title}</span>
                   <span className="text-[12px] text-[#383838] font-poppins">{item.sub}</span>
                </div>
                <ChevronRight size={14} className="text-[#222]" />
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
        className="relative w-[300px] h-[640px] rounded-[52px] p-[10px] overflow-hidden"
        style={{
          background: "linear-gradient(160deg, #222 0%, #000 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 25px 80px -12px rgba(0,0,0,0.8)",
        }}
      >
        <div className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col select-none" style={{ background: Colors.bg }}>
          
          <AmbientBackground />

          {/* iOS Status bar */}
          <div className="flex-none flex items-center justify-between px-8 pt-[14px] pb-2 relative z-30">
            <span className="text-[13px] font-bold text-white font-mono tracking-tighter">9:41</span>
            <div className="w-[84px] h-[24px] rounded-full absolute left-1/2 -translate-x-1/2 top-0 bg-black" />
            <div className="flex items-center gap-1.5 opacity-80">
               <div className="flex items-end gap-[1.5px] h-[10px]">
                  {[1,2,3,4].map(i => <div key={i} className="w-[3px] bg-white rounded-[1px]" style={{ height: `${i*2.5}px`, opacity: i > 2 ? 0.3 : 1 }} />)}
               </div>
               <div className="w-[18px] h-[9px] rounded-[2.5px] border border-white opacity-30 relative bg-white/10" />
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScreen}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
                className="h-full"
              >
                {activeScreen === "dashboard" && <DashboardScreen onNavigate={setActiveScreen} />}
                {activeScreen === "approval" && <ApprovalScreen />}
                {activeScreen === "members" && <MembersScreen />}
                {activeScreen === "activities" && <ActivitiesScreen />}
                {activeScreen === "more" && <MoreScreen />}
                {activeScreen === "announcements" && <AnnouncementsScreen onBack={() => setActiveScreen("dashboard")} />}
                {activeScreen === "entry" && (
                   <div className="p-8 h-full flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                         <Plus size={32} className="text-white opacity-40" />
                      </div>
                      <h3 className="text-xl font-bold text-white font-poppins mb-2">Beitrag erfassen</h3>
                      <p className="text-sm text-[#8A8A8A] font-poppins">Simuliertes Formular</p>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Native Style Tab Bar (1:1 Parity) */}
          <div className="absolute bottom-0 left-0 right-0 h-[84px] bg-[#0c0c0c]/85 backdrop-blur-3xl border-t border-white/[0.05] flex items-start justify-between px-6 pt-3 z-[60]">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeScreen === tab.id;
                return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveScreen(tab.id as Screen)}
                     className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-12 ${isActive ? "text-white" : "text-[#8A8A8A] active:scale-90"}`}
                   >
                     <Icon size={isActive ? 21 : 19} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[9.5px] font-bold tracking-tight font-poppins uppercase ${isActive ? "opacity-100" : "opacity-40"}`}>{tab.label}</span>
                   </button>
                );
             })}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[100px] h-[4px] rounded-full bg-white opacity-10 z-[70]" />
        </div>
      </div>
    </div>
  );
}
