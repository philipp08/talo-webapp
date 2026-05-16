"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, TrainingAnnouncement, calculateTargetPoints } from "@/lib/firebase/models";
import { motion } from "framer-motion";
import {
  type LucideIcon,
  CheckCircle, Clock, BarChart3, Zap,
  ChevronRight, ArrowUpRight, Calendar,
  Bell, PenLine, Pin, Megaphone
} from "lucide-react";
import { TCatBadge, TStatusBadge } from "@/app/components/ui/NativeUI";
import Link from "next/link";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, color, subtext, delay,
}: {
	  label: string; value: string; icon: LucideIcon; color: string; subtext?: string; delay: number;
}) => (
  <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.5 }}>
    <div
      className="p-6 rounded-[28px] flex flex-col gap-5 relative overflow-hidden group cursor-default h-full transition-all hover:border-black/10"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
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
        <p className="text-[34px] font-poppins font-bold text-[#0A0A0A] leading-none tracking-tight">{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#71717A" }}>{label}</p>
        {subtext && <p className="text-[10px] font-bold mt-1.5" style={{ color: "#B4B4BA" }}>{subtext}</p>}
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

  const targetPts  = calculateTargetPoints(currentMember, currentClub);
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
    <div className="relative min-h-screen" style={{ background: "#FAFAFA" }}>
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Dashboard</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name} · Dein Überblick</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 animate-spin rounded-full border-[3px] border-black/5 border-t-[#0A0A0A]" />
          </div>
        ) : (
          <>
            {/* ── Stats ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <StatCard label="Bestätigte Punkte" value={approved.toFixed(1)} icon={CheckCircle} color="#34C759" delay={0.05} subtext="Erfolgreich verbucht" />
              <StatCard label="Warteschlange"     value={pending.toFixed(1)}  icon={Clock}        color="#FF9500" delay={0.10} subtext="In Prüfung" />
              <StatCard label="Soll-Erfüllung"    value={`${progress.toFixed(0)}%`} icon={Zap}   color="#0A0A0A" delay={0.15} subtext={`${remaining.toFixed(1)} Pkt. verbleibend`} />
              <StatCard label="Jahresziel"        value={targetPts.toFixed(1)} icon={BarChart3}  color="#E87AA0" delay={0.20} subtext={`Ziel ${new Date().getFullYear()}`} />
            </div>

            {/* ── Progress bar ────────────────────────────────────── */}
            <div className="flex flex-col gap-2 -mt-4">
              <div className="flex items-center justify-between text-[11px] font-poppins font-bold uppercase tracking-widest px-1"
                   style={{ color: "#71717A" }}>
                <span>Fortschritt</span>
                <span style={{ color: progress >= 100 ? "#34C759" : "#52525B" }}>{progress.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.06)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: progress >= 100 ? "#34C759" : "rgba(0,0,0,0.6)" }}
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
                     style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div>
                    <h2 className="text-[20px] font-poppins font-bold text-[#0A0A0A]">Aktivitätsverlauf</h2>
                    <p className="text-[11px] font-black uppercase tracking-widest mt-0.5" style={{ color: "#71717A" }}>
                      Deine letzten 10 Einträge
                    </p>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/dashboard/genehmigungen"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:border-black/15"
                      style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.09)", color: "#52525B" }}
                    >
                      Genehmigungen <ArrowUpRight size={12} />
                    </Link>
                  )}
                </div>

                {entries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center rounded-[32px]"
                       style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.05)" }}>
                    <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                         style={{ background: "rgba(0,0,0,0.05)" }}>
                      <PenLine size={22} style={{ color: "#B4B4BA" }} />
                    </div>
                    <p className="font-poppins font-bold text-[#0A0A0A] text-[16px] mb-1">Kein Verlauf</p>
                    <p className="text-[13px] mb-6" style={{ color: "#71717A" }}>Erfasse deine erste Tätigkeit.</p>
                    <Link
                      href="/dashboard/eintragen"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-full font-poppins font-semibold text-[13px] text-white bg-[#0A0A0A] hover:bg-[#0A0A0A]/90 transition-all"
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
                        className="flex items-start sm:items-center gap-3 sm:gap-4 p-4 rounded-[22px] group transition-all cursor-default"
                        style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.05)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.11)")}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)")}
                      >
                        <TCatBadge category={entry.activityCategory as string} size={46} />

                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-poppins font-semibold text-[15px] text-[#0A0A0A] truncate">
                              {entry.activityName}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Calendar size={11} style={{ color: "#71717A" }} />
                            <span className="text-[11px]" style={{ color: "#52525B" }}>
                              {entry.date instanceof Date
                                ? entry.date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
                                : "–"}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0 sm:flex-row sm:items-center sm:gap-3">
                          <TStatusBadge status={entry.status as string} />
                          <span className="font-mono font-black text-[18px] text-[#0A0A0A]">
                            +{entry.points.toFixed(1)}
                          </span>
                          <ChevronRight size={16} style={{ color: "#B4B4BA" }} />
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
                     style={{ color: "#71717A", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    Quick Actions
                  </p>
                  <div className="flex flex-col gap-3">
                    <Link
                      href="/dashboard/eintragen"
                      className="group flex items-center gap-4 p-5 rounded-[26px] bg-[#0A0A0A] text-white hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/5"
                    >
                      <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center text-[#0A0A0A] transition-transform group-hover:-rotate-6 shrink-0">
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
                      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.13)")}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}
                    >
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                           style={{ background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.07)" }}>
                        <Megaphone size={20} style={{ color: "#0A0A0A" }} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[15px] font-poppins font-semibold text-[#0A0A0A]">Ankündigungen</span>
                        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#71717A" }}>
                          {announcements.length} Einträge
                        </span>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Announcements */}
                <div>
                  <div className="flex items-center justify-between mb-4"
                       style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", paddingBottom: "12px" }}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "#71717A" }}>
                      Letzte Ankündigungen
                    </p>
                    <Bell size={13} style={{ color: "#B4B4BA" }} />
                  </div>

                  {topAnnouncements.length === 0 ? (
                    <div className="py-8 text-center rounded-[24px]"
                         style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
                      <p className="text-[13px] font-poppins" style={{ color: "#71717A" }}>Keine Ankündigungen</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      {topAnnouncements.map((ann) => (
                        <div key={ann.id} className="p-4 rounded-[20px] flex flex-col gap-2"
                             style={{
                               background: ann.isPinned ? "rgba(232,122,160,0.06)" : "rgba(0,0,0,0.03)",
                               border: ann.isPinned ? "1px solid rgba(232,122,160,0.2)" : "1px solid rgba(0,0,0,0.06)",
                             }}>
                          <div className="flex items-center gap-2">
                            {ann.isPinned
                              ? <Pin size={11} style={{ color: "#E87AA0" }} />
                              : <Megaphone size={11} style={{ color: "#71717A" }} />
                            }
                            <span className="text-[11px] font-poppins font-bold"
                                  style={{ color: ann.isPinned ? "#E87AA0" : "#52525B" }}>
                              {ann.authorName}
                            </span>
                          </div>
                          <p className="text-[13px] font-poppins text-[#0A0A0A] leading-relaxed line-clamp-2">
                            {ann.message}
                          </p>
                          <p className="text-[10px]" style={{ color: "#71717A" }}>
                            {ann.createdAt instanceof Date
                              ? ann.createdAt.toLocaleDateString("de-DE", { day: "2-digit", month: "short" })
                              : ""}
                          </p>
                        </div>
                      ))}
                      <Link
                        href="/dashboard/ankuendigungen"
                        className="text-center text-[10px] font-black uppercase tracking-[0.2em] py-3 rounded-full transition-colors"
                        style={{ color: "#71717A" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0A0A")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "#71717A")}
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
