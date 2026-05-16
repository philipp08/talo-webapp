"use client";

import React from "react";

/* ══════════════════════════════════════════════════════════════════
   1. ACTIVITY FEED PLAYER
   ══════════════════════════════════════════════════════════════════ */
const ACTIVITIES = [
  { initial: "M", name: "Maria Schmidt",  action: "20 Punkte erhalten",    time: "eben",       color: "#6366f1" },
  { initial: "A", name: "Antrag #42",     action: "Zeltlager genehmigt",   time: "vor 1 Min.", color: "#10b981" },
  { initial: "T", name: "Tim Kowalski",   action: "Neu beigetreten",       time: "vor 3 Min.", color: "#3b82f6" },
  { initial: "K", name: "Kassenprüfung",  action: "Dokument geprüft",      time: "vor 5 Min.", color: "#f59e0b" },
];

export function ActivityFeedPlayer() {
  return (
    <div className="w-full bg-white dark:bg-[#111] p-5 flex flex-col font-sans select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Live Aktivitäten</span>
        </div>
        <span className="text-[10px] text-gray-400">Heute</span>
      </div>
      <div className="flex flex-col gap-1">
        {ACTIVITIES.map((act, i) => (
          <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-white/[0.04] last:border-0">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[13px] font-bold"
              style={{ backgroundColor: `${act.color}15`, color: act.color }}
            >
              {act.initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate m-0">{act.name}</p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate m-0">{act.action}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: act.color }} />
              <span className="text-[10px] text-gray-400">{act.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   2. LEADERBOARD PLAYER
   ══════════════════════════════════════════════════════════════════ */
const MEMBERS = [
  { rank: 1, initial: "L", name: "Lisa K.",  points: 28, pct: 100, color: "#f59e0b", icon: "🥇" },
  { rank: 2, initial: "M", name: "Max M.",   points: 23, pct: 82,  color: "#9ca3af", icon: "🥈" },
  { rank: 3, initial: "T", name: "Tim B.",   points: 19, pct: 68,  color: "#cd7c2f", icon: "🥉" },
];

export function LeaderboardPlayer() {
  return (
    <div className="w-full bg-white dark:bg-[#111] p-5 flex flex-col font-sans select-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Top Mitglieder</span>
        <span className="text-[11px] font-bold text-[#6366f1]">70 Pkt.</span>
      </div>
      <div className="flex flex-col gap-2">
        {MEMBERS.map((mem, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <span className="text-sm w-5 text-center shrink-0">{mem.icon}</span>
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[11px] font-bold"
              style={{ backgroundColor: `${mem.color}20`, color: mem.color }}
            >
              {mem.initial}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-white">{mem.name}</span>
                <span className="text-xs font-bold" style={{ color: mem.color }}>{mem.points}</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/[0.06] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r"
                  style={{ 
                    width: `${mem.pct}%`, 
                    backgroundImage: `linear-gradient(to right, ${mem.color}80, ${mem.color})` 
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   3. MAILING PLAYER
   ══════════════════════════════════════════════════════════════════ */
const MAILS = [
  { icon: "📅", subject: "Erinnerung: Vereinsversammlung", to: "An alle 47 Mitglieder", color: "#6366f1" },
  { icon: "✅", subject: "Antrag genehmigt",                to: "An Tim Kowalski",       color: "#10b981" },
  { icon: "⭐", subject: "Punktestand April 2026",          to: "An alle Mitglieder",    color: "#f59e0b" },
];

export function MailingPlayer() {
  return (
    <div className="w-full bg-white dark:bg-[#111] p-5 flex flex-col font-sans select-none">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#6366f1] animate-pulse" />
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Benachrichtigungen</span>
        </div>
        <span className="text-[11px] font-bold text-[#6366f1]">47 gesendet</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {MAILS.map((mail, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.04]"
            style={{ backgroundColor: `${mail.color}05` }}
          >
            <div 
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style={{ backgroundColor: `${mail.color}15` }}
            >
              {mail.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11.5px] font-semibold text-gray-900 dark:text-white truncate m-0">{mail.subject}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate m-0">{mail.to}</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-4 h-4 rounded-full bg-[#10b981] flex items-center justify-center text-[9px] text-white">✓</div>
              <span className="text-[9.5px] font-semibold text-[#10b981]">Gesendet</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   4. ROLES PLAYER
   ══════════════════════════════════════════════════════════════════ */
const ROLES = [
  {
    label: "Vorstand",
    badge: "Admin",
    color: "#6366f1",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: true  },
      { name: "Verwalten",   ok: true  },
    ],
  },
  {
    label: "Übungsleiter",
    badge: "Trainer",
    color: "#f59e0b",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: false },
      { name: "Verwalten",   ok: false },
    ],
  },
  {
    label: "Mitglied",
    badge: "User",
    color: "#9ca3af",
    perms: [
      { name: "Eintragen",   ok: true  },
      { name: "Genehmigen",  ok: false },
      { name: "Verwalten",   ok: false },
    ],
  },
];

export function RolesPlayer() {
  return (
    <div className="w-full bg-white dark:bg-[#111] p-5 flex flex-col font-sans select-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rechtesystem</span>
        <span className="text-[10px] text-gray-400">3 Rollen aktiv</span>
      </div>
      <div className="flex flex-col gap-2.5">
        {ROLES.map((role, i) => (
          <div 
            key={i} 
            className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.04]"
            style={{ backgroundColor: `${role.color}05` }}
          >
            <div className="flex flex-col gap-1 min-w-[90px] shrink-0">
              <span className="text-[11.5px] font-bold text-gray-900 dark:text-white leading-none">{role.label}</span>
              <div>
                <span 
                  className="text-[8.5px] font-bold px-1.5 py-0.5 rounded tracking-wide leading-none"
                  style={{ backgroundColor: `${role.color}18`, color: role.color }}
                >
                  {role.badge}
                </span>
              </div>
            </div>
            <div className="flex gap-4">
              {role.perms.map((p, pi) => (
                <div key={pi} className="flex flex-col items-center gap-1">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                    style={{ 
                      backgroundColor: p.ok ? "#10b981" : "#f3f4f6", 
                      color: p.ok ? "#fff" : "#a1a1aa" 
                    }}
                  >
                    {p.ok ? "✓" : "✕"}
                  </div>
                  <span className="text-[8px] text-gray-400 font-semibold tracking-tight">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   5. EXPORT PLAYER
   ══════════════════════════════════════════════════════════════════ */
const EXPORT_FILES = [
  { icon: "📄", name: "Jahresbericht_2026.pdf",   size: "2.4 MB", color: "#ef4444", ext: "PDF"  },
  { icon: "📊", name: "Punkteübersicht.xlsx",      size: "890 KB", color: "#10b981", ext: "XLSX" },
];

export function ExportPlayer() {
  return (
    <div className="w-full bg-white dark:bg-[#111] p-5 flex flex-col font-sans select-none">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Export</span>
        <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[9.5px] font-bold text-[#10b981]">Abgeschlossen</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {EXPORT_FILES.map((file, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-100 dark:border-white/[0.04] bg-gray-50 dark:bg-white/[0.02]"
          >
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
              style={{ backgroundColor: `${file.color}12` }}
            >
              {file.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate m-0">{file.name}</p>
              <p className="text-[10px] text-gray-400 m-0">{file.size}</p>
            </div>
            <span 
              className="text-[8.5px] font-bold px-2 py-0.5 rounded shrink-0"
              style={{ backgroundColor: `${file.color}15`, color: file.color }}
            >
              {file.ext}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
