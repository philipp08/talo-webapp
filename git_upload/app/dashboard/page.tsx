"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, calculateTargetPoints } from "@/lib/firebase/models";
import { motion } from "framer-motion";
import { 
  Briefcase, CheckCircle, Clock, BarChart3, Star, Zap, 
  ChevronRight, ArrowUpRight, TrendingUp, Calendar,
  Bell, Plus, Search
} from "lucide-react";
import { AmbientBackground, GlassSection, TCatBadge, TLine } from "@/app/components/ui/NativeUI";
import Link from "next/link";

const DesktopStatCard = ({ label, value, icon: Icon, color, delay, subtext }: { label: string; value: string; icon: any; color: string; delay: number; subtext?: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    className="h-full"
  >
    <div className="bg-[#0c0c0c] border border-white/[0.03] rounded-[32px] p-8 flex flex-col gap-6 relative overflow-hidden group hover:border-white/10 transition-all cursor-default">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-white/5 transition-colors" />
      
      <div className="flex items-center justify-between relative z-10">
        <div className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center border border-white/5" style={{ background: `${color}08`, color: color }}>
          <Icon size={24} strokeWidth={2.2} />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white bg-white/10 px-3 py-1.5 rounded-full">
           <TrendingUp size={12} />
           <span>+12%</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-1 relative z-10">
        <p className="text-[36px] font-poppins font-bold text-white leading-none tracking-tight">{value}</p>
        <p className="text-[11px] font-poppins font-black tracking-[0.2em] text-gray-500 uppercase">{label}</p>
        {subtext && <p className="text-[10px] text-gray-700 font-bold uppercase mt-2">{subtext}</p>}
      </div>
    </div>
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
        const sorted = [...userEntries].sort((a, b) => {
          const t1 = a.date instanceof Date ? a.date.getTime() : 0;
          const t2 = b.date instanceof Date ? b.date.getTime() : 0;
          return t2 - t1;
        });
        setEntries(sorted);
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
    <div className="relative min-h-screen bg-[#080808]">
      <div className="relative z-10 flex flex-col gap-12 max-w-[1600px] mx-auto py-12">
        
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/5 border-t-white" />
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            
            {/* 1. STATS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-1">
              <DesktopStatCard 
                 label="Bestätigte Punkte" 
                 value={approvedPts.toFixed(1)} 
                 icon={CheckCircle} 
                 color="#FFFFFF" 
                 delay={0.1} 
                 subtext="Erfolgreich verbucht"
              />
              <DesktopStatCard 
                 label="Warteschlange" 
                 value={pendingPts.toFixed(1)} 
                 icon={Clock} 
                 color="#8A8A8A" 
                 delay={0.15} 
                 subtext="In Prüfung durch Admin"
              />
              <DesktopStatCard 
                 label="Soll-Erfüllung" 
                 value={`${progress.toFixed(0)}%`} 
                 icon={Zap} 
                 color="#FFFFFF" 
                 delay={0.2} 
                 subtext={`${targetPts - approvedPts > 0 ? (targetPts - approvedPts).toFixed(1) : 0} Pkt. verbleibend`}
              />
              <DesktopStatCard 
                 label="Jahresziel" 
                 value={targetPts.toFixed(1)} 
                 icon={BarChart3} 
                 color="#FFFFFF" 
                 delay={0.25} 
                 subtext="Soll für 2024"
              />
            </div>

            {/* 2. MAIN CONTENT AREA: TWO COLUMNS */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
               
               {/* LEFT: ACTIVITY & LOGS */}
               <div className="xl:col-span-2 space-y-10">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                     <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-poppins font-bold text-white">Aktivitätsverlauf</h2>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest pl-1">Deine letzten 10 Tätigkeiten</p>
                     </div>
                     <Link href="/dashboard/genehmigungen" className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-white transition-all uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                        Vollständige Liste <ArrowUpRight size={14} />
                     </Link>
                  </div>

                  <div className="space-y-4">
                    {entries.length === 0 ? (
                      <div className="bg-[#0c0c0c] rounded-[40px] p-24 text-center border border-white/5 opacity-40">
                         <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={24} />
                         </div>
                         <h3 className="text-lg font-bold text-white mb-2 underline decoration-white/10 underline-offset-8 decoration-2">Kein Verlauf</h3>
                         <p className="text-sm font-medium">Starte jetzt und erfasse deine erste Tätigkeit.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3">
                        {entries.slice(0, 10).map((entry, idx) => (
                          <motion.div 
                            key={entry.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="bg-[#0c0c0c] hover:bg-white/[0.03] border border-white/[0.03] rounded-[28px] p-6 pr-10 flex items-center justify-between group transition-all"
                          >
                             <div className="flex items-center gap-6">
                                <div className="relative">
                                   <TCatBadge category={entry.activityCategory} size={52} />
                                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-[#0c0c0c] flex items-center justify-center ${
                                      entry.status === "Genehmigt" ? "bg-white" : entry.status === "Abgelehnt" ? "bg-gray-800" : "bg-gray-500"
                                   }`}>
                                      {entry.status === "Genehmigt" ? <CheckCircle size={10} className="text-black" /> : <Clock size={10} className="text-white" />}
                                   </div>
                                </div>
                                
                                <div className="flex flex-col gap-1">
                                   <div className="flex items-center gap-3">
                                      <span className="text-lg font-poppins font-bold text-white group-hover:underline decoration-white/20 underline-offset-4">{entry.activityName}</span>
                                      <span className="text-[9px] font-black bg-white/5 px-2.5 py-1 rounded-md text-gray-500 uppercase tracking-widest">{entry.activityCategory}</span>
                                   </div>
                                   <div className="flex items-center gap-3">
                                      <div className="flex items-center gap-1.5 text-[#8A8A8A] font-bold text-[11px] uppercase tracking-wider">
                                         <Calendar size={12} className="opacity-40" />
                                         {new Date(entry.date as any).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}
                                      </div>
                                   </div>
                                </div>
                             </div>

                             <div className="flex items-center gap-8">
                                <div className="flex flex-col items-end">
                                   <span className="text-2xl font-mono font-black text-white">+{entry.points.toFixed(1)}</span>
                                   <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">PUNKTE</span>
                                </div>
                                <ChevronRight className="text-gray-800 group-hover:text-white transition-colors" size={20} />
                             </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
               </div>

               {/* RIGHT: SIDEBAR / QUICK ACTIONS */}
               <div className="space-y-10 lg:pl-4">
                  
                  {/* Quick Actions */}
                  <div className="space-y-6">
                     <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] pl-1 h-[44px] flex items-center border-b border-white/5">Quick Actions</h2>
                     <div className="grid grid-cols-1 gap-4">
                        <Link href="/dashboard/genehmigungen" className="group flex items-center gap-4 bg-white text-black p-6 rounded-[32px] hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-white/5">
                           <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white transition-transform group-hover:-rotate-6">
                              <Plus size={24} strokeWidth={2.5} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[17px] font-poppins font-black leading-tight uppercase tracking-tight">Erfassung</span>
                              <span className="text-[11px] font-bold opacity-40 uppercase tracking-widest">Aktivität melden</span>
                           </div>
                        </Link>

                        <div className="flex items-center gap-4 bg-[#0c0c0c] border border-white/5 p-6 rounded-[32px] hover:bg-white/[0.02] transition-all cursor-pointer group">
                           <div className="w-12 h-12 rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center text-white">
                              <Search size={22} />
                           </div>
                           <div className="flex flex-col">
                              <span className="text-[17px] font-poppins font-bold text-white">Suche</span>
                              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest leading-none mt-1">Einträge filtern</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  {/* Club News / Global Announcements Placeholder */}
                  <div className="space-y-6">
                     <div className="flex items-center justify-between border-b border-white/5 pb-4">
                        <h2 className="text-xs font-black text-gray-500 uppercase tracking-[0.3em] pl-1">News & Club</h2>
                        <Bell size={14} className="text-gray-700" />
                     </div>
                     <div className="bg-white/[0.015] border border-white/5 rounded-[40px] p-8 space-y-6">
                        <div className="flex flex-col gap-2">
                           <div className="flex items-center gap-2">
                              <Star size={12} className="text-white" />
                              <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.2em]">Mitglieder-Event</span>
                           </div>
                           <h4 className="font-poppins font-bold text-white text-lg leading-snug">Sommerfest Vorbereitung <br />am kommenden Samstag.</h4>
                           <p className="text-gray-500 text-sm font-medium leading-relaxed">Wir benötigen noch Unterstützung beim Aufbau ab 10:00 Uhr. Wer Zeit hat, bitte melden!</p>
                        </div>
                        <div className="h-px bg-white/5" />
                        <Link href="/dashboard/ankuendigungen" className="block text-center text-[10px] font-black text-white hover:text-white/60 transition-colors uppercase tracking-[0.3em]">Alle Ankündigungen</Link>
                     </div>
                  </div>

               </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}
