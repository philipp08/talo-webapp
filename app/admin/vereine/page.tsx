"use client";

import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { motion } from "framer-motion";
import { Building2, RefreshCw, Users, ChevronRight, Search, EyeOff, Eye } from "lucide-react";
import { GlassSection } from "@/app/components/ui/NativeUI";
import { getPlanFeatures, getPlanKey } from "@/lib/firebase/models";
import Link from "next/link";

interface ClubRow {
  id: string;
  name: string;
  plan: string;
  memberCount: number;
  licenseStatus?: string;
  licenseExpiresAt?: any;
  isTrial?: boolean;
  sportType?: string;
  createdAt?: Date | null;
}

const PLAN_COLOR: Record<string, { bg: string; text: string }> = {
  starter: { bg: "rgba(113,113,122,0.12)", text: "#71717A" },
  club:    { bg: "rgba(0,122,255,0.12)",   text: "#007AFF" },
  pro:     { bg: "rgba(175,82,222,0.12)",  text: "#AF52DE" },
};

export default function VereineAdminPage() {
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showEmpty, setShowEmpty] = useState(false);
  const [planFilter, setPlanFilter] = useState<"all" | "starter" | "club" | "pro">("all");

  async function loadClubs() {
    setLoading(true);
    try {
      // Single read of members collection, then count per club in memory
      const [clubsSnap, membersSnap] = await Promise.all([
        getDocs(collection(db, "clubs")),
        getDocs(collection(db, "members")),
      ]);

      const memberCountByClub = new Map<string, number>();
      membersSnap.docs.forEach((m) => {
        const data = m.data();
        const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
        clubIds.forEach((cid) => {
          memberCountByClub.set(cid, (memberCountByClub.get(cid) ?? 0) + 1);
        });
      });

      const rows: ClubRow[] = clubsSnap.docs.map((clubDoc) => {
        const data = clubDoc.data();
        return {
          id: clubDoc.id,
          name: data.name ?? "Unbekannt",
          plan: getPlanKey(data.plan),
          memberCount: memberCountByClub.get(clubDoc.id) ?? 0,
          licenseStatus: data.licenseStatus,
          licenseExpiresAt: data.licenseExpiresAt,
          isTrial: data.isTrial ?? false,
          sportType: data.sportType,
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });

      rows.sort((a, b) => b.memberCount - a.memberCount);
      setClubs(rows);
    } catch (e) {
      console.error("Fehler beim Laden der Vereine", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadClubs(); }, []);

  const filtered = useMemo(() => {
    return clubs.filter((c) => {
      if (!showEmpty && c.memberCount === 0) return false;
      if (planFilter !== "all" && c.plan !== planFilter) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [clubs, showEmpty, planFilter, search]);

  const planCounts = useMemo(() => {
    const active = clubs.filter((c) => c.memberCount > 0);
    return {
      total: clubs.length,
      active: active.length,
      empty: clubs.length - active.length,
      starter: active.filter((c) => c.plan === "starter").length,
      club: active.filter((c) => c.plan === "club").length,
      pro: active.filter((c) => c.plan === "pro").length,
    };
  }, [clubs]);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Vereine</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              {planCounts.active} aktiv · {planCounts.empty} leer
            </p>
          </div>
          <button
            onClick={loadClubs}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Aktiv" value={String(planCounts.active)} color="#0A0A0A" />
          <StatCard label="Starter" value={String(planCounts.starter)} color="#71717A" />
          <StatCard label="Club" value={String(planCounts.club)} color="#007AFF" />
          <StatCard label="Pro" value={String(planCounts.pro)} color="#AF52DE" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Verein suchen…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
            />
          </div>

          {/* Plan filter */}
          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5">
            {(["all", "starter", "club", "pro"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPlanFilter(p)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-poppins font-black uppercase tracking-widest transition-all ${
                  planFilter === p ? "bg-[#0A0A0A] text-white" : "text-[#71717A]"
                }`}
              >
                {p === "all" ? "Alle" : p}
              </button>
            ))}
          </div>

          {/* Empty toggle */}
          <button
            onClick={() => setShowEmpty(!showEmpty)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-black/[0.06] bg-white text-[11px] font-black uppercase tracking-widest hover:bg-black/[0.02]"
            style={{ color: showEmpty ? "#0A0A0A" : "#71717A" }}
          >
            {showEmpty ? <Eye size={13} /> : <EyeOff size={13} />}
            {showEmpty ? "Leere zeigen" : "Leere ausblenden"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Building2 size={32} className="mb-4" style={{ color: "#71717A" }} />
            <p className="font-poppins font-bold text-[18px] text-[#0A0A0A] mb-2">Keine Vereine gefunden</p>
            {!showEmpty && planCounts.empty > 0 && (
              <button onClick={() => setShowEmpty(true)} className="text-[12px] text-[#007AFF] hover:underline mt-2">
                {planCounts.empty} leere Vereine anzeigen
              </button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((club, i) => (
              <ClubListRow key={club.id} club={club} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClubListRow({ club, index }: { club: ClubRow; index: number }) {
  const planFeatures = getPlanFeatures(club.plan);
  const colors = PLAN_COLOR[club.plan] ?? PLAN_COLOR.starter;
  const maxMembers = planFeatures.maxMembers;
  const fillPct = Math.min(1, club.memberCount / maxMembers);

  const expiresLabel = (() => {
    if (!club.licenseExpiresAt) return null;
    try {
      const d = typeof club.licenseExpiresAt.toDate === "function"
        ? club.licenseExpiresAt.toDate()
        : new Date(club.licenseExpiresAt);
      const isExpired = d < new Date();
      return {
        label: isExpired ? "Abgelaufen" : `bis ${d.toLocaleDateString("de-DE")}`,
        expired: isExpired,
      };
    } catch {
      return null;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.02, 0.5) }}
    >
      <Link href={`/admin/vereine/${club.id}`} className="block group">
        <GlassSection>
          <div className="p-4 flex items-center gap-4 group-hover:bg-black/[0.01] transition-all">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
              <Building2 size={18} style={{ color: colors.text }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-poppins font-bold text-[15px] text-[#0A0A0A] truncate group-hover:underline">{club.name}</span>
                {club.isTrial && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white">Trial</span>
                )}
                {club.memberCount === 0 && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Leer</span>
                )}
                {club.sportType && (
                  <span className="text-[10px] text-[#71717A]">· {club.sportType}</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span
                  className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ background: colors.bg, color: colors.text }}
                >
                  {planFeatures.name}
                </span>
                <div className="flex items-center gap-1.5">
                  <Users size={11} className="text-[#52525B]" />
                  <span className="text-[11px] font-bold text-[#52525B]">{club.memberCount} / {maxMembers}</span>
                  <div className="w-12 h-1 rounded-full bg-black/[0.06] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${fillPct * 100}%`, background: colors.text }} />
                  </div>
                </div>
                {expiresLabel && (
                  <span
                    className="text-[10px] font-bold"
                    style={{ color: expiresLabel.expired ? "#FF453A" : "#71717A" }}
                  >
                    {expiresLabel.expired ? "⚠ " : ""}{expiresLabel.label}
                  </span>
                )}
              </div>
            </div>

            <ChevronRight size={16} className="text-[#A1A1AA] group-hover:text-[#0A0A0A] transition-colors shrink-0" />
          </div>
        </GlassSection>
      </Link>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-5 rounded-[24px] flex items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex flex-col">
        <p className="text-[28px] font-poppins font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#71717A" }}>{label}</p>
      </div>
    </div>
  );
}
