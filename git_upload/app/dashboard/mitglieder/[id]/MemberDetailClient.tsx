"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2, AlertTriangle, X, Pencil, Camera,
  ShieldCheck, Calendar,
  RefreshCcw, ChevronRight, MoreHorizontal,
  MailQuestion, Activity, Settings, Layers, Lock,
  Check
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import {
  Member, Entry, MemberType,
  calculateTargetPoints, EntryStatus, ClubGroup, getPlanFeatures,
  TrainingGroup, PointFactors
} from "@/lib/firebase/models";
import { 
  TAvatar,
  TButton, TCatBadge,
  GlassSection, TLine, TBadge
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
  const [trainingGroups, setTrainingGroups] = useState<TrainingGroup[]>([]);
  const [loading, setLoading] = useState(true);

  // member edit
  const [isEditExpanded, setIsEditExpanded] = useState(false);
  const [editForm,    setEditForm]    = useState({
    firstName: "", lastName: "", email: "",
    memberType: MemberType.Active as string,
    isAdmin: false, isTrainer: false,
    groupId: "",
    trainingGroupIds: [] as string[],
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
          trainingGroupIds: m.trainingGroupIds ?? [],
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
    const u1 = FirebaseManager.listenToGroups(currentClub.id, setGroups);
    const u2 = FirebaseManager.listenToTrainingGroups(currentClub.id, setTrainingGroups);
    return () => { u1(); u2(); };
  }, [currentClub, planFeatures.hasGroups]);

  const visibleGroups = planFeatures.hasGroups ? groups : [];
  const visibleTrainingGroups = planFeatures.hasGroups ? trainingGroups : [];

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
    const nextMembership = {
      memberType: editForm.memberType,
      isAdmin: editForm.isAdmin,
      isTrainer: planFeatures.hasAdvancedRoles ? editForm.isTrainer : false,
      ...(planFeatures.hasGroups && editForm.groupId ? { groupId: editForm.groupId } : {}),
      trainingGroupIds: editForm.trainingGroupIds,
    };
    await Promise.all([
      FirebaseManager.updateMember(member.id, nextProfile),
      FirebaseManager.updateMemberMembership(member.id, currentClub.id, nextMembership),
    ]);
    setMember({ ...member, ...nextProfile, ...nextMembership });
    setEditSaved(true);
    setTimeout(() => { setEditSaved(false); setIsEditExpanded(false); }, 1500);
    setSaving(false);
  };

  const removeMember = async () => {
    if (!isAdmin || !currentClub || !member) return;
    await FirebaseManager.removeMemberFromClub(member, currentClub.id);
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

  const toggleTrainingGroup = (groupId: string) => {
    setEditForm(prev => ({
      ...prev,
      trainingGroupIds: prev.trainingGroupIds.includes(groupId)
        ? prev.trainingGroupIds.filter(id => id !== groupId)
        : [...prev.trainingGroupIds, groupId]
    }));
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
      <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-12 lg:px-10 flex flex-col gap-7 lg:gap-12 pb-20">
        
        {/* TOP BAR / BREADCRUMBS */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 border-b border-black/5 pb-6 lg:pb-8">
           <div className="flex min-w-0 flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                 <Link href="/dashboard/mitglieder" className="text-[10px] font-black text-[#71717A] hover:text-[#0A0A0A] transition-colors uppercase tracking-widest">Team</Link>
                 <ChevronRight size={10} className="text-gray-700" />
                 <span className="min-w-0 truncate text-[10px] font-black text-[#0A0A0A] hover:text-[#0A0A0A] transition-colors uppercase tracking-widest">Profil: {member.firstName}</span>
              </div>
              <h1 className="truncate text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{member.firstName} {member.lastName}</h1>
           </div>
           
           <div className="flex items-center gap-3 sm:gap-4">
              {isAdmin && (
                <button 
                  onClick={() => setIsEditExpanded(!isEditExpanded)} 
                  className={`flex flex-1 sm:flex-none items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border ${
                    isEditExpanded 
                      ? "bg-[#0A0A0A] text-white border-black/15" 
                      : "bg-black/[0.04] text-[#0A0A0A] border-black/5 hover:bg-black/[0.08]"
                  }`}
                >
                  <Pencil size={14} />
                  {isEditExpanded ? "Abbrechen" : "Profil bearbeiten"}
                </button>
              )}
           </div>
        </div>

        {/* EDIT SECTION */}
        <AnimatePresence>
          {isEditExpanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 md:p-8 bg-black/[0.03] rounded-3xl border border-black/5">
                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                    <EditField label="Vorname" value={editForm.firstName} onChange={(v: string) => setEditForm({ ...editForm, firstName: v })} />
                    <EditField label="Nachname" value={editForm.lastName} onChange={(v: string) => setEditForm({ ...editForm, lastName: v })} />
                    <EditField label="E-Mail (ID)" value={editForm.email} onChange={(v: string) => setEditForm({ ...editForm, email: v })} disabled />
                    
                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Mitgliedertyp</label>
                       <select value={editForm.memberType} onChange={(e) => setEditForm({ ...editForm, memberType: e.target.value })} className="w-full bg-white rounded-2xl border border-black/10 px-4 py-3.5 text-sm font-poppins focus:outline-none focus:border-black/20 transition-all">
                          {availableMemberTypes.map(t => <option key={t} value={t}>{t}</option>)}
                       </select>
                    </div>

                    <div className="flex flex-col gap-2">
                       <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Abteilung / Gruppe</label>
                       <select value={editForm.groupId} onChange={(e) => setEditForm({ ...editForm, groupId: e.target.value })} className="w-full bg-white rounded-2xl border border-black/10 px-4 py-3.5 text-sm font-poppins focus:outline-none focus:border-black/20 transition-all">
                          <option value="">Keine Auswahl</option>
                          {visibleGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                       </select>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                       <Toggle label="Admin-Rechte" active={editForm.isAdmin} onToggle={() => setEditForm({ ...editForm, isAdmin: !editForm.isAdmin })} />
                       {planFeatures.hasAdvancedRoles && (
                         <Toggle label="Trainer-Rechte" active={editForm.isTrainer} onToggle={() => setEditForm({ ...editForm, isTrainer: !editForm.isTrainer })} />
                       )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-l border-black/5 pl-6">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Trainingsgruppen</label>
                    <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-2">
                      {visibleTrainingGroups.length === 0 ? (
                        <p className="text-[10px] text-[#A1A1AA] italic">Keine Trainingsgruppen angelegt.</p>
                      ) : (
                        visibleTrainingGroups.map(g => (
                          <button 
                            key={g.id}
                            onClick={() => toggleTrainingGroup(g.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                              editForm.trainingGroupIds.includes(g.id)
                                ? "bg-[#0A0A0A] border-black text-white shadow-lg"
                                : "bg-white border-black/10 text-[#71717A] hover:border-black/20"
                            }`}
                          >
                            <span className="text-xs font-bold font-poppins">{g.name}</span>
                            {editForm.trainingGroupIds.includes(g.id) && <Check size={12} />}
                          </button>
                        ))
                      )}
                    </div>
                    <p className="text-[9px] text-[#A1A1AA] leading-relaxed">Wähle die Gruppen aus, für die dieses Mitglied Trainingstermine sehen soll.</p>

                    <div className="mt-auto pt-6 flex flex-col gap-3">
                       <TButton label={saving ? "Speichern..." : editSaved ? "Gespeichert!" : "Änderungen übernehmen"} onClick={saveMember} disabled={saving} />
                       <button onClick={() => setMemberToDelete(true)} className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-[#FF3B30] hover:bg-red-50 rounded-2xl transition-all">
                          <Trash2 size={12} /> Mitglied entfernen
                       </button>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
           <StatCard label="Jahresziel" value={`${targetPts} Pkt.`} sub={isExempt ? "Befreit (Sonderstatus)" : `Faktor: ${PointFactors[member.memberType] ?? 1.0}x`} />
           <StatCard label="Genehmigt" value={`${approvedPts} Pkt.`} sub={`${entries.filter(e => e.status === "Genehmigt").length} Tätigkeiten`} highlight="#34C759" />
           <StatCard label="In Prüfung" value={`${pendingPts} Pkt.`} sub={`${entries.filter(e => e.status === "Ausstehend").length} Anträge`} highlight="#FFCC00" />
           <StatCard label="Fehlend" value={`${missingPts} Pkt.`} sub={progress >= 1 ? "Ziel erreicht! 🎉" : `${(progress * 100).toFixed(0)}% erledigt`} highlight={missingPts > 0 ? "#FF3B30" : "#34C759"} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10">
           {/* LEFT: PROGRESS & GROUPS */}
           <div className="lg:col-span-4 flex flex-col gap-7">
              <GlassSection className="p-6 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-[#71717A]">Fortschritt</h3>
                    <TBadge label={member.memberType} />
                 </div>
                 
                 <div className="relative flex flex-col items-center py-4">
                    <svg className="w-40 h-40 transform -rotate-90">
                       <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-black/[0.04]" />
                       <motion.circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={440} initial={{ strokeDashoffset: 440 }} animate={{ strokeDashoffset: 440 - (440 * progress) }} transition={{ duration: 1.5, ease: "easeOut" }} className="text-[#0A0A0A]" strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-poppins font-black text-[#0A0A0A]">{(progress * 100).toFixed(0)}%</span>
                    </div>
                 </div>
                 
                 <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between text-xs font-bold">
                       <span className="text-[#71717A]">Genehmigt</span>
                       <span className="text-[#0A0A0A]">{approvedPts} / {targetPts} Pkt.</span>
                    </div>
                    <div className="w-full h-2 bg-black/[0.04] rounded-full overflow-hidden">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }} transition={{ duration: 1 }} className="h-full bg-[#0A0A0A]" />
                    </div>
                 </div>
              </GlassSection>

              <GlassSection className="p-6 flex flex-col gap-5">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-[#71717A]">Gruppen-Zugehörigkeit</h3>
                 <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-black/[0.03] border border-black/5">
                       <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-white border border-black/5 flex items-center justify-center text-[#71717A]"><Settings size={14} /></div>
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Abteilung</span>
                             <span className="text-xs font-bold text-[#0A0A0A]">{editForm.groupId ? groups.find(g => g.id === editForm.groupId)?.name : "Keine"}</span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col gap-2">
                       <span className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1 mb-1">Trainingsgruppen</span>
                       <div className="flex flex-wrap gap-2">
                          {editForm.trainingGroupIds.length === 0 ? (
                            <span className="text-[10px] text-[#A1A1AA] italic pl-1">Keine Gruppen zugewiesen</span>
                          ) : (
                            editForm.trainingGroupIds.map(tgid => {
                              const tg = trainingGroups.find(g => g.id === tgid);
                              return tg ? (
                                <div key={tgid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0A0A0A] text-white">
                                   <Layers size={10} />
                                   <span className="text-[10px] font-black uppercase tracking-widest">{tg.name}</span>
                                </div>
                              ) : null;
                            })
                          )}
                       </div>
                    </div>
                 </div>
              </GlassSection>
           </div>

           {/* RIGHT: ENTRIES */}
           <div className="lg:col-span-8 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-xl font-poppins font-black text-[#0A0A0A] tracking-tight uppercase">Letzte Tätigkeiten</h3>
                 <span className="text-xs font-bold text-[#71717A] bg-black/[0.04] px-3 py-1.5 rounded-full">{entries.length} Einträge</span>
              </div>

              <div className="flex flex-col gap-3">
                 {entries.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-black/[0.02] border border-dashed border-black/10 rounded-3xl opacity-40">
                       <Activity size={32} className="mb-3" />
                       <p className="text-sm font-poppins">Bisher wurden keine <br />Tätigkeiten erfasst.</p>
                    </div>
                 ) : (
                    entries.map((entry, idx) => (
                      <motion.div key={entry.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                        <GlassSection className="p-4 flex items-center justify-between group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-2xl bg-black/[0.04] flex items-center justify-center text-[#0A0A0A] font-poppins font-black text-xs">
                                 {entry.points}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{entry.activityName}</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest">{toDate(entry.date).toLocaleDateString()}</span>
                                    <div className="w-1 h-1 rounded-full bg-black/10" />
                                    <TCatBadge category={entry.activityCategory} size={20} />
                                 </div>
                              </div>
                           </div>
                           
                           <div className="flex items-center gap-4">
                              <StatusBadge status={entry.status} />
                              {isAdmin && (
                                <button onClick={() => openEntryEdit(entry)} className="p-2 text-[#71717A] hover:text-[#0A0A0A] hover:bg-black/[0.05] rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                   <MoreHorizontal size={18} />
                                </button>
                              )}
                           </div>
                        </GlassSection>
                      </motion.div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* ENTRY EDIT MODAL */}
      <AnimatePresence>
        {entryToEdit && entryForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm">
                <GlassSection className="p-6 flex flex-col gap-5">
                   <div className="flex items-center justify-between">
                      <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg uppercase tracking-tight">Eintrag bearbeiten</h3>
                      <button onClick={() => setEntryToEdit(null)} className="text-[#71717A] hover:text-[#0A0A0A]"><X size={20} /></button>
                   </div>
                   
                   <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Tätigkeit</label>
                        <input value={entryForm.activityName} onChange={(e) => setEntryForm({ ...entryForm, activityName: e.target.value })} className="w-full bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Punkte</label>
                           <input type="number" value={entryForm.points} onChange={(e) => setEntryForm({ ...entryForm, points: e.target.value })} className="w-full bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                         </div>
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Status</label>
                           <select value={entryForm.status} onChange={(e) => setEntryForm({ ...entryForm, status: e.target.value })} className="w-full bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none">
                              <option value="Ausstehend">Ausstehend</option>
                              <option value="Genehmigt">Genehmigt</option>
                              <option value="Abgelehnt">Abgelehnt</option>
                           </select>
                         </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Datum</label>
                        <input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} className="w-full bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none" />
                      </div>

                      {entryForm.status === "Abgelehnt" && (
                         <div className="flex flex-col gap-1.5">
                           <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Ablehnungsgrund</label>
                           <textarea value={entryForm.rejectionReason} onChange={(e) => setEntryForm({ ...entryForm, rejectionReason: e.target.value })} className="w-full bg-black/[0.03] border border-black/5 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none" rows={2} />
                         </div>
                      )}
                   </div>
                   
                   <TButton label={savingEntry ? "Wird gespeichert..." : "Speichern"} onClick={saveEntry} disabled={savingEntry} />
                </GlassSection>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MEMBER MODAL */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xs">
                <GlassSection className="p-8 flex flex-col items-center text-center gap-2">
                   <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-2 border border-red-500/20"><Trash2 size={32} className="text-[#FF3B30]" /></div>
                   <h3 className="text-xl font-poppins font-black text-[#0A0A0A]">Mitglied entfernen?</h3>
                   <p className="text-xs text-[#71717A] leading-relaxed mb-4">Dieses Mitglied wird aus deinem Verein gelöscht. Alle Punkte bleiben in der Historie, aber das Profil wird inaktiv.</p>
                   <div className="flex flex-col gap-2 w-full">
                      <TButton label="Unwiderruflich löschen" variant="danger" onClick={removeMember} />
                      <TButton label="Abbrechen" variant="secondary" onClick={() => setMemberToDelete(false)} />
                   </div>
                </GlassSection>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: any) {
  return (
    <GlassSection className="p-5 flex flex-col gap-1">
       <span className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">{label}</span>
       <div className="flex items-baseline gap-2">
          <span className="text-2xl font-poppins font-black text-[#0A0A0A]">{value}</span>
          {highlight && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: highlight }} />}
       </div>
       <span className="text-[10px] font-bold text-[#A1A1AA] truncate">{sub}</span>
    </GlassSection>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: any = {
    "Genehmigt": "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
    "Ausstehend": "bg-[#FFCC00]/10 text-[#FFCC00] border-[#FFCC00]/20",
    "Abgelehnt": "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20"
  };
  return (
    <div className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${colors[status] || "bg-gray-100 text-gray-500"}`}>
       {status}
    </div>
  );
}

function EditField({ label, value, onChange, disabled }: any) {
  return (
    <div className="flex flex-col gap-2">
       <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">{label}</label>
       <input disabled={disabled} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-white rounded-2xl border border-black/10 px-4 py-3.5 text-sm font-poppins focus:outline-none focus:border-black/20 transition-all disabled:opacity-50" />
    </div>
  );
}

function Toggle({ label, active, onToggle }: any) {
  return (
    <button onClick={onToggle} className="flex items-center gap-3 group">
       <div className={`w-10 h-6 rounded-full transition-all relative ${active ? "bg-[#0A0A0A]" : "bg-black/[0.08]"}`}>
          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? "left-5" : "left-1"}`} />
       </div>
       <span className="text-[10px] font-black text-[#71717A] group-hover:text-[#0A0A0A] uppercase tracking-widest">{label}</span>
    </button>
  );
}
