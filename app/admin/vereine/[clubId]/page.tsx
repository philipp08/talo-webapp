"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase/config";
import {
  collection, getDocs, doc, getDoc, updateDoc, Timestamp,
  query, orderBy, limit, deleteDoc,
} from "firebase/firestore";
import { motion } from "framer-motion";
import {
  Building2, Users, Calendar, Key, ArrowLeft, RefreshCw, Trash2,
  Crown, Shield, Activity, FileText, Settings, AlertTriangle,
  CheckCircle2, Mail, ChevronRight, Save, X, Sparkles,
} from "lucide-react";
import { GlassSection, TLine, TButton } from "@/app/components/ui/NativeUI";
import { getPlanFeatures, getPlanKey, PLAN_TIERS, PlanKey } from "@/lib/firebase/models";
import Link from "next/link";

interface ClubDetail {
  id: string;
  name: string;
  plan: string;
  memberCount: number;
  licenseStatus?: string;
  licenseExpiresAt?: any;
  isTrial?: boolean;
  sportType?: string;
  requiredPoints?: number;
  compensationPerMissingPoint?: number;
  brandColor?: string;
  accentColor?: string;
  logoUrl?: string;
  createdAt?: Date | null;
  seasonType?: string;
}

interface MemberSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isAdmin: boolean;
  isTrainer: boolean;
  memberType?: string;
}

interface EntrySummary {
  id: string;
  memberId: string;
  memberName?: string;
  activityName: string;
  points: number;
  status: string;
  date: Date | null;
}

const fmtDate = (d: Date | null): string => {
  if (!d) return "—";
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
};

