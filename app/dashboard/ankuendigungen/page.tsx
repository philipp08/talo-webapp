"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, X, Pin, Megaphone } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { TrainingAnnouncement, getPlanFeatures, isLightColor } from "@/lib/firebase/models";
import {
  GlassSection, TLine, TAvatar,
  TButton, TSearchBar
} from "@/app/components/ui/NativeUI";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function AnnouncementsPage() {
  const { t } = useI18n();
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);

  const planFeatures  = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures("starter");
  const accentRaw     = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent        = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight   = isLightColor(accent);
  
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
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
            <div className="flex items-center gap-4">
              {currentClub?.logoUrl && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2" style={{ borderColor: `${accent}30` }}>
                  <img src={currentClub.logoUrl} alt={currentClub.name} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{t("ankuendigungen.title")}</h1>
                <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name} · {t("ankuendigungen.subtitle")}</p>
              </div>
            </div>
            {isAdminOrTrainer && (
              <button
                onClick={openAdd}
                style={{ backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }}
                className="shrink-0 flex items-center gap-2 hover:opacity-95 px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-xl shadow-black/5"
              >
                <Plus size={16} /> {t("common.new")}
              </button>
            )}
          </div>
        </motion.div>

        {/* Search */}
        <TSearchBar value={searchText} onChange={setSearchText} placeholder={t("ankuendigungen.search")} />

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Megaphone size={40} className="text-[#0A0A0A] mb-4" />
            <p className="font-poppins text-[#52525B]">{t("ankuendigungen.empty")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            <AnimatePresence mode="popLayout">
              {filtered.map((announcement, idx) => {
                const date = announcement.createdAt instanceof Date
                  ? announcement.createdAt
                  : announcement.createdAt.toDate();
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
                          ? "border-[#E87AA0]/30 bg-[#E87AA0]/[0.04] shadow-[0_0_20px_rgba(232,122,160,0.08)]" 
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
                              <span className="font-poppins font-semibold text-[#0A0A0A] text-[14px] truncate leading-tight">
                                {announcement.authorName}
                              </span>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                 <span className="text-[10px] font-mono text-[#52525B]">
                                    {date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                 </span>
                                 <span className="w-1 h-1 rounded-full bg-black/[0.07]" />
                                 <span className="text-[10px] font-mono text-[#52525B]">
                                    {date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                                 </span>
                                 {announcement.isPinned && (
                                   <div className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-full bg-[#E87AA0]/10 border border-[#E87AA0]/20">
                                      <Pin size={8} className="text-[#E87AA0]" fill="currentColor" />
                                      <span className="text-[8px] font-bold text-[#E87AA0] uppercase tracking-widest">{t("ankuendigungen.important")}</span>
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
                                 announcement.isPinned ? "text-[#E87AA0] bg-[#E87AA0]/10" : "text-[#A1A1AA] hover:text-[#0A0A0A] bg-black/[0.04]"
                               }`}
                             >
                                <Pin size={14} strokeWidth={announcement.isPinned ? 3 : 2} />
                             </button>
                             <button 
                               onClick={() => setDeleteTarget(announcement)}
                               className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-red-400 bg-black/[0.04] transition-all"
                             >
                                <Trash2 size={14} />
                             </button>
                          </div>
                        )}
                      </div>

                      <TLine className="opacity-40" />
                      
                      {/* Message body */}
                      <div className="px-5 py-5">
                         <p className="font-poppins text-[15px] text-[#0A0A0A]/90 whitespace-pre-wrap leading-relaxed">
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
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setShowForm(false); }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <GlassSection className="p-5 sm:p-6 flex flex-col gap-4 sm:gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg">
                      {t("ankuendigungen.modalTitle")}
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">{t("ankuendigungen.message")}</label>
                      <textarea
                        autoFocus
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={t("ankuendigungen.placeholder")}
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-base text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-black/15 transition-all resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex flex-col gap-0.5">
                           <span className="font-poppins font-semibold text-[#0A0A0A] text-sm">{t("ankuendigungen.pinLabel")}</span>
                           <span className="text-[11px] font-poppins text-[#52525B]">{t("ankuendigungen.pinSub")}</span>
                        </div>
                        <button 
                          onClick={() => setIsPinned(!isPinned)}
                          className={`w-11 h-6 rounded-full relative transition-all ${isPinned ? "bg-[#E87AA0]" : "bg-black/[0.07]"}`}
                        >
                           <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isPinned ? "left-6" : "left-1"}`} />
                        </button>
                     </div>
                  </div>

                  <div className="pt-2">
                    <TButton
                      label={saving ? t("common.saving") : t("common.create")}
                      onClick={saveForm}
                      disabled={saving || !message.trim()}
                    />
                  </div>
                </GlassSection>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Delete Confirmation */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {deleteTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setDeleteTarget(null); }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-xs"
              >
                <GlassSection className="p-7 flex flex-col items-center text-center gap-1 font-poppins">
                  <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3 border border-red-500/20">
                    <Trash2 size={28} className="text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A0A0A]">{t("ankuendigungen.deleteTitle")}</h3>
                  <p className="text-sm text-[#52525B] mb-4 px-2">{t("ankuendigungen.deleteConfirm")}</p>
                  <div className="flex flex-col gap-2 w-full">
                    <TButton label={t("common.delete")} variant="danger" onClick={deleteAnnouncement} />
                    <TButton label={t("common.cancel")} variant="secondary" onClick={() => setDeleteTarget(null)} />
                  </div>
                </GlassSection>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
