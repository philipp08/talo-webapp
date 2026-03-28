"use client";

import { useState } from "react";
import {
  LayoutGrid, ShieldCheck, Users, Star, MoreHorizontal,
  Clock, CheckCircle, AlertCircle, Plus, ChevronRight,
  Search, Trophy, Settings, FileDown, Megaphone
} from "lucide-react";

type Screen = "dashboard" | "approval" | "members" | "activities" | "more";

/* ─── SCREEN: Dashboard (Admin) ──────────────────────────── */
function DashboardScreen() {
  return (
    <div className="flex flex-col w-full gap-4 px-4 pt-3 pb-6">
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
          <img src="/talo-logo.png" alt="Talo" className="w-[26px] h-[26px] rounded-md" />
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
            <div key={i} className="px-3 py-2.5 border-b border-[#242424] last:border-0">
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

      {/* Letzte Einträge */}
      <div className="flex flex-col gap-2">
        <span className="text-[8px] font-bold tracking-[0.15em] text-[#8A8A8A] px-0.5">LETZTE EINTRÄGE</span>
        <div className="rounded-[14px] bg-[#101010] border border-[#242424] overflow-hidden">
          {[
            { name: "Kinder trainieren", user: "Sarah K.", cat: "A", points: "+8", status: "pending", catColor: "#FF453A" },
            { name: "Fahrdienst C-Jugend", user: "Max M.", cat: "C", points: "+2", status: "approved", catColor: "#34C759" },
          ].map((e, i) => (
            <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-[#242424] last:border-0">
              <div className="flex items-center gap-2">
                <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ background: e.catColor }}>{e.cat}</span>
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-white">{e.name}</span>
                  <span className="text-[9px] text-[#8A8A8A]">{e.user}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-[11px] font-bold" style={{ color: e.status === "approved" ? "#34C759" : "#FF9500" }}>{e.points}</span>
                <div className="flex items-center gap-1 rounded-full px-1.5 py-[1px]" style={{ background: e.status === "approved" ? "rgba(52,199,89,0.1)" : "rgba(255,149,0,0.1)" }}>
                  <div className="w-[3px] h-[3px] rounded-full" style={{ background: e.status === "approved" ? "#34C759" : "#FF9500" }} />
                  <span className="text-[7px] font-bold" style={{ color: e.status === "approved" ? "#34C759" : "#FF9500" }}>{e.status === "approved" ? "Genehmigt" : "Ausstehend"}</span>
                </div>
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
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-6">
      <p className="text-[17px] font-bold text-white">Genehmigung</p>
      <div className="flex items-center gap-1.5 px-0.5">
        <span className="text-[10px] text-[#383838]">✋</span>
        <span className="text-[9px] text-[#383838]">Rechts wischen = genehmigen · Links = ablehnen</span>
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
          {e.note && (
            <div className="flex items-start gap-1.5">
              <span className="text-[9px] text-[#383838] mt-0.5">💬</span>
              <span className="text-[10px] text-[#8A8A8A]">{e.note}</span>
            </div>
          )}
          <div className="h-px bg-[#242424]" />
          <div className="flex items-center gap-1">
            <button className="flex-none text-[9px] font-semibold text-[#8A8A8A] px-2 py-1 rounded-full bg-[#1A1A1A] border border-[#242424]">✏️ Bearb.</button>
            <div className="flex-1" />
            <button className="flex-none text-[9px] font-semibold text-[#FF453A] px-2 py-1 rounded-full border" style={{ background: "rgba(255,69,58,0.1)", borderColor: "rgba(255,69,58,0.25)" }}>✕ Ablehnen</button>
            <button className="flex-none text-[9px] font-semibold text-[#080C14] px-2 py-1 rounded-full bg-white">✓ OK</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── SCREEN: Members ────────────────────────────────────── */
function MembersScreen() {
  return (
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-6">
      <p className="text-[17px] font-bold text-white">Mitglieder</p>
      {/* Segment */}
      <div className="flex gap-1 p-1 bg-[#1A1A1A] rounded-full">
        <div className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-full bg-white text-[#080808]">Liste</div>
        <div className="flex-1 text-center text-[11px] font-semibold py-1.5 rounded-full text-[#8A8A8A]">Rangliste</div>
      </div>
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-full border border-[#242424]">
        <Search size={12} className="text-[#8A8A8A]" />
        <span className="text-[11px] text-[#383838]">Suchen…</span>
      </div>
      {/* Section */}
      <span className="text-[8px] font-bold tracking-[0.15em] text-[#8A8A8A] px-0.5">AKTIVE MITGLIEDER · 8</span>
      <div className="rounded-[14px] bg-[#101010] border border-[#242424] overflow-hidden">
        {[
          { name: "Anna Weber", role: "Admin", pts: 92, target: 80, badge: "🛡️", color: "#34C759" },
          { name: "Max Mustermann", role: "", pts: 68, target: 80, badge: "", color: "#FF9500" },
          { name: "Sarah Koch", role: "Trainer", pts: 94, target: 80, badge: "🏃", color: "#34C759" },
          { name: "Tom Huber", role: "", pts: 87, target: 80, badge: "", color: "#34C759" },
          { name: "Julia Berger", role: "", pts: 42, target: 80, badge: "", color: "#FF453A" },
        ].map((m, i) => (
          <div key={i} className="flex items-center gap-2.5 px-3 py-2.5 border-b border-[#242424] last:border-0">
            <div className="w-[32px] h-[32px] rounded-full bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] flex items-center justify-center text-[10px] font-bold text-white">
              {m.name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-white truncate">{m.name}</span>
                {m.badge && <span className="text-[8px]">{m.badge}</span>}
              </div>
              <div className="h-[3px] rounded-full bg-[#1A1A1A] overflow-hidden mt-1">
                <div className="h-full rounded-full" style={{ width: `${Math.min((m.pts / m.target) * 100, 100)}%`, background: m.color }} />
              </div>
            </div>
            <span className="text-[11px] font-bold font-mono" style={{ color: m.color }}>{m.pts.toFixed(1)}</span>
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
    <div className="flex flex-col w-full gap-3 px-4 pt-3 pb-6">
      <p className="text-[17px] font-bold text-white">Tätigkeiten</p>
      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#1A1A1A] rounded-full border border-[#242424]">
        <Search size={12} className="text-[#8A8A8A]" />
        <span className="text-[11px] text-[#383838]">Tätigkeit suchen…</span>
      </div>
      {/* Filters */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          { label: "Alle", active: true },
          { label: "Hauptverantwortung", active: false },
          { label: "Mitarbeit", active: false },
          { label: "Unterstützung", active: false },
        ].map((f, i) => (
          <span key={i} className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full whitespace-nowrap border" style={{
            background: f.active ? "linear-gradient(135deg, #fff, #C8D0E0)" : "#1A1A1A",
            color: f.active ? "#080C14" : "#8A8A8A",
            borderColor: f.active ? "transparent" : "#242424",
          }}>{f.label}</span>
        ))}
      </div>
      <div className="h-px bg-[#242424]" />
      {/* List */}
      <div className="flex flex-col">
        {[
          { name: "Training leiten", cat: "A", pts: "8.0", catColor: "#FF453A", desc: "Hauptverantwortung" },
          { name: "Vereinsfest aufbauen", cat: "B", pts: "5.0", catColor: "#FFFFFF", desc: "Mitarbeit" },
          { name: "Hallendienst", cat: "C", pts: "2.0", catColor: "#34C759", desc: "Unterstützung" },
          { name: "Fahrdienst", cat: "C", pts: "2.0", catColor: "#34C759", desc: "Unterstützung" },
          { name: "Saisonhelfer", cat: "S", pts: "4.0", catColor: "#FF9500", desc: "Saisonal" },
        ].map((a, i) => (
          <div key={i} className="flex items-center gap-2.5 px-1 py-2.5 border-b border-[#242424] last:border-0">
            <span className="w-[22px] h-[22px] rounded-md flex items-center justify-center text-[9px] font-black text-white" style={{ background: a.catColor }}>{a.cat}</span>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-semibold text-white">{a.name}</span>
              <p className="text-[9px] text-[#8A8A8A]">{a.desc}</p>
            </div>
            <span className="text-[11px] font-bold text-white font-mono">{a.pts}</span>
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
    <div className="flex flex-col w-full gap-4 px-4 pt-3 pb-6">
      <div>
        <p className="text-[17px] font-bold text-white">Mehr</p>
        <p className="text-[11px] text-[#8A8A8A]">Export & Einstellungen</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0" />
        <img src="/talo-logo.png" alt="T" className="w-[36px] h-[36px] rounded-xl border border-[#242424]" />
      </div>
      {[
        { icon: <FileDown size={18} className="text-[#34C759]" />, title: "Export", desc: "Berichte & Daten exportieren", color: "#34C759" },
        { icon: <Settings size={18} className="text-[#8A8A8A]" />, title: "Einstellungen", desc: "Profil, Verein & App verwalten", color: "#8A8A8A" },
      ].map((item, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-[14px] bg-[#101010] border border-[#242424]">
          <div className="w-[40px] h-[40px] rounded-xl flex items-center justify-center" style={{ background: `${item.color}15` }}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white">{item.title}</p>
            <p className="text-[10px] text-[#8A8A8A]">{item.desc}</p>
          </div>
          <ChevronRight size={10} className="text-[#383838]" />
        </div>
      ))}
    </div>
  );
}

/* ─── TAB CONFIG ─────────────────────────────────────────── */
const tabs: { id: Screen; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Home", icon: <LayoutGrid size={18} /> },
  { id: "approval", label: "Genehmigung", icon: <ShieldCheck size={18} /> },
  { id: "members", label: "Mitglieder", icon: <Users size={18} /> },
  { id: "activities", label: "Tätigkeiten", icon: <Star size={18} /> },
  { id: "more", label: "Mehr", icon: <MoreHorizontal size={18} /> },
];

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function PhoneDemo() {
  const [activeScreen, setActiveScreen] = useState<Screen>("dashboard");

  const screenComponents: Record<Screen, React.ReactNode> = {
    dashboard: <DashboardScreen />,
    approval: <ApprovalScreen />,
    members: <MembersScreen />,
    activities: <ActivitiesScreen />,
    more: <MoreScreen />,
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8 w-full max-w-md mx-auto relative z-10">
      {/* Phone mockup */}
      <div className="relative scale-[0.92] sm:scale-100">
        {/* Glow */}
        <div className="absolute inset-0 rounded-[48px] blur-3xl opacity-[0.06] scale-90 animate-pulse-glow" style={{ background: "#ffffff" }} />

        {/* Phone shell */}
        <div
          className="relative w-[300px] h-[620px] rounded-[48px] p-[6px]"
          style={{
            background: "linear-gradient(160deg, #3A3A3A 0%, #1A1A1A 40%, #000 100%)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px -12px rgba(0,0,0,0.8)",
          }}
        >
          <div className="w-full h-full rounded-[42px] overflow-hidden relative flex flex-col" style={{ background: "#080808" }}>

            {/* Status bar */}
            <div className="flex-none flex items-center justify-between px-6 pt-3 pb-1 relative z-20">
              <span className="text-[11px] font-semibold text-white">9:41</span>
              <div className="w-[90px] h-[24px] rounded-full absolute left-1/2 -translate-x-1/2 top-[6px]" style={{ background: "#000" }} />
              <div className="flex items-center gap-1.5">
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M0 8H2V10H0V8ZM4 5H6V10H4V5ZM8 2H10V10H8V2ZM12 0H14V10H12V0Z" fill="white" /></svg>
                <svg width="13" height="9" viewBox="0 0 16 12" fill="none"><path d="M8 1C5.5 1 3.2 2 1.5 3.7L2.9 5.1C4.3 3.6 6.1 2.7 8 2.7C9.9 2.7 11.7 3.6 13.1 5.1L14.5 3.7C12.8 2 10.5 1 8 1Z" fill="white"/><path d="M4 7L5.4 8.4C6.1 7.7 7 7.3 8 7.3C9 7.3 9.9 7.7 10.6 8.4L12 7C10.9 5.9 9.5 5.3 8 5.3C6.5 5.3 5.1 5.9 4 7Z" fill="white"/><circle cx="8" cy="10.5" r="1.2" fill="white"/></svg>
                <svg width="20" height="10" viewBox="0 0 22 10" fill="none"><rect x="0.5" y="0.5" width="18" height="9" rx="2" stroke="white" strokeWidth="0.8"/><rect x="19" y="3" width="1.5" height="4" rx="0.75" fill="white" fillOpacity="0.4"/><rect x="2" y="2" width="12" height="6" rx="1" fill="white"/></svg>
              </div>
            </div>

            {/* Screen content – scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar relative z-10">
              <div key={activeScreen} className="screen-transition">
                {screenComponents[activeScreen]}
              </div>
            </div>

            {/* FAB (only on dashboard) */}
            {activeScreen === "dashboard" && (
              <div className="absolute bottom-[72px] right-3 z-30">
                <button className="flex items-center gap-1.5 bg-white text-[#080808] px-4 py-2.5 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.4)]">
                  <Plus size={14} strokeWidth={3} />
                  <span className="text-[12px] font-bold">Eintragen</span>
                </button>
              </div>
            )}

            {/* Tab bar */}
            <div className="flex-none h-[62px] bg-[rgba(8,8,8,0.92)] backdrop-blur-xl border-t border-[#242424] flex items-start justify-evenly pt-2 relative z-30">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveScreen(tab.id)}
                  className="flex flex-col items-center gap-[2px] transition-colors duration-150"
                  style={{ color: activeScreen === tab.id ? "#FFFFFF" : "#8A8A8A" }}
                >
                  {tab.icon}
                  <span className="text-[8px] font-medium">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Home indicator */}
            <div className="flex-none flex justify-center pb-1.5 bg-[rgba(8,8,8,0.92)] relative z-30">
              <div className="w-[100px] h-[4px] rounded-full" style={{ background: "rgba(255,255,255,0.6)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="text-[13px] text-[#8A8A8A]">Ansicht: Administrator (iOS)</p>
    </div>
  );
}
