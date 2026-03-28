"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, List, Crown, Medal, Award, ChevronRight, Shield, Dumbbell } from "lucide-react";
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

type ViewMode = "list" | "leaderboard";

export default function MembersPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");

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
      .filter((m) => m.memberType !== MemberType.Passive) // Only active/youth/board in ranking typically
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
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-[#8A8A8A] font-poppins">Kein Zugriff.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 p-6 flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-end justify-between">
            <h1 className="text-[26px] font-poppins font-bold text-white tracking-tight">Mitglieder</h1>
            <span className="text-sm font-poppins text-[#8A8A8A] pb-1">{members.length} gesamt</span>
          </div>
        </motion.div>

        {/* Segmented Native Toggle */}
        <div className="flex p-1 rounded-full bg-white/5 border border-white/10 w-full max-w-sm self-center">
          {(["list", "leaderboard"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-full text-sm font-poppins font-bold transition-all ${
                viewMode === mode
                  ? "bg-white text-[#080808] shadow-lg"
                  : "text-[#8A8A8A] hover:text-white"
              }`}
            >
              {mode === "list" ? <List size={14} strokeWidth={2.5} /> : <Trophy size={14} strokeWidth={2.5} />}
              {mode === "list" ? "Liste" : "Rangliste"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : viewMode === "leaderboard" ? (
          <LeaderboardView data={leaderboard} />
        ) : (
          <div className="flex flex-col gap-6">
            <TSearchBar value={searchText} onChange={setSearchText} placeholder="Mitglied suchen…" />
            <ListView members={filtered} entries={entries} requiredPoints={currentClub?.requiredPoints ?? 15} />
          </div>
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
      <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
        <Search size={40} className="text-white mb-4" />
        <p className="font-poppins text-[#8A8A8A]">Keine Mitglieder gefunden.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-7 pb-20">
      {grouped.map(({ type, group }, secIdx) => (
        <div key={type} className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-[0.15em]">
              {memberTypeLabel[type] ?? type}
            </span>
            <span className="text-[11px] font-poppins font-medium text-[#555]">{group.length}</span>
          </div>
          
          <GlassSection>
            {group.map((member, idx) => {
              const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt");
              const approved = mEntries.reduce((sum, e) => sum + e.points, 0);
              const target = calculateTargetPoints(member, requiredPoints);
              const progress = target > 0 ? Math.min(1, approved / target) : 1;
              const color = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF3B30";

              return (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: secIdx * 0.06 + idx * 0.04 }}
                >
                  <Link
                    href={`/dashboard/mitglieder/${member.id}`}
                    className="flex items-center gap-4 px-5 py-4 active:bg-white/5 transition-colors"
                  >
                    <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} imageUrl={member.profileImageUrl} size={44} />
                    
                    <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-poppins font-semibold text-white text-[15px] truncate leading-tight">
                          {member.firstName} {member.lastName}
                        </span>
                        {member.isAdmin && <Shield size={12} className="text-white opacity-60 shrink-0" />}
                        {member.isTrainer && !member.isAdmin && <Dumbbell size={12} className="text-[#FF9500] opacity-80 shrink-0" />}
                      </div>
                      
                      {/* Native 4px Progress Bar */}
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-[14px]" style={{ color }}>
                        {approved.toFixed(1)}
                      </span>
                      <ChevronRight size={14} className="text-[#383838]" />
                    </div>
                  </Link>
                  {idx < group.length - 1 && <TLine className="mx-5" />}
                </motion.div>
              );
            })}
          </GlassSection>
        </div>
      ))}
    </div>
  );
}

function LeaderboardView({
  data,
}: {
  data: { member: Member; approved: number; target: number; progress: number }[];
}) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="flex flex-col gap-8 pb-20">
      {/* Native Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-2 pt-4">
          {/* 2nd Place */}
          {top3[1] && <PodiumBlock item={top3[1]} rank={2} height={100} medal="🥈" color="#C0C0C0" />}
          
          {/* 1st Place */}
          {top3[0] && <PodiumBlock item={top3[0]} rank={1} height={140} medal="🥇" color="#FFD700" />}
          
          {/* 3rd Place */}
          {top3[2] && <PodiumBlock item={top3[2]} rank={3} height={80} medal="🥉" color="#CD7F32" />}
        </div>
      )}

      {/* Rest of List */}
      <GlassSection>
        {rest.length > 0 ? rest.map((item, idx) => (
          <div key={item.member.id}>
            <Link
              href={`/dashboard/mitglieder/${item.member.id}`}
              className="flex items-center gap-4 px-5 py-4 active:bg-white/5 transition-colors"
            >
              <span className="w-6 text-center font-mono font-bold text-[13px] text-[#555]">
                #{idx + 4}
              </span>
              <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={38} />
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="font-poppins font-semibold text-white text-[14px]">
                   {item.member.firstName} {item.member.lastName}
                </span>
                <span className="text-[11px] font-poppins text-[#8A8A8A]">
                   {item.member.memberType}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono font-bold text-[15px] text-[#34C759]">
                   {item.approved.toFixed(1)}
                </span>
                <ChevronRight size={14} className="text-[#383838]" />
              </div>
            </Link>
            {idx < rest.length - 1 && <TLine className="mx-5" />}
          </div>
        )) : data.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 text-center opacity-40">
             <Trophy size={40} className="text-white mb-4" />
             <p className="font-poppins text-[#8A8A8A]">Noch keine Punkte eingetragen.</p>
          </div>
        )}
      </GlassSection>
    </div>
  );
}

function PodiumBlock({ item, rank, height, medal, color }: { item: any, rank: number, height: number, medal: string, color: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (3 - rank) * 0.1 }}
      className="flex-1 flex flex-col items-center gap-3 max-w-[120px]"
    >
      <div className="relative">
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30" 
          style={{ background: color }}
        />
        <TAvatar 
          name={`${item.member.firstName} ${item.member.lastName}`} 
          id={item.member.id} 
          size={rank === 1 ? 64 : 52} 
          imageUrl={item.member.profileImageUrl} 
        />
      </div>
      
      <div className="flex flex-col items-center gap-1">
        <span className="font-poppins font-bold text-white text-[12px] truncate w-full text-center">
          {item.member.firstName}
        </span>
        <span className="font-mono font-bold text-[14px]" style={{ color }}>
          {item.approved.toFixed(1)}
        </span>
      </div>

      <div 
        className="w-full rounded-2xl relative overflow-hidden flex flex-col items-center pt-3 border border-white/10"
        style={{ 
          height, 
          background: `linear-gradient(to bottom, ${color}22, ${color}05)`,
          boxShadow: `inset 0 0 20px ${color}11`
        }}
      >
        <span className="text-2xl drop-shadow-md">{medal}</span>
      </div>
    </motion.div>
  );
}
