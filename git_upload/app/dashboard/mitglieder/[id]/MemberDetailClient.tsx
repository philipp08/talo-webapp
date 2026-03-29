"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, ChevronDown, ChevronUp, Check,
  Trash2, AlertTriangle, X, Pencil, Info, Camera,
  Mail, ShieldCheck, Dumbbell, Calendar, Target, Plus, 
  RefreshCcw, ChevronRight, User, MoreHorizontal,
  MailQuestion, Activity, Settings, ExternalLink
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import {
  Member, Entry, MemberType, ActivityCategory,
  calculateTargetPoints, EntryStatus,
} from "@/lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar, AmbientBackground, 
  TButton, TSearchBar, TBadge, TCatBadge 
} from "@/app/components/ui/NativeUI";

function toDateInput(d: any): string {
  const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d));
  return date.toISOString().slice(0, 10);
}

export default function MemberDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const router          = useRouter();
  const currentClub     = useAppStore((s) => s.currentClub);
  const currentMember   = useAppStore((s) => s.currentMember);

  const [member,  setMember]  = useState<Member | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // member edit
  const [isEditExpanded, setIsEditExpanded] = useState(false);
  const [editForm,    setEditForm]    = useState({
    firstName: "", lastName: "", email: "",
    memberType: MemberType.Active as string,
    isAdmin: false, isTrainer: false,
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
  const [entryToDelete,  setEntryToDelete]  = useState<Entry | null>(null);

  const isAdmin = currentMember?.isAdmin === true;

  useEffect(() => {
    if (!currentClub) return;
    FirebaseManager.getMember(id).then((m) => {
      if (m) {
        setMember(m);
        setEditForm({
          firstName: m.firstName, lastName: m.lastName, email: m.email,
          memberType: m.memberType, isAdmin: m.isAdmin, isTrainer: m.isTrainer,
        });
      }
      setLoading(false);
    });
    const unsub = FirebaseManager.listenToEntries(currentClub.id, (all) =>
      setEntries(all.filter((e) => e.memberId === id).sort((a,b) => (b.date as any).toDate() - (a.date as any).toDate()))
    );
    return () => unsub();
  }, [currentClub, id]);

  const targetPts   = member && currentClub ? calculateTargetPoints(member, currentClub.requiredPoints) : 15;
  const approvedPts = entries.filter((e) => e.status === "Genehmigt").reduce((s, e) => s + e.points, 0);
  const pendingPts  = entries.filter((e) => e.status === "Ausstehend").reduce((s, e) => s + e.points, 0);
  const missingPts  = Math.max(0, targetPts - approvedPts);
  const progress    = targetPts > 0 ? Math.min(1, approvedPts / targetPts) : 0;
  const progressColor = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF3B30";
  const isExempt    = member?.memberType === MemberType.Youth || member?.memberType === MemberType.Board;

  const saveMember = async () => {
    if (!member) return;
    setSaving(true);
    await FirebaseManager.updateMember(member.id, editForm);
    setMember({ ...member, ...editForm });
    setEditSaved(true);
    setTimeout(() => { setEditSaved(false); setIsEditExpanded(false); }, 1500);
    setSaving(false);
  };

  const removeMember = async () => {
    if (!currentClub || !member) return;
    const newIds = (member.clubIds ?? [member.clubId]).filter((c) => c !== currentClub.id);
    await FirebaseManager.updateMember(member.id, { clubIds: newIds });
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
    if (!currentClub || !entryToEdit || !entryForm) return;
    setSavingEntry(true);
    const updated: Entry = {
      ...entryToEdit,
      activityName:     entryForm.activityName,
      activityCategory: entryForm.activityCategory,
      points:           parseFloat(entryForm.points) || 0,
      status:           entryForm.status,
      notes:            entryForm.notes,
      date:             new Date(entryForm.date),
      rejectionReason:  entryForm.rejectionReason,
    };
    await FirebaseManager.updateEntry(currentClub.id, updated);
    setSavingEntry(false);
    setEntryToEdit(null);
    setEntryForm(null);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px] opacity-20">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/5 border-t-white" />
    </div>
  );

  if (!member) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-gray-500">
         <AlertTriangle size={32} />
      </div>
      <div className="flex flex-col gap-2">
         <h3 className="text-xl font-bold text-white">Mitglied nicht gefunden</h3>
         <p className="text-gray-500 text-sm">Die ID existiert nicht mehr oder <br />ist für diesen Verein ungültig.</p>
      </div>
      <Link href="/dashboard/mitglieder" className="px-8 py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full hover:scale-105 transition-all">← Zurück zur Liste</Link>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#080808]">
      <div className="max-w-[1600px] mx-auto py-12 px-1 flex flex-col gap-12">
        
        {/* TOP BAR / BREADCRUMBS */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
           <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-2">
                 <Link href="/dashboard/mitglieder" className="text-[10px] font-black text-gray-500 hover:text-white transition-colors uppercase tracking-widest">Team</Link>
                 <ChevronRight size={10} className="text-gray-700" />
                 <span className="text-[10px] font-black text-white hover:text-white transition-colors uppercase tracking-widest">Profil: {member.firstName}</span>
              </div>
              <h1 className="text-4xl font-poppins font-black text-white tracking-tighter">{member.firstName} {member.lastName}</h1>
           </div>
           
           <div className="flex items-center gap-4">
              {isAdmin && (
                <button 
                  onClick={() => setIsEditExpanded(!isEditExpanded)} 
                  className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest border ${
                    isEditExpanded 
                      ? "bg-white text-black border-white" 
                      : "bg-white/5 text-white border-white/5 hover:bg-white/10"
                  }`}
                >
                   <Pencil size={14} /> {isEditExpanded ? "Abbrechen" : "Bearbeiten"}
                </button>
              )}
              <button 
                onClick={() => setMemberToDelete(true)} 
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-500/10 transition-all border-red-500/0 hover:border-red-500/20"
              >
                 <Trash2 size={18} />
              </button>
           </div>
        </div>

        {/* MAIN SPLIT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
           
           {/* LEFT COLUMN: IDENTITY & STATS (4/12) */}
           <div className="xl:col-span-4 flex flex-col gap-8">
              
              {/* Profile Card */}
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] overflow-hidden p-10 flex flex-col items-center relative group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.02] blur-3xl rounded-full" />
                 
                 <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-[120px] h-[120px] rounded-full blur-[60px] opacity-20" style={{ background: progressColor }} />
                    </div>
                    <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} size={140} imageUrl={member.profileImageUrl} className="relative z-10 border-[6px] border-black shadow-2xl" />
                    <button className="absolute bottom-2 right-2 w-10 h-10 rounded-2xl bg-white border border-white shadow-2xl flex items-center justify-center text-black z-20 hover:scale-110 transition-transform">
                       <Camera size={18} strokeWidth={2.5} />
                    </button>
                 </div>

                 <div className="flex flex-col items-center gap-3 text-center mb-10">
                    <div className="flex items-center gap-3">
                       <h2 className="text-2xl font-poppins font-black text-white">{member.firstName} {member.lastName}</h2>
                       {member.isAdmin && <ShieldCheck size={20} className="text-[#34C759]" />}
                    </div>
                    <p className="text-gray-500 font-bold text-sm">{member.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                       <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">{member.memberType}</span>
                       {member.isTrainer && <span className="px-4 py-1.5 rounded-full bg-[#FF9500]/10 border border-[#FF9500]/20 text-[10px] font-black text-[#FF9500] uppercase tracking-widest">Trainer</span>}
                    </div>
                 </div>

                 {/* Detailed Progress Stats */}
                 <div className="w-full space-y-10">
                    <div className="space-y-4">
                       <div className="flex justify-between items-end px-1">
                          <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] italic">JAHRESPERFORMANCE</span>
                          <span className="text-2xl font-mono font-black text-white">{Math.min(100, Math.round(progress * 100))}%</span>
                       </div>
                       <div className="h-2 w-full rounded-full bg-white/5 p-0.5 border border-white/5">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
                             transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                             className="h-full rounded-full border border-white/10" style={{ background: progressColor }} />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Bestätigt</span>
                          <span className="text-2xl font-mono font-black text-[#34C759]">+{approvedPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">In Prüfung</span>
                          <span className="text-2xl font-mono font-black text-[#FF9500]">+{pendingPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Ziel</span>
                          <span className="text-2xl font-mono font-black text-white">{targetPts.toFixed(1)}</span>
                       </div>
                       <div className="bg-white/5 p-6 rounded-3xl border border-white/5 flex flex-col gap-2">
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Fehlend</span>
                          <span className="text-2xl font-mono font-black text-gray-500">{isExempt ? "–" : missingPts.toFixed(1)}</span>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Quick Actions / Security Section */}
              <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] p-10 space-y-6">
                 <h3 className="text-xs font-black text-gray-600 uppercase tracking-[0.3em] pl-1">Sicherheit & Verwaltung</h3>
                 <div className="flex flex-col gap-3">
                    <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-left group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                             <MailQuestion size={18} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">Passwort Reset</span>
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Link per Mail senden</span>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-800 group-hover:text-white" />
                    </button>

                    <button className="w-full flex items-center justify-between p-5 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/5 transition-all text-left group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white">
                             <RefreshCcw size={18} />
                          </div>
                          <div className="flex flex-col">
                             <span className="text-sm font-bold text-white">Sync Status</span>
                             <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Letzter Login: Gestern 18:42</span>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-gray-800 group-hover:text-white" />
                    </button>
                 </div>
              </div>

           </div>

           {/* RIGHT COLUMN: ACTIVITY & EDIT (8/12) */}
           <div className="xl:col-span-8 flex flex-col gap-12">
              
              <AnimatePresence>
                 {isEditExpanded && (
                   <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="bg-[#0c0c0c] border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.02)] rounded-[40px] p-10 space-y-10 mb-6">
                         <div className="flex items-center gap-3">
                            <Settings size={20} className="text-gray-500" />
                            <h3 className="text-xl font-poppins font-black text-white uppercase tracking-tight italic">Stammdaten anpassen</h3>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-6">
                               <FormInput label="Vorname" value={editForm.firstName} onChange={(v) => setEditForm({...editForm, firstName: v})} />
                               <FormInput label="Nachname" value={editForm.lastName} onChange={(v) => setEditForm({...editForm, lastName: v})} />
                               <FormInput label="E-Mail" value={editForm.email} onChange={(v) => setEditForm({...editForm, email: v})} />
                            </div>
                            <div className="space-y-6">
                               <div className="flex flex-col gap-3">
                                  <label className="text-[11px] font-poppins font-bold text-gray-600 uppercase tracking-[0.3em] pl-1">Mitgliedstyp</label>
                                  <div className="grid grid-cols-2 gap-3">
                                     {Object.values(MemberType).map((t) => (
                                       <button key={t} onClick={() => setEditForm({...editForm, memberType: t})}
                                         className={`py-4 rounded-2xl font-poppins font-black text-[11px] transition-all border uppercase tracking-widest ${editForm.memberType === t ? "bg-white text-black border-white" : "bg-white/[0.02] text-gray-500 border-white/[0.05] hover:border-white/10"}`}>
                                         {t}
                                       </button>
                                     ))}
                                  </div>
                               </div>
                               <div className="flex flex-col gap-3 pt-4">
                                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                     <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">Administrator</span>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Voller Zugriff auf Verein</span>
                                     </div>
                                     <button onClick={() => setEditForm({...editForm, isAdmin: !editForm.isAdmin})} className={`w-12 h-6 rounded-full transition-all relative ${editForm.isAdmin ? "bg-[#34C759]" : "bg-white/10"}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editForm.isAdmin ? "left-7" : "left-1"}`} />
                                     </button>
                                  </div>
                                  <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                     <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white">Trainer / Coach</span>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Kann Punkte genehmigen</span>
                                     </div>
                                     <button onClick={() => setEditForm({...editForm, isTrainer: !editForm.isTrainer})} className={`w-12 h-6 rounded-full transition-all relative ${editForm.isTrainer ? "bg-[#34C759]" : "bg-white/10"}`}>
                                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${editForm.isTrainer ? "left-7" : "left-1"}`} />
                                     </button>
                                  </div>
                               </div>
                            </div>
                         </div>
                         <div className="flex justify-end gap-4 border-t border-white/5 pt-10">
                            <button onClick={() => setIsEditExpanded(false)} className="px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors">Abbrechen</button>
                            <TButton label={saving ? "Speichert…" : (editSaved ? "Gespeichert!" : "Änderungen übernehmen")} onClick={saveMember} disabled={saving} className="w-auto h-auto min-w-[240px]" />
                         </div>
                      </div>
                   </motion.div>
                 )}
              </AnimatePresence>

              {/* Activity Log Section */}
              <div className="space-y-8">
                 <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div className="flex items-center gap-3">
                       <Activity size={20} className="text-gray-800" />
                       <h3 className="text-xl font-poppins font-black text-white uppercase tracking-tight italic">Gesamte Aktivitäten</h3>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{entries.length} Einträge verfügbar</span>
                    </div>
                 </div>

                 {entries.length === 0 ? (
                   <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] p-24 text-center opacity-40">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                         <Calendar size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-white">Keine Einträge</h3>
                      <p className="text-sm font-medium">Noch keine Tätigkeiten in diesem Zeitraum.</p>
                   </div>
                 ) : (
                   <div className="bg-[#0c0c0c] border border-white/5 rounded-[40px] overflow-hidden shadow-2xl">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                               <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Tätigkeit</th>
                               <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Datum</th>
                               <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</th>
                               <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Punkte</th>
                               <th className="px-10 py-6 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-20"></th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-white/[0.03]">
                            {entries.map((entry, idx) => (
                               <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                                  <td className="px-10 py-6">
                                     <div className="flex items-center gap-6">
                                        <TCatBadge category={entry.activityCategory} size={48} />
                                        <div className="flex flex-col">
                                           <span className="text-[17px] font-poppins font-bold text-white leading-tight">{entry.activityName}</span>
                                           <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{entry.activityCategory}</span>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-10 py-6 text-[13px] font-bold text-gray-500">
                                     {new Date(entry.date as any).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })}
                                  </td>
                                  <td className="px-10 py-6">
                                     <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                           entry.status === "Genehmigt" ? "bg-[#34C759]" : entry.status === "Abgelehnt" ? "bg-[#FF3B30]" : "bg-[#FF9500]"
                                        }`} />
                                        <span className={`text-[11px] font-black uppercase tracking-widest ${
                                           entry.status === "Genehmigt" ? "text-[#34C759]" : entry.status === "Abgelehnt" ? "text-[#FF3B30]" : "text-[#FF9500]"
                                        }`}>
                                           {entry.status}
                                        </span>
                                     </div>
                                  </td>
                                  <td className="px-10 py-6 text-right">
                                     <span className="text-xl font-mono font-black text-white">+{entry.points.toFixed(1)}</span>
                                  </td>
                                  <td className="px-10 py-6 text-center">
                                     {isAdmin && (
                                       <button onClick={() => openEntryEdit(entry)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-700 hover:text-white hover:bg-white/10 transition-all">
                                          <MoreHorizontal size={18} />
                                       </button>
                                     )}
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                 )}
              </div>
           </div>

        </div>
      </div>

      {/* Entry Edit Modal */}
      <AnimatePresence>
        {entryToEdit && entryForm && (
           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="w-full max-w-xl">
                <div className="bg-[#0c0c0c] border border-white/10 rounded-[48px] p-10 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.02] blur-3xl rounded-full" />
                   
                   <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white">
                            <Activity size={24} />
                         </div>
                         <div className="flex flex-col">
                            <h3 className="font-poppins font-black text-white text-xl uppercase tracking-tight italic">Eintrag Details</h3>
                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Administrative Korrektur</span>
                         </div>
                      </div>
                      <button onClick={() => setEntryToEdit(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
                   </div>

                   <div className="flex flex-col gap-6 relative z-10">
                      <FormInput label="Bezeichnung der Tätigkeit" value={entryForm.activityName} onChange={(v) => setEntryForm({...entryForm, activityName: v})} />
                      
                      <div className="grid grid-cols-2 gap-6">
                         <FormInput label="Punkte Wert" value={entryForm.points} onChange={(v) => setEntryForm({...entryForm, points: v})} type="number" />
                         <FormInput label="Durchgeführt am" value={entryForm.date} onChange={(v) => setEntryForm({...entryForm, date: v})} type="date" />
                      </div>

                      <div className="flex flex-col gap-3">
                         <label className="text-[11px] font-poppins font-bold text-gray-600 uppercase tracking-[0.3em] pl-1">Status Festlegen</label>
                         <div className="flex p-2 rounded-2xl bg-white/5 border border-white/5">
                            {[EntryStatus.Pending, EntryStatus.Approved, EntryStatus.Rejected].map((s) => (
                              <button key={s} onClick={() => setEntryForm({...entryForm, status: s})}
                                className={`flex-1 py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${
                                   entryForm.status === s 
                                      ? "bg-white text-black shadow-2xl" 
                                      : "text-gray-500 hover:text-white"
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

                   <div className="pt-6 border-t border-white/5 relative z-10">
                      <TButton label={savingEntry ? "Aktualisierung…" : "Änderungen speichern"} onClick={saveEntry} disabled={savingEntry} />
                   </div>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Delete Member Modal */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/90 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-sm text-center">
               <div className="w-24 h-24 rounded-[32px] bg-red-500/10 flex items-center justify-center mx-auto mb-8 border border-red-500/20 shadow-[0_0_60px_rgba(239,68,68,0.1)]">
                  <AlertTriangle size={48} className="text-red-500" />
               </div>
               <h3 className="text-3xl font-poppins font-black text-white mb-3 tracking-tight italic uppercase">Mitglied Löschen</h3>
               <p className="text-gray-500 font-bold text-sm mb-12 px-6">Soll <span className="text-white underline decoration-red-500/40">{member.firstName} {member.lastName}</span> wirklich permanent aus der Datenbank des Vereins entfernt werden?</p>
               <div className="flex flex-col gap-3">
                 <button onClick={removeMember} className="w-full py-5 bg-red-600 hover:bg-red-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl shadow-red-500/10 active:scale-95">Endgültig Löschen</button>
                 <button onClick={() => setMemberToDelete(false)} className="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/5 active:scale-95">Abbrechen</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatItem({ value, label, color }: { value: string, label: string, color: string }) {
  return (
    <div className="flex flex-col items-center py-6 gap-1 group cursor-default">
       <span className="font-mono font-black text-xl group-hover:scale-110 transition-transform" style={{ color }}>{value}</span>
       <span className="text-[9px] font-black text-gray-700 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, color }: { title: string, icon: any, color: string }) {
  return (
    <div className="flex items-center gap-3 px-1 pb-1">
       <div className="w-1 h-4 bg-white/10 rounded-full" />
       <span className="text-[11px] font-poppins font-black text-gray-500 tracking-[0.25em] uppercase italic">{title}</span>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sub, color, onClick }: { icon: any, label: string, sub: string, color: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-5 px-6 py-5 transition-all bg-white/[0.015] hover:bg-white/[0.04] border border-white/5 rounded-3xl group text-left">
       <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 transition-transform group-hover:-rotate-3" style={{ background: `${color}08`, color }}>
          <Icon size={22} strokeWidth={2.5} />
       </div>
       <div className="flex-1 flex flex-col min-w-0">
          <span className="font-poppins font-black text-white text-[17px] leading-tight uppercase tracking-tight">{label}</span>
          <span className="text-[12px] font-bold text-gray-600 mt-0.5">{sub}</span>
       </div>
       <ChevronRight size={18} className="text-gray-800 group-hover:text-white transition-colors" />
    </button>
  );
}

function FormInput({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-2.5">
      <label className="text-[11px] font-poppins font-bold text-gray-600 uppercase tracking-[0.2em] pl-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[24px] bg-white/[0.03] border border-white/5 px-6 py-4.5 font-poppins font-bold text-sm text-white focus:outline-none focus:border-white/20 focus:bg-white/5 transition-all [color-scheme:dark] placeholder:text-gray-800"
      />
    </div>
  );
}
