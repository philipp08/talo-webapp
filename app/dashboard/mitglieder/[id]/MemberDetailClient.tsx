"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, AlertTriangle, X, Pencil, Camera,
  ShieldCheck, Calendar,
  RefreshCcw, ChevronRight, MoreHorizontal,
  MailQuestion, Activity, Settings, Layers, Lock
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import {
  Member, Entry, MemberType,
  calculateTargetPoints, EntryStatus, ClubGroup, getPlanFeatures, isLightColor,
} from "@/lib/firebase/models";
import { 
  TAvatar,
  TButton, TCatBadge, TStatusBadge
} from "@/app/components/ui/NativeUI";

function toDate(d: Entry["date"]): Date {
  return d instanceof Date ? d : d.toDate();
}

function toDateInput(d: Entry["date"]): string {
  const date = toDate(d);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function parseDateInput(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export default function MemberDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const router          = useRouter();
  const currentClub     = useAppStore((s) => s.currentClub);
  const currentMember   = useAppStore((s) => s.currentMember);

  const [member,  setMember]  = useState<Member | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // member edit
  const [isEditExpanded, setIsEditExpanded] = useState(false);
  const [editForm,    setEditForm]    = useState({
    firstName: "", lastName: "", email: "",
    memberType: MemberType.Active as string,
    isAdmin: false, isTrainer: false,
    groupId: "",
  });
  const [saving,    setSaving]    = useState(false);
  const [editSaved, setEditSaved] = useState(false);

  // entry edit modal
  const [entryToEdit,  setEntryToEdit]  = useState<Entry | null>(null);
  const [entryForm,    setEntryForm]    = useState<{
    activityName: string; activityCategory: string;
    points: string; status: string; notes: string;
    date: string; rejectionReason: string;
  } | null>(null);
  const [savingEntry, setSavingEntry] = useState(false);

  // delete modals
  const [memberToDelete, setMemberToDelete] = useState(false);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;
  const canViewMember = isAdmin || isTrainer;
  const planFeatures = getPlanFeatures(currentClub?.plan);
  const accentRaw     = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent        = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight   = isLightColor(accent);

  useEffect(() => {
    if (!currentClub || !canViewMember) return;
    FirebaseManager.getMember(id, currentClub.id).then((m) => {
      if (m) {
        if (!m.clubIds.includes(currentClub.id)) {
          setMember(null);
          setLoading(false);
          return;
        }

        setMember(m);
        setEditForm({
          firstName: m.firstName, lastName: m.lastName, email: m.email,
          memberType: m.memberType, isAdmin: m.isAdmin, isTrainer: m.isTrainer,
          groupId: m.groupId ?? "",
        });
      }
      setLoading(false);
    });
    const unsub = FirebaseManager.listenToEntries(currentClub.id, (all) => {
      const filtered = all.filter((e) => e.memberId === id);
      const sorted = [...filtered].sort((a, b) => {
        const t1 = toDate(a.date).getTime();
        const t2 = toDate(b.date).getTime();
        return t2 - t1;
      });
      setEntries(sorted);
    });
    return () => unsub();
  }, [currentClub, id, canViewMember]);

  useEffect(() => {
    if (!currentClub || !planFeatures.hasGroups) return;
    return FirebaseManager.listenToGroups(currentClub.id, setGroups);
  }, [currentClub, planFeatures.hasGroups]);

  const visibleGroups = planFeatures.hasGroups ? groups : [];

  const availableMemberTypes = (() => {
    const types: string[] = Object.values(MemberType);
    if (planFeatures.hasCustomMemberTypes && currentClub?.customMemberTypes) {
      currentClub.customMemberTypes.forEach(c => {
        if (!types.includes(c.name)) types.push(c.name);
      });
    }
    if (member && !types.includes(member.memberType)) {
      types.push(member.memberType);
    }
    return types;
  })();

  const targetPts   = member && currentClub ? calculateTargetPoints(member, currentClub) : 15;
  const approvedPts = entries.filter((e) => e.status === "Genehmigt").reduce((s, e) => s + e.points, 0);
  const pendingPts  = entries.filter((e) => e.status === "Ausstehend").reduce((s, e) => s + e.points, 0);
  const missingPts  = Math.max(0, targetPts - approvedPts);
  const progress    = targetPts > 0 ? Math.min(1, approvedPts / targetPts) : 0;
  const progressColor = progress >= 1 ? "#0A0A0A" : progress >= 0.5 ? "#52525B" : "#333333";
  const isExempt    = member?.memberType === MemberType.Youth || member?.memberType === MemberType.Board;

  const saveMember = async () => {
    if (!isAdmin || !currentClub || !member) return;
    setSaving(true);
    const nextProfile = {
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      email: editForm.email.trim().toLowerCase(),
    };
    
    // Merge existing membership to avoid wiping customTargetPoints, etc.
    const existingMembership = member.clubMemberships?.[currentClub.id] || {};
    const nextMembership = {
      ...existingMembership,
      memberType: editForm.memberType,
      isAdmin: editForm.isAdmin,
      isTrainer: planFeatures.hasAdvancedRoles ? editForm.isTrainer : false,
      ...(planFeatures.hasGroups && editForm.groupId ? { groupId: editForm.groupId } : {}),
    };
    
    // Also store memberType at the root for legacy compatibility
    await Promise.all([
      FirebaseManager.updateMember(member.id, {
        ...nextProfile,
        memberType: editForm.memberType,
      }),
      FirebaseManager.updateMemberMembership(member.id, currentClub.id, nextMembership),
    ]);

    setMember({ 
      ...member, 
      ...nextProfile, 
      memberType: editForm.memberType,
      clubMemberships: {
        ...(member.clubMemberships || {}),
        [currentClub.id]: nextMembership,
      }
    });
    setEditSaved(true);
    setTimeout(() => { setEditSaved(false); setIsEditExpanded(false); }, 1500);
    setSaving(false);
  };

  const removeMember = async () => {
    if (!isAdmin || !currentClub || !member) return;
    const { fullyDeleted } = await FirebaseManager.removeMemberFromClub(member, currentClub.id);

    // If the member has no remaining clubs, also delete their Firebase Auth account
    if (fullyDeleted) {
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();
        if (token) {
          const res = await fetch("/api/members/delete-auth", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uid: member.id, clubId: currentClub.id }),
          });
          
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            console.error("Auth deletion failed:", data.error || data);
            alert(`Mitglied wurde aus der Datenbank gelöscht, aber das Firebase Auth-Konto konnte nicht entfernt werden.\n\nGrund: ${data.error || data.reason || "Serverfehler"}.\n\nBitte vergewissere dich, dass die Firebase Admin-Umgebungsvariablen (FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY) auf dem Server (Vercel) konfiguriert sind, damit Auth-Konten administrativ entfernt werden können.`);
          }
        }
      } catch (err) {
        console.error("Auth-Konto konnte nicht gelöscht werden:", err);
      }
    }

    router.push("/dashboard/mitglieder");
  };

  const openEntryEdit = (entry: Entry) => {
    setEntryToEdit(entry);
    setEntryForm({
      activityName:     entry.activityName,
      activityCategory: entry.activityCategory as string,
      points:           String(entry.points),
      status:           entry.status as string,
      notes:            entry.notes ?? "",
      date:             toDateInput(entry.date),
      rejectionReason:  entry.rejectionReason ?? "",
    });
  };

  const saveEntry = async () => {
    if (!isAdmin || !currentClub || !entryToEdit || !entryForm) return;
    setSavingEntry(true);
    const updated: Entry = {
      ...entryToEdit,
      activityName:     entryForm.activityName,
      activityCategory: entryForm.activityCategory,
      points:           parseFloat(entryForm.points) || 0,
      status:           entryForm.status,
      notes:            entryForm.notes,
      date:             parseDateInput(entryForm.date),
      rejectionReason:  entryForm.rejectionReason,
    };
    await FirebaseManager.updateEntry(currentClub.id, updated);
    setSavingEntry(false);
    setEntryToEdit(null);
    setEntryForm(null);
  };

  if (currentMember && !canViewMember) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#8A8A8A] font-poppins font-bold uppercase tracking-widest bg-white/5 px-8 py-4 rounded-full">
          Kein Zugriff.
        </p>
      </div>
    );
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] opacity-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-black/5 border-t-[#0A0A0A]" />
    </div>
  );

  if (!member) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="w-16 h-16 bg-black/[0.04] rounded-full flex items-center justify-center border border-black/10 text-[#71717A]">
         <AlertTriangle size={32} />
      </div>
      <div className="flex flex-col gap-2">
         <h3 className="text-xl font-bold text-[#0A0A0A]">Mitglied nicht gefunden</h3>
         <p className="text-[#71717A] text-sm">Die ID existiert nicht mehr oder <br />ist für diesen Verein ungültig.</p>
      </div>
      <Link href="/dashboard/mitglieder" className="px-6 py-3 bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all">← Zurück zur Liste</Link>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-12 lg:px-10 flex flex-col gap-7 lg:gap-12">
        
        {/* TOP BAR / BREADCRUMBS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-black/5 pb-6 lg:pb-8">
           <div className="flex items-center gap-4 min-w-0">
              {currentClub?.logoUrl && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2" style={{ borderColor: `${accent}30` }}>
                  <img src={currentClub.logoUrl} alt={currentClub.name} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex min-w-0 flex-col gap-1">
                 <div className="flex items-center gap-2 mb-1">
                    <Link href="/dashboard/mitglieder" className="text-[10px] font-black text-[#71717A] hover:text-[#0A0A0A] transition-colors uppercase tracking-widest">Team</Link>
                    <ChevronRight size={10} className="text-gray-700" />
                    <span className="min-w-0 truncate text-[10px] font-black text-[#0A0A0A] hover:text-[#0A0A0A] transition-colors uppercase tracking-widest">Profil: {member.firstName}</span>
                 </div>
                 <h1 className="truncate text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{member.firstName} {member.lastName}</h1>
              </div>
           </div>
           
           <div className="flex items-center gap-3 sm:gap-4">
              {isAdmin && (
                <button 
                  onClick={() => setIsEditExpanded(!isEditExpanded)} 
                  style={isEditExpanded ? { backgroundColor: accent, borderColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" } : undefined}
                  className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border ${
                    isEditExpanded 
                      ? "shadow-xl shadow-black/5" 
                      : "bg-black/[0.04] text-[#0A0A0A] border-black/5 hover:bg-black/[0.08]"
                  }`}
                >
                   <Pencil size={14} /> {isEditExpanded ? "Abbrechen" : "Bearbeiten"}
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setMemberToDelete(true)}
                  className="w-12 h-12 shrink-0 rounded-2xl bg-black/[0.04] border border-black/5 flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] hover:bg-black/[0.08] transition-all border-white/0 hover:border-black/15"
                >
                   <Trash2 size={18} />
                </button>
              )}
           </div>
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-7 lg:gap-12">
           
           {/* LEFT COLUMN: IDENTITY & STATS (4/12) */}
           <div className="xl:col-span-4 flex flex-col gap-5 lg:gap-8">
              
              {/* Profile Card */}
              <div 
                 className="bg-white border border-black/5 rounded-[28px] lg:rounded-[40px] p-5 sm:p-8 lg:p-10 flex flex-col items-center relative group"
                 style={{
                    isolation: "isolate",
                    transform: "translateZ(0)",
                    WebkitTransform: "translateZ(0)",
                    WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                    maskImage: "-webkit-radial-gradient(white, black)"
                 }}
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.03] blur-3xl rounded-full" />
                 
                 <div className="relative mb-6 lg:mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-[120px] h-[120px] rounded-full blur-[60px] opacity-20" style={{ background: progressColor }} />
                    </div>
                    <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} size={140} imageUrl={member.profileImageUrl} className="relative z-10 border-[6px] border-black shadow-2xl" />
                    <button className="absolute bottom-2 right-2 w-10 h-10 rounded-2xl bg-[#0A0A0A] border border-black/15 shadow-2xl flex items-center justify-center text-white z-20 hover:scale-110 transition-transform">
                       <Camera size={18} strokeWidth={2.5} />
                    </button>
                 </div>

                 <div className="flex flex-col items-center gap-3 text-center mb-8 lg:mb-10 max-w-full">
                    <div className="flex max-w-full items-center gap-3">
                       <h2 className="truncate text-xl sm:text-2xl font-poppins font-black text-[#0A0A0A]">{member.firstName} {member.lastName}</h2>
                       {member.isAdmin && <ShieldCheck size={20} className="text-[#0A0A0A]/60" />}
                    </div>
                    <p className="max-w-full break-all text-[#71717A] font-bold text-sm">{member.email}</p>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                       <span className="px-4 py-1.5 rounded-full bg-black/[0.04] border border-black/10 text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">{member.memberType}</span>
                       {member.isTrainer && <span className="px-4 py-1.5 rounded-full bg-black/[0.07] border border-black/15 text-[10px] font-black text-[#0A0A0A]/60 uppercase tracking-widest">Trainer</span>}
                    </div>
                 </div>

                 {/* Detailed Progress Stats */}
                 <div className="w-full space-y-8 lg:space-y-10">
                    <div className="space-y-4">
                       <div className="flex justify-between items-end px-1">
                          <span className="text-[10px] font-black text-[#52525B] uppercase tracking-[0.2em] italic">JAHRESPERFORMANCE</span>
                          <span className="text-2xl font-mono font-black text-[#0A0A0A]">{Math.min(100, Math.round(progress * 100))}%</span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-black/[0.04] p-0.5 border border-black/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
                             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                             className="h-full rounded-full border border-black/10" style={{ background: progressColor }} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                       <div className="bg-black/[0.04] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-[#52525B] uppercase tracking-widest">Bestätigt</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-[#0A0A0A]">+{approvedPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-black/[0.04] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-[#52525B] uppercase tracking-widest">In Prüfung</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-[#A1A1AA]">+{pendingPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-black/[0.04] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-[#52525B] uppercase tracking-widest">Ziel</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-[#0A0A0A]">{targetPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-black/[0.04] p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-black/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-[#52525B] uppercase tracking-widest">Fehlend</span>
                          <span className="text-xl sm:text-2xl font-mono font-black text-[#71717A]">{isExempt ? "–" : missingPts.toFixed(1)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Quick Actions / Security Section */}
              <div className="bg-white border border-black/5 rounded-[28px] lg:rounded-[40px] p-5 sm:p-8 lg:p-10 space-y-5 lg:space-y-6">
                 <h3 className="text-xs font-black text-[#52525B] uppercase tracking-[0.3em] pl-1">Sicherheit & Verwaltung</h3>
                 <div className="flex flex-col gap-3">
                    <button className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-black/[0.03] border border-black/5 hover:bg-black/[0.05] transition-all text-left group">
                       <div className="flex min-w-0 items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#0A0A0A]">
                             <MailQuestion size={18} />
                          </div>
                          <div className="flex min-w-0 flex-col">
                             <span className="text-sm font-bold text-[#0A0A0A]">Passwort Reset</span>
                             <span className="truncate text-[10px] font-black text-[#52525B] uppercase tracking-widest mt-0.5">Link per Mail senden</span>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-800 group-hover:text-[#0A0A0A]" />
                    </button>

                    <button className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 rounded-3xl bg-black/[0.03] border border-black/5 hover:bg-black/[0.05] transition-all text-left group">
                       <div className="flex min-w-0 items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#0A0A0A]">
                             <RefreshCcw size={18} />
                          </div>
                          <div className="flex min-w-0 flex-col">
                             <span className="text-sm font-bold text-[#0A0A0A]">Sync Status</span>
                             <span className="truncate text-[10px] font-black text-[#52525B] uppercase tracking-widest mt-0.5">Letzter Login: Gestern 18:42</span>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-800 group-hover:text-[#0A0A0A]" />
                    </button>
                 </div>
              </div>

           </div>

           {/* RIGHT COLUMN: ACTIVITY & EDIT (8/12) */}
           <div className="xl:col-span-8 flex flex-col gap-8 lg:gap-12">
              
              <AnimatePresence>
                 {isEditExpanded && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-white border border-black/10 shadow-[0_0_80px_rgba(0,0,0,0.03)] rounded-[28px] lg:rounded-[40px] p-5 sm:p-8 lg:p-10 space-y-7 lg:space-y-10 mb-6">
                         <div className="flex items-center gap-3">
                            <Settings size={20} className="text-[#71717A]" />
                            <h3 className="text-lg sm:text-xl font-poppins font-black text-[#0A0A0A] uppercase tracking-tight italic">Stammdaten anpassen</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-7 lg:gap-10">
                            <div className="space-y-6">
                               <FormInput label="Vorname" value={editForm.firstName} onChange={(v) => setEditForm({...editForm, firstName: v})} />
                               <FormInput label="Nachname" value={editForm.lastName} onChange={(v) => setEditForm({...editForm, lastName: v})} />
                               <FormInput label="E-Mail" value={editForm.email} onChange={(v) => setEditForm({...editForm, email: v})} />
                            </div>
                            <div className="space-y-6">
                               <div className="flex flex-col gap-3">
                                  <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-[0.3em] pl-1">Mitgliedstyp</label>
                                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                     {availableMemberTypes.map((t) => (
                                       <button key={t} onClick={() => setEditForm({...editForm, memberType: t})}
                                         className={`py-3.5 sm:py-4 rounded-2xl font-poppins font-black text-[10px] sm:text-[11px] transition-all border uppercase tracking-widest ${editForm.memberType === t ? "bg-[#0A0A0A] text-white border-black/15" : "bg-black/[0.03] text-[#71717A] border-black/[0.08] hover:border-black/10"}`}>
                                         {t}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                               {planFeatures.hasGroups ? (
                                 <div className="flex flex-col gap-3">
                                   <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-[0.3em] pl-1">Gruppe / Team</label>
                                   <div className="relative">
                                     <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                                     <select
                                       value={editForm.groupId}
                                       onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })}
                                       className="w-full appearance-none rounded-2xl bg-black/[0.03] border border-black/[0.08] py-3.5 pl-11 pr-4 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15"
                                     >
                                       <option value="">Keine Gruppe</option>
                                       {visibleGroups.map((group) => (
                                         <option key={group.id} value={group.id}>{group.name}</option>
                                       ))}
                                     </select>
                                   </div>
                                 </div>
                               ) : (
                                 <div className="flex items-center gap-3 p-4 bg-black/[0.03] border border-black/5 rounded-2xl">
                                   <Lock size={16} className="text-[#A1A1AA]" />
                                   <div className="flex flex-col">
                                     <span className="text-sm font-bold text-[#0A0A0A]">Gruppen & Teams</span>
                                     <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest">Ab Club verfügbar</span>
                                   </div>
                                 </div>
                               )}
                               <div className="flex flex-col gap-3 pt-4">
                                  <div className="flex items-center justify-between gap-4 p-4 bg-black/[0.03] border border-black/5 rounded-2xl">
                                     <div className="flex min-w-0 flex-col">
                                        <span className="text-sm font-bold text-[#0A0A0A]">Administrator</span>
                                        <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest leading-snug">Voller Zugriff auf Verein</span>
                                     </div>
                                     <button onClick={() => setEditForm({...editForm, isAdmin: !editForm.isAdmin})} className={`w-12 h-6 rounded-full transition-all relative ${editForm.isAdmin ? "bg-[#52525B]" : "bg-black/[0.07]"}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editForm.isAdmin ? "left-7" : "left-1"}`} />
                                     </button>
                                  </div>
                                  <div className={`flex items-center justify-between gap-4 p-4 bg-black/[0.03] border border-black/5 rounded-2xl ${!planFeatures.hasAdvancedRoles ? "opacity-60" : ""}`}>
                                     <div className="flex min-w-0 flex-col">
                                        <span className="text-sm font-bold text-[#0A0A0A]">Trainer / Coach</span>
                                        <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest leading-snug">
                                          {planFeatures.hasAdvancedRoles ? "Kann Punkte genehmigen" : "Erweiterte Rollen ab Pro"}
                                        </span>
                                     </div>
                                     <button disabled={!planFeatures.hasAdvancedRoles} onClick={() => setEditForm({...editForm, isTrainer: !editForm.isTrainer})} className={`w-12 h-6 rounded-full transition-all relative ${editForm.isTrainer ? "bg-[#52525B]" : "bg-black/[0.07]"} disabled:cursor-not-allowed`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editForm.isTrainer ? "left-7" : "left-1"}`} />
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:gap-4 border-t border-black/5 pt-7 lg:pt-10">
                            <button onClick={() => setIsEditExpanded(false)} className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A] transition-colors">Abbrechen</button>
                            <TButton label={saving ? "Speichert…" : (editSaved ? "Gespeichert!" : "Änderungen übernehmen")} onClick={saveMember} disabled={saving} style={{ backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }} className="w-full sm:w-auto h-auto sm:min-w-[240px]" />
                         </div>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Activity Log Section */}
              <div className="space-y-5 lg:space-y-8">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-black/5 pb-4">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-gray-800" />
                       <h3 className="text-lg sm:text-xl font-poppins font-black text-[#0A0A0A] uppercase tracking-tight italic">Gesamte Aktivitäten</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{entries.length} Einträge verfügbar</span>
                    </div>
                 </div>

                 {entries.length === 0 ? (
                   <div className="bg-white border border-black/5 rounded-[28px] lg:rounded-[40px] p-12 md:p-24 text-center opacity-40">
                      <div className="w-16 h-16 bg-black/[0.04] rounded-full flex items-center justify-center mx-auto mb-6">
                         <Calendar size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-[#0A0A0A]">Keine Einträge</h3>
                      <p className="text-sm font-medium">Noch keine Tätigkeiten in diesem Zeitraum.</p>
                   </div>
                 ) : (
                   <>
                   <div className="hidden md:block bg-white border border-black/5 rounded-[32px] lg:rounded-[40px] overflow-hidden shadow-2xl">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="border-b border-black/5 bg-black/[0.02]">
                               <th className="px-10 py-6 text-[10px] font-black text-[#71717A] uppercase tracking-widest">Tätigkeit</th>
                               <th className="px-10 py-6 text-[10px] font-black text-[#71717A] uppercase tracking-widest">Datum</th>
                               <th className="px-10 py-6 text-[10px] font-black text-[#71717A] uppercase tracking-widest">Status</th>
                               <th className="px-10 py-6 text-[10px] font-black text-[#71717A] uppercase tracking-widest text-right">Punkte</th>
                               <th className="px-10 py-6 text-[10px] font-black text-[#71717A] uppercase tracking-widest text-center w-20"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-black/[0.04]">
                            {entries.map((entry) => (
                               <tr key={entry.id} className="group hover:bg-black/[0.03] transition-colors">
                                  <td className="px-10 py-6">
                                     <div className="flex items-center gap-6">
                                        <TCatBadge category={entry.activityCategory} size={48} />
                                        <span className="text-[17px] font-poppins font-bold text-[#0A0A0A] leading-tight">{entry.activityName}</span>
                                     </div>
                                  </td>
                                  <td className="px-10 py-6 text-[13px] font-bold text-[#71717A]">
                                     {toDate(entry.date).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </td>
                                  <td className="px-10 py-6">
                                     <TStatusBadge status={entry.status} />
                                  </td>
                                  <td className="px-10 py-6 text-right">
                                     <span className="text-xl font-mono font-black text-[#0A0A0A]">+{entry.points.toFixed(1)}</span>
                                  </td>
                                  <td className="px-10 py-6 text-center">
                                     {isAdmin && (
                                       <button onClick={() => openEntryEdit(entry)} className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-gray-700 hover:text-[#0A0A0A] hover:bg-black/[0.08] transition-all">
                                          <MoreHorizontal size={18} />
                                       </button>
                                     )}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                   <div className="md:hidden flex flex-col gap-3">
                      {entries.map((entry) => {
                        const dateStr = toDate(entry.date).toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" });
                        return (
                          <div key={entry.id} className="rounded-[24px] bg-white border border-black/5 p-4 flex flex-col gap-4">
                            <div className="flex items-start gap-3">
                              <TCatBadge category={entry.activityCategory} size={42} />
                              <div className="min-w-0 flex-1">
                                <p className="font-poppins font-bold text-[#0A0A0A] text-[15px] leading-tight break-words">{entry.activityName}</p>
                                <div className="mt-1.5">
                                  <span className="text-[11px] font-bold text-[#71717A]">{dateStr}</span>
                                </div>
                              </div>
                              {isAdmin && (
                                <button onClick={() => openEntryEdit(entry)} className="w-10 h-10 shrink-0 rounded-xl bg-black/[0.04] flex items-center justify-center text-gray-700 hover:text-[#0A0A0A] hover:bg-black/[0.08] transition-all">
                                  <MoreHorizontal size={18} />
                                </button>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-3 rounded-2xl bg-black/[0.025] border border-black/5 px-4 py-3">
                              <TStatusBadge status={entry.status} />
                              <span className="shrink-0 text-lg font-mono font-black text-[#0A0A0A]">+{entry.points.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                   </div>
                   </>
                 )}
              </div>
           </div>

        </div>
      </div>

      {/* Entry Edit Modal */}
      <AnimatePresence>
        {entryToEdit && entryForm && (
           <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center p-4 sm:p-6 md:p-10">
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="w-full max-w-xl my-auto">
                <div className="bg-white border border-black/10 rounded-[30px] sm:rounded-[40px] p-6 sm:p-8 lg:p-9 flex flex-col gap-5 sm:gap-6 shadow-2xl relative">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-black/[0.03] blur-3xl rounded-full" />
                   
                   <div className="flex items-start justify-between gap-4 relative z-10">
                      <div className="flex min-w-0 items-center gap-3">
                         <div className="w-12 h-12 shrink-0 rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#0A0A0A]">
                            <Activity size={24} />
                         </div>
                         <div className="flex min-w-0 flex-col">
                            <h3 className="font-poppins font-black text-[#0A0A0A] text-lg sm:text-xl uppercase tracking-tight italic">Eintrag Details</h3>
                            <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest">Administrative Korrektur</span>
                         </div>
                      </div>
                      <button onClick={() => setEntryToEdit(null)} className="w-10 h-10 shrink-0 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] transition-colors"><X size={20} /></button>
                   </div>

                   <div className="flex flex-col gap-6 relative z-10">
                      <FormInput label="Bezeichnung der Tätigkeit" value={entryForm.activityName} onChange={(v) => setEntryForm({...entryForm, activityName: v})} />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                         <FormInput label="Punkte Wert" value={entryForm.points} onChange={(v) => setEntryForm({...entryForm, points: v})} type="number" />
                         <FormInput label="Durchgeführt am" value={entryForm.date} onChange={(v) => setEntryForm({...entryForm, date: v})} type="date" />
                      </div>

                      <div className="flex flex-col gap-3">
                         <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-[0.3em] pl-1">Status Festlegen</label>
                         <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-black/[0.04] border border-black/5">
                            {[EntryStatus.Pending, EntryStatus.Approved, EntryStatus.Rejected].map((s) => (
                              <button key={s} onClick={() => setEntryForm({...entryForm, status: s})}
                                className={`flex-1 py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${
                                   entryForm.status === s 
                                      ? "bg-[#0A0A0A] text-white shadow-2xl" 
                                      : "text-[#71717A] hover:text-[#0A0A0A]"
                                }`}>
                                {s === EntryStatus.Pending ? "Prüfung" : s === EntryStatus.Approved ? "OK" : "Abbruch"}
                              </button>
                            ))}
                         </div>
                      </div>

                      {entryForm.status === EntryStatus.Rejected && (
                         <div className="mt-2">
                            <FormInput label="Ablehnungsgrund" value={entryForm.rejectionReason} onChange={(v) => setEntryForm({...entryForm, rejectionReason: v})} />
                         </div>
                      )}
                   </div>

                   <div className="pt-6 border-t border-black/5 relative z-10">
                      <TButton label={savingEntry ? "Aktualisierung…" : "Änderungen speichern"} onClick={saveEntry} disabled={savingEntry} style={{ backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }} />
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Delete Member Modal */}
      <AnimatePresence>
        {memberToDelete && isAdmin && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-sm">
              <div className="bg-white rounded-[28px] border border-black/8 shadow-xl p-8 flex flex-col items-center text-center gap-1">
                <div className="w-20 h-20 rounded-[24px] bg-red-500/10 flex items-center justify-center mb-5 border border-red-500/20">
                  <AlertTriangle size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-poppins font-black text-[#0A0A0A] tracking-tight italic uppercase">Mitglied Entfernen</h3>
                <p className="text-[#71717A] font-bold text-sm mb-6 px-4">
                  {member.clubIds.length <= 1 ? (
                    <>Soll <span className="text-[#0A0A0A] underline decoration-red-500/40">{member.firstName} {member.lastName}</span> endgültig entfernt werden? Das Konto und alle Daten werden unwiderruflich gelöscht.</>
                  ) : (
                    <>Soll <span className="text-[#0A0A0A] underline decoration-red-500/40">{member.firstName} {member.lastName}</span> aus diesem Verein entfernt werden? Das Konto bleibt bestehen, da noch andere Vereine verknüpft sind.</>
                  )}
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <button onClick={removeMember} className="w-full py-4 bg-red-600 hover:bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95">Endgültig Löschen</button>
                  <button onClick={() => setMemberToDelete(false)} className="w-full py-4 bg-black/[0.04] hover:bg-black/[0.08] text-[#0A0A0A] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-black/5 active:scale-95">Abbrechen</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-[0.2em] pl-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[24px] bg-black/[0.04] border border-black/5 px-6 py-4.5 font-poppins font-bold text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 focus:bg-black/[0.04] transition-all [color-scheme:light] placeholder:text-[#A1A1AA]"
      />
    </div>
  );
}
