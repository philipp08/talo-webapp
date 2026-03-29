"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Trophy, List, Crown, Medal, Award, 
  ChevronRight, Shield, Dumbbell, UserPlus, 
  ArrowUpRight, Target, Filter, MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry } from "@/lib/firebase/models";
import { TAvatar, GlassSection, TLine, AmbientBackground, TSearchBar, TBadge } from "@/app/components/ui/NativeUI";

const memberTypeOrder = [
  MemberType.Active,
  MemberType.Board,
  MemberType.Passive,
  MemberType.Youth,
];

const memberTypeLabel: Record<string, string> = {
  [MemberType.Active]: "Aktive Mitglieder",
  [MemberType.Board]: "Vorstand",
  [MemberType.Passive]: "Passive Mitglieder",
  [MemberType.Youth]: "Jugend",
};

type ViewMode = "administration" | "leaderboard";

export default function MembersPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("administration");

  useEffect(() => {
    if (!currentClub) return;

    const unsubMembers = FirebaseManager.listenToMembers(currentClub.id, (ms) => {
      setMembers(ms);
      setLoading(false);
    });

    const unsubEntries = FirebaseManager.listenToEntries(currentClub.id, (es) => {
      setEntries(es);
    });

    return () => { unsubMembers(); unsubEntries(); };
  }, [currentClub]);

  const filtered = useMemo(() => {
    if (!searchText.trim()) return members;
    const q = searchText.toLowerCase();
    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
    );
  }, [members, searchText]);

  const leaderboard = useMemo(() => {
    return members
      .filter((m) => m.memberType !== MemberType.Passive)
      .map((m) => {
        const approved = entries
          .filter((e) => e.memberId === m.id && e.status === "Genehmigt")
          .reduce((sum, e) => sum + e.points, 0);
        const target = currentClub ? calculateTargetPoints(m, currentClub.requiredPoints) : 15;
        const progress = target > 0 ? Math.min(1, approved / target) : 1;
        return { member: m, approved, target, progress };
      })
      .sort((a, b) => b.approved - a.approved);
  }, [members, entries, currentClub]);

  if (!currentMember?.isAdmin && !currentMember?.isTrainer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#8A8A8A] font-poppins font-bold uppercase tracking-widest bg-white/5 px-8 py-4 rounded-full">Kein Zugriff.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080808]">
      <div className="max-w-[1600px] mx-auto py-12 px-1 flex flex-col gap-10">
        
        {/* Header Action Bar */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
           <div className="flex flex-col gap-2">
              <h1 className="text-4xl font-poppins font-black text-white tracking-tighter">Team & Engagement</h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name} Management Console</p>
           </div>
           
           <div className="flex items-center gap-4">
              <div className="flex p-1 rounded-2xl bg-white/[0.02] border border-white/5">
                {(["administration", "leaderboard"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-8 py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${
                      viewMode === mode
                        ? "bg-white text-black shadow-2xl"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    {mode === "administration" ? "Verwaltung" : "Leaderboard"}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-6 py-3.5 rounded-2xl border border-white/10 transition-all font-black text-[11px] uppercase tracking-widest">
                 <UserPlus size={16} /> Einladen
              </button>
           </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
             <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/5 border-t-white" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
             {viewMode === "administration" ? (
               <motion.div 
                 key="admin"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                 <div className="flex items-center justify-between">
                    <div className="w-full max-w-sm">
                       <TSearchBar value={searchText} onChange={setSearchText} placeholder="Mitglied suchen…" />
                    </div>
                    <div className="flex items-center gap-3">
                       <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors">
                          <Filter size={18} />
                       </button>
                    </div>
                 </div>
                 <ListView members={filtered} entries={entries} requiredPoints={currentClub?.requiredPoints ?? 15} />
               </motion.div>
             ) : (
               <motion.div 
                 key="lead"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <LeaderboardView data={leaderboard} />
               </motion.div>
             )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ListView({ members, entries, requiredPoints }: { members: Member[]; entries: Entry[]; requiredPoints: number }) {
  const grouped = memberTypeOrder
    .map((type) => ({ type, group: members.filter((m) => m.memberType === type) }))
    .filter(({ group }) => group.length > 0);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-40 text-center bg-[#0c0c0c] border border-white/5 rounded-[40px]">
        <Search size={48} className="text-gray-800 mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">Keine Treffer</h3>
        <p className="font-poppins text-gray-500 text-sm max-w-xs mx-auto text-balance">Versuche es mit einem anderen Namen oder schau in einer anderen Kategorie nach.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {grouped.map(({ type, group }, secIdx) => (
        <div key={type} className="flex flex-col gap-6">
          <div className="flex items-center gap-4 px-2">
             <div className="h-10 w-1 bg-white/10 rounded-full" />
             <div className="flex flex-col">
                <span className="text-[17px] font-poppins font-black text-white uppercase tracking-tight leading-none italic">
                   {memberTypeLabel[type] ?? type}
                </span>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1 italic">{group.length} Personen</span>
             </div>
          </div>
          
          <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-white/5 bg-white/[0.01]">
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[40%]">Mitglied</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Fortschritt</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Punkte</th>
                      <th className="px-8 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-20">Aktion</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                   {group.map((member, idx) => {
                     const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt");
                     const approved = mEntries.reduce((sum, e) => sum + e.points, 0);
                     const target = calculateTargetPoints(member, requiredPoints);
                     const progress = target > 0 ? Math.min(1, approved / target) : 1;
                     const color = progress >= 1 ? "#8A8A8A" : progress >= 0.5 ? "#8A8A8A" : "#333333";

                     return (
                        <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                           <td className="px-8 py-5">
                              <Link href={`/dashboard/mitglieder/${member.id}`} className="flex items-center gap-4">
                                 <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} imageUrl={member.profileImageUrl} size={48} />
                                 <div className="flex flex-col">
                                    <span className="text-[16px] font-poppins font-bold text-white group-hover:underline underline-offset-4 decoration-white/20">{member.firstName} {member.lastName}</span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                       <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{member.memberType}</span>
                                       {member.isAdmin && <Shield size={10} className="text-[#8A8A8A]" />}
                                    </div>
                                 </div>
                              </Link>
                           </td>
                           <td className="px-8 py-5">
                              <div className="flex flex-col gap-2 max-w-[200px]">
                                 <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                                    <motion.div 
                                       initial={{ width: 0 }}
                                       animate={{ width: `${progress * 100}%` }}
                                       className="h-full"
                                       style={{ background: color }}
                                    />
                                 </div>
                                 <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">{(progress * 100).toFixed(0)}% Erreicht</span>
                              </div>
                           </td>
                           <td className="px-8 py-5 text-right font-mono font-black text-lg" style={{ color }}>
                              {approved.toFixed(1)} <span className="text-[10px] font-black text-gray-700">/ {target.toFixed(1)}</span>
                           </td>
                           <td className="px-8 py-5 text-center">
                              <button className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/10 transition-all ml-auto">
                                 <MoreVertical size={16} />
                              </button>
                           </td>
                        </tr>
                     );
                   })}
                </tbody>
             </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardView({ data }: { data: { member: Member; approved: number; target: number; progress: number }[] }) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="flex flex-col gap-20 py-10">
      {/* Expanded Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-6 max-w-4xl mx-auto w-full px-12">
          {top3[1] && <PodiumBlock item={top3[1]} rank={2} height={180} medal="🥈" color="#E0E0E0" />}
          {top3[0] && <PodiumBlock item={top3[0]} rank={1} height={260} medal="🥇" color="#FFD700" />}
          {top3[2] && <PodiumBlock item={top3[2]} rank={3} height={140} medal="🥉" color="#CD7F32" />}
        </div>
      )}

      {/* High-End List */}
      <div className="max-w-4xl mx-auto w-full space-y-4 px-4">
        <div className="flex items-center justify-between px-8 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4 mb-8">
           <span>PLATZIERUNG</span>
           <span className="ml-12 mr-auto">MITGLIED</span>
           <span>GESAMTPUNKTE</span>
        </div>
        
        {rest.length > 0 ? rest.map((item, idx) => (
          <motion.div 
            key={item.member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center gap-8 bg-[#0c0c0c] border border-white/5 rounded-[32px] p-6 hover:bg-white/[0.02] transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center font-mono font-black text-white/20 group-hover:text-white transition-colors">
               #{idx + 4}
            </div>
            <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={52} />
            <div className="flex flex-col flex-1 min-w-0">
               <span className="text-[17px] font-poppins font-bold text-white">{item.member.firstName} {item.member.lastName}</span>
               <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-1">{item.member.memberType}</span>
            </div>
            <div className="flex flex-col items-end mr-4">
               <span className="text-[22px] font-mono font-black text-[#8A8A8A]">+{item.approved.toFixed(1)}</span>
               <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest whitespace-nowrap">GESAMTPUNKTE</span>
            </div>
            <ChevronRight className="text-gray-800 group-hover:text-white transition-colors" size={20} />
          </motion.div>
        )) : data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <Trophy size={64} className="mb-6" />
             <p className="font-poppins font-black uppercase tracking-[0.2em]">Keine Punkte im System</p>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumBlock({ item, rank, height, medal, color }: { item: any, rank: number, height: number, medal: string, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 100, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100, delay: (3 - rank) * 0.15 }}
      className="flex-1 flex flex-col items-center gap-6"
    >
      <div className="relative group cursor-pointer">
        <div 
          className="absolute inset-0 rounded-full blur-[40px] opacity-20 transition-opacity group-hover:opacity-40" 
          style={{ background: color }}
        />
        <TAvatar 
          name={`${item.member.firstName} ${item.member.lastName}`} 
          id={item.member.id} 
          size={rank === 1 ? 120 : 90} 
          imageUrl={item.member.profileImageUrl} 
          className="relative z-10 border-4 border-[#0c0c0c] shadow-2xl"
        />
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-black border-2 border-white/10 flex items-center justify-center z-20 text-xl shadow-2xl">
           {medal}
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="font-poppins font-black text-white text-lg tracking-tight leading-none group-hover:underline">{item.member.firstName} {item.member.lastName}</span>
        <div className="flex items-center gap-2">
           <span className="text-[28px] font-mono font-black" style={{ color }}>{item.approved.toFixed(1)}</span>
           <span className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] mt-1.5">PKT</span>
        </div>
      </div>

      <div 
        className="w-full rounded-[40px] relative overflow-hidden flex flex-col items-center justify-center border border-white/[0.05] shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]"
        style={{ 
          height, 
          background: `linear-gradient(to bottom, ${color}15, transparent)`,
        }}
      >
         <div className="absolute top-0 w-full h-1" style={{ background: color }} />
         <span className="text-[64px] font-black text-white/[0.02] absolute -bottom-4 font-logo select-none">
            #{rank}
         </span>
         <Target size={rank === 1 ? 48 : 32} className="opacity-10" />
      </div>
    </motion.div>
  );
}
