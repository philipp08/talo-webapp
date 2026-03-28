"use client";

import { useState, useEffect } from "react";
import {
  LayoutGrid, ShieldCheck, Users, Star, MoreHorizontal,
  Clock, CheckCircle, AlertCircle, Plus, ChevronRight,
  Search, FileDown, Settings, Megaphone, X, Calendar, Image as ImageIcon,
  Info
} from "lucide-react";

export type Screen = "dashboard" | "approval" | "members" | "activities" | "more" | "entry";

/* ─── SCREEN: Dashboard (Admin) ──────────────────────────── */
function DashboardScreen({ onNavigate }: { onNavigate: (s: Screen) => void }) {
  return (
    <div className="flex flex-col w-full gap-4 px-4 pt-3 pb-24">
      {/* Hero Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-[15px] font-bold text-white">Hey, Anna 👋</h1>
          <div className="flex items-center gap-1.5">
            <div className="w-[5px] h-[5px] rounded-full bg-white" />
            <span className="text-[10px] text-[#8A8A8A]">TSV Musterstadt</span>
            <span className="text-[10px] text-[#383838]">·</span>
            <span className="text-[10px] text-[#383838]">Fr, 24. Mär</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-[30px] h-[30px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center">
              <Megaphone size={13} className="text-[#8A8A8A]" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-[6px] h-[6px] rounded-full bg-white" />
          </div>
          <div className="w-[26px] h-[26px] rounded-md bg-white flex items-center justify-center">
             <span className="text-[10px] font-black text-black">T</span>
          </div>
        </div>
      </div>

      {/* Stats 2×2 */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "120", label: "MITGLIEDER", icon: <Users size={13} />, color: "#FFFFFF" },
          { value: "8", label: "AUSSTEHEND", icon: <Clock size={13} />, color: "#FF9500" },
          { value: "95", label: "ON TRACK", icon: <CheckCircle size={13} />, color: "#34C759" },
          { value: "25", label: "RÜCKSTAND", icon: <AlertCircle size={13} />, color: "#FF453A" },
        ].map((s, i) => (
          <div key={i} className="rounded-[14px] p-2.5 bg-[#101010] border border-[#242424]">
            <div className="w-[26px] h-[26px] rounded-full flex items-center justify-center mb-1.5" style={{ background: `${s.color}15`, color: s.color }}>
              {s.icon}
            </div>
            <p className="text-[16px] font-bold text-white leading-tight">{s.value}</p>
            <p className="text-[8px] font-semibold tracking-wider text-[#8A8A8A] mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Fortschritt */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-0.5">
          <span className="text-[8px] font-bold tracking-[0.15em] text-[#8A8A8A]">FORTSCHRITT</span>
          <span className="text-[9px] text-[#8A8A8A]">95/120 on track</span>
        </div>
        <div className="rounded-[14px] bg-[#101010] border border-[#242424] overflow-hidden">
          {[
            { name: "Max M.", pts: 68, target: 80, color: "#34C759" },
            { name: "Julia B.", pts: 42, target: 80, color: "#FF9500" },
            { name: "Tom H.", pts: 87, target: 80, color: "#34C759" },
          ].map((m, i) => (
            <div key={i} className="px-3 py-2.5 border-b border-[#242424] last:border-0" onClick={() => onNavigate("members")}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#1A1A1A] border border-[#242424] flex items-center justify-center text-[7px] font-bold text-white">{m.name.substring(0,2).toUpperCase()}</div>
                  <span className="text-[11px] text-white">{m.name}</span>
                </div>
                <span className="text-[11px] font-bold text-white">{m.pts}<span className="text-[#8A8A8A] font-normal">/{m.target}</span></span>
              </div>
              <div className="h-[3px] rounded-full bg-[#1A1A1A] overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min((m.pts / m.target) * 100, 100)}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SCREEN: Approval ──────────────────────────────────── */
function ApprovalScreen() {
  return (
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-24">
      <p className="text-[17px] font-bold text-white">Genehmigung</p>
      <div className="flex items-center gap-1.5 px-0.5">
        <span className="text-[10px]">✋</span>
        <span className="text-[9px] text-[#383838]">Zum Genehmigen klicken</span>
      </div>
      {[
        { name: "Training leiten", user: "Lisa W.", cat: "A", pts: "8.0", date: "23. Mär", catColor: "#FF453A", note: "2h Training U15" },
        { name: "Vereinsfest", user: "Tom H.", cat: "B", pts: "5.0", date: "22. Mär", catColor: "#FFFFFF", note: "" },
        { name: "Hallendienst", user: "Max M.", cat: "C", pts: "2.0", date: "21. Mär", catColor: "#34C759", note: "Sporthalle Ost" },
      ].map((e, i) => (
        <div key={i} className="rounded-[14px] bg-[#101010] border border-[#242424] p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ background: e.catColor }}>{e.cat}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-white truncate">{e.name}</p>
              <p className="text-[10px] text-[#8A8A8A]">{e.user}</p>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold text-white font-mono">{e.pts} Pkt.</p>
              <p className="text-[9px] text-[#8A8A8A]">{e.date}</p>
            </div>
          </div>
          <div className="h-px bg-[#242424]" />
          <div className="flex items-center gap-1">
             <button className="flex-1 py-1 rounded-xl bg-white text-black text-[10px] font-bold">GENEHMIGEN</button>
             <button className="flex-none w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-[#FF453A]"><X size={14} /></button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SCREEN: Members ────────────────────────────────────── */
function MembersScreen() {
  return (
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-24">
      <p className="text-[17px] font-bold text-white">Mitglieder</p>
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-full border border-[#242424]">
        <Search size={12} className="text-[#8A8A8A]" />
        <span className="text-[11px] text-[#383838]">Suchen…</span>
      </div>
      <div className="rounded-[14px] bg-[#101010] border border-[#242424] overflow-hidden">
        {[
          { name: "Anna Weber", role: "Admin", pts: 92, target: 80, badge: "🛡️", color: "#34C759" },
          { name: "Max Mustermann", role: "", pts: 68, target: 80, badge: "", color: "#FF9500" },
          { name: "Sarah Koch", role: "Trainer", pts: 94, target: 80, badge: "🏃", color: "#34C759" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#242424] last:border-0">
            <div className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-[10px] font-bold text-white">
              {m.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1">
               <span className="text-[11px] font-semibold text-white">{m.name}</span>
               <div className="h-[3px] rounded-full bg-[#1A1A1A] overflow-hidden mt-1">
                 <div className="h-full rounded-full" style={{ width: `${Math.min((m.pts / m.target) * 100, 100)}%`, background: m.color }} />
               </div>
            </div>
            <ChevronRight size={10} className="text-[#383838]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN: Activities ─────────────────────────────────── */
function ActivitiesScreen() {
  return (
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-24">
      <p className="text-[17px] font-bold text-white">Tätigkeiten</p>
      <div className="space-y-2">
        {[
          { name: "Training leiten", cat: "A", pts: "8.0", catColor: "#FF453A" },
          { name: "Vereinsfest aufbauen", cat: "B", pts: "5.0", catColor: "#FFFFFF" },
          { name: "Hallendienst", cat: "C", pts: "2.0", catColor: "#34C759" },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 bg-[#101010] border border-[#242424] rounded-2xl">
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ background: a.catColor }}>{a.cat}</span>
            <div className="flex-1 min-w-0">
               <span className="text-[11px] font-semibold text-white">{a.name}</span>
               <p className="text-[9px] text-[#34C759]">{a.pts} Pkt.</p>
            </div>
            <ChevronRight size={10} className="text-[#383838]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN: More ────────────────────────────────────────── */
function MoreScreen() {
  return (
    <div className="flex flex-col w-full gap-4 px-4 pt-3 pb-24">
      <p className="text-[17px] font-bold text-white">Mehr</p>
      <div className="grid grid-cols-1 gap-2">
        {[
          { icon: <FileDown size={18} className="text-[#34C759]" />, title: "Export", desc: "Berichte generieren" },
          { icon: <Settings size={18} className="text-[#8A8A8A]" />, title: "Einstellungen", desc: "App verwalten" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#101010] border border-[#242424]">
            <div className="w-[36px] h-[36px] rounded-xl flex items-center justify-center bg-white/[0.03]">{item.icon}</div>
            <div className="flex-1">
               <p className="text-[12px] font-semibold text-white">{item.title}</p>
               <p className="text-[10px] text-[#8A8A8A]">{item.desc}</p>
            </div>
            <ChevronRight size={10} className="text-[#383838]" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── SCREEN: Entry Form ──────────────────────────────────── */
function EntryScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col w-full px-4 pt-3 h-full pb-24">
       <div className="flex items-center justify-between mb-6">
          <p className="text-[17px] font-bold text-white">Beitrag erfassen</p>
          <button onClick={onBack} className="w-7 h-7 rounded-full bg-[#1A1A1A] flex items-center justify-center">
             <X size={14} className="text-white" />
          </button>
       </div>
       <div className="space-y-4">
          <div className="space-y-1.5">
             <label className="text-[9px] font-bold text-[#8A8A8A] uppercase tracking-widest px-1">Tätigkeit</label>
             <div className="p-3 rounded-2xl bg-[#121212] border border-[#242424] flex items-center justify-between">
                <span className="text-[12px] text-white">Training leiten</span>
                <ChevronRight size={14} className="text-[#383838]" />
             </div>
          </div>
          <div className="space-y-1.5">
             <label className="text-[9px] font-bold text-[#8A8A8A] uppercase tracking-widest px-1">Anhang (optional)</label>
             <div className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-[#242424] bg-[#0c0c0c] flex flex-col items-center justify-center gap-2">
                <ImageIcon size={24} className="text-[#383838]" />
                <span className="text-[11px] text-[#383838]">Foto hochladen</span>
             </div>
          </div>
          <button className="w-full py-3.5 mt-4 rounded-2xl bg-white text-black font-black text-[13px] shadow-xl shadow-white/5">
             EINTRAG ABSENDEN
          </button>
       </div>
    </div>
  );
}

/* ─── TAB CONFIG ─────────────────────────────────────────── */
const tabs: { id: Screen; label: string; icon: any }[] = [
  { id: "dashboard", label: "Home", icon: LayoutGrid },
  { id: "approval", label: "Check", icon: ShieldCheck },
  { id: "members", label: "Team", icon: Users },
  { id: "activities", label: "Aktiv", icon: Star },
  { id: "more", label: "Mehr", icon: MoreHorizontal },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
interface PhoneDemoProps {
  initialScreen?: Screen;
}

export default function PhoneDemo({ initialScreen = "dashboard" }: PhoneDemoProps) {
  const [activeScreen, setActiveScreen] = useState<Screen>(initialScreen);

  useEffect(() => {
    setActiveScreen(initialScreen);
  }, [initialScreen]);

  const renderContent = () => {
    switch (activeScreen) {
      case "dashboard": return <DashboardScreen onNavigate={setActiveScreen} />;
      case "approval": return <ApprovalScreen />;
      case "members": return <MembersScreen />;
      case "activities": return <ActivitiesScreen />;
      case "more": return <MoreScreen />;
      case "entry": return <EntryScreen onBack={() => setActiveScreen("dashboard")} />;
      default: return <DashboardScreen onNavigate={setActiveScreen} />;
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto relative z-10 py-4">
      <div
        className="relative w-[300px] h-[620px] rounded-[48px] p-[10px]"
        style={{
          background: "linear-gradient(160deg, #222 0%, #000 100%)",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div className="w-full h-full rounded-[40px] overflow-hidden relative flex flex-col" style={{ background: "#080808" }}>

          {/* Status bar */}
          <div className="flex-none flex items-center justify-between px-6 pt-5 pb-2 relative z-20">
            <span className="text-[11px] font-bold text-white">9:41</span>
            <div className="w-[80px] h-[22px] rounded-full absolute left-1/2 -translate-x-1/2 top-[10px]" style={{ background: "#000" }} />
            <div className="flex items-center gap-1.5 opacity-60">
              <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M0 8H2V10H0V8ZM4 5H6V10H4V5ZM8 2H10V10H8V2ZM12 0H14V10H12V0Z" fill="white" /></svg>
              <svg width="20" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="white" strokeWidth="0.8"/><rect x="19" y="3" width="1.5" height="4" rx="0.75" fill="white" fillOpacity="0.4"/><rect x="2" y="2" width="12" height="6" rx="1" fill="white"/></svg>
            </div>
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
            <div key={activeScreen} className="transition-all duration-300">
              {renderContent()}
            </div>
          </div>

          {/* FAB only when NOT entry */}
          {activeScreen !== "entry" && (
             <div className="absolute bottom-[88px] right-4 z-40">
                <button 
                  onClick={() => setActiveScreen("entry")}
                  className="group flex items-center gap-2 bg-white text-black pl-3 pr-4 py-2.5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all"
                >
                   <div className="w-5 h-5 rounded-lg bg-black text-white flex items-center justify-center group-hover:bg-[#34C759] transition-colors">
                      <Plus size={12} strokeWidth={4} />
                   </div>
                   <span className="text-[12px] font-black uppercase tracking-tight">Eintragen</span>
                </button>
             </div>
          )}

          {/* Floating Pill Tab Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center bg-[#1A1A1A]/80 backdrop-blur-2xl border border-white/[0.08] px-2 py-1.5 rounded-[24px] z-50 shadow-2xl">
             {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeScreen === tab.id;
                return (
                   <button
                     key={tab.id}
                     onClick={() => setActiveScreen(tab.id)}
                     className={`relative flex flex-col items-center justify-center w-[44px] h-[38px] rounded-[16px] transition-all duration-200 ${
                        isActive ? "bg-white/10 text-white" : "text-[#8A8A8A]"
                     }`}
                   >
                     <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                     <span className={`text-[6px] font-bold uppercase tracking-wider mt-0.5 ${isActive ? "opacity-100" : "opacity-0"}`}>
                        {tab.label}
                     </span>
                   </button>
                );
             })}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[80px] h-[4px] rounded-full bg-white/20 z-50" />
        </div>
      </div>
    </div>
  );
}