export default function ClubDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clubId = params?.clubId as string;

  const [club, setClub] = useState<ClubDetail | null>(null);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [shiftCount, setShiftCount] = useState(0);
  const [trainingCount, setTrainingCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [groupCount, setGroupCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Plan editing
  const [editingPlan, setEditingPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<PlanKey>("starter");
  const [newExpiry, setNewExpiry] = useState("");
  const [savingPlan, setSavingPlan] = useState(false);

  // Delete confirmation
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Club config editing
  const [editingConfig, setEditingConfig] = useState(false);
  const [configName, setConfigName] = useState("");
  const [configSportType, setConfigSportType] = useState("");
  const [configRequiredPoints, setConfigRequiredPoints] = useState(0);
  const [configCompensation, setConfigCompensation] = useState(0);
  const [configSeasonType, setConfigSeasonType] = useState("calendar");
  const [configIsTrial, setConfigIsTrial] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);

  async function loadAll() {
    if (!clubId) return;
    setLoading(true);
    try {
      const clubDoc = await getDoc(doc(db, "clubs", clubId));
      if (!clubDoc.exists()) {
        setClub(null);
        setLoading(false);
        return;
      }
      const cd = clubDoc.data();
      setConfigName(cd.name ?? "");
      setConfigSportType(cd.sportType ?? "");
      setConfigRequiredPoints(cd.requiredPoints ?? 0);
      setConfigCompensation(cd.compensationPerMissingPoint ?? 0);
      setConfigSeasonType(cd.seasonType ?? "calendar");
      setConfigIsTrial(cd.isTrial ?? false);

      const safeGetDocs = async (ref: any) => {
        try {
          return await getDocs(ref);
        } catch (e) {
          console.error("Firestore getDocs failed gracefully for reference:", ref, e);
          return { docs: [], size: 0 } as any;
        }
      };

      const [membersSnap, activitiesSnap, groupsSnap, shiftsSnap, trainingsSnap] =
        await Promise.all([
          safeGetDocs(collection(db, "members")),
          safeGetDocs(collection(db, `clubs/${clubId}/activities`)),
          safeGetDocs(collection(db, `clubs/${clubId}/groups`)),
          safeGetDocs(collection(db, `clubs/${clubId}/shifts`)),
          safeGetDocs(collection(db, `clubs/${clubId}/trainings`)),
        ]);

      const getSafeDate = (val: any) => {
        if (!val) return new Date(2000, 0, 1);
        if (typeof val.toDate === "function") return val.toDate();
        const parsed = new Date(val);
        return isNaN(parsed.getTime()) ? new Date(2000, 0, 1) : parsed;
      };

      let entriesDocs: any[] = [];
      try {
        const snap = await getDocs(query(collection(db, `clubs/${clubId}/entries`), orderBy("date", "desc"), limit(50)));
        entriesDocs = snap.docs;
      } catch (e) {
        try {
          const snap = await safeGetDocs(collection(db, `clubs/${clubId}/entries`));
          entriesDocs = snap.docs;
        } catch {
          entriesDocs = [];
        }
      }

      const clubMembers: MemberSummary[] = [];
      membersSnap.docs.forEach((m: any) => {
        const data = m.data();
        const clubIds: string[] = data.clubIds ?? (data.clubId ? [data.clubId] : []);
        if (!clubIds.includes(clubId)) return;
        const membership = data.clubMemberships?.[clubId];
        clubMembers.push({
          id: m.id,
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          email: data.email ?? "—",
          isAdmin: membership?.isAdmin ?? data.isAdmin ?? false,
          isTrainer: membership?.isTrainer ?? data.isTrainer ?? false,
          memberType: membership?.memberType ?? data.memberType,
        });
      });
      clubMembers.sort((a, b) => {
        if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
        if (a.isTrainer !== b.isTrainer) return a.isTrainer ? -1 : 1;
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      });

      const memberNameById = new Map<string, string>();
      clubMembers.forEach((m) => memberNameById.set(m.id, `${m.firstName} ${m.lastName}`.trim()));

      // Sort in memory by date descending to be 100% robust and index-free
      entriesDocs.sort((a, b) => {
        const dateA = getSafeDate(a.data().date);
        const dateB = getSafeDate(b.data().date);
        return dateB.getTime() - dateA.getTime();
      });

      const recentEntries: EntrySummary[] = entriesDocs.slice(0, 15).map((e: any) => {
        const d = e.data();
        return {
          id: e.id,
          memberId: d.memberId,
          memberName: memberNameById.get(d.memberId) ?? "—",
          activityName: d.activityName ?? "—",
          points: d.points ?? 0,
          status: d.status ?? "—",
          date: getSafeDate(d.date),
        };
      });

      setClub({
        id: clubDoc.id,
        name: cd.name ?? "Unbekannt",
        plan: getPlanKey(cd.plan),
        memberCount: clubMembers.length,
        licenseStatus: cd.licenseStatus,
        licenseExpiresAt: cd.licenseExpiresAt,
        isTrial: cd.isTrial ?? false,
        sportType: cd.sportType,
        requiredPoints: cd.requiredPoints,
        compensationPerMissingPoint: cd.compensationPerMissingPoint,
        brandColor: cd.brandColor,
        accentColor: cd.accentColor,
        logoUrl: cd.logoUrl,
        createdAt: cd.createdAt?.toDate?.() ?? null,
        seasonType: cd.seasonType,
      });
      setMembers(clubMembers);
      setEntries(recentEntries);
      setShiftCount(shiftsSnap.size);
      setTrainingCount(trainingsSnap.size);
      setActivityCount(activitiesSnap.size);
      setGroupCount(groupsSnap.size);

      setNewPlan(getPlanKey(cd.plan));
      if (cd.licenseExpiresAt?.toDate) {
        const exp = cd.licenseExpiresAt.toDate();
        setNewExpiry(exp.toISOString().split("T")[0]);
      }
    } catch (e) {
      console.error("Fehler beim Laden", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, [clubId]);

  const savePlan = async () => {
    if (!club) return;
    setSavingPlan(true);
    try {
      const updates: Record<string, any> = {
        plan: newPlan,
        licenseStatus: newPlan === "starter" ? "expired" : "active",
      };
      if (newPlan === "starter") {
        updates.licenseExpiresAt = null;
        updates.isTrial = false;
      } else if (newExpiry) {
        updates.licenseExpiresAt = Timestamp.fromDate(new Date(newExpiry));
      }
      await updateDoc(doc(db, "clubs", club.id), updates);
      setEditingPlan(false);
      await loadAll();
    } catch (e) {
      alert("Fehler: " + (e as Error).message);
    }
    setSavingPlan(false);
  };

  const extendLicense = async (years: number) => {
    if (!club) return;
    const currentExpiry =
      club.licenseExpiresAt?.toDate?.() ?? new Date();
    const base = currentExpiry > new Date() ? currentExpiry : new Date();
    const newDate = new Date(base);
    newDate.setFullYear(newDate.getFullYear() + years);
    await updateDoc(doc(db, "clubs", club.id), {
      licenseExpiresAt: Timestamp.fromDate(newDate),
      licenseStatus: "active",
    });
    await loadAll();
  };

  const saveConfig = async () => {
    if (!club) return;
    setSavingConfig(true);
    try {
      await updateDoc(doc(db, "clubs", club.id), {
        name: configName,
        sportType: configSportType,
        requiredPoints: Number(configRequiredPoints),
        compensationPerMissingPoint: Number(configCompensation),
        seasonType: configSeasonType,
        isTrial: configIsTrial,
      });
      setEditingConfig(false);
      await loadAll();
    } catch (e) {
      alert("Fehler beim Speichern: " + (e as Error).message);
    }
    setSavingConfig(false);
  };

  const handleDeleteClub = async () => {
    if (!club) return;
    setDeleting(true);
    try {
      // Note: this only deletes the club doc — subcollections (entries, members membership refs)
      // need to be cleaned via a Cloud Function in production. For now, manual cleanup.
      await deleteDoc(doc(db, "clubs", club.id));
      router.push("/admin/vereine");
    } catch (e) {
      alert("Fehler beim Löschen: " + (e as Error).message);
      setDeleting(false);
    }
  };

  const planFeatures = club ? getPlanFeatures(club.plan) : null;
  const licenseExpired = useMemo(() => {
    if (!club?.licenseExpiresAt) return false;
    try {
      const d = club.licenseExpiresAt.toDate?.() ?? new Date(club.licenseExpiresAt);
      return d < new Date();
    } catch { return false; }
  }, [club]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertTriangle size={32} className="text-[#FF453A]" />
        <p className="text-[#0A0A0A] font-bold">Verein nicht gefunden</p>
        <Link href="/admin/vereine" className="text-[12px] text-[#007AFF] hover:underline">← Zurück zur Übersicht</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Back nav */}
        <Link href="/admin/vereine" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A] transition-colors w-fit">
          <ArrowLeft size={13} /> Vereine
        </Link>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex items-center gap-4">
            {club.logoUrl ? (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden p-2">
                <img src={club.logoUrl} alt={club.name} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.05)" }}>
                <Building2 size={22} style={{ color: "#71717A" }} />
              </div>
            )}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{club.name}</h1>
                {club.isTrial && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#0A0A0A] text-white">Trial</span>
                )}
                {licenseExpired && (
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-red-500/10 text-red-500">Abgelaufen</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-[11px] text-[#71717A]">
                <span className="font-mono">{club.id}</span>
                {club.sportType && <span>· {club.sportType}</span>}
                {club.createdAt && <span>· erstellt {fmtDate(club.createdAt)}</span>}
              </div>
            </div>
          </div>
          <button
            onClick={loadAll}
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
            style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
          >
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MiniStat label="Mitglieder" value={club.memberCount} max={planFeatures?.maxMembers} icon={Users} color="#0A0A0A" />
          <MiniStat label="Einträge" value={entries.length} icon={FileText} color="#34C759" />
          <MiniStat label="Aktivitäten" value={activityCount} icon={Activity} color="#FF9500" />
          <MiniStat label="Schichten" value={shiftCount} icon={Calendar} color="#007AFF" />
          <MiniStat label="Trainings" value={trainingCount} icon={Sparkles} color="#AF52DE" />
        </div>

        {/* Main grid: left settings/license, right members + entries */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT: Plan & License */}
          <div className="flex flex-col gap-4">
            <GlassSection>
              <div className="p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Plan & Lizenz</p>
                  {!editingPlan && (
                    <button onClick={() => setEditingPlan(true)} className="text-[11px] font-bold text-[#007AFF] hover:underline">
                      Bearbeiten
                    </button>
                  )}
                </div>
                <TLine />

                {!editingPlan ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-poppins font-black text-[#0A0A0A]">{planFeatures?.name}</span>
                      <span className="text-[12px] text-[#71717A]">{planFeatures?.price}{planFeatures?.period}</span>
                    </div>
                    <div className="text-[12px] text-[#52525B] space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Lizenz-Status:</span>
                        <span className={`font-bold ${licenseExpired ? "text-red-500" : "text-[#34C759]"}`}>
                          {licenseExpired ? "Abgelaufen" : club.licenseStatus ?? "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#71717A]">Ablauf:</span>
                        <span className="font-bold">{club.licenseExpiresAt?.toDate ? fmtDate(club.licenseExpiresAt.toDate()) : "—"}</span>
                      </div>
                    </div>
                    <TLine />
                    <div className="flex flex-col gap-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Schnellaktionen</p>
                      <button onClick={() => extendLicense(1)} className="text-left px-3 py-2 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] text-[12px] font-bold text-[#0A0A0A] transition-all">
                        + 1 Jahr Lizenz verlängern
                      </button>
                      <button onClick={() => extendLicense(2)} className="text-left px-3 py-2 rounded-lg bg-black/[0.03] hover:bg-black/[0.06] text-[12px] font-bold text-[#0A0A0A] transition-all">
                        + 2 Jahre Lizenz verlängern
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Plan</label>
                      <div className="grid grid-cols-3 gap-2">
                        {PLAN_TIERS.map((tier) => (
                          <button
                            key={tier.key}
                            onClick={() => setNewPlan(tier.key)}
                            className={`py-2 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                              newPlan === tier.key
                                ? "bg-[#0A0A0A] text-white border-black/15"
                                : "bg-black/[0.03] text-[#71717A] border-black/5"
                            }`}
                          >
                            {tier.name}
                          </button>
                        ))}
                      </div>
                    </div>
                    {newPlan !== "starter" && (
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Ablaufdatum</label>
                        <input
                          type="date"
                          value={newExpiry}
                          onChange={(e) => setNewExpiry(e.target.value)}
                          className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A]"
                        />
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <TButton label={savingPlan ? "..." : "Speichern"} onClick={savePlan} disabled={savingPlan} />
                      <TButton label="Abbrechen" variant="ghost" onClick={() => setEditingPlan(false)} />
                    </div>
                  </>
                )}
              </div>
            </GlassSection>

            {/* Vereins-Konfiguration */}
            <GlassSection>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Konfiguration</p>
                  {!editingConfig && (
                    <button onClick={() => setEditingConfig(true)} className="text-[11px] font-bold text-[#007AFF] hover:underline">
                      Bearbeiten
                    </button>
                  )}
                </div>
                <TLine />

                {!editingConfig ? (
                  <div className="text-[12px] text-[#52525B] space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Vereinsname:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Pflichtpunkte:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.requiredPoints ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Ausgleichsbetrag:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.compensationPerMissingPoint ?? "—"}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Saisontyp:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.seasonType === "calendar" ? "Kalenderjahr" : "Halbjahr/Saison"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Sportart:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.sportType ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Trial-Status:</span>
                      <span className="font-bold text-[#0A0A0A]">{club.isTrial ? "Ja (Testphase)" : "Nein"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#71717A]">Abteilungen/Gruppen:</span>
                      <span className="font-bold text-[#0A0A0A]">{groupCount}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Vereinsname</label>
                      <input
                        type="text"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A] focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Sportart</label>
                      <select
                        value={configSportType}
                        onChange={(e) => setConfigSportType(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A] focus:outline-none"
                      >
                        <option value="">Keine Angabe</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Fußball">Fußball</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Handball">Handball</option>
                        <option value="Volleyball">Volleyball</option>
                        <option value="Turnen">Turnen</option>
                        <option value="Tischtennis">Tischtennis</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Leichtathletik">Leichtathletik</option>
                        <option value="Schwimmen">Schwimmen</option>
                        <option value="Fitness / Breitensport">Fitness / Breitensport</option>
                        <option value="Sonstige">Sonstige / Andere</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Pflichtpunkte</label>
                        <input
                          type="number"
                          value={configRequiredPoints}
                          onChange={(e) => setConfigRequiredPoints(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A] focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Ausgleich (€/Pkt)</label>
                        <input
                          type="number"
                          value={configCompensation}
                          onChange={(e) => setConfigCompensation(Number(e.target.value))}
                          className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A] focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">Saisontyp</label>
                      <select
                        value={configSeasonType}
                        onChange={(e) => setConfigSeasonType(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.06] text-[12px] font-poppins text-[#0A0A0A] focus:outline-none"
                      >
                        <option value="calendar">Kalenderjahr</option>
                        <option value="halfyear">Halbjahr</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        id="isTrial"
                        checked={configIsTrial}
                        onChange={(e) => setConfigIsTrial(e.target.checked)}
                        className="w-4 h-4 accent-black"
                      />
                      <label htmlFor="isTrial" className="text-[12px] font-bold text-[#0A0A0A] select-none cursor-pointer">
                        Trial-Phase (Testmodus) aktiv
                      </label>
                    </div>
                    <div className="flex gap-2 mt-1">
                      <TButton label={savingConfig ? "..." : "Speichern"} onClick={saveConfig} disabled={savingConfig} />
                      <TButton label="Abbrechen" variant="ghost" onClick={() => setEditingConfig(false)} />
                    </div>
                  </div>
                )}
              </div>
            </GlassSection>

            {/* Danger Zone */}
            <GlassSection>
              <div className="p-5 flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500">Gefahrenzone</p>
                <TLine />
                <button
                  onClick={() => setShowDelete(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/[0.06] hover:bg-red-500/10 text-[12px] font-bold text-red-500 transition-all"
                >
                  <Trash2 size={13} /> Verein löschen
                </button>
                <p className="text-[10px] text-[#71717A]">
                  Löscht nur das Club-Dokument. Subcollections (Einträge, Schichten) müssen separat bereinigt werden.
                </p>
              </div>
            </GlassSection>
          </div>

          {/* RIGHT: Members + Recent Entries */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Members */}
            <GlassSection>
              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Mitglieder ({members.length})</p>
                </div>
                <TLine />
                {members.length === 0 ? (
                  <p className="text-[12px] text-[#71717A] py-6 text-center">Noch keine Mitglieder.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-black/[0.04] max-h-[400px] overflow-y-auto">
                    {members.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 py-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0" style={{ background: "rgba(0,0,0,0.05)", color: "#0A0A0A" }}>
                          {(m.firstName.charAt(0) || "?").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-poppins font-semibold text-[#0A0A0A] truncate">{m.firstName} {m.lastName}</span>
                            {m.isAdmin && (
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-500">
                                <Crown size={9} /> Admin
                              </span>
                            )}
                            {m.isTrainer && !m.isAdmin && (
                              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                                <Shield size={9} /> Trainer
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#71717A] truncate">{m.email} · {m.memberType ?? "—"}</p>
                        </div>
                        <a href={`mailto:${m.email}`} className="text-[#A1A1AA] hover:text-[#0A0A0A] shrink-0" title="E-Mail senden">
                          <Mail size={13} />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassSection>

            {/* Recent Entries */}
            <GlassSection>
              <div className="p-5 flex flex-col gap-3">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#71717A]">Letzte Einträge</p>
                <TLine />
                {entries.length === 0 ? (
                  <p className="text-[12px] text-[#71717A] py-6 text-center">Noch keine Einträge.</p>
                ) : (
                  <div className="flex flex-col divide-y divide-black/[0.04]">
                    {entries.map((e) => (
                      <div key={e.id} className="flex items-center gap-3 py-2.5">
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-poppins font-semibold text-[#0A0A0A] truncate">{e.activityName}</p>
                          <p className="text-[10px] text-[#71717A] truncate">{e.memberName} · {fmtDate(e.date)}</p>
                        </div>
                        <span className="text-[11px] font-bold text-[#0A0A0A] shrink-0">{e.points}P</span>
                        <span
                          className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded shrink-0"
                          style={{
                            background:
                              e.status === "Genehmigt" ? "rgba(52,199,89,0.12)" :
                              e.status === "Abgelehnt" ? "rgba(255,69,58,0.12)" :
                              "rgba(255,149,0,0.12)",
                            color:
                              e.status === "Genehmigt" ? "#34C759" :
                              e.status === "Abgelehnt" ? "#FF453A" :
                              "#FF9500",
                          }}
                        >
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </GlassSection>

          </div>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm"
          >
            <GlassSection>
              <div className="p-6 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <h3 className="text-lg font-poppins font-bold text-[#0A0A0A]">Verein löschen?</h3>
                <p className="text-[12px] text-[#52525B]">
                  „{club.name}" wird unwiderruflich gelöscht. Mitglieder bleiben erhalten, verlieren aber den Zugriff.
                </p>
                <div className="flex flex-col gap-2 w-full mt-2">
                  <TButton label={deleting ? "Wird gelöscht…" : "Endgültig löschen"} variant="danger" onClick={handleDeleteClub} disabled={deleting} />
                  <TButton label="Abbrechen" variant="secondary" onClick={() => setShowDelete(false)} />
                </div>
              </div>
            </GlassSection>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MiniStat({ label, value, max, icon: Icon, color }: { label: string; value: number; max?: number; icon: React.ElementType; color: string }) {
  return (
    <div className="p-4 rounded-2xl" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={13} style={{ color }} />
        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: "#71717A" }}>{label}</span>
      </div>
      <p className="text-[22px] font-poppins font-bold text-[#0A0A0A] leading-none">
        {value.toLocaleString("de-DE")}
        {max != null && <span className="text-[12px] text-[#71717A] font-medium"> / {max}</span>}
      </p>
    </div>
  );
}
