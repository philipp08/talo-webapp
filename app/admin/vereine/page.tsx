"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { motion } from "framer-motion";
import { Building2, RefreshCw, Users, Shield, ChevronRight, Search } from "lucide-react";
import { GlassSection, TLine } from "@/app/components/ui/NativeUI";
import { getPlanFeatures } from "@/lib/firebase/models";
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
}

const PLAN_COLOR: Record<string, { bg: string; text: string }> = {
  free:   { bg: "rgba(113,113,122,0.12)", text: "#71717A" },
  verein: { bg: "rgba(52,199,89,0.12)",   text: "#34C759" },
  club:   { bg: "rgba(0,122,255,0.12)",   text: "#007AFF" },
  pro:    { bg: "rgba(175,82,222,0.12)",  text: "#AF52DE" },
};

export default function VereineAdminPage() {
  const [clubs, setClubs] = useState<ClubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function loadClubs() {
    setLoading(true);
    try {
      const clubsSnap = await getDocs(collection(db, "clubs"));
      const rows: ClubRow[] = [];

      await Promise.all(
        clubsSnap.docs.map(async (clubDoc) => {
          const data = clubDoc.data();

          // Count members for this club
          let memberCount = 0;
          try {
            const membersSnap = await getDocs(collection(db, "members"));
            memberCount = membersSnap.docs.filter((m) => {
              const d = m.data();
              return (d.clubIds ?? []).includes(clubDoc.id) || d.clubId === clubDoc.id;
            }).length;
          } catch {
            memberCount = 0;
          }

          rows.push({
            id: clubDoc.id,
            name: data.name ?? "Unbekannt",
            plan: (data.plan ?? "free").toLowerCase(),
            memberCount,
            licenseStatus: data.licenseStatus,
            licenseExpiresAt: data.licenseExpiresAt,
            isTrial: data.isTrial ?? false,
            sportType: data.sportType,
          });
        })
      );

      rows.sort((a, b) => a.name.localeCompare(b.name));
      setClubs(rows);
    } catch (e) {
      console.error("Fehler beim Laden der Vereine", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadClubs(); }, []);

  const filtered = clubs.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const planCounts = clubs.reduce<Record<string, number>>((acc, c) => {
    acc[c.plan] = (acc[c.plan] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Vereine</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              Alle registrierten Vereine
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
          <StatCard label="Gesamt" value={String(clubs.length)} color="#0A0A0A" />
          <StatCard label="Free" value={String(planCounts.free ?? 0)} color="#71717A" />
          <StatCard label="Bezahlt" value={String((planCounts.verein ?? 0) + (planCounts.club ?? 0) + (planCounts.pro ?? 0))} color="#34C759" />
          <StatCard label="Pro" value={String(planCounts.pro ?? 0)} color="#AF52DE" />
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Verein suchen…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
          />
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
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((club, i) => (
              <ClubRow key={club.id} club={club} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ClubRow({ club, index }: { club: ClubRow; index: number }) {
  const planFeatures = getPlanFeatures(club.plan);
  const colors = PLAN_COLOR[club.plan] ?? PLAN_COLOR.free;
  const maxMembers = planFeatures.maxMembers;

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
      transition={{ delay: index * 0.02 }}
    >
      <GlassSection>
        <div className="p-4 flex items-center gap-4">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: colors.bg }}>
            <Building2 size={18} style={{ color: colors.text }} />
          </div>

          {/* Name + meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-poppins font-bold text-[15px] text-[#0A0A0A] truncate">{club.name}</span>
              {club.isTrial && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#0A0A0A] text-white">Trial</span>
              )}
              {club.sportType && (
                <span className="text-[10px] text-[#71717A]">{club.sportType}</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                style={{ background: colors.bg, color: colors.text }}
              >
                {planFeatures.name}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-[#52525B]">
                <Users size={11} />
                {club.memberCount} / {maxMembers}
              </span>
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

          {/* Club ID */}
          <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
            <span className="font-mono text-[10px] text-[#A1A1AA]">{club.id.slice(0, 12)}…</span>
          </div>
        </div>
      </GlassSection>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="p-5 rounded-[24px] flex items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex flex-col">
        <p className="text-[28px] font-poppins font-bold text-[#0A0A0A] leading-none">{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#71717A" }}>{label}</p>
      </div>
    </div>
  );
}
