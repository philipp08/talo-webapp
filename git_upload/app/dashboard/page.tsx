"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, TrainingAnnouncement, calculateTargetPoints } from "@/lib/firebase/models";
import { motion } from "framer-motion";
import {
  CheckCircle, Clock, BarChart3, Zap,
  ChevronRight, ArrowUpRight, Calendar,
  Bell, PenLine, Pin, Megaphone
} from "lucide-react";
import { GlassSection, TCatBadge, TLine, TAvatar, TStatusBadge } from "@/app/components/ui/NativeUI";
import Link from "next/link";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, color, subtext, delay,
}: {
  label: string; value: string; icon: any; color: string; subtext?: string; delay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
    <div
      className="p-6 rounded-[28px] flex flex-col gap-5 relative overflow-hidden group cursor-default h-full transition-all hover:border-white/10"
      style={{ background: "#0C0C0C", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      {/* Glow blob */}
      <div className="absolute top-0 right-0 w-28 h-28 rounded-full -mr-14 -mt-14 transition-colors"
           style={{ background: `${color}10`, filter: "blur(40px)" }} />

      <div className="flex items-center justify-between relative z-10">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center"
             style={{ background: `${color}12`, color }}>
          <Icon size={22} strokeWidth={2.2} />
        </div>
      </div>

      <div className="flex flex-col gap-0.5 relative z-10">
        <p className="text-[34px] font-poppins font-bold text-white leading-none tracking-tight">{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#555" }}>{label}</p>
        {subtext && <p className="text-[10px] font-bold mt-1.5" style={{ color: "#383838" }}>{subtext}</p>}
      </div>
    </div>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub   = useAppStore((s) => s.currentClub);

  const [entries,       setEntries]       = useState<Entry[]>([]);
  const [announcements, setAnnouncements] = useState<TrainingAnnouncement[]>([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    if (!currentClub) return;
    const u1 = FirebaseManager.listenToEntries(currentClub.id, (all) => {
      const mine = all
        .filter((e) => e.memberId === currentMember?.id)
        .sort((a, b) => {
          const t1 = a.date instanceof Date ? a.date.getTime() : 0;
          const t2 = b.date instanceof Date ? b.date.getTime() : 0;
          return t2 - t1;
        });
      setEntries(mine);
      setLoading(false);
    });
    const u2 = FirebaseManager.listenToAnnouncements(currentClub.id, setAnnouncements);
    return () => { u1(); u2(); };
  }, [currentClub, currentMember]);

  if (!currentMember || !currentClub) return null;

  const targetPts  = calculateTargetPoints(currentMember, currentClub.requiredPoints);
  const approved   = entries.filter((e) => e.status === "Genehmigt").reduce((s, e) => s + e.points, 0);
  const pending    = entries.filter((e) => e.status === "Ausstehend").reduce((s, e) => s + e.points, 0);
  const progress   = targetPts > 0 ? Math.min((approved / targetPts) * 100, 100) : 100;
  const remaining  = Math.max(targetPts - approved, 0);

  const isAdmin = currentMember.isAdmin;

  // Top 3 announcements (pinned first)
  const topAnnouncements = [...announcements]
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    .slice(0, 3);

  return (
    <div className="relative min-h-screen" style={{ background: "#080808" }}>
      <div className="relative z-10 p-6 flex flex-col gap-10 max-w-[1400px] mx-auto">

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-poppins font-black text-white tracking-tighter">Dashboard</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name} · Dein Überblick</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 animate-spin rounded-full border-[3px] border-white/5 border-t-white" />
          </div>
        ) : (
          <>
            {/* ── Stats ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Bestätigte Punkte" value={approved.toFixed(1)} icon={CheckCircle} color="#34C759" delay={0.05} subtext="Erfolgreich verbucht" />
              <StatCard label="Warteschlange"     value={pending.toFixed(1)}  icon={Clock}        color="#FF9500" delay={0.10} subtext="In Prüfung" />
              <StatCard label="Soll-Erfüllung"    value={`${progress.toFixed(0)}%`} icon={Zap}   color="#FFFFFF" delay={0.15} subtext={`${remaining.toFixed(1)} Pkt. verbleibend`} />
              <StatCard label="Jahresziel"        value={targetPts.toFixed(1)} icon={BarChart3}  color="#E87AA0" delay={0.20} subtext={`Ziel ${new Date().getFullYear()}`} />
            </div>

            {/* ── Progress bar ────────────────────────────────────── */}
            <div className="flex flex-col gap-2 -mt-4">
              <div className="flex items-center justify-between text-[11px] font-poppins font-bold uppercase tracking-widest px-1"
                   style={{ color: "#555" }}>
                <span>Fortschritt</span>
                <span style={{ color: progress >= 100 ? "#34C759" : "#8A8A8A" }}>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: progress >= 100 ? "#34C759" : "rgba(255,255,255,0.6)" }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                />
              </div>
            </div>

            {/* ── Two-column layout ───────────────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

              {/* LEFT: Activity log */}
              <div className="xl:col-span-2 flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3"
                     style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <div>
                    <h2 className="text-[20px] font-poppins font-bold text-white">Aktivitätsverlauf</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#555" }}>
                      Deine letzten 10 Einträge
                    </p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/dashboard/genehmigungen"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:border-white/20"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#8A8A8A" }}
                    >
                      Genehmigungen <ArrowUpRight size={12} />
                    </Link>
                  )}
                </div>

                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-[32px]"
                       style={{ background: "#0C0C0C", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                         style={{ background: "rgba(255,255,255,0.04)" }}>
                      <PenLine size={22} style={{ color: "#383838" }} />
                    </div>
                    <p className="font-poppins font-bold text-white text-[16px] mb-1">Kein Verlauf</p>
                    <p className="text-[13px] mb-6" style={{ color: "#555" }}>Erfasse deine erste Tätigkeit.</p>
                    <Link
                      href="/dashboard/eintragen"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins font-semibold text-[13px] text-black bg-white hover:bg-white/90 transition-all"
                    >
                      <PenLine size={14} /> Jetzt eintragen
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {entries.slice(0, 10).map((entry, idx) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * idx }}
                        className="flex items-center gap-4 p-4 rounded-[22px] group transition-all cursor-default"
                        style={{ background: "#0C0C0C", border: "1px solid rgba(255,255,255,0.04)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)")}
                      >
                        <TCatBadge category={entry.activityCategory as string} size={46} />

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-poppins font-semibold text-[15px] text-white truncate">
                              {entry.activityName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={11} style={{ color: "#555" }} />
                            <span className="text-[11px]" style={{ color: "#8A8A8A" }}>
                              {entry.date instanceof Date
                                ? entry.date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
                                : "–"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <TStatusBadge status={entry.status as string} />
                          <span className="font-mono font-black text-[18px] text-white">
                            +{entry.points.toFixed(1)}
                          </span>
                          <ChevronRight size={16} style={{ color: "#383838" }} />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* RIGHT: Quick actions + Announcements */}
              <div className="flex flex-col gap-6">

                {/* Quick Actions */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 pl-1 flex items-center h-10"
                     style={{ color: "#555", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    Quick Actions
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/dashboard/eintragen"
                      className="group flex items-center gap-4 p-5 rounded-[26px] bg-white text-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-black flex items-center justify-center text-white transition-transform group-hover:-rotate-6 shrink-0">
                        <PenLine size={20} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-poppins font-black leading-tight uppercase tracking-tight">Eintragen</span>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Tätigkeit erfassen</span>
                      </div>
                    </Link>

                    <Link
                      href="/dashboard/ankuendigungen"
                      className="flex items-center gap-4 p-5 rounded-[26px] transition-all group"
                      style={{ background: "#0C0C0C", border: "1px solid rgba(255,255,255,0.05)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <Megaphone size={20} style={{ color: "#FFFFFF" }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-poppins font-semibold text-white">Ankündigungen</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#555" }}>
                          {announcements.length} Einträge
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Announcements */}
                <div>
                  <div className="flex items-center justify-between mb-4"
                       style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#555" }}>
                      Letzte Ankündigungen
                    </p>
                    <Bell size={13} style={{ color: "#383838" }} />
                  </div>

                  {topAnnouncements.length === 0 ? (
                    <div className="py-8 text-center rounded-[24px]"
                         style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}>
                      <p className="text-[13px] font-poppins" style={{ color: "#555" }}>Keine Ankündigungen</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {topAnnouncements.map((ann) => (
                        <div key={ann.id} className="p-4 rounded-[20px] flex flex-col gap-2"
                             style={{
                               background: ann.isPinned ? "rgba(232,122,160,0.06)" : "rgba(255,255,255,0.02)",
                               border: ann.isPinned ? "1px solid rgba(232,122,160,0.2)" : "1px solid rgba(255,255,255,0.05)",
                             }}>
                          <div className="flex items-center gap-2">
                            {ann.isPinned
                              ? <Pin size={11} style={{ color: "#E87AA0" }} />
                              : <Megaphone size={11} style={{ color: "#555" }} />
                            }
                            <span className="text-[11px] font-poppins font-bold"
                                  style={{ color: ann.isPinned ? "#E87AA0" : "#8A8A8A" }}>
                              {ann.authorName}
                            </span>
                          </div>
                          <p className="text-[13px] font-poppins text-white leading-relaxed line-clamp-2">
                            {ann.message}
                          </p>
                          <p className="text-[10px]" style={{ color: "#555" }}>
                            {ann.createdAt instanceof Date
                              ? ann.createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
                              : ""}
                          </p>
                        </div>
                      ))}
                      <Link
                        href="/dashboard/ankuendigungen"
                        className="text-center text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-full transition-colors"
                        style={{ color: "#555" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#FFFFFF")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#555")}
                      >
                        Alle anzeigen
                      </Link>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
