"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, X, Users, ChevronDown, ChevronUp,
  Check, AlertCircle, Pencil, Circle, CalendarPlus, Ban, RotateCcw, Sparkles,
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import {
  TrainingGroup, TrainingSession, TrainingScheduleEntry,
  Member, getPlanFeatures, getMemberFullName,
  TRAINING_GROUP_COLORS, ABSENCE_REASONS,
} from "@/lib/firebase/models";
import {
  GlassSection, TLine, TAvatar, TButton, TSearchBar, PlanUpsell,
} from "@/app/components/ui/NativeUI";

// ── helpers ──────────────────────────────────────────────────────────────────

const WEEKDAY_LABELS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const WEEKDAY_FULL   = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

const toDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
};

// JS getDay() (0=Sun) → iOS dayOfWeek (1=Mon … 7=Sun)
const jsToIos = (jsDay: number) => (jsDay === 0 ? 7 : jsDay);

const getEffectiveSchedule = (
  group: TrainingGroup,
  all: TrainingGroup[]
): TrainingScheduleEntry[] => {
  if (group.schedule.length > 0) return group.schedule;
  if (!group.parentGroupId) return [];
  const parent = all.find((g) => g.id === group.parentGroupId);
  return parent ? getEffectiveSchedule(parent, all) : [];
};

// Returns the day's regular absence-record session (id = "{groupId}_{yyyy-MM-dd}", no isExtra)
const getDaySession = (
  sessions: TrainingSession[],
  groupId: string,
  dateStr: string
): TrainingSession | undefined =>
  sessions.find((s) => s.groupId === groupId && s.dateString === dateStr && !s.isExtra);

const getRootGroup = (group: TrainingGroup, all: TrainingGroup[]): TrainingGroup => {
  if (!group.parentGroupId) return group;
  const parent = all.find((g) => g.id === group.parentGroupId);
  return parent ? getRootGroup(parent, all) : group;
};

// ── types ─────────────────────────────────────────────────────────────────────

// A slot rendered for a specific day: either a regular schedule entry or an extra session
type DaySlot =
  | { kind: "regular"; group: TrainingGroup; time: string; cancelled: boolean }
  | { kind: "extra"; group: TrainingGroup; time: string; sessionId: string; note?: string };

interface GroupForm {
  name: string;
  colorHex: string;
  parentGroupId: string;
  schedule: TrainingScheduleEntry[];
  memberIds: string[];
}

const emptyForm = (): GroupForm => ({
  name: "",
  colorHex: "#007AFF",
  parentGroupId: "",
  schedule: [],
  memberIds: [],
});

interface ExtraForm {
  groupId: string;
  date: string; // yyyy-MM-dd
  time: string; // HH:mm
  note: string;
}

const emptyExtra = (): ExtraForm => ({
  groupId: "",
  date: toDateString(new Date()),
  time: "18:00",
  note: "",
});

// ── main page ─────────────────────────────────────────────────────────────────

