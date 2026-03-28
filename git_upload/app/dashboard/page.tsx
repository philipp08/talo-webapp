"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, calculateTargetPoints } from "@/lib/firebase/models";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, CheckCircle, Clock, BarChart3, Star, Zap, ChevronRight } from "lucide-react";
import { AmbientBackground, GlassSection, TCatBadge, TLine } from "../components/ui/NativeUI";
import Link from "next/link";

const GlassStatCard = ({ label, value, icon: Icon, color, delay }: { label: string; value: string; icon: any; color: string; delay: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
  >
    <GlassSection className="p-5 flex flex-col gap-4 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-3xl rounded-full -mr-12 -mt-12 group-hover:bg-white/10 transition-colors" />
      
      <div className="w-[42px] h-[42px] rounded-full flex items-center justify-center border border-white/10" style={{ background: `${color}15`, color: color }}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
      
      <div className="flex flex-col gap-0.5">
        <p className="text-[28px] font-poppins font-bold text-white leading-none tracking-tight">{value}</p>
        <p className="text-[10px] font-poppins font-bold tracking-[0.15em] text-[#8A8A8A] uppercase">{label}</p>
      </div>
    </GlassSection>
  </motion.div>
);

export default function DashboardPage() {
  const currentMember = useAppStore((state) => state.currentMember);
  const currentClub = useAppStore((state) => state.currentClub);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClub) {
      const unsubscribe = FirebaseManager.listenToEntries(currentClub.id, (allEntries) => {
        const userEntries = allEntries.filter((e) => e.memberId === currentMember?.id);
        setEntries(userEntries.sort((a,b) => (b.date as any).toDate() - (a.date as any).toDate()));
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentClub, currentMember]);

  if (!currentMember || !currentClub) return null;

  const targetPts = calculateTargetPoints(currentMember, currentClub.requiredPoints);
  const approvedPts = entries.filter((e) => e.status === "Genehmigt").reduce((sum, e) => sum + e.points, 0);
  const pendingPts = entries.filter((e) => e.status === "Ausstehend").reduce((sum, e) => sum + e.points, 0);
  
  let progress = targetPts > 0 ? (approvedPts / targetPts) * 100 : 100;
  if (progress > 100) progress = 100;

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 flex flex-col gap-8 p-6 max-w-5xl mx-auto pb-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1.5"
        >
          <h1 className="text-[28px] sm:text-[34px] font-poppins font-bold text-white tracking-tight leading-tight">
            Hey, {currentMember.firstName} 👋
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#34C759] shadow-[0_0_12px_rgba(52,199,89,0.6)]" />
            <p className="text-[#8A8A8A] font-poppins font-bold text-xs uppercase tracking-[0.15em]">
              {currentClub.name} • {new Date().toLocaleDateString("de-DE", { weekday: 'short', day: '2-digit', month: 'short' })}
            </p>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassStatCard label="Punkte" value={approvedPts.toFixed(1)} icon={CheckCircle} color="#34C759" delay={0.1} />
              <GlassStatCard label="Warten" value={pendingPts.toFixed(1)} icon={Clock} color="#FF9500" delay={0.15} />
              <GlassStatCard label="Ziel" value={`${progress.toFixed(0)}%`} icon={Zap} color="#00E0D1" delay={0.2} />
              <GlassStatCard label="Soll" value={targetPts.toFixed(1)} icon={BarChart3} color="#FFFFFF" delay={0.25} />
            </div>

            {/* Letzte Einträge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4"
            >
              <div className="flex items-center justify-between px-1">
                 <h2 className="text-[11px] font-bold tracking-[0.15em] text-[#8A8A8A] uppercase font-poppins">LETZTE EINTRÄGE</h2>
                 <Link href="/dashboard/genehmigungen" className="text-[11px] font-bold text-white/40 hover:text-white transition-colors flex items-center gap-1 uppercase tracking-wider">
                    Alle sehen <ChevronRight size={10} strokeWidth={3} />
                 </Link>
              </div>
              
              <GlassSection>
                {entries.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center opacity-30">
                    <Briefcase size={32} className="mb-4" />
                    <p className="font-poppins text-sm">Noch keine Tätigkeiten eingetragen.</p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {entries.slice(0, 5).map((entry, idx) => (
                      <div key={entry.id}>
                        <div className="flex items-center justify-between p-4 active:bg-white/5 transition-all group">
                          <div className="flex items-center gap-4">
                            <TCatBadge category={entry.activityCategory} size={42} />
                            <div className="flex flex-col">
                              <span className="font-poppins font-semibold text-white text-[15px] leading-tight">{entry.activityName}</span>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-wider">
                                  {new Date(entry.date as any).toLocaleDateString("de-DE")}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/10" />
                                <span className={`text-[11px] font-poppins font-bold uppercase tracking-wider ${
                                  entry.status === "Genehmigt" ? "text-[#34C759]" : entry.status === "Abgelehnt" ? "text-[#FF3B30]" : "text-[#FF9500]"
                                }`}>
                                  {entry.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className="font-mono font-bold text-white text-[15px]">+{entry.points.toFixed(1)}</span>
                             <ChevronRight size={14} className="text-[#383838]" />
                          </div>
                        </div>
                        {idx < entries.slice(0, 5).length - 1 && <TLine className="ml-[72px]" />}
                      </div>
                    ))}
                  </div>
                )}
              </GlassSection>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
