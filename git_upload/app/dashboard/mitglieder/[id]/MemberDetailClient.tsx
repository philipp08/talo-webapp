"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Shield, ChevronDown, ChevronUp, Check,
  Trash2, AlertTriangle, X, Pencil, Info,
} from "lucide-react";
import { useAppStore } from "../../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../../lib/firebase/firebaseManager";
import {
  Member, Entry, MemberType, ActivityCategory,
  calculateTargetPoints, EntryStatus,
} from "../../../../lib/firebase/models";

// ── helpers ──────────────────────────────────────────────────────────────────

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-red-500/10",    text: "text-red-400"    },
  B: { bg: "bg-blue-500/10",   text: "text-blue-400"   },
  C: { bg: "bg-green-500/10",  text: "text-green-400"  },
  S: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

const ALL_CATS  = [ActivityCategory.A, ActivityCategory.B, ActivityCategory.C, ActivityCategory.S];
const ALL_STATI = [EntryStatus.Pending, EntryStatus.Approved, EntryStatus.Rejected];
const MEMBER_TYPES = [MemberType.Active, MemberType.Passive, MemberType.Youth, MemberType.Board];

function toDateInput(d: any): string {
  const date = d instanceof Date ? d : (d?.toDate ? d.toDate() : new Date(d));
  return date.toISOString().slice(0, 10);
}

// ── component ────────────────────────────────────────────────────────────────

