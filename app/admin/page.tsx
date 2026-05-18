"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs, collectionGroup, query, orderBy, limit } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Building2, Users, Activity, Key, RefreshCw, TrendingUp,
  AlertTriangle, ChevronRight, Sparkles, FileText, Calendar,
} from "lucide-react";
import { GlassSection, TLine } from "@/app/components/ui/NativeUI";
import { getPlanKey, getPlanFeatures } from "@/lib/firebase/models";
import Link from "next/link";

interface Stats {
  totalClubs: number;
  activeClubs: number;
  emptyClubs: number;
  totalMembers: number;
  totalEntries: number;
  planCounts: Record<string, number>;
  expiredLicenses: number;
  trialClubs: number;
  recentClubs: { id: string; name: string; createdAt: Date | null; memberCount: number; plan: string }[];
  recentMembers: { id: string; name: string; email: string; createdAt: Date | null }[];
}

const PLAN_COLOR: Record<string, string> = {
  starter: "#71717A",
  club: "#007AFF",
  pro: "#AF52DE",
};

const fmtDate = (d: Date | null): string => {
  if (!d) return "—";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtRelative = (d: Date | null): string => {
  if (!d) return "—";
  const diff = Date.now() - d.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "heute";
  if (diff < 2 * day) return "gestern";
  if (diff < 7 * day) return `vor ${Math.floor(diff / day)} Tagen`;
  if (diff < 30 * day) return `vor ${Math.floor(diff / (7 * day))} Wochen`;
  return d.toLocaleDateString("de-DE");
};

let collectionGroupSupported = true;

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto-cleanup removed: would race with onboarding (createClub → updateMember).
  // Manual cleanup is available on /admin/mitglieder.

  async function loadStats() {
    setLoading(true);
    try {
      const clubsSnap = await getDocs(collection(db, "clubs"));
      const membersSnap = await getDocs(collection(db, "members"));

      // Member-to-club mapping
      const memberClubMap = new Map<string, string[]>();
      membersSnap.docs.forEach((m) => {
        const data = m.data();
        const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
        memberClubMap.set(m.id, clubIds);
      });

      // Count members per club
      const memberCountByClub = new Map<string, number>();
      memberClubMap.forEach((clubIds) => {
        clubIds.forEach((cid) => {
          memberCountByClub.set(cid, (memberCountByClub.get(cid) ?? 0) + 1);
        });
      });

      const planCounts: Record<string, number> = { starter: 0, club: 0, pro: 0 };
      let activeClubs = 0;
      let emptyClubs = 0;
      let expiredLicenses = 0;
      let trialClubs = 0;
      const now = new Date();

      const recentClubsRaw: Stats["recentClubs"] = [];

      clubsSnap.docs.forEach((c) => {
        const data = c.data();
        const memberCount = memberCountByClub.get(c.id) ?? 0;
        const plan = getPlanKey(data.plan);
        planCounts[plan] = (planCounts[plan] ?? 0) + 1;

        if (memberCount > 0) activeClubs++;
        else emptyClubs++;

        if (data.isTrial) trialClubs++;

        if (data.licenseExpiresAt) {
          try {
            const exp = data.licenseExpiresAt.toDate
              ? data.licenseExpiresAt.toDate()
              : new Date(data.licenseExpiresAt);
            if (exp < now && plan !== "starter") expiredLicenses++;
          } catch {}
        }

        const createdAt = data.createdAt?.toDate?.() ?? null;
        recentClubsRaw.push({
          id: c.id,
          name: data.name ?? "Unbekannt",
          createdAt,
          memberCount,
          plan,
        });
      });

      recentClubsRaw.sort((a, b) => {
        const at = a.createdAt?.getTime() ?? 0;
        const bt = b.createdAt?.getTime() ?? 0;
        return bt - at;
      });

      const recentMembers = membersSnap.docs
        .map((m) => {
          const data = m.data();
          return {
            id: m.id,
            name: `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim() || "Unbekannt",
            email: data.email ?? "—",
            createdAt: data.createdAt?.toDate?.() ?? null,
          };
        })
        .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0))
        .slice(0, 8);

      // Total entries count fallback
      let totalEntries = 0;
      let usedFallback = false;

      if (collectionGroupSupported) {
        try {
          const entriesGroup = await getDocs(collectionGroup(db, "entries"));
          totalEntries = entriesGroup.size;
        } catch {
          collectionGroupSupported = false;
          usedFallback = true;
        }
      } else {
        usedFallback = true;
      }

      if (usedFallback) {
        try {
          const clubEntriesPromises = clubsSnap.docs.map(async (clubDoc) => {
            const entriesSnap = await getDocs(collection(db, "clubs", clubDoc.id, "entries"));
            return entriesSnap.size;
          });
          const resolvedSizes = await Promise.all(clubEntriesPromises);
          totalEntries = resolvedSizes.reduce((acc, val) => acc + val, 0);
        } catch (fallbackErr) {
          console.error("Fallback club-by-club count fetch failed:", fallbackErr);
          totalEntries = 0;
        }
      }

      setStats({
        totalClubs: clubsSnap.size,
        activeClubs,
        emptyClubs,
        totalMembers: membersSnap.size,
        totalEntries,
        planCounts,
        expiredLicenses,
        trialClubs,
        recentClubs: recentClubsRaw.slice(0, 6),
        recentMembers,
      });
    } catch (e) {
      console.error("Fehler beim Laden der Stats", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadStats(); }, []);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Übersicht</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              Globale Plattform-Statistiken
            </p>
          </div>
          <button
            onClick={loadStats}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Top-Line Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <BigStatCard icon={Building2} label="Vereine" value={stats.totalClubs} sub={`${stats.activeClubs} aktiv · ${stats.emptyClubs} leer`} color="#0A0A0A" />
              <BigStatCard icon={Users} label="Mitglieder" value={stats.totalMembers} sub="alle Konten" color="#007AFF" />
              <BigStatCard icon={FileText} label="Einträge" value={stats.totalEntries} sub="alle Vereine" color="#34C759" />
              <BigStatCard icon={TrendingUp} label="Bezahlt" value={(stats.planCounts.club ?? 0) + (stats.planCounts.pro ?? 0)} sub={`${stats.planCounts.pro ?? 0} Pro · ${stats.planCounts.club ?? 0} Club`} color="#AF52DE" />
            </div>

            {/* Warning Cards */}
            {(stats.expiredLicenses > 0 || stats.trialClubs > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stats.expiredLicenses > 0 && (
                  <Link href="/admin/vereine" className="flex items-center gap-4 p-4 rounded-2xl border border-orange-500/30 bg-orange-500/8 hover:bg-orange-500/12 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,149,0,0.15)" }}>
                      <AlertTriangle size={18} style={{ color: "#FF9500" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-poppins font-bold text-sm text-[#0A0A0A]">{stats.expiredLicenses} Lizenz(en) abgelaufen</p>
                      <p className="text-xs text-[#52525B]">Vereine mit aktivem Plan, dessen Lizenz nicht mehr gültig ist</p>
                    </div>
                    <ChevronRight size={16} className="text-[#71717A]" />
                  </Link>
                )}
                {stats.trialClubs > 0 && (
                  <Link href="/admin/vereine" className="flex items-center gap-4 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 transition-all">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(0,122,255,0.12)" }}>
                      <Sparkles size={18} style={{ color: "#007AFF" }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-poppins font-bold text-sm text-[#0A0A0A]">{stats.trialClubs} Verein(e) in Testphase</p>
                      <p className="text-xs text-[#52525B]">Trial-Lizenzen aktuell aktiv</p>
                    </div>
                    <ChevronRight size={16} className="text-[#71717A]" />
                  </Link>
                )}
              </div>
            )}

            {/* Plan Distribution */}
            <GlassSection>
              <div className="p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A] mb-4">Plan-Verteilung</p>
                <div className="flex h-3 rounded-full overflow-hidden bg-black/[0.03]">
                  {(["starter", "club", "pro"] as const).map((k) => {
                    const count = stats.planCounts[k] ?? 0;
                    const pct = stats.totalClubs > 0 ? (count / stats.totalClubs) * 100 : 0;
                    if (pct === 0) return null;
                    return <div key={k} style={{ width: `${pct}%`, background: PLAN_COLOR[k] }} />;
                  })}
                </div>
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {(["starter", "club", "pro"] as const).map((k) => {
                    const count = stats.planCounts[k] ?? 0;
                    const features = getPlanFeatures(k);
                    return (
                      <div key={k} className="flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: PLAN_COLOR[k] }} />
                        <div className="flex flex-col">
                          <span className="text-[13px] font-poppins font-bold text-[#0A0A0A]">{count} · {features.name}</span>
                          <span className="text-[10px] text-[#71717A]">{features.price}{features.period}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </GlassSection>

            {/* Two-column lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Recent Clubs */}
              <GlassSection>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Neueste Vereine</p>
                    <Link href="/admin/vereine" className="text-[11px] font-bold text-[#0A0A0A] hover:underline flex items-center gap-1">
                      Alle <ChevronRight size={12} />
                    </Link>
                  </div>
                  <TLine />
                  <div className="flex flex-col divide-y divide-black/[0.04]">
                    {stats.recentClubs.length === 0 ? (
                      <p className="text-[12px] text-[#71717A] py-4">Keine Daten</p>
                    ) : stats.recentClubs.map((c) => (
                      <Link key={c.id} href={`/admin/vereine/${c.id}`} className="flex items-center gap-3 py-3 hover:bg-black/[0.02] -mx-2 px-2 rounded-lg transition-all">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${PLAN_COLOR[c.plan]}15` }}>
                          <Building2 size={14} style={{ color: PLAN_COLOR[c.plan] }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-poppins font-semibold text-[#0A0A0A] truncate">{c.name}</p>
                          <p className="text-[10px] text-[#71717A]">{c.memberCount} Mitglied(er) · {fmtRelative(c.createdAt)}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#A1A1AA]" />
                      </Link>
                    ))}
                  </div>
                </div>
              </GlassSection>

              {/* Recent Members */}
              <GlassSection>
                <div className="p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Neueste Mitglieder</p>
                    <Link href="/admin/mitglieder" className="text-[11px] font-bold text-[#0A0A0A] hover:underline flex items-center gap-1">
                      Alle <ChevronRight size={12} />
                    </Link>
                  </div>
                  <TLine />
                  <div className="flex flex-col divide-y divide-black/[0.04]">
                    {stats.recentMembers.length === 0 ? (
                      <p className="text-[12px] text-[#71717A] py-4">Keine Daten</p>
                    ) : stats.recentMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 py-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px]" style={{ background: "rgba(0,0,0,0.05)", color: "#0A0A0A" }}>
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-poppins font-semibold text-[#0A0A0A] truncate">{m.name}</p>
                          <p className="text-[10px] text-[#71717A] truncate">{m.email} · {fmtRelative(m.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassSection>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function BigStatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number; sub: string; color: string }) {
  return (
    <div className="p-5 rounded-[24px]" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>
          <Icon size={16} strokeWidth={2.2} />
        </div>
      </div>
      <p className="text-[32px] font-poppins font-bold text-[#0A0A0A] leading-none">{value.toLocaleString("de-DE")}</p>
      <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-2" style={{ color: "#71717A" }}>{label}</p>
      <p className="text-[11px] text-[#52525B] mt-1">{sub}</p>
    </div>
  );
}
