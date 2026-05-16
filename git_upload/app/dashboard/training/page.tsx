"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, X, Calendar, MapPin, 
  Users, CheckCircle2, XCircle, Clock,
  ChevronRight, Info, AlertCircle, Repeat,
  ChevronDown, Filter, User, Settings2,
  Check, Layers
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { 
  Training, Member, getPlanFeatures, getMemberFullName, 
  TrainingSchedule, TrainingGroup 
} from "@/lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar,
  TButton, TSearchBar, TBadge, PlanUpsell
} from "@/app/components/ui/NativeUI";

type ViewMode = "sessions" | "schedules" | "groups";

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default function TrainingPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  
  const [viewMode, setViewMode] = useState<ViewMode>("sessions");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [trainingGroups, setTrainingGroups] = useState<TrainingGroup[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  // Forms
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"session" | "schedule" | "group">("session");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weekday, setWeekday] = useState(3); 
  const [location, setLocation] = useState("");
  const [selectedTrainingGroupId, setSelectedTrainingGroupId] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | TrainingSchedule | TrainingGroup | null>(null);

  const isAdminOrTrainer = currentMember?.isAdmin === true || currentMember?.isTrainer === true;
  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
  const hasAccess = planFeatures.hasTrainingRSVP;

  useEffect(() => {
    if (!currentClub || !hasAccess) {
        setLoading(false);
        return;
    }
    const u1 = FirebaseManager.listenToTrainings(currentClub.id, setTrainings);
    const u2 = FirebaseManager.listenToMembers(currentClub.id, setAllMembers);
    const u3 = FirebaseManager.listenToTrainingSchedules(currentClub.id, setSchedules);
    const u4 = FirebaseManager.listenToTrainingGroups(currentClub.id, setTrainingGroups);
    
    setLoading(false);
    return () => { u1(); u2(); u3(); u4(); };
  }, [currentClub, hasAccess]);

  const filteredSessions = trainings.filter((t) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.location?.toLowerCase().includes(q));
  });

  const filteredSchedules = schedules.filter((s) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return s.title.toLowerCase().includes(q) || (s.location?.toLowerCase().includes(q));
  });

  const filteredGroups = trainingGroups.filter((g) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return g.name.toLowerCase().includes(q);
  });

  const openAdd = (type: "session" | "schedule" | "group") => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setWeekday(3);
    setLocation("");
    setSelectedTrainingGroupId("");
    setFormType(type);
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!currentClub || !currentMember) return;
    if (formType !== "group" && !title.trim()) return;
    if (formType === "group" && !title.trim()) return;
    
    setSaving(true);
    
    try {
      if (formType === "group") {
        await FirebaseManager.addTrainingGroup(currentClub.id, {
          name: title.trim(),
          description: description.trim(),
        });
      } else if (formType === "schedule") {
        await FirebaseManager.addTrainingSchedule(currentClub.id, {
          title: title.trim(),
          description: description.trim(),
          weekday,
          time,
          location: location.trim(),
          trainingGroupId: selectedTrainingGroupId || undefined,
          isActive: true
        });
      } else {
        const trainingDate = new Date(`${date}T${time}`);
        await FirebaseManager.addTraining(currentClub.id, {
          title: title.trim(),
          description: description.trim(),
          date: trainingDate,
          location: location.trim(),
          authorId: currentMember.id,
          trainingGroupId: selectedTrainingGroupId || undefined,
        });
      }
      setShowForm(false);
    } catch (e) {
      console.error("Error saving training data:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleRSVP = async (trainingId: string, status: "attend" | "decline") => {
    if (!currentClub || !currentMember) return;
    try {
      await FirebaseManager.rsvpTraining(currentClub.id, trainingId, currentMember.id, status);
    } catch (e) {
      console.error("Error RSVPing:", e);
    }
  };

  const generateFromSchedule = async (s: TrainingSchedule) => {
    if (!currentClub || !currentMember) return;
    
    // Find next date for this weekday
    const now = new Date();
    const resultDate = new Date();
    resultDate.setDate(now.getDate() + (s.weekday + 7 - now.getDay()) % 7);
    // If it's today but in the past, move to next week
    const [sh, sm] = s.time.split(":").map(Number);
    resultDate.setHours(sh, sm, 0, 0);
    if (resultDate < now) resultDate.setDate(resultDate.getDate() + 7);

    try {
      await FirebaseManager.addTraining(currentClub.id, {
        title: s.title,
        description: s.description,
        date: resultDate,
        location: s.location,
        authorId: currentMember.id,
        trainingGroupId: s.trainingGroupId,
        scheduleId: s.id
      });
      setViewMode("sessions");
    } catch (e) {
      console.error("Error generating training session:", e);
    }
  };

  if (!hasAccess) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10">
           <PlanUpsell 
             title="Trainings-Modul ist ab dem Club-Plan verfügbar."
             text="Verwalte regelmäßige Trainings, erstelle Trainingsgruppen und behalte die Anwesenheit im Blick."
           />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        
        {/* Header */}
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
              <div className="flex flex-col gap-2">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Training</h1>
                <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Pläne & Anwesenheit</p>
              </div>
              {isAdminOrTrainer && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAdd(viewMode === "groups" ? "group" : viewMode === "schedules" ? "schedule" : "session")}
                    className="shrink-0 flex items-center gap-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-black/5"
                  >
                    <Plus size={16} /> 
                    <span className="hidden sm:inline">
                      {viewMode === "groups" ? "Gruppe" : viewMode === "schedules" ? "Regelmäßiges Training" : "Einzeltermin"}
                    </span>
                    <span className="sm:hidden">Neu</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start overflow-x-auto max-w-full">
            <button
              onClick={() => setViewMode("sessions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === "sessions" ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5" : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              <Calendar size={14} /> Termine
            </button>
            <button
              onClick={() => setViewMode("schedules")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === "schedules" ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5" : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              <Repeat size={14} /> Regelmäßig
            </button>
            <button
              onClick={() => setViewMode("groups")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === "groups" ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5" : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              <Layers size={14} /> Trainingsgruppen
            </button>
          </div>
        </div>

        {/* Search */}
        <TSearchBar 
          value={searchText} 
          onChange={setSearchText} 
          placeholder={
            viewMode === "sessions" ? "Termine suchen…" : 
            viewMode === "schedules" ? "Regelmäßige Pläne suchen…" : 
            "Trainingsgruppen suchen…"
          } 
        />

        {/* List Content */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {viewMode === "sessions" ? (
                filteredSessions.length === 0 ? (
                  <EmptyState icon={Calendar} text="Keine Trainings geplant." />
                ) : (
                  filteredSessions.map((training, idx) => (
                    <SessionCard 
                      key={training.id} 
                      training={training} 
                      idx={idx} 
                      currentMember={currentMember}
                      isAdminOrTrainer={isAdminOrTrainer}
                      trainingGroups={trainingGroups}
                      onRSVP={handleRSVP}
                      onDelete={() => setDeleteTarget(training)}
                      onShowList={() => setSelectedTraining(training)}
                    />
                  ))
                )
              ) : viewMode === "schedules" ? (
                filteredSchedules.length === 0 ? (
                  <EmptyState icon={Repeat} text="Keine regelmäßigen Trainings angelegt." />
                ) : (
                  filteredSchedules.map((schedule, idx) => (
                    <ScheduleCard 
                      key={schedule.id} 
                      schedule={schedule} 
                      idx={idx} 
                      isAdminOrTrainer={isAdminOrTrainer}
                      trainingGroups={trainingGroups}
                      onDelete={() => setDeleteTarget(schedule)}
                      onGenerate={() => generateFromSchedule(schedule)}
                    />
                  ))
                )
              ) : (
                filteredGroups.length === 0 ? (
                  <EmptyState icon={Layers} text="Keine Trainingsgruppen erstellt." />
                ) : (
                  filteredGroups.map((group, idx) => (
                    <TrainingGroupCard 
                      key={group.id} 
                      group={group} 
                      idx={idx} 
                      isAdminOrTrainer={isAdminOrTrainer}
                      allMembers={allMembers}
                      onDelete={() => setDeleteTarget(group)}
                    />
                  ))
                )
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Forms Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-sm">
              <GlassSection className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-black text-[#0A0A0A] text-lg uppercase tracking-tight">
                    {formType === "group" ? "Neue Trainingsgruppe" : 
                     formType === "schedule" ? "Regelmäßiger Plan" : "Einzeltermin anlegen"}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">
                      {formType === "group" ? "Name der Gruppe" : "Titel"}
                    </label>
                    <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder={formType === "group" ? "z.B. U15 Leistungskader" : "z.B. Dienstagstraining"} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                  </div>

                  {formType === "schedule" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Wochentag</label>
                        <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all">
                          {WEEKDAYS.map((day, i) => <option key={i} value={i}>{day}</option>)}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Zeit</label>
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                      </div>
                    </div>
                  )}

                  {formType === "session" && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Datum</label>
                        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Zeit</label>
                        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                      </div>
                    </div>
                  )}

                  {formType !== "group" && (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Ort</label>
                        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="z.B. Sportplatz A" className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Trainingsgruppe</label>
                        <select value={selectedTrainingGroupId} onChange={(e) => setSelectedTrainingGroupId(e.target.value)} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all">
                          <option value="">Alle Trainingsgruppen</option>
                          {trainingGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Beschreibung (optional)</label>
                    <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Zusatzinfos..." className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all resize-none" />
                  </div>
                </div>

                <div className="pt-2">
                  <TButton 
                    label={saving ? "Wird gespeichert…" : "Speichern"} 
                    onClick={saveForm} 
                    disabled={saving || !title.trim() || (formType === "session" && !date) || (formType !== "group" && !time)} 
                  />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendee List Modal with Group Breakdown */}
      <AnimatePresence>
        {selectedTraining && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-md">
              <GlassSection className="max-h-[85vh] flex flex-col">
                <div className="p-6 border-b border-black/5 flex items-center justify-between bg-black/[0.01]">
                  <div className="flex flex-col">
                    <h3 className="font-poppins font-black text-[#0A0A0A] text-lg uppercase tracking-tight">Anwesenheit</h3>
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{selectedTraining.title}</p>
                  </div>
                  <button onClick={() => setSelectedTraining(null)} className="text-[#52525B] hover:text-[#0A0A0A] transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-8">
                  {/* Attendance Stats per Training Group */}
                  {trainingGroups.length > 0 && (
                    <div className="flex flex-col gap-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717A] pl-1">Status nach Trainingsgruppen</h4>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {trainingGroups.map(group => {
                            const groupMembers = allMembers.filter(m => m.trainingGroupIds?.includes(group.id));
                            const groupAttendees = selectedTraining.attendeeIds.filter(id => groupMembers.find(m => m.id === id));
                            const groupAbsentees = selectedTraining.absenteeIds.filter(id => groupMembers.find(m => m.id === id));
                            const total = groupMembers.length;
                            if (total === 0) return null;

                            return (
                              <div key={group.id} className="p-3 rounded-2xl bg-black/[0.03] border border-black/5">
                                 <p className="text-xs font-poppins font-bold text-[#0A0A0A] truncate mb-2">{group.name}</p>
                                 <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                       <span className="text-[#34C759]">{groupAttendees.length} Ja</span>
                                       <span className="text-[#FF3B30]">{groupAbsentees.length} Nein</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-black/5 overflow-hidden flex">
                                       <div className="h-full bg-[#34C759]" style={{ width: `${(groupAttendees.length / total) * 100}%` }} />
                                       <div className="h-full bg-[#FF3B30]" style={{ width: `${(groupAbsentees.length / total) * 100}%` }} />
                                    </div>
                                    <p className="text-[9px] text-[#71717A] font-bold uppercase tracking-widest">
                                       {groupAttendees.length} von {total} angemeldet
                                    </p>
                                 </div>
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}

                  {/* List of Attendees */}
                  <div className="flex flex-col gap-6">
                    <AttendanceSection 
                      title="Zusagen" 
                      count={selectedTraining.attendeeIds.length} 
                      ids={selectedTraining.attendeeIds} 
                      allMembers={allMembers} 
                      color="#34C759"
                      icon={CheckCircle2}
                    />
                    <AttendanceSection 
                      title="Absagen" 
                      count={selectedTraining.absenteeIds.length} 
                      ids={selectedTraining.absenteeIds} 
                      allMembers={allMembers} 
                      color="#FF3B30"
                      icon={XCircle}
                    />
                    {isAdminOrTrainer && (
                      <AttendanceSection 
                        title="Noch offen" 
                        ids={allMembers.filter(m => !selectedTraining.attendeeIds.includes(m.id) && !selectedTraining.absenteeIds.includes(m.id))} 
                        allMembers={allMembers} 
                        color="#71717A"
                        icon={Clock}
                        isMinimal={true}
                      />
                    )}
                  </div>
                </div>

                <div className="p-4 border-t border-black/5 bg-black/[0.01]">
                   <TButton label="Schließen" onClick={() => setSelectedTraining(null)} />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xs">
              <GlassSection className="p-7 flex flex-col items-center text-center gap-1 font-poppins">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3 border border-red-500/20">
                  <Trash2 size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A]">Löschen?</h3>
                <p className="text-sm text-[#52525B] mb-4 px-2">Soll dieser Eintrag wirklich gelöscht werden?</p>
                <div className="flex flex-col gap-2 w-full">
                  <TButton label="Löschen" variant="danger" onClick={async () => {
                    if (!currentClub || !deleteTarget) return;
                    if ('weekday' in deleteTarget) {
                      await FirebaseManager.deleteTrainingSchedule(currentClub.id, deleteTarget.id);
                    } else if ('memberIds' in deleteTarget || 'name' in deleteTarget) {
                      await FirebaseManager.deleteTrainingGroup(currentClub.id, deleteTarget.id);
                    } else {
                      await FirebaseManager.deleteTraining(currentClub.id, deleteTarget.id);
                    }
                    setDeleteTarget(null);
                  }} />
                  <TButton label="Abbrechen" variant="secondary" onClick={() => setDeleteTarget(null)} />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: any) {
  return (
    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
      <Icon size={40} className="text-[#0A0A0A] mb-4" />
      <p className="font-poppins text-[#52525B] font-bold uppercase tracking-widest text-xs">{text}</p>
    </div>
  );
}

function SessionCard({ training, idx, currentMember, isAdminOrTrainer, trainingGroups, onRSVP, onDelete, onShowList }: any) {
  const dateObj = training.date instanceof Date ? training.date : (training.date as any).toDate();
  const isPast = dateObj < new Date();
  const hasJoined = training.attendeeIds.includes(currentMember?.id || "");
  const hasDeclined = training.absenteeIds.includes(currentMember?.id || "");
  const group = trainingGroups.find((g: any) => g.id === training.trainingGroupId);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}>
      <GlassSection className={`overflow-hidden flex flex-col h-full border-b-2 border-black/5 ${isPast ? "opacity-60" : ""}`}>
         <div className="p-5 flex flex-col gap-4 flex-1">
            <div className="flex items-start justify-between gap-3">
               <div className="flex flex-col gap-1">
                  <h3 className="font-poppins font-black text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight truncate max-w-[200px]">
                     {training.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[#71717A]">
                     <Clock size={12} strokeWidth={2.5} />
                     <span className="text-[11px] font-mono font-bold">
                        {dateObj.toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit' })} · {dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                     </span>
                  </div>
               </div>
               {isAdminOrTrainer && (
                 <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-500 bg-black/[0.04] transition-all">
                    <Trash2 size={14} />
                 </button>
               )}
            </div>

            <div className="flex flex-wrap gap-2">
              {group && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A0A0A]/[0.03] border border-black/5">
                   <Users size={10} className="text-[#0A0A0A]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{group.name}</span>
                </div>
              )}
              {training.location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.02] border border-black/5">
                   <MapPin size={10} className="text-[#71717A]" />
                   <span className="text-[10px] font-poppins font-bold text-[#71717A]">{training.location}</span>
                </div>
              )}
            </div>

            <TLine />

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#34C759]">Ja</span>
                     <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{training.attendeeIds.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">Nein</span>
                     <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{training.absenteeIds.length}</span>
                  </div>
               </div>
               
               <button onClick={onShowList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-[#0A0A0A] hover:bg-black/[0.07] transition-all border border-black/5">
                  <Users size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Liste</span>
               </button>
            </div>
         </div>

         {!isPast && (
           <div className="p-3 bg-black/[0.02] border-t border-black/5 grid grid-cols-2 gap-2">
              <button onClick={() => onRSVP(training.id, "attend")} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasJoined ? "bg-[#34C759] text-white shadow-lg shadow-green-500/20" : "bg-white border border-black/5 text-[#34C759] hover:bg-green-50"}`}>
                 <CheckCircle2 size={14} /> {hasJoined ? "Dabei" : "Zusage"}
              </button>
              <button onClick={() => onRSVP(training.id, "decline")} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasDeclined ? "bg-[#FF3B30] text-white shadow-lg shadow-red-500/20" : "bg-white border border-black/5 text-[#FF3B30] hover:bg-red-50"}`}>
                 <XCircle size={14} /> {hasDeclined ? "Absage" : "Absagen"}
              </button>
           </div>
         )}
      </GlassSection>
    </motion.div>
  );
}

function ScheduleCard({ schedule, idx, isAdminOrTrainer, trainingGroups, onDelete, onGenerate }: any) {
  const group = trainingGroups.find((g: any) => g.id === schedule.trainingGroupId);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}>
      <GlassSection className="p-5 flex flex-col gap-4 h-full border-b-2 border-black/5">
         <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
               <h3 className="font-poppins font-black text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight truncate max-w-[200px]">
                  {schedule.title}
               </h3>
               <div className="flex items-center gap-2 text-[#71717A]">
                  <Repeat size={12} strokeWidth={2.5} />
                  <span className="text-[11px] font-poppins font-bold uppercase tracking-widest">
                     Jeden {WEEKDAYS[schedule.weekday]} · {schedule.time} Uhr
                  </span>
               </div>
            </div>
            {isAdminOrTrainer && (
              <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-500 bg-black/[0.04] transition-all">
                 <Trash2 size={14} />
              </button>
            )}
         </div>

         <div className="flex flex-wrap gap-2">
            {group && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0A0A0A]/[0.03] border border-black/5">
                 <Users size={10} className="text-[#0A0A0A]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{group.name}</span>
              </div>
            )}
            {schedule.location && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/[0.02] border border-black/5">
                 <MapPin size={10} className="text-[#71717A]" />
                 <span className="text-[10px] font-poppins font-bold text-[#71717A]">{schedule.location}</span>
              </div>
            )}
         </div>

         <TLine />

         <TButton 
           label="Session generieren" 
           variant="secondary" 
           icon={Plus} 
           onClick={onGenerate}
           className="w-full py-3"
         />
      </GlassSection>
    </motion.div>
  );
}

function TrainingGroupCard({ group, idx, isAdminOrTrainer, allMembers, onDelete }: any) {
  const membersCount = allMembers.filter((m: any) => m.trainingGroupIds?.includes(group.id)).length;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}>
      <GlassSection className="p-5 flex flex-col gap-4 h-full border-b-2 border-black/5">
         <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
               <h3 className="font-poppins font-black text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight">
                  {group.name}
               </h3>
               <div className="flex items-center gap-2 text-[#71717A]">
                  <Users size={12} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                     {membersCount} Mitglieder zugeordnet
                  </span>
               </div>
            </div>
            {isAdminOrTrainer && (
              <button onClick={onDelete} className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-500 bg-black/[0.04] transition-all">
                 <Trash2 size={14} />
              </button>
            )}
         </div>

         {group.description && (
           <p className="text-xs text-[#71717A] italic leading-relaxed">
             "{group.description}"
           </p>
         )}

         <TLine />
         
         <div className="flex -space-x-2">
            {allMembers
              .filter((m: any) => m.trainingGroupIds?.includes(group.id))
              .slice(0, 5)
              .map((m: any) => (
                <div key={m.id} className="border-2 border-white rounded-full">
                  <TAvatar name={getMemberFullName(m)} id={m.id} size={28} />
                </div>
              ))}
            {membersCount > 5 && (
              <div className="w-7 h-7 rounded-full bg-black/5 border-2 border-white flex items-center justify-center text-[8px] font-black text-[#71717A]">
                +{membersCount - 5}
              </div>
            )}
         </div>
      </GlassSection>
    </motion.div>
  );
}

function AttendanceSection({ title, count, ids, allMembers, color, icon: Icon, isMinimal }: any) {
  const memberList = Array.isArray(ids) ? ids : ids.map((m: any) => m.id);
  if (memberList.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
         <Icon size={14} style={{ color }} />
         <span className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>{title} {count !== undefined && `(${count})`}</span>
      </div>
      <div className="flex flex-col gap-1">
        {memberList.map((id: string) => {
          const m = allMembers.find((member: any) => member.id === id);
          if (!m) return null;
          return (
            <div key={id} className={`flex items-center gap-3 px-3 py-2 rounded-2xl border border-transparent transition-all ${isMinimal ? "opacity-40" : "hover:bg-black/[0.02] hover:border-black/5"}`}>
               <TAvatar name={getMemberFullName(m)} id={id} size={34} />
               <div className="flex flex-col">
                  <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{getMemberFullName(m)}</span>
                  {m.memberType && (
                    <span className="text-[9px] font-black text-[#71717A] uppercase tracking-[0.1em]">{m.memberType}</span>
                  )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