export default function TrainingPage() {
  const currentClub  = useAppStore((s) => s.currentClub);
  const currentMember = useAppStore((s) => s.currentMember);

  const planFeatures  = getPlanFeatures(currentClub?.plan);
  const hasAccess     = planFeatures.hasTrainingRSVP;
  const isAdminOrTrainer = currentMember?.isAdmin || currentMember?.isTrainer;

  const [tab, setTab]                         = useState<"woche" | "gruppen">("woche");
  const [selectedDayIdx, setSelectedDayIdx]   = useState(0);
  const [trainingGroups, setTrainingGroups]   = useState<TrainingGroup[]>([]);
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>([]);
  const [allMembers, setAllMembers]           = useState<Member[]>([]);
  const [loading, setLoading]                 = useState(true);

  // absence modal
  const [absenceTarget, setAbsenceTarget] = useState<{ groupId: string; date: Date } | null>(null);
  const [absenceReason, setAbsenceReason] = useState("");
  const [customReason, setCustomReason]   = useState("");
  const [savingAbsence, setSavingAbsence] = useState(false);

  // group form
  const [showGroupForm, setShowGroupForm]   = useState(false);
  const [editingGroup, setEditingGroup]     = useState<TrainingGroup | null>(null);
  const [form, setForm]                     = useState<GroupForm>(emptyForm());
  const [newEntryDay, setNewEntryDay]       = useState(1);
  const [newEntryTime, setNewEntryTime]     = useState("18:00");
  const [memberSearch, setMemberSearch]     = useState("");
  const [savingGroup, setSavingGroup]       = useState(false);

  // delete
  const [deleteTarget, setDeleteTarget] = useState<TrainingGroup | null>(null);

  // extra session modal
  const [showExtraForm, setShowExtraForm] = useState(false);
  const [extraForm, setExtraForm]         = useState<ExtraForm>(emptyExtra());
  const [savingExtra, setSavingExtra]     = useState(false);

  // ── subscriptions ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!currentClub || !hasAccess) { setLoading(false); return; }
    const u1 = FirebaseManager.listenToTrainingGroups(currentClub.id, setTrainingGroups);
    const u2 = FirebaseManager.listenToTrainingSessions(currentClub.id, setTrainingSessions);
    const u3 = FirebaseManager.listenToMembers(currentClub.id, setAllMembers);
    setLoading(false);
    return () => { u1(); u2(); u3(); };
  }, [currentClub, hasAccess]);

  // ── week days ──────────────────────────────────────────────────────────────
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(0, 0, 0, 0);
      return d;
    }),
    []
  );

  // ── slots for selected day (regular + extras, with cancellation state) ────
  const slotsForDay = useMemo<DaySlot[]>(() => {
    const date    = weekDays[selectedDayIdx];
    const iosDay  = jsToIos(date.getDay());
    const dateStr = toDateString(date);
    const slots: DaySlot[] = [];
    const seenKeys = new Set<string>();

    const isMemberOnly = !isAdminOrTrainer && currentMember;

    for (const group of trainingGroups) {
      // Determine if this group should contribute to slots
      let isVisible = false;
      if (!isMemberOnly) {
        isVisible = true; // Admins/Trainers see everything
      } else {
        // Members see groups they are in
        if (group.memberIds.includes(currentMember.id)) isVisible = true;
      }

      if (!isVisible) continue;

      // For members, we display the root group (the "Training")
      const displayGroup = isMemberOnly ? getRootGroup(group, trainingGroups) : group;

      // Regular schedule entries
      const schedule = getEffectiveSchedule(group, trainingGroups);
      const daySession = getDaySession(trainingSessions, group.id, dateStr);
      const cancelledTimes = daySession?.cancelledTimes ?? [];

      for (const entry of schedule) {
        if (entry.dayOfWeek === iosDay) {
          const key = `${displayGroup.id}_${entry.time}_reg`;
          if (isMemberOnly && seenKeys.has(key)) continue;
          seenKeys.add(key);

          slots.push({
            kind: "regular",
            group: displayGroup,
            time: entry.time,
            cancelled: cancelledTimes.includes(entry.time),
          });
        }
      }

      // Extra sessions
      const extras = trainingSessions.filter(
        (s) => s.groupId === group.id && s.dateString === dateStr && s.isExtra
      );
      for (const extra of extras) {
        const key = `${displayGroup.id}_${extra.extraTime}_ext`;
        if (isMemberOnly && seenKeys.has(key)) continue;
        seenKeys.add(key);

        slots.push({
          kind: "extra",
          group: displayGroup,
          time: extra.extraTime ?? "00:00",
          sessionId: extra.id,
          note: extra.note,
        });
      }
    }
    return slots.sort((a, b) => a.time.localeCompare(b.time));
  }, [trainingGroups, trainingSessions, selectedDayIdx, weekDays, currentMember, isAdminOrTrainer]);

  // ── absence handlers ───────────────────────────────────────────────────────
  const openAbsenceModal = (groupId: string, date: Date) => {
    setAbsenceTarget({ groupId, date });
    setAbsenceReason("");
    setCustomReason("");
  };

  const saveAbsence = async () => {
    if (!currentClub || !currentMember || !absenceTarget) return;
    const reason = absenceReason === "Sonstiges" && customReason.trim()
      ? customReason.trim()
      : absenceReason;
    if (!reason) return;
    setSavingAbsence(true);
    try {
      await FirebaseManager.setAbsence(
        currentClub.id, absenceTarget.groupId, absenceTarget.date,
        currentMember.id, true, reason
      );
      setAbsenceTarget(null);
    } finally {
      setSavingAbsence(false);
    }
  };

  const markPresent = async (groupId: string, date: Date) => {
    if (!currentClub || !currentMember) return;
    await FirebaseManager.setAbsence(currentClub.id, groupId, date, currentMember.id, false);
  };

  // ── trainer: cancel / restore / extra session ─────────────────────────────
  const toggleCancellation = async (groupId: string, date: Date, time: string) => {
    if (!currentClub) return;
    await FirebaseManager.toggleCancellation(currentClub.id, groupId, date, time);
  };

  const deleteExtraSession = async (sessionId: string) => {
    if (!currentClub) return;
    await FirebaseManager.deleteSession(currentClub.id, sessionId);
  };

  const openExtraForm = () => {
    setExtraForm(emptyExtra());
    setShowExtraForm(true);
  };

  const saveExtra = async () => {
    if (!currentClub || !extraForm.groupId || !extraForm.date || !extraForm.time) return;
    setSavingExtra(true);
    try {
      const [y, m, d] = extraForm.date.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      date.setHours(0, 0, 0, 0);
      await FirebaseManager.addExtraSession(
        currentClub.id, extraForm.groupId, date, extraForm.time, extraForm.note
      );
      setShowExtraForm(false);
    } finally {
      setSavingExtra(false);
    }
  };

  // ── group form handlers ────────────────────────────────────────────────────
  const openAddGroup = () => {
    setEditingGroup(null);
    setForm(emptyForm());
    setNewEntryDay(1);
    setNewEntryTime("18:00");
    setMemberSearch("");
    setShowGroupForm(true);
  };

  const openEditGroup = (group: TrainingGroup) => {
    setEditingGroup(group);
    setForm({
      name: group.name,
      colorHex: group.colorHex,
      parentGroupId: group.parentGroupId ?? "",
      schedule: [...group.schedule],
      memberIds: [...group.memberIds],
    });
    setNewEntryDay(1);
    setNewEntryTime("18:00");
    setMemberSearch("");
    setShowGroupForm(true);
  };

  const addScheduleEntry = () => {
    setForm((f) => ({
      ...f,
      schedule: [
        ...f.schedule,
        { id: crypto.randomUUID(), dayOfWeek: newEntryDay, time: newEntryTime },
      ],
    }));
  };

  const removeScheduleEntry = (id: string) =>
    setForm((f) => ({ ...f, schedule: f.schedule.filter((e) => e.id !== id) }));

  const toggleMember = (memberId: string) =>
    setForm((f) => ({
      ...f,
      memberIds: f.memberIds.includes(memberId)
        ? f.memberIds.filter((id) => id !== memberId)
        : [...f.memberIds, memberId],
    }));

  const saveGroup = async () => {
    if (!currentClub || !form.name.trim()) return;
    setSavingGroup(true);
    try {
      const payload = {
        name: form.name.trim(),
        colorHex: form.colorHex,
        parentGroupId: form.parentGroupId || undefined,
        schedule: form.schedule,
        memberIds: form.memberIds,
      };
      if (editingGroup) {
        await FirebaseManager.updateTrainingGroup(currentClub.id, editingGroup.id, payload);
      } else {
        await FirebaseManager.addTrainingGroup(currentClub.id, payload);
      }
      setShowGroupForm(false);
    } finally {
      setSavingGroup(false);
    }
  };

  const confirmDelete = async () => {
    if (!currentClub || !deleteTarget) return;
    await FirebaseManager.deleteTrainingGroup(currentClub.id, deleteTarget.id);
    setDeleteTarget(null);
  };

  // ── upsell ─────────────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10">
          <PlanUpsell
            title="Trainings-Modul ist ab dem Club-Plan verfügbar."
            text="Verwalte Trainingsgruppen mit eingebettetem Wochenplan und tracke Abwesenheiten ganz einfach."
          />
        </div>
      </div>
    );
  }

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Training</h1>
              <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Gruppen & Anwesenheit</p>
            </div>
            {isAdminOrTrainer && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={openExtraForm}
                  className="flex items-center gap-2 bg-white border border-black/10 text-[#0A0A0A] hover:bg-black/[0.04] px-3 sm:px-4 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
                  title="Zusatztermin anlegen"
                >
                  <CalendarPlus size={16} />
                  <span className="hidden sm:inline">Zusatztermin</span>
                </button>
                <button
                  onClick={openAddGroup}
                  className="flex items-center gap-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-black/5"
                >
                  <Plus size={16} />
                  <span className="hidden sm:inline">Neue Gruppe</span>
                  <span className="sm:hidden">Neu</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start">
          {(["woche", "gruppen"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                tab === t
                  ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5"
                  : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              {t === "woche" ? "Woche" : "Gruppen"}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-transparent" />
          </div>
        ) : tab === "woche" ? (
          <WeekView
            weekDays={weekDays}
            selectedDayIdx={selectedDayIdx}
            onSelectDay={setSelectedDayIdx}
            slotsForDay={slotsForDay}
            trainingSessions={trainingSessions}
            allMembers={allMembers}
            currentMember={currentMember}
            isAdminOrTrainer={!!isAdminOrTrainer}
            onMarkAbsent={openAbsenceModal}
            onMarkPresent={markPresent}
            onToggleCancellation={toggleCancellation}
            onDeleteExtra={deleteExtraSession}
          />
        ) : (
          <GroupsView
            trainingGroups={trainingGroups}
            allMembers={allMembers}
            isAdminOrTrainer={!!isAdminOrTrainer}
            currentMember={currentMember}
            onEdit={openEditGroup}
            onDelete={setDeleteTarget}
          />
        )}
      </div>

      {/* Absence Modal */}
      <AnimatePresence>
        {absenceTarget && (
          <Backdrop onClick={() => setAbsenceTarget(null)}>
            <Modal>
              <ModalHeader title="Abwesenheit melden" onClose={() => setAbsenceTarget(null)} />
              <div className="p-5 flex flex-col gap-4">
                <p className="text-xs text-[#71717A] font-bold uppercase tracking-widest pl-1">Grund wählen</p>
                <div className="grid grid-cols-2 gap-2">
                  {ABSENCE_REASONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => { setAbsenceReason(r); if (r !== "Sonstiges") setCustomReason(""); }}
                      className={`py-2.5 px-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                        absenceReason === r
                          ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                          : "bg-black/[0.03] text-[#52525B] border-black/5 hover:border-black/10"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {absenceReason === "Sonstiges" && (
                  <input
                    autoFocus
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Eigenen Grund eingeben…"
                    className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                  />
                )}
                <TButton
                  label={savingAbsence ? "Wird gespeichert…" : "Abwesenheit bestätigen"}
                  onClick={saveAbsence}
                  disabled={savingAbsence || !absenceReason || (absenceReason === "Sonstiges" && !customReason.trim())}
                />
              </div>
            </Modal>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* Group Form Modal */}
      <AnimatePresence>
        {showGroupForm && (
          <Backdrop onClick={() => setShowGroupForm(false)}>
            <Modal wide onClick={(e) => e.stopPropagation()}>
              <ModalHeader
                title={editingGroup ? "Gruppe bearbeiten" : "Neue Trainingsgruppe"}
                onClose={() => setShowGroupForm(false)}
              />
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">

                {/* Name */}
                <Field label="Name der Gruppe">
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="z. B. U15 Leistungskader"
                    className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                  />
                </Field>

                {/* Color */}
                <Field label="Farbe">
                  <div className="flex gap-3 flex-wrap">
                    {TRAINING_GROUP_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((f) => ({ ...f, colorHex: c }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          form.colorHex === c ? "border-[#0A0A0A] scale-110" : "border-transparent"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </Field>

                {/* Parent group */}
                {trainingGroups.length > 0 && (
                  <Field label="Übergeordnete Gruppe (optional)">
                    <select
                      value={form.parentGroupId}
                      onChange={(e) => setForm((f) => ({ ...f, parentGroupId: e.target.value }))}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    >
                      <option value="">Keine (Hauptgruppe)</option>
                      {trainingGroups
                        .filter((g) => g.id !== editingGroup?.id)
                        .map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                  </Field>
                )}

                {/* Schedule */}
                <Field label="Trainingszeiten">
                  <div className="flex flex-col gap-2">
                    {form.schedule.map((entry) => (
                      <div key={entry.id} className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/[0.03] border border-black/5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: form.colorHex }}
                        />
                        <span className="text-xs font-black text-[#0A0A0A] uppercase tracking-widest flex-1">
                          {WEEKDAY_FULL[entry.dayOfWeek === 7 ? 0 : entry.dayOfWeek]} · {entry.time} Uhr
                        </span>
                        <button
                          onClick={() => removeScheduleEntry(entry.id)}
                          className="text-[#A1A1AA] hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2 items-end">
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] font-black text-[#71717A] uppercase tracking-widest pl-1">Tag</label>
                        <select
                          value={newEntryDay}
                          onChange={(e) => setNewEntryDay(Number(e.target.value))}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-3 py-2.5 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        >
                          {[1,2,3,4,5,6,7].map((d) => (
                            <option key={d} value={d}>
                              {WEEKDAY_FULL[d === 7 ? 0 : d]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <label className="text-[9px] font-black text-[#71717A] uppercase tracking-widest pl-1">Zeit</label>
                        <input
                          type="time"
                          value={newEntryTime}
                          onChange={(e) => setNewEntryTime(e.target.value)}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-3 py-2.5 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        />
                      </div>
                      <button
                        onClick={addScheduleEntry}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-[#0A0A0A] text-white text-[10px] font-black uppercase tracking-widest shrink-0"
                      >
                        <Plus size={14} /> Add
                      </button>
                    </div>
                  </div>
                </Field>

                {/* Members */}
                <Field label={`Mitglieder (${form.memberIds.length} ausgewählt)`}>
                  <TSearchBar value={memberSearch} onChange={setMemberSearch} placeholder="Mitglied suchen…" />
                  <div className="mt-2 max-h-52 overflow-y-auto flex flex-col gap-1">
                    {allMembers
                      .filter((m) => {
                        if (!memberSearch.trim()) return true;
                        return getMemberFullName(m).toLowerCase().includes(memberSearch.toLowerCase());
                      })
                      .map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMember(m.id)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-left transition-all border ${
                            form.memberIds.includes(m.id)
                              ? "bg-[#0A0A0A]/[0.05] border-[#0A0A0A]/10"
                              : "border-transparent hover:bg-black/[0.02]"
                          }`}
                        >
                          <TAvatar name={getMemberFullName(m)} id={m.id} size={30} />
                          <span className="text-sm font-poppins font-bold text-[#0A0A0A] flex-1">{getMemberFullName(m)}</span>
                          {form.memberIds.includes(m.id) && (
                            <Check size={14} className="text-[#34C759]" />
                          )}
                        </button>
                      ))}
                  </div>
                </Field>
              </div>

              <div className="p-5 border-t border-black/5">
                <TButton
                  label={savingGroup ? "Wird gespeichert…" : editingGroup ? "Änderungen speichern" : "Gruppe erstellen"}
                  onClick={saveGroup}
                  disabled={savingGroup || !form.name.trim()}
                />
              </div>
            </Modal>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* Extra Session (Zusatztermin) Modal */}
      <AnimatePresence>
        {showExtraForm && (
          <Backdrop onClick={() => setShowExtraForm(false)}>
            <Modal onClick={(e) => e.stopPropagation()}>
              <ModalHeader title="Zusatztermin anlegen" onClose={() => setShowExtraForm(false)} />
              <div className="p-5 flex flex-col gap-4">
                <Field label="Trainingsgruppe">
                  <select
                    autoFocus
                    value={extraForm.groupId}
                    onChange={(e) => setExtraForm((f) => ({ ...f, groupId: e.target.value }))}
                    className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                  >
                    <option value="">Gruppe auswählen…</option>
                    {trainingGroups.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Datum">
                    <input
                      type="date"
                      value={extraForm.date}
                      onChange={(e) => setExtraForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-3 py-2.5 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </Field>
                  <Field label="Uhrzeit">
                    <input
                      type="time"
                      value={extraForm.time}
                      onChange={(e) => setExtraForm((f) => ({ ...f, time: e.target.value }))}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-3 py-2.5 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </Field>
                </div>

                <Field label="Notiz (optional)">
                  <textarea
                    rows={2}
                    value={extraForm.note}
                    onChange={(e) => setExtraForm((f) => ({ ...f, note: e.target.value }))}
                    placeholder="z. B. Turniervorbereitung, Auswärtsspiel…"
                    className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 text-base text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all resize-none"
                  />
                </Field>

                <TButton
                  label={savingExtra ? "Wird gespeichert…" : "Zusatztermin anlegen"}
                  onClick={saveExtra}
                  disabled={savingExtra || !extraForm.groupId || !extraForm.date || !extraForm.time}
                />
              </div>
            </Modal>
          </Backdrop>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <Backdrop onClick={() => setDeleteTarget(null)}>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassSection className="p-7 flex flex-col items-center text-center gap-1 font-poppins">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3 border border-red-500/20">
                  <Trash2 size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A]">Gruppe löschen?</h3>
                <p className="text-sm text-[#52525B] mb-4 px-2">
                  &ldquo;{deleteTarget.name}&rdquo; wird dauerhaft gelöscht.
                </p>
                <div className="flex flex-col gap-2 w-full">
                  <TButton label="Löschen" variant="danger" onClick={confirmDelete} />
                  <TButton label="Abbrechen" variant="secondary" onClick={() => setDeleteTarget(null)} />
                </div>
              </GlassSection>
            </motion.div>
          </Backdrop>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Week View ─────────────────────────────────────────────────────────────────

function WeekView({
  weekDays, selectedDayIdx, onSelectDay, slotsForDay,
  trainingSessions, allMembers, currentMember, isAdminOrTrainer,
  onMarkAbsent, onMarkPresent, onToggleCancellation, onDeleteExtra,
}: {
  weekDays: Date[];
  selectedDayIdx: number;
  onSelectDay: (i: number) => void;
  slotsForDay: DaySlot[];
  trainingSessions: TrainingSession[];
  allMembers: Member[];
  currentMember: Member | null;
  isAdminOrTrainer: boolean;
  onMarkAbsent: (groupId: string, date: Date) => void;
  onMarkPresent: (groupId: string, date: Date) => void;
  onToggleCancellation: (groupId: string, date: Date, time: string) => void;
  onDeleteExtra: (sessionId: string) => void;
}) {
  const selectedDate = weekDays[selectedDayIdx];
  const dateStr = toDateString(selectedDate);

  return (
    <div className="flex flex-col gap-5">
      {/* Day selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {weekDays.map((day, i) => {
          const isToday = i === 0;
          const isSelected = i === selectedDayIdx;
          return (
            <button
              key={i}
              onClick={() => onSelectDay(i)}
              className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-2xl transition-all shrink-0 min-w-[56px] border ${
                isSelected
                  ? "bg-[#0A0A0A] text-white border-[#0A0A0A]"
                  : "bg-black/[0.03] text-[#52525B] border-black/5 hover:border-black/10"
              }`}
            >
              <span className={`text-[9px] font-black uppercase tracking-widest ${isSelected ? "text-white/60" : "text-[#A1A1AA]"}`}>
                {isToday ? "Heute" : WEEKDAY_LABELS[day.getDay()]}
              </span>
              <span className="text-sm font-black">{day.getDate()}</span>
            </button>
          );
        })}
      </div>

      {/* Selected day label */}
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#0A0A0A]">
          {selectedDayIdx === 0 ? "Heutiges Training" : `${WEEKDAY_FULL[selectedDate.getDay()]}, ${selectedDate.getDate()}. ${selectedDate.toLocaleDateString("de-DE", { month: "long" })}`}
        </h2>
        {slotsForDay.length > 0 && (
          <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
            · {slotsForDay.length} {slotsForDay.length === 1 ? "Termin" : "Termine"}
          </span>
        )}
      </div>

      {slotsForDay.length === 0 ? (
        <EmptyDay isToday={selectedDayIdx === 0} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {slotsForDay.map((slot, idx) => (
              <AttendanceCard
                key={
                  slot.kind === "regular"
                    ? `reg_${slot.group.id}_${dateStr}_${slot.time}`
                    : `ext_${slot.sessionId}`
                }
                slot={slot}
                date={selectedDate}
                dateStr={dateStr}
                session={getDaySession(trainingSessions, slot.group.id, dateStr)}
                trainingGroups={trainingGroups}
                trainingSessions={trainingSessions}
                allMembers={allMembers}
                currentMember={currentMember}
                isAdminOrTrainer={isAdminOrTrainer}
                idx={idx}
                onMarkAbsent={onMarkAbsent}
                onMarkPresent={onMarkPresent}
                onToggleCancellation={onToggleCancellation}
                onDeleteExtra={onDeleteExtra}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ── Attendance Card ────────────────────────────────────────────────────────────

function AttendanceCard({
  slot, date, dateStr, session, allMembers, currentMember,
  isAdminOrTrainer, idx, onMarkAbsent, onMarkPresent,
  onToggleCancellation, onDeleteExtra,
}: {
  slot: DaySlot;
  date: Date;
  dateStr: string;
  session: TrainingSession | undefined;
  trainingGroups: TrainingGroup[];
  trainingSessions: TrainingSession[];
  allMembers: Member[];
  currentMember: Member | null;
  isAdminOrTrainer: boolean;
  idx: number;
  onMarkAbsent: (groupId: string, date: Date) => void;
  onMarkPresent: (groupId: string, date: Date) => void;
  onToggleCancellation: (groupId: string, date: Date, time: string) => void;
  onDeleteExtra: (sessionId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const group = slot.group;
  const time = slot.time;
  const isExtra = slot.kind === "extra";
  const isCancelled = slot.kind === "regular" && slot.cancelled;

  const rootGroup = useMemo(() => getRootGroup(group, trainingGroups), [group, trainingGroups]);

  const groupMembers = useMemo(
    () => allMembers.filter((m) => group.memberIds.includes(m.id)),
    [allMembers, group.memberIds]
  );

  // Effective absences: anyone in this group's session OR the root group's session
  const absentIds = useMemo(() => {
    const ids = new Set(session?.absentMemberIds ?? []);
    if (rootGroup.id !== group.id) {
      const rootSession = getDaySession(trainingSessions, rootGroup.id, dateStr);
      rootSession?.absentMemberIds.forEach((id) => ids.add(id));
    }
    return Array.from(ids);
  }, [session, rootGroup, group.id, trainingSessions, dateStr]);

  const total        = groupMembers.length;
  const presentCount = total - absentIds.filter((id) => group.memberIds.includes(id)).length;
  const ratio        = total > 0 ? presentCount / total : 1;

  const myAbsent = currentMember ? absentIds.includes(currentMember.id) : false;
  const myReason = useMemo(() => {
    if (!currentMember) return "";
    let reason = session?.absenceReasons[currentMember.id] || "";
    if (!reason && rootGroup.id !== group.id) {
      const rootSession = getDaySession(trainingSessions, rootGroup.id, dateStr);
      reason = rootSession?.absenceReasons[currentMember.id] || "";
    }
    return reason;
  }, [currentMember, session, rootGroup, group.id, trainingSessions, dateStr]);

  const iAmInGroup = currentMember ? group.memberIds.includes(currentMember.id) : false;

  const barColor = ratio >= 0.7 ? "#34C759" : ratio >= 0.4 ? "#FF9500" : "#FF3B30";

  // Slightly dim cancelled cards
  const dimmedClass = isCancelled ? "opacity-60" : "";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: idx * 0.05 }}
    >
      <GlassSection className={`overflow-hidden flex flex-col ${dimmedClass}`}>
        {/* Color stripe (or grey when cancelled) */}
        <div className="h-1 w-full" style={{ backgroundColor: isCancelled ? "#A1A1AA" : group.colorHex }} />

        <div className="p-5 flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Circle size={8} fill={isCancelled ? "#A1A1AA" : group.colorHex} stroke="none" />
                <h3 className={`font-poppins font-black text-[#0A0A0A] text-base leading-tight uppercase tracking-tight ${isCancelled ? "line-through" : ""}`}>
                  {group.name}
                </h3>
                {isExtra && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5856D6]/10 text-[#5856D6] text-[9px] font-black uppercase tracking-widest">
                    <Sparkles size={9} /> Zusatz
                  </span>
                )}
                {isCancelled && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[9px] font-black uppercase tracking-widest">
                    <Ban size={9} /> Fällt aus
                  </span>
                )}
              </div>
              <span className={`text-[11px] font-mono font-bold text-[#71717A] pl-4 ${isCancelled ? "line-through" : ""}`}>
                {time} Uhr
              </span>
              {isExtra && slot.note && (
                <span className="text-[11px] text-[#52525B] italic pl-4 mt-0.5">{slot.note}</span>
              )}
            </div>
            {total > 0 && !isCancelled && (
              <span className="text-xs font-poppins font-bold text-[#0A0A0A] shrink-0">
                {presentCount}/{total}
              </span>
            )}
          </div>

          {/* Progress bar */}
          {total > 0 && !isCancelled && (
            <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{ width: `${ratio * 100}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
          )}

          {/* Member status (only for non-cancelled trainings) */}
          {iAmInGroup && currentMember && !isCancelled && (
            <>
              <TLine />
              {myAbsent ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">Abwesend</span>
                    {myReason && (
                      <span className="text-xs font-poppins font-bold text-[#52525B]">{myReason}</span>
                    )}
                  </div>
                  <button
                    onClick={() => onMarkPresent(group.id, date)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-[#34C759] hover:bg-green-50 border border-black/5 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Check size={12} /> Anwesend
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#34C759]">Anwesend</span>
                  <button
                    onClick={() => onMarkAbsent(group.id, date)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-[#FF3B30] hover:bg-red-50 border border-black/5 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <X size={12} /> Abmelden
                  </button>
                </div>
              )}
            </>
          )}

          {/* Trainer: full attendance + cancel/delete controls */}
          {isAdminOrTrainer && (
            <>
              <TLine />
              {total > 0 && !isCancelled && (
                <button
                  onClick={() => setExpanded((v) => !v)}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A] transition-all"
                >
                  {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  {expanded ? "Ausblenden" : "Anwesenheitsliste"}
                </button>
              )}

              {/* Cancel / restore / delete buttons */}
              <div className="flex flex-wrap gap-2">
                {slot.kind === "regular" ? (
                  <button
                    onClick={() => onToggleCancellation(group.id, date, time)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all text-[10px] font-black uppercase tracking-widest ${
                      isCancelled
                        ? "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20 hover:bg-[#34C759]/15"
                        : "bg-black/[0.04] text-[#52525B] border-black/5 hover:text-red-500 hover:bg-red-50"
                    }`}
                  >
                    {isCancelled ? (
                      <><RotateCcw size={12} /> Reaktivieren</>
                    ) : (
                      <><Ban size={12} /> Termin absagen</>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => onDeleteExtra(slot.sessionId)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-red-500 hover:bg-red-50 border border-black/5 transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Trash2 size={12} /> Zusatz löschen
                  </button>
                )}
              </div>

              <AnimatePresence>
                {expanded && !isCancelled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-1 pt-1">
                      {groupMembers.map((m) => {
                        const absent = absentIds.includes(m.id);
                        const reason = session?.absenceReasons[m.id] ?? "";
                        return (
                          <div
                            key={m.id}
                            className={`flex items-center gap-3 px-3 py-2 rounded-2xl transition-all ${
                              absent ? "bg-red-50/60" : "hover:bg-black/[0.02]"
                            }`}
                          >
                            <TAvatar name={getMemberFullName(m)} id={m.id} size={30} />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-poppins font-bold text-[#0A0A0A] block truncate">
                                {getMemberFullName(m)}
                              </span>
                              {absent && reason && (
                                <span className="text-[10px] text-[#FF3B30] font-bold">{reason}</span>
                              )}
                            </div>
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${absent ? "bg-[#FF3B30]" : "bg-[#34C759]"}`}>
                              {absent
                                ? <X size={10} className="text-white" />
                                : <Check size={10} className="text-white" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </GlassSection>
    </motion.div>
  );
}

// ── Groups View ────────────────────────────────────────────────────────────────

function GroupsView({
  trainingGroups, allMembers, isAdminOrTrainer, currentMember, onEdit, onDelete,
}: {
  trainingGroups: TrainingGroup[];
  allMembers: Member[];
  isAdminOrTrainer: boolean;
  currentMember: Member | null;
  onEdit: (g: TrainingGroup) => void;
  onDelete: (g: TrainingGroup) => void;
}) {
  const isMemberOnly = !isAdminOrTrainer && currentMember;

  const rootGroups = trainingGroups.filter((g) => {
    if (!g.parentGroupId) {
      if (!isMemberOnly) return true;
      // Member only sees root groups they are part of (direct or via descendant)
      return g.memberIds.includes(currentMember.id) || trainingGroups.some(child => child.parentGroupId === g.id && child.memberIds.includes(currentMember.id));
    }
    return false;
  });

  const subGroups = isMemberOnly ? [] : trainingGroups.filter((g) => !!g.parentGroupId);

  if (trainingGroups.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center opacity-40">
        <Users size={40} className="text-[#0A0A0A] mb-4" />
        <p className="font-poppins text-[#52525B] font-bold uppercase tracking-widest text-xs">
          Noch keine Trainingsgruppen angelegt.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      <AnimatePresence mode="popLayout">
        {rootGroups.map((group, idx) => (
          <motion.div
            key={group.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
            className="flex flex-col gap-3"
          >
            <GroupCard
              group={group}
              allMembers={allMembers}
              isAdminOrTrainer={isAdminOrTrainer}
              onEdit={onEdit}
              onDelete={onDelete}
            />
            {/* Subgroups */}
            {subGroups
              .filter((sg) => sg.parentGroupId === group.id)
              .map((sg) => (
                <div key={sg.id} className="pl-4">
                  <GroupCard
                    group={sg}
                    allMembers={allMembers}
                    isAdminOrTrainer={isAdminOrTrainer}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isSubgroup
                  />
                </div>
              ))}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function GroupCard({
  group, allMembers, isAdminOrTrainer, onEdit, onDelete, isSubgroup,
}: {
  group: TrainingGroup;
  allMembers: Member[];
  isAdminOrTrainer: boolean;
  onEdit: (g: TrainingGroup) => void;
  onDelete: (g: TrainingGroup) => void;
  isSubgroup?: boolean;
}) {
  const members = allMembers.filter((m) => group.memberIds.includes(m.id));

  return (
    <GlassSection className={`overflow-hidden flex flex-col ${isSubgroup ? "border-l-2" : ""}`} style={isSubgroup ? { borderLeftColor: group.colorHex } : {}}>
      <div className="h-1 w-full" style={{ backgroundColor: group.colorHex }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <Circle size={8} fill={group.colorHex} stroke="none" />
              <h3 className="font-poppins font-black text-[#0A0A0A] text-sm uppercase tracking-tight">
                {group.name}
              </h3>
            </div>
            <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-widest pl-4">
              {members.length} Mitglieder
            </span>
          </div>
          {isAdminOrTrainer && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(group)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] bg-black/[0.04] transition-all"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={() => onDelete(group)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-500 bg-black/[0.04] transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Schedule */}
        {group.schedule.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {group.schedule.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest"
                style={{ borderColor: `${group.colorHex}40`, color: group.colorHex, backgroundColor: `${group.colorHex}10` }}
              >
                {WEEKDAY_LABELS[entry.dayOfWeek === 7 ? 0 : entry.dayOfWeek]} · {entry.time}
              </div>
            ))}
          </div>
        )}

        {/* Member avatars */}
        {members.length > 0 && (
          <div className="flex -space-x-2 pt-1">
            {members.slice(0, 6).map((m) => (
              <div key={m.id} className="border-2 border-white rounded-full">
                <TAvatar name={getMemberFullName(m)} id={m.id} size={26} />
              </div>
            ))}
            {members.length > 6 && (
              <div className="w-[26px] h-[26px] rounded-full bg-black/5 border-2 border-white flex items-center justify-center text-[8px] font-black text-[#71717A]">
                +{members.length - 6}
              </div>
            )}
          </div>
        )}
      </div>
    </GlassSection>
  );
}

// ── small helpers ──────────────────────────────────────────────────────────────

function EmptyDay({ isToday }: { isToday: boolean }) {
  return (
    <div className="py-16 flex flex-col items-center justify-center text-center opacity-40">
      <AlertCircle size={36} className="text-[#0A0A0A] mb-3" />
      <p className="font-poppins text-[#52525B] font-bold uppercase tracking-widest text-xs">
        {isToday ? "Kein Training heute." : "Kein Training an diesem Tag."}
      </p>
    </div>
  );
}

function Backdrop({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClick}>
      {children}
    </div>
  );
}

function Modal({ children, wide, onClick }: { children: React.ReactNode; wide?: boolean; onClick?: React.MouseEventHandler }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`w-full ${wide ? "max-w-lg max-h-[90vh] flex flex-col" : "max-w-sm"}`}
      onClick={onClick ?? ((e) => e.stopPropagation())}
    >
      <GlassSection className={wide ? "flex flex-col overflow-hidden max-h-[90vh]" : ""}>
        {children}
      </GlassSection>
    </motion.div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between p-5 border-b border-black/5">
      <h3 className="font-poppins font-black text-[#0A0A0A] text-base uppercase tracking-tight">{title}</h3>
      <button onClick={onClose} className="text-[#52525B] hover:text-[#0A0A0A] transition-all">
        <X size={20} />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">{label}</label>
      {children}
    </div>
  );
}
