"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, X, Calendar, MapPin, 
  Users, CheckCircle2, XCircle, Clock,
  ChevronRight, Info, AlertCircle, Repeat,
  ChevronDown, Filter, User
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { 
  Training, Member, getPlanFeatures, getMemberFullName, 
  TrainingSchedule, ClubGroup 
} from "@/lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar,
  TButton, TSearchBar, TBadge, PlanUpsell
} from "@/app/components/ui/NativeUI";

type ViewMode = "sessions" | "schedules";

const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

export default function TrainingPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  
  const [viewMode, setViewMode] = useState<ViewMode>("sessions");
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [schedules, setSchedules] = useState<TrainingSchedule[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  // Forms
  const [showForm, setShowForm] = useState(false);
  const [isScheduleForm, setIsScheduleForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [weekday, setWeekday] = useState(3); // Default Wed
  const [location, setLocation] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | TrainingSchedule | null>(null);

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
    const u4 = planFeatures.hasGroups ? FirebaseManager.listenToGroups(currentClub.id, setGroups) : () => {};
    
    setLoading(false);
    return () => { u1(); u2(); u3(); u4(); };
  }, [currentClub, hasAccess, planFeatures.hasGroups]);

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

  const openAdd = (asSchedule = false) => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setWeekday(3);
    setLocation("");
    setSelectedGroupId("");
    setIsScheduleForm(asSchedule);
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!currentClub || !currentMember || !title.trim() || (!isScheduleForm && !date) || !time) return;
    setSaving(true);
    
    try {
      if (isScheduleForm) {
        await FirebaseManager.addTrainingSchedule(currentClub.id, {
          title: title.trim(),
          description: description.trim(),
          weekday,
          time,
          location: location.trim(),
          groupId: selectedGroupId || undefined,
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
          groupId: selectedGroupId || undefined,
        });
      }
      setShowForm(false);
    } catch (e) {
      console.error("Error saving training:", e);
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
    if (resultDate < now) resultDate.setDate(resultDate.getDate() + 7);
    
    const [h, m] = s.time.split(":").map(Number);
    resultDate.setHours(h, m, 0, 0);

    try {
      await FirebaseManager.addTraining(currentClub.id, {
        title: s.title,
        description: s.description,
        date: resultDate,
        location: s.location,
        authorId: currentMember.id,
        groupId: s.groupId,
        scheduleId: s.id
      });
      setViewMode("sessions");
    } catch (e) {
      console.error("Error generating training:", e);
    }
  };

  if (!hasAccess) {
    return (
      <div className="relative min-h-screen">
        <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10">
           <PlanUpsell 
             title="Trainings-RSVP ist ab dem Club-Plan verfügbar."
             text="Plane deine Trainings effizienter mit Zu- und Absagen deiner Mitglieder in Echtzeit."
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
                <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Zusagen & Planung</p>
              </div>
              {isAdminOrTrainer && (
                <button
                  onClick={() => openAdd(viewMode === "schedules")}
                  className="shrink-0 flex items-center gap-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-black/5"
                >
                  <Plus size={16} /> {viewMode === "schedules" ? "Regelmäßiges Training" : "Termin"}
                </button>
              )}
            </div>
          </motion.div>

          {/* View Toggle */}
          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start">
            <button
              onClick={() => setViewMode("sessions")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                viewMode === "sessions" ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5" : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              <Calendar size={14} /> Termine
            </button>
            <button
              onClick={() => setViewMode("schedules")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                viewMode === "schedules" ? "bg-white text-[#0A0A0A] shadow-sm border border-black/5" : "text-[#71717A] hover:text-[#0A0A0A]"
              }`}
            >
              <Repeat size={14} /> Regelmäßig
            </button>
          </div>
        </div>

        {/* Search */}
        <TSearchBar value={searchText} onChange={setSearchText} placeholder={viewMode === "sessions" ? "Termine suchen…" : "Regelmäßige Trainings suchen…"} />

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
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Calendar size={40} className="text-[#0A0A0A] mb-4" />
                    <p className="font-poppins text-[#52525B]">Keine Trainings geplant.</p>
                  </div>
                ) : (
                  filteredSessions.map((training, idx) => (
                    <SessionCard 
                      key={training.id} 
                      training={training} 
                      idx={idx} 
                      currentMember={currentMember}
                      isAdminOrTrainer={isAdminOrTrainer}
                      groups={groups}
                      onRSVP={handleRSVP}
                      onDelete={() => setDeleteTarget(training)}
                      onShowList={() => setSelectedTraining(training)}
                    />
                  ))
                )
              ) : (
                filteredSchedules.length === 0 ? (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center opacity-40">
                    <Repeat size={40} className="text-[#0A0A0A] mb-4" />
                    <p className="font-poppins text-[#52525B]">Keine regelmäßigen Trainings angelegt.</p>
                  </div>
                ) : (
                  filteredSchedules.map((schedule, idx) => (
                    <ScheduleCard 
                      key={schedule.id} 
                      schedule={schedule} 
                      idx={idx} 
                      isAdminOrTrainer={isAdminOrTrainer}
                      groups={groups}
                      onDelete={() => setDeleteTarget(schedule)}
                      onGenerate={() => generateFromSchedule(schedule)}
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
                    {isScheduleForm ? "Regelmäßiges Training" : "Termin anlegen"}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Titel</label>
                    <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Dienstagstraining" className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                  </div>

                  {isScheduleForm ? (
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
                  ) : (
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

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Ort</label>
                    <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="z.B. Sportplatz A" className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all" />
                  </div>

                  {planFeatures.hasGroups && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Trainingsgruppe</label>
                      <select value={selectedGroupId} onChange={(e) => setSelectedGroupId(e.target.value)} className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all">
                        <option value="">Gesamter Verein</option>
                        {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Beschreibung (optional)</label>
                    <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Zusatzinfos..." className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all resize-none" />
                  </div>
                </div>

                <div className="pt-2">
                  <TButton label={saving ? "Wird gespeichert…" : "Speichern"} onClick={saveForm} disabled={saving || !title.trim() || (!isScheduleForm && !date) || !time} />
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
                  {/* Attendance Stats per Group */}
                  {planFeatures.hasGroups && groups.length > 0 && (
                    <div className="flex flex-col gap-3">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-[#71717A] pl-1">Status nach Gruppen</h4>
                       <div className="grid grid-cols-2 gap-3">
                          {groups.map(group => {
                            const groupMembers = allMembers.filter(m => (m.groupId === group.id));
                            const groupAttendees = selectedTraining.attendeeIds.filter(id => groupMembers.find(m => m.id === id));
                            const groupAbsentees = selectedTraining.absenteeIds.filter(id => groupMembers.find(m => m.id === id));
                            const total = groupMembers.length;
                            if (total === 0) return null;

                            return (
                              <div key={group.id} className="p-3 rounded-2xl bg-black/[0.03] border border-black/5">
                                 <p className="text-xs font-poppins font-bold text-[#0A0A0A] truncate mb-2">{group.name}</p>
                                 <div className="flex items-center gap-2">
                                    <div className="flex flex-col flex-1">
                                       <div className="flex items-center justify-between text-[10px] font-mono font-bold">
                                          <span className="text-[#34C759]">{groupAttendees.length} Ja</span>
                                          <span className="text-[#FF3B30]">{groupAbsentees.length} Nein</span>
                                       </div>
                                       <div className="h-1 rounded-full bg-black/5 mt-1 overflow-hidden flex">
                                          <div className="h-full bg-[#34C759]" style={{ width: `${(groupAttendees.length / total) * 100}%` }} />
                                          <div className="h-full bg-[#FF3B30]" style={{ width: `${(groupAbsentees.length / total) * 100}%` }} />
                                       </div>
                                       <p className="text-[9px] text-[#71717A] mt-1 font-bold uppercase tracking-widest">{groupAttendees.length} von {total} Mitgliedern</p>
                                    </div>
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
                        ids={allMembers.filter(m => !selectedTraining.attendeeIds.includes(m.id) && !selectedTraining.absenteeIds.includes(m.id)).map(m => m.id)} 
                        allMembers={allMembers} 
                        color="#71717A"
                        icon={Clock}
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

function SessionCard({ training, idx, currentMember, isAdminOrTrainer, groups, onRSVP, onDelete, onShowList }: any) {
  const dateObj = training.date instanceof Date ? training.date : (training.date as any).toDate();
  const isPast = dateObj < new Date();
  const hasJoined = training.attendeeIds.includes(currentMember?.id || "");
  const hasDeclined = training.absenteeIds.includes(currentMember?.id || "");
  const group = groups.find((g: any) => g.id === training.groupId);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}>
      <GlassSection className={`overflow-hidden flex flex-col h-full ${isPast ? "opacity-60" : ""}`}>
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
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/5">
                   <Users size={10} className="text-[#0A0A0A]" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{group.name}</span>
                </div>
              )}
              {training.location && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/5">
                   <MapPin size={10} className="text-[#71717A]" />
                   <span className="text-[10px] font-poppins font-bold text-[#71717A]">{training.location}</span>
                </div>
              )}
            </div>

            <TLine />

            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#34C759]">Zusagen</span>
                     <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{training.attendeeIds.length}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#FF3B30]">Absagen</span>
                     <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{training.absenteeIds.length}</span>
                  </div>
               </div>
               
               <button onClick={onShowList} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-[#0A0A0A] hover:bg-black/[0.07] transition-all">
                  <Users size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Details</span>
               </button>
            </div>
         </div>

         {!isPast && (
           <div className="p-3 bg-black/[0.02] border-t border-black/5 grid grid-cols-2 gap-2">
              <button onClick={() => onRSVP(training.id, "attend")} className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${hasJoined ? "bg-[#34C759] text-white shadow-lg shadow-green-500/20" : "bg-white border border-black/5 text-[#34C759] hover:bg-green-50"}`}>
                 <CheckCircle2 size={14} /> {hasJoined ? "Dabei" : "Zusagen"}
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

function ScheduleCard({ schedule, idx, isAdminOrTrainer, groups, onDelete, onGenerate }: any) {
  const group = groups.find((g: any) => g.id === schedule.groupId);

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: idx * 0.05 }}>
      <GlassSection className="p-5 flex flex-col gap-4 h-full">
         <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
               <h3 className="font-poppins font-black text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight">
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

         {schedule.location && (
           <div className="flex items-center gap-2 text-[#52525B]">
              <MapPin size={12} strokeWidth={2.5} />
              <span className="text-[11px] font-poppins font-bold">{schedule.location}</span>
           </div>
         )}

         {group && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/5 border border-black/5 self-start">
               <Users size={10} className="text-[#0A0A0A]" />
               <span className="text-[10px] font-black uppercase tracking-widest text-[#0A0A0A]">{group.name}</span>
            </div>
          )}

         <TLine />

         <TButton 
           label="Termin erstellen" 
           variant="secondary" 
           icon={Plus} 
           onClick={onGenerate}
           className="w-full"
         />
      </GlassSection>
    </motion.div>
  );
}

function AttendanceSection({ title, count, ids, allMembers, color, icon: Icon }: any) {
  if (!ids || ids.length === 0) return null;
  
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
         <Icon size={14} style={{ color }} />
         <span className="text-[11px] font-black uppercase tracking-widest" style={{ color }}>{title} {count !== undefined && `(${count})`}</span>
      </div>
      <div className="flex flex-col gap-1">
        {ids.map((id: string) => {
          const m = allMembers.find((member: any) => member.id === id);
          return (
            <div key={id} className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-black/[0.02] transition-colors border border-transparent hover:border-black/5">
               <TAvatar name={m ? getMemberFullName(m) : "Unbekannt"} id={id} size={34} />
               <div className="flex flex-col">
                  <span className="text-sm font-poppins font-bold text-[#0A0A0A]">{m ? getMemberFullName(m) : "Unbekannt"}</span>
                  {m?.memberType && (
                    <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{m.memberType}</span>
                  )}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
