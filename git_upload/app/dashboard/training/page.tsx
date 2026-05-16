"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, X, Calendar, MapPin, 
  Users, CheckCircle2, XCircle, Clock,
  ChevronRight, Info, AlertCircle
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Training, Member, getPlanFeatures, getMemberFullName } from "@/lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar,
  TButton, TSearchBar, TBadge, PlanUpsell
} from "@/app/components/ui/NativeUI";

export default function TrainingPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null);

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
    setLoading(false);
    return () => { u1(); u2(); };
  }, [currentClub, hasAccess]);

  const filtered = trainings.filter((t) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return t.title.toLowerCase().includes(q) || (t.location?.toLowerCase().includes(q));
  });

  const openAdd = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTime("");
    setLocation("");
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!currentClub || !currentMember || !title.trim() || !date || !time) return;
    setSaving(true);
    
    try {
      const trainingDate = new Date(`${date}T${time}`);
      await FirebaseManager.addTraining(currentClub.id, {
        title: title.trim(),
        description: description.trim(),
        date: trainingDate,
        location: location.trim(),
        authorId: currentMember.id,
      });
      setShowForm(false);
    } catch (e) {
      console.error("Error adding training:", e);
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
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Training</h1>
              <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Zusagen & Planung</p>
            </div>
            {isAdminOrTrainer && (
              <button
                onClick={openAdd}
                className="shrink-0 flex items-center gap-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
              >
                <Plus size={16} /> Neu
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        <TSearchBar value={searchText} onChange={setSearchText} placeholder="Training suchen…" />

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Calendar size={40} className="text-[#0A0A0A] mb-4" />
            <p className="font-poppins text-[#52525B]">Keine Trainings geplant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((training, idx) => {
                const dateObj = training.date instanceof Date ? training.date : (training.date as any).toDate();
                const isPast = dateObj < new Date();
                const hasJoined = training.attendeeIds.includes(currentMember?.id || "");
                const hasDeclined = training.absenteeIds.includes(currentMember?.id || "");
                
                return (
                  <motion.div
                    key={training.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GlassSection className={`overflow-hidden flex flex-col h-full ${isPast ? "opacity-60" : ""}`}>
                       <div className="p-5 flex flex-col gap-4 flex-1">
                          <div className="flex items-start justify-between gap-3">
                             <div className="flex flex-col gap-1">
                                <h3 className="font-poppins font-black text-[#0A0A0A] text-lg leading-tight uppercase tracking-tight">
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
                               <button 
                                 onClick={() => setDeleteTarget(training)}
                                 className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-500 bg-black/[0.04] transition-all"
                               >
                                  <Trash2 size={14} />
                               </button>
                             )}
                          </div>

                          {training.location && (
                            <div className="flex items-center gap-2 text-[#52525B]">
                               <MapPin size={12} strokeWidth={2.5} />
                               <span className="text-[11px] font-poppins font-bold">{training.location}</span>
                            </div>
                          )}

                          {training.description && (
                            <p className="text-xs text-[#71717A] font-poppins leading-relaxed line-clamp-2 italic">
                               "{training.description}"
                            </p>
                          )}

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
                             
                             <button 
                               onClick={() => setSelectedTraining(training)}
                               className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/[0.04] text-[#52525B] hover:text-[#0A0A0A] hover:bg-black/[0.07] transition-all"
                             >
                                <Users size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Liste</span>
                             </button>
                          </div>
                       </div>

                       {/* RSVP Footer */}
                       {!isPast && (
                         <div className="p-3 bg-black/[0.02] border-t border-black/5 grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleRSVP(training.id, "attend")}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                hasJoined 
                                  ? "bg-[#34C759] text-white shadow-lg shadow-green-500/20" 
                                  : "bg-white border border-black/5 text-[#34C759] hover:bg-green-50"
                              }`}
                            >
                               <CheckCircle2 size={14} /> {hasJoined ? "Zugesagt" : "Zusagen"}
                            </button>
                            <button 
                              onClick={() => handleRSVP(training.id, "decline")}
                              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                hasDeclined 
                                  ? "bg-[#FF3B30] text-white shadow-lg shadow-red-500/20" 
                                  : "bg-white border border-black/5 text-[#FF3B30] hover:bg-red-50"
                              }`}
                            >
                               <XCircle size={14} /> {hasDeclined ? "Abgesagt" : "Absagen"}
                            </button>
                         </div>
                       )}
                    </GlassSection>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sheet Modal: Create Training */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg uppercase tracking-tight">
                    Neues Training
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Titel</label>
                    <input
                      autoFocus
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="z.B. Dienstagstraining"
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Datum</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Zeit</label>
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Ort</label>
                    <input
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="z.B. Sportplatz A"
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-[#71717A] uppercase tracking-widest pl-1">Beschreibung (optional)</label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Zusatzinfos..."
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <TButton 
                    label={saving ? "Erstellt…" : "Training anlegen"} 
                    onClick={saveForm}
                    disabled={saving || !title.trim() || !date || !time}
                  />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Attendee List Modal */}
      <AnimatePresence>
        {selectedTraining && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md"
            >
              <GlassSection className="max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-poppins font-black text-[#0A0A0A] text-lg uppercase tracking-tight">Anwesenheit</h3>
                    <p className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest">{selectedTraining.title}</p>
                  </div>
                  <button onClick={() => setSelectedTraining(null)} className="text-[#52525B] hover:text-[#0A0A0A]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-6">
                  {/* Zusagen Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-4 pt-2">
                       <CheckCircle2 size={14} className="text-[#34C759]" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-[#34C759]">Zusagen ({selectedTraining.attendeeIds.length})</span>
                    </div>
                    {selectedTraining.attendeeIds.length === 0 ? (
                      <p className="px-4 py-2 text-[12px] text-[#A1A1AA] italic">Noch keine Zusagen</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedTraining.attendeeIds.map(id => {
                          const m = allMembers.find(member => member.id === id);
                          return (
                            <div key={id} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-black/[0.02]">
                               <TAvatar name={m ? getMemberFullName(m) : "Unbekannt"} id={id} size={30} />
                               <span className="text-sm font-poppins font-semibold text-[#0A0A0A]">{m ? getMemberFullName(m) : "Unbekannt"}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Absagen Section */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 px-4">
                       <XCircle size={14} className="text-[#FF3B30]" />
                       <span className="text-[11px] font-black uppercase tracking-widest text-[#FF3B30]">Absagen ({selectedTraining.absenteeIds.length})</span>
                    </div>
                    {selectedTraining.absenteeIds.length === 0 ? (
                      <p className="px-4 py-2 text-[12px] text-[#A1A1AA] italic">Noch keine Absagen</p>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {selectedTraining.absenteeIds.map(id => {
                          const m = allMembers.find(member => member.id === id);
                          return (
                            <div key={id} className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-black/[0.02]">
                               <TAvatar name={m ? getMemberFullName(m) : "Unbekannt"} id={id} size={30} />
                               <span className="text-sm font-poppins font-semibold text-[#0A0A0A]">{m ? getMemberFullName(m) : "Unbekannt"}</span>
                               <span className="ml-auto text-[10px] font-bold text-[#FF3B30] uppercase px-2 py-0.5 rounded bg-red-50 border border-red-100">Abgesagt</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Pending Section (Optional) */}
                  {isAdminOrTrainer && (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 px-4">
                         <Clock size={14} className="text-[#71717A]" />
                         <span className="text-[11px] font-black uppercase tracking-widest text-[#71717A]">Noch offen</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        {allMembers
                          .filter(m => !selectedTraining.attendeeIds.includes(m.id) && !selectedTraining.absenteeIds.includes(m.id))
                          .map(m => (
                            <div key={m.id} className="flex items-center gap-3 px-4 py-2 rounded-xl opacity-40">
                               <TAvatar name={getMemberFullName(m)} id={m.id} size={30} />
                               <span className="text-sm font-poppins font-semibold text-[#0A0A0A]">{getMemberFullName(m)}</span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-black/5">
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
                <p className="text-sm text-[#52525B] mb-4 px-2">Soll dieses Training wirklich gelöscht werden?</p>
                <div className="flex flex-col gap-2 w-full">
                  <TButton label="Löschen" variant="danger" onClick={async () => {
                    if (!currentClub || !deleteTarget) return;
                    await FirebaseManager.deleteTraining(currentClub.id, deleteTarget.id);
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
