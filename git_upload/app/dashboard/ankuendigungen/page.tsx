"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, X, MessageSquare, Pin, CalendarDays, Megaphone, ChevronRight } from "lucide-react";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { TrainingAnnouncement } from "../../../lib/firebase/models";
import { 
  GlassSection, TLine, TAvatar, AmbientBackground, 
  TButton, TSearchBar, TBadge 
} from "../../components/ui/NativeUI";

export default function AnnouncementsPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  
  const [announcements, setAnnouncements] = useState<TrainingAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [deleteTarget, setDeleteTarget] = useState<TrainingAnnouncement | null>(null);

  useEffect(() => {
    if (!currentClub) return;
    const unsub = FirebaseManager.listenToAnnouncements(currentClub.id, (anns) => {
      setAnnouncements(anns);
      setLoading(false);
    });
    return unsub;
  }, [currentClub]);

  const filtered = announcements.filter((a) => {
    if (!searchText.trim()) return true;
    const q = searchText.toLowerCase();
    return a.message.toLowerCase().includes(q) || a.authorName.toLowerCase().includes(q);
  });

  const openAdd = () => {
    setMessage("");
    setIsPinned(false);
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!currentClub || !currentMember || !message.trim()) return;
    setSaving(true);
    
    try {
      await FirebaseManager.addAnnouncement(currentClub.id, {
        authorId: currentMember.id,
        authorName: `${currentMember.firstName} ${currentMember.lastName}`,
        message: message.trim(),
        isPinned,
      });
      setShowForm(false);
    } catch (e) {
      console.error("Error adding announcement:", e);
    } finally {
      setSaving(false);
    }
  };

  const deleteAnnouncement = async () => {
    if (!currentClub || !deleteTarget) return;
    try {
      await FirebaseManager.deleteAnnouncement(currentClub.id, deleteTarget.id);
    } catch (e) {
      console.error("Error deleting announcement:", e);
    } finally {
      setDeleteTarget(null);
    }
  };

  const togglePin = async (announcement: TrainingAnnouncement) => {
    if (!currentClub) return;
    try {
      await FirebaseManager.updateAnnouncement(currentClub.id, announcement.id, {
        isPinned: !announcement.isPinned
      });
    } catch (e) {
      console.error("Error updating pin status:", e);
    }
  };

  const isAdminOrTrainer = currentMember?.isAdmin === true || currentMember?.isTrainer === true;

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 p-6 flex flex-col gap-6 max-w-2xl mx-auto pb-32">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <div className="flex items-end justify-between">
            <h1 className="text-[26px] font-poppins font-bold text-white tracking-tight">Ankündigungen</h1>
            {isAdminOrTrainer && (
              <button 
                onClick={openAdd}
                className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <Plus size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        <TSearchBar value={searchText} onChange={setSearchText} placeholder="Ankündigungen suchen…" />

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Megaphone size={40} className="text-white mb-4" />
            <p className="font-poppins text-[#8A8A8A]">Keine Ankündigungen vorhanden.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((announcement, idx) => {
                const date = announcement.createdAt instanceof Date ? announcement.createdAt : new Date((announcement.createdAt as any).seconds * 1000);
                const canModify = currentMember?.isAdmin || currentMember?.id === announcement.authorId;
                
                return (
                  <motion.div
                    key={announcement.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <GlassSection 
                      className={`overflow-hidden transition-all ${
                        announcement.isPinned 
                          ? "border-yellow-500/30 bg-yellow-500/[0.03] shadow-[0_0_20px_rgba(234,179,8,0.05)]" 
                          : "border-white/[0.08]"
                      }`}
                    >
                      {/* Author Header */}
                      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <TAvatar 
                             name={announcement.authorName} 
                             id={announcement.authorId} 
                             size={38} 
                           />
                           <div className="flex flex-col min-w-0">
                              <span className="font-poppins font-semibold text-white text-[14px] truncate leading-tight">
                                {announcement.authorName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="text-[10px] font-mono text-[#8A8A8A]">
                                    {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                 </span>
                                 <span className="w-1 h-1 rounded-full bg-white/10" />
                                 <span className="text-[10px] font-mono text-[#8A8A8A]">
                                    {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 {announcement.isPinned && (
                                   <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20">
                                      <Pin size={8} className="text-yellow-500" fill="currentColor" />
                                      <span className="text-[8px] font-bold text-yellow-500 uppercase tracking-widest">WICHTIG</span>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>

                        {canModify && (
                          <div className="flex items-center gap-1">
                             <button 
                               onClick={() => togglePin(announcement)}
                               className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                 announcement.isPinned ? "text-yellow-500 bg-yellow-500/10" : "text-[#383838] hover:text-white bg-white/5"
                               }`}
                             >
                                <Pin size={14} strokeWidth={announcement.isPinned ? 3 : 2} />
                             </button>
                             <button 
                               onClick={() => setDeleteTarget(announcement)}
                               className="w-8 h-8 rounded-lg flex items-center justify-center text-[#383838] hover:text-red-400 bg-white/5 transition-all"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                        )}
                      </div>

                      <TLine className="opacity-40" />
                      
                      {/* Message body */}
                      <div className="px-5 py-5">
                         <p className="font-poppins text-[15px] text-white/90 whitespace-pre-wrap leading-relaxed">
                            {announcement.message}
                         </p>
                      </div>
                    </GlassSection>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sheet Modal: Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-white text-lg">
                    Ankündigung
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-[#8A8A8A] hover:text-white">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">Nachricht</label>
                    <textarea
                      autoFocus
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Was gibt es Neues?"
                      className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3.5 font-poppins text-[15px] text-white placeholder-[#444] focus:outline-none focus:border-white/20 transition-all resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col gap-0.5">
                         <span className="font-poppins font-semibold text-white text-sm">Oben anheften</span>
                         <span className="text-[11px] font-poppins text-[#8A8A8A]">Ganz oben als wichtig markieren</span>
                      </div>
                      <button 
                        onClick={() => setIsPinned(!isPinned)}
                        className={`w-11 h-6 rounded-full relative transition-all ${isPinned ? "bg-yellow-500" : "bg-white/10"}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPinned ? "left-6" : "left-1"}`} />
                      </button>
                   </div>
                </div>

                <div className="pt-2">
                  <TButton 
                    label={saving ? "Wird gesendet…" : "Jetzt senden"} 
                    onClick={saveForm}
                    disabled={saving || !message.trim()}
                  />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-xs text-center font-poppins">
               <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                  <Trash2 size={32} className="text-red-400" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Löschen?</h3>
               <p className="text-sm text-[#8A8A8A] mb-8 px-4">Soll diese Ankündigung wirklich unwiderruflich gelöscht werden?</p>
               <div className="flex flex-col gap-2">
                 <TButton label="Löschen" variant="danger" onClick={deleteAnnouncement} />
                 <TButton label="Abbrechen" variant="secondary" onClick={() => setDeleteTarget(null)} />
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
