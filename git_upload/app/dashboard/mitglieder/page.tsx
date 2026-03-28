"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Trophy, List, Crown, Medal, Award, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry } from "../../../lib/firebase/models";

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

  // Leaderboard: approved points per member
  const leaderboard = useMemo(() => {
    return members
      .filter((m) => m.memberType === MemberType.Active || m.memberType === MemberType.Passive)
      .map((m) => {
        const approved = entries
          .filter((e) => e.memberId === m.id && e.status === "Genehmigt")
          .reduce((sum, e) => sum + e.points, 0);
        const target = currentClub ? calculateTargetPoints(m, currentClub.requiredPoints) : 0;
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
    <div className="flex flex-col gap-0 h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#080808] border-b border-[#ffffff0f] px-6 pt-6 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-poppins font-bold text-white">Mitglieder</h1>
          <span className="text-sm font-poppins text-[#8A8A8A]">{members.length} gesamt</span>
        </div>

        {/* Toggle */}
        <div className="flex gap-1 p-1 rounded-full bg-[#1A1A1A] w-fit">
          {(["list", "leaderboard"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-poppins font-semibold transition-all ${
                viewMode === mode
                  ? "bg-white text-[#080808]"
                  : "text-[#8A8A8A] hover:text-white"
              }`}
            >
              {mode === "list" ? <List size={14} /> : <Trophy size={14} />}
              {mode === "list" ? "Liste" : "Rangliste"}
            </button>
          ))}
        </div>

        {/* Search (only in list mode) */}
        {viewMode === "list" && (
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Mitglied suchen…"
              className="w-full rounded-xl border border-[#ffffff0f] bg-[#111111] pl-10 pr-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : viewMode === "leaderboard" ? (
          <LeaderboardView data={leaderboard} />
        ) : (
          <ListView members={filtered} />
        )}
      </div>
    </div>
  );
}

function ListView({ members }: { members: Member[] }) {
  const grouped = memberTypeOrder
    .map((type) => ({ type, group: members.filter((m) => m.memberType === type) }))
    .filter(({ group }) => group.length > 0);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <Search size={40} className="text-[#333] mb-4" />
        <p className="font-poppins text-[#8A8A8A]">Keine Mitglieder gefunden.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {grouped.map(({ type, group }, secIdx) => (
        <div key={type}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest">
              {memberTypeLabel[type] ?? type}
            </span>
            <span className="text-xs font-poppins text-[#555]">{group.length}</span>
          </div>
          <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
            {group.map((member, idx) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: secIdx * 0.06 + idx * 0.04 }}
              >
                <Link
                  href={`/dashboard/mitglieder/${member.id}`}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold font-poppins shrink-0">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-poppins font-medium text-white text-sm">
                      {member.firstName} {member.lastName}
                    </span>
                    <span className="text-xs font-poppins text-[#8A8A8A] truncate">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {member.isAdmin && (
                      <span className="text-[10px] font-poppins font-semibold px-2 py-0.5 rounded-full bg-white/10 text-[#C8D0E0]">
                        Admin
                      </span>
                    )}
                    {member.isTrainer && !member.isAdmin && (
                      <span className="text-[10px] font-poppins font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                        Trainer
                      </span>
                    )}
                    <ChevronRight size={14} className="text-[#555]" />
                  </div>
                </Link>
                {idx < group.length - 1 && (
                  <div className="border-b border-[#ffffff0a] mx-5" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const rankIcons = [
  <Crown key={0} size={18} className="text-yellow-400" />,
  <Medal key={1} size={18} className="text-[#C0C0C0]" />,
  <Award key={2} size={18} className="text-amber-600" />,
];

function LeaderboardView({
  data,
}: {
  data: { member: Member; approved: number; target: number; progress: number }[];
}) {
  return (
    <div className="flex flex-col gap-3 pb-8">
      {data.map(({ member, approved, target, progress }, idx) => (
        <motion.div
          key={member.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.04 }}
          className="rounded-2xl border border-[#ffffff0f] bg-[#111111] p-5 flex items-center gap-4"
        >
          {/* Rank */}
          <div className="w-8 text-center shrink-0">
            {idx < 3 ? rankIcons[idx] : (
              <span className="font-poppins font-bold text-[#555] text-sm">{idx + 1}</span>
            )}
          </div>

          {/* Avatar */}
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold font-poppins shrink-0">
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </div>

          {/* Info + Progress */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <span className="font-poppins font-medium text-white text-sm">
              {member.firstName} {member.lastName}
            </span>
            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-[#1A1A1A] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: idx * 0.04 }}
                className="h-full rounded-full"
                style={{
                  background: progress >= 1
                    ? "#34C759"
                    : progress >= 0.6
                    ? "#FF9500"
                    : "linear-gradient(90deg, #C8D0E0, #fff)",
                }}
              />
            </div>
          </div>

          {/* Points */}
          <div className="text-right shrink-0">
            <div className="font-poppins font-bold text-white">
              {approved.toFixed(1)}
            </div>
            <div className="text-[11px] font-poppins text-[#8A8A8A]">
              / {target.toFixed(1)} Pkt.
            </div>
          </div>
        </motion.div>
      ))}
      {data.length === 0 && (
        <div className="flex flex-col items-center justify-center p-16 text-center">
          <Trophy size={40} className="text-[#333] mb-4" />
          <p className="font-poppins text-[#8A8A8A]">Noch keine Punkte eingetragen.</p>
        </div>
      )}
    </div>
  );
}
