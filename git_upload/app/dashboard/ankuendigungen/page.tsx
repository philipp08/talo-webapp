"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Trash2, X, MessageSquare, Pin, CalendarDays } from "lucide-react";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { TrainingAnnouncement } from "../../../lib/firebase/models";

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
    <div className="flex flex-col gap-0 h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#080808] border-b border-[#ffffff0f] px-6 pt-6 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-poppins font-bold text-white">Ankündigungen</h1>
          {isAdminOrTrainer && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-poppins font-semibold bg-white text-[#080808] hover:bg-white/90 transition-colors"
            >
              <Plus size={16} />
              Neu
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Ankündigungen suchen…"
            className="w-full rounded-xl border border-[#ffffff0f] bg-[#111111] pl-10 pr-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <MessageSquare size={40} className="text-[#333] mb-4" />
            <p className="font-poppins text-[#8A8A8A]">Keine Ankündigungen vorhanden.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 mb-8">
            {filtered.map((announcement, idx) => {
              const date = announcement.createdAt instanceof Date ? announcement.createdAt : new Date();
              const canModify = currentMember?.isAdmin || currentMember?.id === announcement.authorId;
              
              return (
                <motion.div
                  key={announcement.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative p-5 rounded-2xl border ${
                    announcement.isPinned 
                      ? "border-yellow-500/30 bg-[#111111]/80 shadow-[0_0_15px_rgba(234,179,8,0.05)]" 
                      : "border-[#ffffff0f] bg-[#111111]"
                  }`}
                >
                  {/* Pin Badge Overlay */}
                  {announcement.isPinned && (
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center shadow-lg">
                      <Pin size={14} fill="currentColor" />
                    </div>
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                        {announcement.authorName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-semibold text-white text-sm">
                          {announcement.authorName}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-[#8A8A8A]">
                          <CalendarDays size={12} />
                          {date.toLocaleDateString('de-DE', {
                             weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' 
                          })} 
                          {' • '} 
                          {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    
                    {/* Admin Actions */}
                    {canModify && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePin(announcement)}
                          className={`p-2 rounded-lg transition-colors ${
                            announcement.isPinned 
                              ? "text-yellow-500 hover:bg-yellow-500/10" 
                              : "text-[#8A8A8A] hover:text-white hover:bg-white/10"
                          }`}
                          title={announcement.isPinned ? "Fixierung lösen" : "Anpinnen"}
                        >
                          <Pin size={16} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(announcement)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[#8A8A8A] hover:text-red-400"
                          title="Löschen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#ffffff0a]">
                    <p className="font-poppins text-sm text-[#E0E0E0] whitespace-pre-wrap leading-relaxed">
                      {announcement.message}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-bold text-white text-lg">
                  Neue Ankündigung
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} className="text-[#8A8A8A]" />
                </button>
              </div>

              {/* Message */}
              <div>
                <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider mb-2 block">Nachricht</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Was gibt es Neues?"
                  rows={5}
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20 resize-none"
                />
              </div>

              {/* Pinned Checkbox */}
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsPinned(!isPinned)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${
                    isPinned ? "bg-white border-white" : "border-[#ffffff33] bg-transparent"
                  }`}
                >
                  {isPinned && <Pin size={12} className="text-black rotate-45" />}
                </button>
                <span className="text-sm font-poppins text-white cursor-pointer select-none" onClick={() => setIsPinned(!isPinned)}>
                  Wichtig / Oben anheften
                </span>
              </div>

              {/* Save */}
              <button
                onClick={saveForm}
                disabled={saving || !message.trim()}
                className="w-full py-3 rounded-xl font-poppins font-semibold text-sm bg-white text-[#080808] hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {saving ? "Wird gesendet…" : "Jetzt senden"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6 flex flex-col gap-4"
            >
              <h3 className="font-poppins font-bold text-white text-lg">Ankündigung löschen?</h3>
              <p className="text-sm font-poppins text-[#8A8A8A]">
                Möchtest du diese Ankündigung wirklich unwiderruflich löschen?
              </p>
              <div className="flex gap-3 justify-end mt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={deleteAnnouncement}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
