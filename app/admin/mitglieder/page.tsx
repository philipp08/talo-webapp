"use client";

import { useEffect, useMemo, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Users, RefreshCw, Search, Crown, Shield, Mail,
  Building2, Filter, ChevronRight, Trash2, Sparkles, AlertTriangle,
} from "lucide-react";
import { GlassSection, TButton } from "@/app/components/ui/NativeUI";
import { EmptyState } from "@/app/components/ui/EmptyState";
import { findOrphanedData, executeCleanup, MIN_CLUB_AGE_MS, MIN_MEMBER_AGE_MS } from "@/lib/admin/orphanedCleanup";
import { toast } from "@/lib/ui/toast";
import { confirmDialog } from "@/lib/ui/dialog";
import { useEscapeKey } from "@/lib/ui/useEscapeKey";
import Link from "next/link";

interface MemberRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  clubIds: string[];
  clubMemberships?: Record<string, any>;
  isAdmin: boolean;
  isTrainer: boolean;
  memberType?: string;
  createdAt?: Date | null;
}

interface ClubLookup {
  id: string;
  name: string;
}

type RoleFilter = "all" | "admin" | "trainer" | "member";

export default function MitgliederAdminPage() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [clubs, setClubs] = useState<Map<string, ClubLookup>>(new Map());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [clubFilter, setClubFilter] = useState<string>("all");

  // Cleanup UI state — manual trigger only, NEVER runs automatically.
  // Auto-cleanup would race with the onboarding flow (createClub → updateMember)
  // and delete brand-new clubs before the admin user is assigned.
  const [cleanupPreview, setCleanupPreview] = useState<{
    deletableClubs: number;
    deletableMembers: number;
    preservedClubs: number;
    preservedMembers: number;
  } | null>(null);
  const [cleanupRunning, setCleanupRunning] = useState(false);

  // Escape closes the cleanup preview modal — but only if no destructive op runs.
  useEscapeKey(!!cleanupPreview && !cleanupRunning, () => setCleanupPreview(null));

  const previewCleanup = async () => {
    setCleanupRunning(true);
    try {
      const [clubsSnap, membersSnap] = await Promise.all([
        getDocs(collection(db, "clubs")),
        getDocs(collection(db, "members")),
      ]);
      const candidates = findOrphanedData(clubsSnap, membersSnap);
      setCleanupPreview({
        deletableClubs: candidates.emptyClubIds.length,
        deletableMembers: candidates.orphanedMemberIds.length,
        preservedClubs: candidates.emptyClubIdsPreserved,
        preservedMembers: candidates.orphanedMembersPreserved,
      });
    } catch (e) {
      toast.error("Bereinigung nicht möglich", { description: (e as Error).message });
    }
    setCleanupRunning(false);
  };

  const confirmCleanup = async () => {
    if (!cleanupPreview) return;
    const ok = await confirmDialog({
      title: "Endgültig bereinigen?",
      description:
        `${cleanupPreview.deletableClubs} leere Vereine und ` +
        `${cleanupPreview.deletableMembers} verwaiste Mitglieder werden ` +
        `unwiderruflich gelöscht.`,
      confirmLabel: "Löschen",
      variant: "danger",
    });
    if (!ok) return;

    setCleanupRunning(true);
    try {
      const [clubsSnap, membersSnap] = await Promise.all([
        getDocs(collection(db, "clubs")),
        getDocs(collection(db, "members")),
      ]);
      const candidates = findOrphanedData(clubsSnap, membersSnap);
      const result = await executeCleanup(candidates);
      toast.success("Daten bereinigt", {
        description: `${result.deletedClubs} Vereine und ${result.deletedMembers} Mitglieder gelöscht.`,
      });
      setCleanupPreview(null);
      await loadAll();
    } catch (e) {
      toast.error("Bereinigung fehlgeschlagen", { description: (e as Error).message });
    }
    setCleanupRunning(false);
  };

  const deleteMember = async (id: string, name: string) => {
    const ok = await confirmDialog({
      title: `${name} löschen?`,
      description: "Das Mitglied und sein Login-Konto werden komplett und endgültig aus der App entfernt.",
      confirmLabel: "Endgültig löschen",
      variant: "danger",
    });
    if (!ok) return;

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        toast.error("Nicht autorisiert", { description: "Bitte erneut einloggen." });
        return;
      }
      const res = await fetch("/api/admin/delete-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ memberId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Fehler beim Löschen des Mitglieds.");
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      toast.success("Mitglied gelöscht", { description: `${name} wurde entfernt.` });
    } catch (e) {
      console.error(e);
      toast.error("Löschen fehlgeschlagen", { description: (e as Error).message });
    }
  };

  async function loadAll() {
    setLoading(true);
    try {
      const membersSnap = await getDocs(collection(db, "members"));
      const clubsSnap = await getDocs(collection(db, "clubs"));

      const clubMap = new Map<string, ClubLookup>();
      clubsSnap.docs.forEach((c) => clubMap.set(c.id, { id: c.id, name: c.data().name ?? "—" }));

      const rows: MemberRow[] = membersSnap.docs.map((m) => {
        const data = m.data();
        const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
        const memberships = data.clubMemberships ?? {};
        const anyAdmin = Object.values(memberships).some((mm: any) => mm?.isAdmin) || data.isAdmin === true;
        const anyTrainer = Object.values(memberships).some((mm: any) => mm?.isTrainer) || data.isTrainer === true;
        return {
          id: m.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "—",
          clubIds,
          clubMemberships: memberships,
          isAdmin: anyAdmin,
          isTrainer: anyTrainer,
          memberType: data.memberType,
          createdAt: data.createdAt?.toDate?.() ?? null,
        };
      });

      rows.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
      setMembers(rows);
      setClubs(clubMap);
    } catch (e) {
      console.error("Fehler beim Laden", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      if (roleFilter === "admin" && !m.isAdmin) return false;
      if (roleFilter === "trainer" && !m.isTrainer) return false;
      if (roleFilter === "member" && (m.isAdmin || m.isTrainer)) return false;
      if (clubFilter !== "all" && !m.clubIds.includes(clubFilter)) return false;
      if (search) {
        const q = search.toLowerCase();
        const name = `${m.firstName} ${m.lastName}`.toLowerCase();
        if (!name.includes(q) && !m.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [members, search, roleFilter, clubFilter]);

  const stats = useMemo(() => ({
    total: members.length,
    admins: members.filter((m) => m.isAdmin).length,
    trainers: members.filter((m) => m.isTrainer && !m.isAdmin).length,
    orphans: members.filter((m) => m.clubIds.length === 0).length,
  }), [members]);

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Mitglieder</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              Globale Suche über alle Vereine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={previewCleanup}
              disabled={cleanupRunning || loading}
              title="Verwaiste Daten prüfen (älter als 1h für Mitglieder, 24h für Vereine)"
              className="flex items-center gap-2 px-3 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
            >
              <Sparkles size={13} /> Bereinigen
            </button>
            <button aria-label="Aktualisieren"
              onClick={loadAll}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Cleanup preview modal */}
        {cleanupPreview && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => !cleanupRunning && setCleanupPreview(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassSection>
                <div className="p-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <AlertTriangle size={18} className="text-orange-500" />
                    </div>
                    <h3 className="text-lg font-poppins font-bold text-[#0A0A0A]">Datenbereinigung</h3>
                  </div>
                  <div className="space-y-2 text-[12px] text-[#52525B]">
                    <div className="flex justify-between py-1 border-b border-black/[0.04]">
                      <span>Löschbare leere Vereine (älter als 24h):</span>
                      <span className="font-bold text-[#0A0A0A]">{cleanupPreview.deletableClubs}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-black/[0.04]">
                      <span>Löschbare verwaiste Mitglieder (älter als 1h):</span>
                      <span className="font-bold text-[#0A0A0A]">{cleanupPreview.deletableMembers}</span>
                    </div>
                    {(cleanupPreview.preservedClubs > 0 || cleanupPreview.preservedMembers > 0) && (
                      <div className="text-[10px] text-[#71717A] pt-2">
                        {cleanupPreview.preservedClubs > 0 && <p>· {cleanupPreview.preservedClubs} leere Vereine zu jung oder ohne createdAt – nicht löschbar</p>}
                        {cleanupPreview.preservedMembers > 0 && <p>· {cleanupPreview.preservedMembers} verwaiste Mitglieder zu jung oder ohne createdAt – nicht löschbar</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mt-2">
                    <TButton
                      label={cleanupRunning ? "Lösche…" : `${cleanupPreview.deletableClubs + cleanupPreview.deletableMembers} Einträge löschen`}
                      variant="danger"
                      onClick={confirmCleanup}
                      disabled={cleanupRunning || (cleanupPreview.deletableClubs + cleanupPreview.deletableMembers) === 0}
                    />
                    <TButton label="Abbrechen" variant="secondary" onClick={() => setCleanupPreview(null)} disabled={cleanupRunning} />
                  </div>
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Gesamt" value={stats.total} color="#0A0A0A" />
          <StatCard label="Admins" value={stats.admins} color="#AF52DE" />
          <StatCard label="Trainer" value={stats.trainers} color="#007AFF" />
          <StatCard label="Ohne Verein" value={stats.orphans} color="#FF453A" />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Name oder E-Mail suchen…"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-black/[0.06] text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
              />
            </div>

            {/* Role pills */}
            <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5">
              {(["all", "admin", "trainer", "member"] as RoleFilter[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-poppins font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                    roleFilter === r ? "bg-[#0A0A0A] text-white" : "text-[#71717A]"
                  }`}
                >
                  {r === "all" ? "Alle" : r === "member" ? "Mitglied" : r}
                </button>
              ))}
            </div>
          </div>

          {/* Club filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={11} className="text-[#71717A]" />
            <button
              onClick={() => setClubFilter("all")}
              className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-all ${
                clubFilter === "all" ? "bg-[#0A0A0A] text-white" : "bg-black/[0.04] text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              Alle Vereine
            </button>
            {Array.from(clubs.values()).map((c) => (
              <button
                key={c.id}
                onClick={() => setClubFilter(c.id)}
                className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-all ${
                  clubFilter === c.id ? "bg-[#0A0A0A] text-white" : "bg-black/[0.04] text-[#71717A] hover:text-[#0A0A0A]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Keine Mitglieder gefunden"
            description={
              search
                ? `Kein Mitglied passt zum Suchbegriff "${search}".`
                : "In dieser Auswahl sind keine Mitglieder."
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#71717A] pl-1">
              {filtered.length} Treffer
            </p>
            {filtered.map((m, i) => (
              <MemberCard key={m.id} member={m} clubs={clubs} index={i} onDelete={deleteMember} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MemberCard({ member, clubs, index, onDelete }: { member: MemberRow; clubs: Map<string, ClubLookup>; index: number; onDelete: (id: string, name: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.015, 0.3) }}
    >
      <GlassSection>
        <div className="p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[12px] shrink-0" style={{ background: "rgba(0,0,0,0.05)", color: "#0A0A0A" }}>
            {(member.firstName.charAt(0) || "?").toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-poppins font-bold text-[14px] text-[#0A0A0A] truncate">{member.firstName} {member.lastName}</span>
              {member.isAdmin && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                  <Crown size={9} /> Admin
                </span>
              )}
              {member.isTrainer && !member.isAdmin && (
                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                  <Shield size={9} /> Trainer
                </span>
              )}
              {member.clubIds.length === 0 && (
                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-red-500/10 text-red-500">Ohne Verein</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-[10px] text-[#52525B] truncate flex items-center gap-1">
                <Mail size={9} /> {member.email}
              </span>
              {member.clubIds.slice(0, 3).map((cid) => {
                const c = clubs.get(cid);
                if (!c) return null;
                return (
                  <Link
                    key={cid}
                    href={`/admin/vereine/${cid}`}
                    className="flex items-center gap-1 text-[10px] font-bold text-[#71717A] hover:text-[#0A0A0A] hover:underline"
                  >
                    <Building2 size={9} /> {c.name}
                  </Link>
                );
              })}
              {member.clubIds.length > 3 && (
                <span className="text-[10px] text-[#A1A1AA]">+{member.clubIds.length - 3}</span>
              )}
            </div>
          </div>

          <span className="hidden sm:block font-mono text-[10px] text-[#A1A1AA] shrink-0">{member.id.slice(0, 10)}…</span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(member.id, `${member.firstName} ${member.lastName}`);
            }}
            className="p-2.5 rounded-xl border border-red-500/10 text-red-500 hover:bg-red-500/5 hover:border-red-500/20 transition-all shrink-0 relative z-20"
            title="Mitglied komplett löschen"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </GlassSection>
    </motion.div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="p-5 rounded-[24px] flex items-center gap-4" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex flex-col">
        <p className="text-[28px] font-poppins font-bold leading-none" style={{ color }}>{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#71717A" }}>{label}</p>
      </div>
    </div>
  );
}
