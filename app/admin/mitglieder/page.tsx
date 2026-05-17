"use client";

import { useEffect, useMemo, useState } from "react";
import { db, auth } from "@/lib/firebase/config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Users, RefreshCw, Search, Crown, Shield, Mail,
  Building2, Filter, ChevronRight, Trash2,
} from "lucide-react";
import { GlassSection } from "@/app/components/ui/NativeUI";
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

  async function runOrphanedCleanup(cSnap: any, mSnap: any) {
    try {
      const memberCountByClub = new Map<string, number>();
      const memberClubMap = new Map<string, string[]>();
      
      mSnap.docs.forEach((m: any) => {
        const data = m.data();
        const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
        memberClubMap.set(m.id, clubIds);
        clubIds.forEach((cid) => {
          memberCountByClub.set(cid, (memberCountByClub.get(cid) ?? 0) + 1);
        });
      });

      const emptyClubIds: string[] = [];
      cSnap.docs.forEach((c: any) => {
        const memberCount = memberCountByClub.get(c.id) ?? 0;
        if (memberCount === 0) {
          emptyClubIds.push(c.id);
        }
      });

      const orphanedMemberIds: string[] = [];
      // Use a shorter safety duration or immediate deletion for orphans if they are found in list
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      mSnap.docs.forEach((m: any) => {
        const data = m.data();
        const clubIds = memberClubMap.get(m.id) ?? [];
        const createdAt = data.createdAt?.toDate?.() ?? new Date();
        if (clubIds.length === 0 && createdAt < fiveMinutesAgo) {
          orphanedMemberIds.push(m.id);
        }
      });

      if (emptyClubIds.length > 0) {
        console.log(`Auto-deleting ${emptyClubIds.length} empty clubs:`, emptyClubIds);
        await Promise.all(emptyClubIds.map(id => deleteDoc(doc(db, "clubs", id))));
      }

      if (orphanedMemberIds.length > 0) {
        console.log(`Auto-deleting ${orphanedMemberIds.length} orphaned members:`, orphanedMemberIds);
        await Promise.all(orphanedMemberIds.map(id => deleteDoc(doc(db, "members", id))));
      }
      
      return {
        deletedClubs: emptyClubIds.length,
        deletedMembers: orphanedMemberIds.length
      };
    } catch (e) {
      console.error("Fehler bei der automatischen Bereinigung verwaister Daten:", e);
      return { deletedClubs: 0, deletedMembers: 0 };
    }
  }

  const deleteMember = async (id: string, name: string) => {
    if (!confirm(`Möchtest du das Mitglied "${name}" und sein Login-Konto wirklich komplett und endgültig aus der App löschen?`)) return;
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        alert("Fehler: Nicht autorisiert.");
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
      alert("Mitglied und Login-Konto erfolgreich gelöscht!");
    } catch (e) {
      console.error(e);
      alert("Fehler beim Löschen: " + (e as Error).message);
    }
  };

  async function loadAll() {
    setLoading(true);
    try {
      let membersSnap = await getDocs(collection(db, "members"));
      let clubsSnap = await getDocs(collection(db, "clubs"));

      const cleanup = await runOrphanedCleanup(clubsSnap, membersSnap);
      if (cleanup.deletedClubs > 0 || cleanup.deletedMembers > 0) {
        membersSnap = await getDocs(collection(db, "members"));
        clubsSnap = await getDocs(collection(db, "clubs"));
      }

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
          <button
            onClick={loadAll}
            disabled={loading}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Users size={32} className="mb-4" style={{ color: "#71717A" }} />
            <p className="font-poppins font-bold text-[18px] text-[#0A0A0A] mb-2">Keine Mitglieder gefunden</p>
          </div>
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
