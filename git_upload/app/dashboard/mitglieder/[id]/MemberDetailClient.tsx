"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, ChevronDown, ChevronUp, Check,
  Trash2, AlertTriangle, X, Pencil, Info, Camera,
  Mail, ShieldCheck, Dumbbell, Calendar, Target, Plus, RefreshCcw
} from "lucide-react";
import { useAppStore } from "../../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../../lib/firebase/firebaseManager";
import {
  Member, Entry, MemberType, ActivityCategory,
  calculateTargetPoints, EntryStatus,
} from "../../../../lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar, AmbientBackground, 
  TButton, TSearchBar, TBadge, TCatBadge 
} from "../../../components/ui/NativeUI";

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
      setEntries(all.filter((e) => e.memberId === id))
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
    <div className="flex items-center justify-center h-full p-20 opacity-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );

  if (!member) return (
    <div className="flex flex-col items-center justify-center h-full p-20 gap-4 opacity-40">
      <p className="text-[#8A8A8A] font-poppins">Mitglied nicht gefunden.</p>
      <Link href="/dashboard/mitglieder" className="text-white text-sm font-poppins hover:underline">← Zurück</Link>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 flex flex-col max-w-2xl mx-auto pb-32">
        {/* Sticky Back Header */}
        <div className="sticky top-0 z-20 bg-black/60 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/mitglieder" className="flex items-center gap-2 text-[#8A8A8A] hover:text-white transition-colors font-poppins text-sm font-bold">
            <ArrowLeft size={16} strokeWidth={2.5} /> Mitglieder
          </Link>
          {isAdmin && (
            <button onClick={() => setMemberToDelete(true)} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8A8A8A] hover:text-red-400 transition-all active:scale-90 bg-white/5 border border-white/10">
              <Trash2 size={15} />
            </button>
          )}
        </div>

        <div className="p-6 flex flex-col gap-8">
          {/* Profile Hero Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <GlassSection className="relative overflow-hidden">
               <div className="absolute inset-0 bg-white/5 opacity-40" />
               <div className="relative z-10 flex flex-col items-center">
                  {/* Avatar + Glow */}
                  <div className="pt-8 pb-4 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                       <div className="w-[110px] h-[110px] rounded-full blur-2xl opacity-20" style={{ background: progressColor }} />
                    </div>
                    <div className="relative">
                      <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} size={88} imageUrl={member.profileImageUrl} />
                      <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white border border-white shadow-lg flex items-center justify-center text-[#080808]">
                        <Camera size={13} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 px-6 pb-2 text-center">
                     <h2 className="text-[22px] font-poppins font-bold text-white leading-tight">
                        {member.firstName} {member.lastName}
                     </h2>
                     <p className="text-[13px] font-poppins text-[#8A8A8A] mb-2">{member.email}</p>
                     
                     <div className="flex items-center gap-2">
                        {member.isAdmin && <TBadge label="Admin" icon={ShieldCheck} color="white" />}
                        {member.isTrainer && !member.isAdmin && <TBadge label="Trainer" icon={Dumbbell} color="#FF9500" />}
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#8A8A8A]">
                          {member.memberType}
                        </span>
                     </div>
                  </div>

                  {!isExempt && (
                    <div className="w-full px-6 py-4 flex flex-col gap-2.5">
                       <div className="flex justify-between items-center px-1">
                          <span className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest">Fortschritt</span>
                          <span className="text-[11px] font-poppins font-bold text-white/60">
                            {approvedPts.toFixed(1)} / {targetPts.toFixed(1)} Pkt.
                          </span>
                       </div>
                       <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
                             transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                             className="h-full rounded-full" style={{ background: progressColor }} />
                       </div>
                    </div>
                  )}

                  <TLine />

                  {/* Hero Stats grid */}
                  <div className="grid grid-cols-3 w-full divide-x divide-white/[0.08]">
                    <StatItem value={approvedPts.toFixed(1)} label="Genehmigt" color="#34C759" />
                    <StatItem value={pendingPts.toFixed(1)} label="Ausstehend" color="#FF9500" />
                    <StatItem value={isExempt ? "–" : missingPts.toFixed(1)} label="Fehlend"
                       color={isExempt ? "#8A8A8A" : missingPts > 0 ? "#FF3B30" : "#34C759"} />
                  </div>
               </div>
            </GlassSection>
          </motion.div>

          {/* Action Rows */}
          <div className="flex flex-col gap-6">
             <div className="flex flex-col gap-3">
                <SectionHeader title="AKTIONEN" icon={Plus} color="#FFFFFF" />
                <GlassSection>
                   <SettingsRow 
                     icon={Mail} 
                     label="Zugangsdaten senden" 
                     sub="Reset-Link an hinterlegte E-Mail" 
                     color="#00E0D1" 
                   />
                   {isAdmin && (
                     <>
                        <TLine className="ml-[68px]" />
                        <div className="overflow-hidden">
                           <button onClick={() => setIsEditExpanded(!isEditExpanded)}
                             className="w-full flex items-center gap-4 px-4 py-3.5 transition-all active:bg-white/5 group text-left">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-white">
                                 <Pencil size={17} strokeWidth={2.5} />
                              </div>
                              <div className="flex-1 flex flex-col min-w-0">
                                 <span className="font-poppins font-semibold text-white text-[15px] leading-tight">Mitglied bearbeiten</span>
                                 <span className="text-[12px] font-poppins text-[#8A8A8A] truncate">Stammdaten & Rollen anpassen</span>
                              </div>
                              <ChevronDown size={14} className={`text-[#383838] transition-transform ${isEditExpanded ? "rotate-180" : ""}`} />
                           </button>
                           
                           <AnimatePresence>
                              {isEditExpanded && (
                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden bg-white/[0.01]">
                                   <div className="p-5 flex flex-col gap-5 border-t border-white/[0.05]">
                                      <div className="grid grid-cols-2 gap-4">
                                         <FormInput label="Vorname" value={editForm.firstName} onChange={(v) => setEditForm({...editForm, firstName: v})} />
                                         <FormInput label="Nachname" value={editForm.lastName} onChange={(v) => setEditForm({...editForm, lastName: v})} />
                                      </div>
                                      <FormInput label="E-Mail" value={editForm.email} onChange={(v) => setEditForm({...editForm, email: v})} />
                                      <div className="flex flex-col gap-2">
                                         <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">Mitgliedstyp</label>
                                         <div className="grid grid-cols-2 gap-2">
                                            {Object.values(MemberType).map((t) => (
                                              <button key={t} onClick={() => setEditForm({...editForm, memberType: t})}
                                                className={`py-2.5 rounded-xl font-poppins font-bold text-xs transition-all border ${editForm.memberType === t ? "bg-white text-[#080808] border-white" : "bg-white/5 text-[#8A8A8A] border-white/10"}`}>
                                                {t}
                                              </button>
                                            ))}
                                         </div>
                                      </div>
                                      <div className="flex flex-col gap-2 pt-2">
                                        <TButton label={saving ? "Speichert…" : (editSaved ? "Gespeichert!" : "Speichern")} onClick={saveMember} disabled={saving} />
                                      </div>
                                   </div>
                                </motion.div>
                              )}
                           </AnimatePresence>
                        </div>
                     </>
                   )}
                </GlassSection>
             </div>

             {/* Entries Section */}
             <div className="flex flex-col gap-3">
                <SectionHeader title={`EINTRÄGE (${entries.length})`} icon={Calendar} color="#FFFFFF" />
                {entries.length === 0 ? (
                  <GlassSection className="p-10 text-center opacity-40">
                    <p className="font-poppins text-[#8A8A8A] text-sm">Noch keine Beiträge eingetragen.</p>
                  </GlassSection>
                ) : (
                  <GlassSection>
                     {entries.map((entry, idx) => (
                       <div key={entry.id}>
                          <div className="flex items-center gap-4 px-4 py-3.5 group">
                             <TCatBadge category={entry.activityCategory} size={40} />
                             <div className="flex flex-col flex-1 min-w-0">
                                <span className="font-poppins font-semibold text-white text-[15px] truncate leading-tight">
                                   {entry.activityName}
                                </span>
                                <div className="flex items-center gap-1.5 mt-1">
                                   <span className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-wider">
                                      {new Date(entry.date as any).toLocaleDateString("de-DE")}
                                   </span>
                                   <span className="w-1 h-1 rounded-full bg-white/10" />
                                   <span className={`text-[11px] font-poppins font-bold uppercase tracking-wider ${
                                      entry.status === "Genehmigt" ? "text-[#34C759]" : entry.status === "Abgelehnt" ? "text-[#FF3B30]" : "text-[#FF9500]"
                                   }`}>
                                      {entry.status}
                                   </span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 shrink-0">
                                <span className="font-mono font-bold text-[15px] text-white">
                                   +{entry.points.toFixed(1)}
                                </span>
                                {isAdmin && (
                                  <button onClick={() => openEntryEdit(entry)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[#383838] hover:text-white transition-all">
                                     <Pencil size={14} />
                                  </button>
                                )}
                             </div>
                          </div>
                          {idx < entries.length - 1 && <TLine className="ml-[68px]" />}
                       </div>
                     ))}
                  </GlassSection>
                )}
             </div>
          </div>
        </div>
      </div>

      {/* Entry Edit Modal */}
      <AnimatePresence>
        {entryToEdit && entryForm && (
           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm">
                <GlassSection className="p-6 flex flex-col gap-5">
                   <div className="flex items-center justify-between">
                      <h3 className="font-poppins font-bold text-white text-lg">Eintrag bearbeiten</h3>
                      <button onClick={() => setEntryToEdit(null)} className="text-[#8A8A8A] hover:text-white"><X size={20} /></button>
                   </div>
                   <div className="flex flex-col gap-4">
                      <FormInput label="Tätigkeit" value={entryForm.activityName} onChange={(v) => setEntryForm({...entryForm, activityName: v})} />
                      <div className="grid grid-cols-2 gap-4">
                         <FormInput label="Punkte" value={entryForm.points} onChange={(v) => setEntryForm({...entryForm, points: v})} type="number" />
                         <FormInput label="Datum" value={entryForm.date} onChange={(v) => setEntryForm({...entryForm, date: v})} type="date" />
                      </div>
                      <div className="flex flex-col gap-2">
                         <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">Status</label>
                         <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
                            {[EntryStatus.Pending, EntryStatus.Approved, EntryStatus.Rejected].map((s) => (
                              <button key={s} onClick={() => setEntryForm({...entryForm, status: s})}
                                className={`flex-1 py-1.5 rounded-lg text-xs font-poppins font-bold transition-all ${entryForm.status === s ? "bg-white text-[#080808]" : "text-[#8A8A8A]"}`}>
                                {s === EntryStatus.Pending ? "Wait" : s === EntryStatus.Approved ? "OK" : "Err"}
                              </button>
                            ))}
                         </div>
                      </div>
                   </div>
                   <TButton label={savingEntry ? "Speichern…" : "Speichern"} onClick={saveEntry} disabled={savingEntry} />
                </GlassSection>
             </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Delete Member Modal */}
      <AnimatePresence>
        {memberToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xs text-center">
               <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <AlertTriangle size={32} className="text-red-400" />
               </div>
               <h3 className="text-xl font-poppins font-bold text-white mb-2">Entfernen?</h3>
               <p className="text-sm font-poppins text-[#8A8A8A] mb-8 px-4">Soll <span className="text-white">{member.firstName}</span> wirklich aus dem Verein entfernt werden?</p>
               <div className="flex flex-col gap-2">
                 <TButton label="Mitglied entfernen" variant="danger" onClick={removeMember} />
                 <TButton label="Abbrechen" variant="secondary" onClick={() => setMemberToDelete(false)} />
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
    <div className="flex flex-col items-center py-4 gap-0.5">
       <span className="font-mono font-bold text-[17px]" style={{ color }}>{value}</span>
       <span className="text-[10px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, color }: { title: string, icon: any, color: string }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-1">
       <Icon size={12} style={{ color }} strokeWidth={3} />
       <span className="text-[10px] font-poppins font-bold text-[#8A8A8A] tracking-[0.15em] uppercase">{title}</span>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sub, color, onClick }: { icon: any, label: string, sub: string, color: string, onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 px-4 py-3.5 transition-all active:bg-white/5 group text-left">
       <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
          <Icon size={18} strokeWidth={2.5} />
       </div>
       <div className="flex-1 flex flex-col min-w-0">
          <span className="font-poppins font-semibold text-white text-[15px] leading-tight">{label}</span>
          <span className="text-[12px] font-poppins text-[#8A8A8A] truncate">{sub}</span>
       </div>
       <ChevronRight size={14} className="text-[#383838]" />
    </button>
  );
}

function FormInput({ label, value, onChange, type = "text" }: { label: string, value: string, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="flex flex-col gap-1.5 px-1">
      <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">{label}</label>
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 font-poppins text-sm text-white focus:outline-none focus:border-white/20 transition-all [color-scheme:dark]"
      />
    </div>
  );
}
