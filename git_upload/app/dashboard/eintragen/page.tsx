"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Circle, ChevronDown, ChevronUp, Search, X, Calendar, Star, MessageSquare, User } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Activity, ActivityCategory, EntryStatus, Member, getMemberFullName } from "@/lib/firebase/models";
import { GlassSection, TLine, TCatBadge, TAvatar, TFilterPill, TButton } from "@/app/components/ui/NativeUI";

const ALL_CATS = [ActivityCategory.A, ActivityCategory.B, ActivityCategory.C, ActivityCategory.S];

function todayString() {
  return new Date().toISOString().split("T")[0];
}

export default function EintragenPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub   = useAppStore((s) => s.currentClub);

  const [activities,     setActivities]     = useState<Activity[]>([]);
  const [members,        setMembers]        = useState<Member[]>([]);
  const [loadingActs,    setLoadingActs]    = useState(true);

  // Form state
  const [selectedActivity,   setSelectedActivity]   = useState<Activity | null>(null);
  const [filterCategory,     setFilterCategory]     = useState<ActivityCategory | null>(null);
  const [activitySearch,     setActivitySearch]     = useState("");
  const [selectedMemberId,   setSelectedMemberId]   = useState<string | null>(null); // null = self
  const [date,               setDate]               = useState(todayString());
  const [notes,              setNotes]              = useState("");

  // Member-picker expand/search
  const [pickerOpen,    setPickerOpen]    = useState(false);
  const [memberSearch,  setMemberSearch]  = useState("");

  // Submission
  const [submitting,  setSubmitting]  = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  const isAdmin   = currentMember?.isAdmin   === true;
  const isTrainer = currentMember?.isTrainer === true;

  // Status logic: Admin/Trainer → direkt genehmigt
  const entryStatus: string = (isAdmin || isTrainer)
    ? EntryStatus.Approved
    : (currentClub?.approvalRequired ? EntryStatus.Pending : EntryStatus.Approved);

  const targetMemberId = isAdmin
    ? (selectedMemberId ?? currentMember?.id ?? "")
    : (currentMember?.id ?? "");

  const canSubmit = selectedActivity !== null && targetMemberId !== "";

  // Lade Tätigkeiten
  useEffect(() => {
    if (!currentClub) return;
    const unsub = FirebaseManager.listenToActivities(currentClub.id, (acts) => {
      setActivities(acts.sort((a, b) => a.name.localeCompare(b.name)));
      setLoadingActs(false);
    });
    return unsub;
  }, [currentClub]);

  // Lade Mitglieder (nur für Admins)
  useEffect(() => {
    if (!currentClub || !isAdmin) return;
    const unsub = FirebaseManager.listenToMembers(currentClub.id, setMembers);
    return unsub;
  }, [currentClub, isAdmin]);

  const filteredActivities = useMemo(() => {
    let list = activities;
    if (filterCategory) list = list.filter((a) => a.category === filterCategory);
    if (activitySearch.trim()) {
      const q = activitySearch.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    return list;
  }, [activities, filterCategory, activitySearch]);

  const filteredMembers = useMemo(() => {
    const others = members.filter((m) => m.id !== currentMember?.id);
    if (!memberSearch.trim()) return others;
    const q = memberSearch.toLowerCase();
    return others.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
    );
  }, [members, memberSearch, currentMember]);

  const selectedMemberObj = members.find((m) => m.id === selectedMemberId);

  async function submit() {
    if (!currentClub || !selectedActivity || !targetMemberId) return;
    setSubmitting(true);
    setError(null);
    try {
      const entryId = crypto.randomUUID();
      await FirebaseManager.addEntry(currentClub.id, entryId, {
        memberId:         targetMemberId,
        date:             new Date(date),
        notes:            notes.trim(),
        points:           selectedActivity.points,
        status:           entryStatus,
        activityName:     selectedActivity.name,
        activityCategory: selectedActivity.category,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedActivity(null);
        setNotes("");
        setDate(todayString());
        setActivitySearch("");
        if (isAdmin) { setSelectedMemberId(null); setPickerOpen(false); }
      }, 2500);
    } catch (e: any) {
      setError(e?.message ?? "Fehler beim Speichern.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 p-6 max-w-2xl mx-auto flex flex-col gap-5 pb-32">

        {/* ── Für wen (nur Admin) ─────────────────────────────────── */}
        {isAdmin && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2 pl-1" style={{ color: "#555" }}>
              Für wen
            </p>
            <GlassSection>
              {/* Selbst */}
              <button
                className="w-full flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03]"
                onClick={() => { setSelectedMemberId(null); setPickerOpen(false); }}
              >
                <TAvatar name={`${currentMember?.firstName ?? ""} ${currentMember?.lastName ?? ""}`} id={currentMember?.id ?? ""} size={36} />
                <div className="flex flex-col items-start flex-1">
                  <span className="font-poppins font-semibold text-[14px] text-white leading-tight">
                    {currentMember?.firstName} {currentMember?.lastName}
                  </span>
                  <span className="text-[11px]" style={{ color: "#8A8A8A" }}>Für mich selbst</span>
                </div>
                {selectedMemberId === null && (
                  <CheckCircle size={20} style={{ color: "#FFFFFF" }} />
                )}
              </button>

              <TLine />

              {/* Anderes Mitglied */}
              <div>
                <button
                  className="w-full flex items-center gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03]"
                  onClick={() => setPickerOpen((p) => !p)}
                >
                  {selectedMemberId && selectedMemberObj ? (
                    <TAvatar name={getMemberFullName(selectedMemberObj)} id={selectedMemberObj.id} size={36} />
                  ) : (
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                         style={{ background: "rgba(255,255,255,0.06)" }}>
                      <User size={16} style={{ color: "#8A8A8A" }} />
                    </div>
                  )}
                  <div className="flex flex-col items-start flex-1">
                    {selectedMemberId && selectedMemberObj ? (
                      <>
                        <span className="font-poppins font-semibold text-[14px] text-white leading-tight">
                          {getMemberFullName(selectedMemberObj)}
                        </span>
                        <span className="text-[11px]" style={{ color: "#8A8A8A" }}>Anderes Mitglied</span>
                      </>
                    ) : (
                      <span className="font-poppins font-semibold text-[14px]" style={{ color: "#8A8A8A" }}>
                        Anderes Mitglied wählen…
                      </span>
                    )}
                  </div>
                  {selectedMemberId !== null && <CheckCircle size={20} style={{ color: "#FFFFFF" }} />}
                  {pickerOpen ? <ChevronUp size={16} style={{ color: "#555" }} /> : <ChevronDown size={16} style={{ color: "#555" }} />}
                </button>

                <AnimatePresence>
                  {pickerOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <TLine />
                      {/* Search */}
                      <div className="px-4 py-2.5 flex items-center gap-2"
                           style={{ background: "rgba(255,255,255,0.02)" }}>
                        <Search size={14} style={{ color: "#555" }} />
                        <input
                          value={memberSearch}
                          onChange={(e) => setMemberSearch(e.target.value)}
                          placeholder="Suchen…"
                          className="flex-1 bg-transparent text-[14px] font-poppins text-white placeholder-[#444] focus:outline-none"
                        />
                        {memberSearch && (
                          <button onClick={() => setMemberSearch("")}>
                            <X size={14} style={{ color: "#555" }} />
                          </button>
                        )}
                      </div>
                      <TLine />
                      {/* List */}
                      <div className="max-h-52 overflow-y-auto no-scrollbar">
                        {filteredMembers.length === 0 ? (
                          <p className="text-center py-5 text-[13px]" style={{ color: "#555" }}>Keine Treffer</p>
                        ) : (
                          filteredMembers.map((m, idx) => (
                            <div key={m.id}>
                              <button
                                className="w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.03]"
                                onClick={() => { setSelectedMemberId(m.id); setPickerOpen(false); }}
                              >
                                <TAvatar name={getMemberFullName(m)} id={m.id} size={32} />
                                <div className="flex flex-col items-start flex-1">
                                  <span className="font-poppins font-semibold text-[13px] text-white leading-tight">
                                    {getMemberFullName(m)}
                                  </span>
                                  <span className="text-[11px]" style={{ color: "#8A8A8A" }}>{m.memberType}</span>
                                </div>
                                {selectedMemberId === m.id && <CheckCircle size={17} style={{ color: "#FFFFFF" }} />}
                              </button>
                              {idx < filteredMembers.length - 1 && <TLine className="ml-[52px]" />}
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </GlassSection>
          </motion.div>
        )}

        {/* ── Aktueller Benutzer (non-admin) ─────────────────────── */}
        {!isAdmin && currentMember && (
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <TAvatar name={`${currentMember.firstName} ${currentMember.lastName}`} id={currentMember.id} size={38} />
            <div className="flex flex-col flex-1">
              <span className="font-poppins font-semibold text-[14px] text-white leading-tight">
                {currentMember.firstName} {currentMember.lastName}
              </span>
              <span className="text-[11px]" style={{ color: "#8A8A8A" }}>{currentMember.memberType}</span>
            </div>
          </motion.div>
        )}

        {/* ── Status-Badge ────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.05 } }}
                    className="flex items-center gap-2 px-1">
          <div className="w-1.5 h-1.5 rounded-full"
               style={{ background: entryStatus === EntryStatus.Approved ? "#34C759" : "#FF9500" }} />
          <span className="text-[12px] font-poppins font-medium"
                style={{ color: entryStatus === EntryStatus.Approved ? "#34C759" : "#FF9500" }}>
            {entryStatus === EntryStatus.Approved
              ? "Wird direkt genehmigt"
              : "Muss vom Admin genehmigt werden"}
          </span>
        </motion.div>

        {/* ── Aktivitäten ─────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 pl-1" style={{ color: "#555" }}>
            Tätigkeit wählen
          </p>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
            <TFilterPill label="Alle" isSelected={filterCategory === null} onClick={() => setFilterCategory(null)} />
            {ALL_CATS.map((cat) => (
              <TFilterPill
                key={cat}
                label={cat}
                isSelected={filterCategory === cat}
                onClick={() => setFilterCategory(filterCategory === cat ? null : cat)}
              />
            ))}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "#555" }} />
            <input
              value={activitySearch}
              onChange={(e) => setActivitySearch(e.target.value)}
              placeholder="Tätigkeit suchen…"
              className="w-full rounded-2xl pl-9 pr-9 py-3 text-[13px] font-poppins text-white placeholder-[#444] focus:outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            />
            {activitySearch && (
              <button onClick={() => setActivitySearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2">
                <X size={14} style={{ color: "#555" }} />
              </button>
            )}
          </div>

          {loadingActs ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 rounded-full border-2 border-white/10 border-t-white animate-spin" />
            </div>
          ) : (
            <GlassSection>
              {filteredActivities.length === 0 ? (
                <p className="text-center py-8 text-[13px]" style={{ color: "#555" }}>
                  Keine Tätigkeiten gefunden.
                </p>
              ) : (
                filteredActivities.map((a, idx) => {
                  const isSelected = selectedActivity?.id === a.id;
                  return (
                    <div key={a.id}>
                      <button
                        className="w-full flex items-center gap-3.5 px-4 py-4 transition-all text-left"
                        style={{ background: isSelected ? "rgba(255,255,255,0.04)" : "transparent" }}
                        onClick={() => setSelectedActivity(isSelected ? null : a)}
                      >
                        <TCatBadge category={a.category} size={38} />
                        <span className="font-poppins text-[14px] text-white flex-1">{a.name}</span>
                        <span className="font-mono font-bold text-[14px] mr-2" style={{ color: "#8A8A8A" }}>
                          {a.points.toFixed(1)}
                        </span>
                        {isSelected
                          ? <CheckCircle size={20} style={{ color: "#FFFFFF" }} />
                          : <Circle     size={20} style={{ color: "#383838" }} />
                        }
                      </button>
                      {idx < filteredActivities.length - 1 && <TLine />}
                    </div>
                  );
                })
              )}
            </GlassSection>
          )}
        </motion.div>

        {/* ── Details ─────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.12 } }}>
          <p className="text-[10px] font-black uppercase tracking-widest mb-2 pl-1" style={{ color: "#555" }}>
            Details
          </p>
          <GlassSection>
            {/* Datum */}
            <div className="flex items-center gap-3 px-4 py-4">
              <Calendar size={16} style={{ color: "#555" }} />
              <span className="font-poppins text-[14px] text-white flex-1">Datum</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="font-poppins text-[13px] text-white bg-transparent focus:outline-none cursor-pointer"
                style={{ colorScheme: "dark" }}
              />
            </div>

            <TLine />

            {/* Punkte */}
            <div className="flex items-center gap-3 px-4 py-4">
              <Star size={16} style={{ color: "#555" }} />
              <span className="font-poppins text-[14px] text-white flex-1">Punkte</span>
              <span
                className="font-mono font-black text-[22px] transition-all"
                style={{ color: selectedActivity ? "#FFFFFF" : "#383838" }}
              >
                {selectedActivity ? selectedActivity.points.toFixed(1) : "—"}
              </span>
            </div>

            <TLine />

            {/* Notiz */}
            <div className="flex items-start gap-3 px-4 py-4">
              <MessageSquare size={16} style={{ color: "#555", marginTop: 2 }} />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notiz (optional)"
                rows={2}
                className="flex-1 bg-transparent font-poppins text-[14px] text-white placeholder-[#444] focus:outline-none resize-none"
              />
            </div>
          </GlassSection>
        </motion.div>

        {/* ── Error ───────────────────────────────────────────────── */}
        {error && (
          <p className="text-[13px] font-poppins text-center" style={{ color: "#FF453A" }}>{error}</p>
        )}

        {/* ── Submit ──────────────────────────────────────────────── */}
        <AnimatePresence>
          {(canSubmit || showSuccess) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              {showSuccess ? (
                <div className="flex items-center gap-3 p-4 rounded-2xl"
                     style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.2)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                       style={{ background: "rgba(52,199,89,0.15)" }}>
                    <CheckCircle size={20} style={{ color: "#34C759" }} />
                  </div>
                  <div>
                    <p className="font-poppins font-bold text-[15px] text-white">Erfolgreich eingetragen!</p>
                    <p className="text-[12px]" style={{ color: "#8A8A8A" }}>
                      {entryStatus === EntryStatus.Approved ? "Direkt genehmigt ✓" : "Wartet auf Genehmigung"}
                    </p>
                  </div>
                </div>
              ) : (
                <TButton
                  label={submitting ? "Wird gespeichert…" : (entryStatus === EntryStatus.Pending ? "Zur Genehmigung einreichen" : "Eintrag speichern")}
                  onClick={submit}
                  disabled={submitting || !canSubmit}
                  className="w-full py-4 text-[15px]"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