export default function MemberDetailPage() {
  const { id }          = useParams<{ id: string }>();
  const router          = useRouter();
  const currentClub     = useAppStore((s) => s.currentClub);
  const currentMember   = useAppStore((s) => s.currentMember);

  const [member,  setMember]  = useState<Member | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  // member edit
  const [isEditOpen,  setIsEditOpen]  = useState(false);
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

  // ── data ──────────────────────────────────────────────────────────────────

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

  // ── computed ──────────────────────────────────────────────────────────────

  const targetPts   = member && currentClub ? calculateTargetPoints(member, currentClub.requiredPoints) : 0;
  const approvedPts = entries.filter((e) => e.status === "Genehmigt").reduce((s, e) => s + e.points, 0);
  const pendingPts  = entries.filter((e) => e.status === "Ausstehend").reduce((s, e) => s + e.points, 0);
  const missingPts  = Math.max(0, targetPts - approvedPts);
  const progress    = targetPts > 0 ? Math.min(1, approvedPts / targetPts) : 1;
  const progressColor = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF3B30";
  const isExempt    = member?.memberType === MemberType.Youth || member?.memberType === MemberType.Board;

  // ── member actions ────────────────────────────────────────────────────────

  const saveMember = async () => {
    if (!member) return;
    setSaving(true);
    await FirebaseManager.updateMember(member.id, editForm);
    setMember({ ...member, ...editForm });
    setEditSaved(true);
    setTimeout(() => { setEditSaved(false); setIsEditOpen(false); }, 1500);
    setSaving(false);
  };

  const removeMember = async () => {
    if (!currentClub || !member) return;
    const newIds = (member.clubIds ?? [member.clubId]).filter((c) => c !== currentClub.id);
    await FirebaseManager.updateMember(member.id, { clubIds: newIds });
    router.push("/dashboard/mitglieder");
  };

  // ── entry actions ─────────────────────────────────────────────────────────

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

  const deleteEntry = async (entry: Entry) => {
    if (!currentClub) return;
    await FirebaseManager.deleteEntry(currentClub.id, entry.id);
    setEntryToDelete(null);
  };

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center h-full p-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
    </div>
  );

  if (!member) return (
    <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
      <p className="text-[#8A8A8A] font-poppins">Mitglied nicht gefunden.</p>
      <Link href="/dashboard/mitglieder" className="text-white text-sm font-poppins hover:underline">← Zurück</Link>
    </div>
  );

  return (
    <div className="flex flex-col max-w-2xl mx-auto pb-20">

      {/* ── sticky back header ───────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#080808] border-b border-[#ffffff0f] px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard/mitglieder" className="flex items-center gap-2 text-[#8A8A8A] hover:text-white transition-colors font-poppins text-sm">
          <ArrowLeft size={16} /> Mitglieder
        </Link>
        {isAdmin && (
          <button onClick={() => setMemberToDelete(true)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[#8A8A8A] hover:text-red-400">
            <Trash2 size={17} />
          </button>
        )}
      </div>

      <div className="px-6 pt-8 flex flex-col gap-6">

        {/* ── hero ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-poppins"
            style={{ background: "linear-gradient(135deg,#1A1A1A,#2A2A2A)", boxShadow: `0 0 0 3px ${progressColor}40`, outline: `2px solid ${progressColor}` }}>
            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
          </div>
          <div className="text-center">
            <h1 className="font-poppins font-bold text-white text-2xl">{member.firstName} {member.lastName}</h1>
            <p className="font-poppins text-[#8A8A8A] text-sm mt-0.5">{member.email}</p>
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {member.isAdmin && (
              <span className="flex items-center gap-1 text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                <Shield size={11} /> Admin
              </span>
            )}
            {member.isTrainer && (
              <span className="text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Trainer
              </span>
            )}
            <span className="text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-white/5 text-[#8A8A8A] border border-white/10">
              {member.memberType}
            </span>
          </div>
        </motion.div>

        {/* ── progress bar ─────────────────────────────────────────────── */}
        {!isExempt && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
            className="rounded-2xl border border-[#ffffff0f] bg-[#111111] p-5 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="font-poppins text-sm text-white">Fortschritt</span>
              <span className="font-mono text-xs text-[#8A8A8A]">{approvedPts.toFixed(1)} / {targetPts.toFixed(1)} Pkt.</span>
            </div>
            <div className="h-2 w-full rounded-full bg-[#1A1A1A] overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full" style={{ background: progressColor }} />
            </div>
          </motion.div>
        )}

        {/* ── stat row ─────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          className="grid grid-cols-3 divide-x divide-[#ffffff0f] rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
          <StatCell value={approvedPts.toFixed(1)} label="Genehmigt" color="#34C759" />
          <StatCell value={pendingPts.toFixed(1)}  label="Ausstehend" color="#FF9500" />
          <StatCell value={isExempt ? "–" : missingPts.toFixed(1)} label="Fehlend"
            color={isExempt ? "#8A8A8A" : missingPts > 0 ? "#FF3B30" : "#34C759"} />
        </motion.div>

        {/* ── member edit (admin) ───────────────────────────────────────── */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
            className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
            <button onClick={() => setIsEditOpen(!isEditOpen)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
              <span className="font-poppins font-medium text-white text-sm">Mitglied bearbeiten</span>
              {isEditOpen ? <ChevronUp size={16} className="text-[#8A8A8A]" /> : <ChevronDown size={16} className="text-[#8A8A8A]" />}
            </button>
            <AnimatePresence>
              {isEditOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="border-t border-[#ffffff0f] px-5 py-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField label="Vorname">
                        <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                          className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-3 py-2.5 text-sm font-poppins text-white focus:outline-none focus:border-white/20" />
                      </FormField>
                      <FormField label="Nachname">
                        <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                          className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-3 py-2.5 text-sm font-poppins text-white focus:outline-none focus:border-white/20" />
                      </FormField>
                    </div>
                    <FormField label="E-Mail">
                      <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-3 py-2.5 text-sm font-poppins text-white focus:outline-none focus:border-white/20" />
                    </FormField>
                    <FormField label="Mitgliedstyp">
                      <div className="rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] overflow-hidden">
                        {MEMBER_TYPES.map((type, idx) => (
                          <div key={type}>
                            <button onClick={() => setEditForm({ ...editForm, memberType: type })}
                              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-poppins transition-colors ${editForm.memberType === type ? "text-white bg-white/5" : "text-[#8A8A8A] hover:bg-white/5"}`}>
                              <span>{type}</span>
                              {editForm.memberType === type && <Check size={14} className="text-[#64D2FF]" />}
                            </button>
                            {idx < MEMBER_TYPES.length - 1 && <div className="border-b border-[#ffffff0a] mx-4" />}
                          </div>
                        ))}
                      </div>
                    </FormField>
                    <ToggleRow label="Admin" subtitle="Voller Zugriff auf alle Einstellungen"
                      checked={editForm.isAdmin} onChange={(v) => setEditForm({ ...editForm, isAdmin: v })} activeColor="#ffffff" />
                    <ToggleRow label="Trainer" subtitle="Sieht Anwesenheit & Abmeldungen"
                      checked={editForm.isTrainer} onChange={(v) => setEditForm({ ...editForm, isTrainer: v })} activeColor="#FF9500" />
                    <button onClick={saveMember} disabled={saving}
                      className="w-full py-3 rounded-xl font-poppins font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                      style={{ background: editSaved ? "#34C759" : "white", color: "#080808" }}>
                      {editSaved ? <><Check size={16} /> Gespeichert</> : saving
                        ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#080808]/30 border-t-[#080808]" />
                        : "Änderungen speichern"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── entries ──────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="flex flex-col gap-3">
          <span className="text-xs font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest">
            Einträge ({entries.length})
          </span>

          {entries.length === 0 ? (
            <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] p-10 text-center">
              <p className="font-poppins text-[#8A8A8A] text-sm">Noch keine Beiträge.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
              {entries.map((entry, idx) => {
                const col = CAT_COLORS[entry.activityCategory as string] ?? CAT_COLORS.B;
                return (
                  <div key={entry.id}>
                    <div className="flex items-start gap-4 px-5 py-4">
                      {/* category badge */}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-poppins text-sm shrink-0 mt-0.5 ${col.bg} ${col.text}`}>
                        {entry.activityCategory}
                      </div>

                      {/* info */}
                      <div className="flex flex-col min-w-0 flex-1 gap-0.5">
                        <span className="font-poppins font-semibold text-white text-sm truncate">{entry.activityName}</span>
                        <div className="flex items-center gap-2 text-xs font-poppins text-[#8A8A8A]">
                          <span>{new Date(entry.date as any).toLocaleDateString("de-DE")}</span>
                          <span>·</span>
                          <span className={
                            entry.status === "Genehmigt"  ? "text-green-500" :
                            entry.status === "Abgelehnt"  ? "text-red-400"   : "text-orange-400"}>
                            {entry.status}
                          </span>
                        </div>
                        {entry.notes && (
                          <span className="text-xs font-poppins text-[#555] truncate">{entry.notes}</span>
                        )}
                        {/* rejection reason */}
                        {entry.status === "Abgelehnt" && entry.rejectionReason && (
                          <div className="flex items-center gap-1.5 mt-1 px-2.5 py-1.5 rounded-lg bg-red-500/8">
                            <Info size={10} className="text-red-400 shrink-0" />
                            <span className="text-[11px] font-poppins text-red-400">{entry.rejectionReason}</span>
                          </div>
                        )}
                      </div>

                      {/* points + actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="font-poppins font-bold text-white">+{entry.points.toFixed(1)}</span>
                        {isAdmin && (
                          <>
                            <button onClick={() => openEntryEdit(entry)}
                              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#555] hover:text-white ml-1">
                              <Pencil size={14} />
                            </button>
                            <button onClick={() => setEntryToDelete(entry)}
                              className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[#555] hover:text-red-400">
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {idx < entries.length - 1 && <div className="border-b border-[#ffffff0a] mx-5" />}
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ══ ENTRY EDIT MODAL ══════════════════════════════════════════════════ */}
      <AnimatePresence>
        {entryToEdit && entryForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70"
            onClick={() => { setEntryToEdit(null); setEntryForm(null); }}>
            <motion.div initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">

              {/* header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#ffffff0f]">
                <h3 className="font-poppins font-bold text-white text-lg">Eintrag bearbeiten</h3>
                <button onClick={() => { setEntryToEdit(null); setEntryForm(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} className="text-[#8A8A8A]" />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">

                {/* activity name */}
                <FormField label="Tätigkeit">
                  <input value={entryForm.activityName}
                    onChange={(e) => setEntryForm({ ...entryForm, activityName: e.target.value })}
                    placeholder="Name der Tätigkeit"
                    className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20" />
                </FormField>

                {/* category */}
                <FormField label="Kategorie">
                  <div className="grid grid-cols-4 gap-2">
                    {ALL_CATS.map((cat) => {
                      const col = CAT_COLORS[cat];
                      const active = entryForm.activityCategory === cat;
                      return (
                        <button key={cat} onClick={() => setEntryForm({ ...entryForm, activityCategory: cat })}
                          className={`py-2.5 rounded-xl font-poppins font-bold text-sm transition-all border ${
                            active ? `${col.bg} ${col.text} border-transparent` : "border-[#ffffff0f] text-[#8A8A8A] hover:bg-white/5"}`}>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </FormField>

                {/* date + points */}
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Datum">
                    <input type="date" value={entryForm.date}
                      onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                      className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white focus:outline-none focus:border-white/20
                        [color-scheme:dark]" />
                  </FormField>
                  <FormField label="Punkte">
                    <input type="number" step="0.5" min="0" value={entryForm.points}
                      onChange={(e) => setEntryForm({ ...entryForm, points: e.target.value })}
                      className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white focus:outline-none focus:border-white/20" />
                  </FormField>
                </div>

                {/* status */}
                <FormField label="Status">
                  <div className="rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] overflow-hidden">
                    {ALL_STATI.map((s, idx) => {
                      const active = entryForm.status === s;
                      const color = s === EntryStatus.Approved ? "text-green-400"
                        : s === EntryStatus.Rejected ? "text-red-400" : "text-orange-400";
                      return (
                        <div key={s}>
                          <button onClick={() => setEntryForm({ ...entryForm, status: s })}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-poppins transition-colors ${active ? "bg-white/5" : "hover:bg-white/5"}`}>
                            <span className={active ? color : "text-[#8A8A8A]"}>{s}</span>
                            {active && <Check size={14} className={color} />}
                          </button>
                          {idx < ALL_STATI.length - 1 && <div className="border-b border-[#ffffff0a] mx-4" />}
                        </div>
                      );
                    })}
                  </div>
                </FormField>

                {/* rejection reason – only when rejected */}
                {entryForm.status === EntryStatus.Rejected && (
                  <FormField label="Ablehnungsgrund">
                    <input value={entryForm.rejectionReason}
                      onChange={(e) => setEntryForm({ ...entryForm, rejectionReason: e.target.value })}
                      placeholder="Grund für die Ablehnung…"
                      className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20" />
                  </FormField>
                )}

                {/* notes */}
                <FormField label="Notiz">
                  <textarea value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    rows={3} placeholder="Optionale Notiz…"
                    className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20 resize-none" />
                </FormField>

                {/* save */}
                <button onClick={saveEntry} disabled={savingEntry || !entryForm.activityName.trim()}
                  className="w-full py-3 rounded-xl font-poppins font-semibold text-sm bg-white text-[#080808] hover:bg-white/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2">
                  {savingEntry
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#080808]/30 border-t-[#080808]" />
                    : "Änderungen speichern"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══ DELETE ENTRY MODAL ════════════════════════════════════════════════ */}
      <AnimatePresence>
        {entryToDelete && (
          <Modal onClose={() => setEntryToDelete(null)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-400" />
              </div>
              <h3 className="font-poppins font-bold text-white text-lg">Eintrag löschen?</h3>
            </div>
            <p className="text-sm font-poppins text-[#8A8A8A] mb-5">
              <span className="text-white">{entryToDelete.activityName}</span> wird unwiderruflich gelöscht.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setEntryToDelete(null)} className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors">Abbrechen</button>
              <button onClick={() => deleteEntry(entryToDelete)} className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">Löschen</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ══ DELETE MEMBER MODAL ═══════════════════════════════════════════════ */}
      <AnimatePresence>
        {memberToDelete && (
          <Modal onClose={() => setMemberToDelete(false)}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <h3 className="font-poppins font-bold text-white text-lg">Aus Verein entfernen?</h3>
            </div>
            <p className="text-sm font-poppins text-[#8A8A8A] mb-5">
              <span className="text-white">{member.firstName} {member.lastName}</span> wird aus dem Verein entfernt.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setMemberToDelete(false)} className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors">Abbrechen</button>
              <button onClick={removeMember} className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors">Entfernen</button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── sub-components ────────────────────────────────────────────────────────────

function StatCell({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center py-4 gap-0.5">
      <span className="font-poppins font-bold text-lg" style={{ color }}>{value}</span>
      <span className="text-[10px] font-poppins text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function ToggleRow({ label, subtitle, checked, onChange, activeColor }:
  { label: string; subtitle: string; checked: boolean; onChange: (v: boolean) => void; activeColor: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border transition-colors"
      style={{ background: checked ? `${activeColor}08` : "transparent", borderColor: checked ? `${activeColor}30` : "rgba(255,255,255,0.06)" }}>
      <div>
        <p className="font-poppins font-semibold text-sm" style={{ color: activeColor }}>{label}</p>
        <p className="font-poppins text-xs text-[#8A8A8A]">{subtitle}</p>
      </div>
      <button onClick={() => onChange(!checked)}
        className="relative w-12 h-6 rounded-full transition-colors shrink-0"
        style={{ background: checked ? activeColor : "#333" }}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }} transition={{ type: "spring", damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-sm rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6">
        {children}
      </motion.div>
    </motion.div>
  );
}
