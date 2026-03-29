"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Pencil, Trash2, Info, CheckSquare, Search } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, ActivityCategory } from "@/lib/firebase/models";
import { TCatBadge, GlassSection, TLine, TButton, TSearchBar, AmbientBackground } from "@/app/components/ui/NativeUI";

export default function ApprovalsPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [pendingEntries, setPendingEntries] = useState<Entry[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentClub) return;

    const unsub = FirebaseManager.listenToEntries(currentClub.id, (all) => {
      setPendingEntries(all.filter((e) => e.status === "Ausstehend"));
      setLoading(false);
    });

    const unsubMembers = FirebaseManager.listenToMembers(currentClub.id, (ms) => {
      const map: Record<string, string> = {};
      ms.forEach((m) => { map[m.id] = `${m.firstName} ${m.lastName}`; });
      setMembers(map);
    });

    return () => { unsub(); unsubMembers(); };
  }, [currentClub]);

  const approve = async (entry: Entry) => {
    if (!currentClub) return;
    setProcessingId(entry.id);
    await FirebaseManager.updateEntryStatus(currentClub.id, entry.id, "Genehmigt");
    setProcessingId(null);
  };

  const reject = async (id: string) => {
    if (!currentClub) return;
    setProcessingId(id);
    await FirebaseManager.updateEntryStatus(currentClub.id, id, "Abgelehnt", rejectReason);
    setRejectId(null);
    setRejectReason("");
    setProcessingId(null);
  };

  if (!currentMember?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <p className="text-[#8A8A8A] font-poppins">Kein Zugriff. Nur für Administratoren.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      
      <div className="relative z-10 p-6 flex flex-col gap-6 max-w-2xl mx-auto">
        {/* Native Header */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-[26px] font-poppins font-bold text-white tracking-tight">Genehmigung</h1>
          <p className="text-[#8A8A8A] font-poppins text-sm">
            {loading ? "Laden…" : `${pendingEntries.length} ausstehende Einträge`}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent opacity-20" />
          </div>
        ) : pendingEntries.length === 0 ? (
          /* Native Empty State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-5 text-center"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-[#34C759]/10 blur-xl absolute inset-0" />
              <div className="w-20 h-20 rounded-full bg-[#34C759]/10 flex items-center justify-center relative border border-[#34C759]/20">
                <CheckSquare size={40} className="text-[#34C759]" strokeWidth={1.5} />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-poppins font-bold text-xl text-white">Alles erledigt!</h2>
              <p className="text-[#8A8A8A] font-poppins text-[15px]">Keine ausstehenden Einträge.</p>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3.5 pb-20">
            <AnimatePresence mode="popLayout">
              {pendingEntries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", duration: 0.5, delay: idx * 0.05 }}
                >
                  <GlassSection className="p-4 sm:p-5 flex flex-col gap-4">
                    {/* Header: Cat + Name + Points */}
                    <div className="flex items-start gap-4">
                      <TCatBadge category={entry.activityCategory as string} />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-poppins font-semibold text-[15px] text-white truncate leading-tight">
                          {entry.activityName}
                        </span>
                        <span className="text-[13px] font-poppins text-[#8A8A8A] mt-1 truncate">
                          {members[entry.memberId] ?? "Unbekannt"}
                        </span>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="font-mono font-bold text-white text-[15px]">
                          {entry.points.toFixed(1)} Pkt.
                        </span>
                        <span className="text-[11px] font-poppins text-[#8A8A8A]">
                          {new Date(entry.date as any).toLocaleDateString("de-DE", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    {entry.notes && (
                      <div className="flex gap-2.5 items-start">
                        <Info size={14} className="text-[#555] shrink-0 mt-0.5" />
                        <p className="text-[13px] font-poppins text-[#8A8A8A] leading-relaxed line-clamp-3">
                          {entry.notes}
                        </p>
                      </div>
                    )}

                    <TLine />

                    {/* Actions: Replay the native Layout */}
                    <div className="flex items-center gap-2">
                       <button className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-poppins font-semibold text-[#8A8A8A] bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                        <Pencil size={12} />
                        Bearb.
                      </button>
                      
                      <div className="ml-auto flex items-center gap-2">
                        <button 
                          onClick={() => setRejectId(entry.id)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-poppins font-semibold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/20 hover:bg-[#FF3B30]/20 transition-all"
                        >
                          <XCircle size={12} />
                          Ablehnen
                        </button>
                        <button 
                          onClick={() => approve(entry)}
                          disabled={processingId === entry.id}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-poppins font-bold text-[#071212] bg-[#00E0D1] hover:bg-[#00E0D1]/90 transition-all shadow-lg shadow-[#00E0D1]/20 disabled:opacity-50"
                        >
                          {processingId === entry.id ? (
                            <div className="h-3 w-3 animate-spin rounded-full border border-[#071212] border-t-transparent" />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          Genehmigen
                        </button>
                      </div>
                    </div>
                  </GlassSection>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Rejection Sheet Overlay (Desktop Modal) */}
      <AnimatePresence>
        {rejectId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-6 flex flex-col gap-5 border-[#FF3B30]/20">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                    <XCircle size={28} className="text-[#FF3B30]" />
                  </div>
                  <h3 className="font-poppins font-bold text-white text-lg">Eintrag ablehnen</h3>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">
                    Grund für die Ablehnung
                  </label>
                  <textarea
                    autoFocus
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Optionaler Grund…"
                    className="w-full h-24 rounded-2xl bg-white/5 border border-white/10 p-3 font-poppins text-sm text-white placeholder-[#444] focus:outline-none focus:border-white/20 resize-none"
                  />
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <TButton 
                    label="Ablehnen bestätigen" 
                    variant="danger" 
                    onClick={() => reject(rejectId)}
                    disabled={processingId === rejectId}
                  />
                  <TButton 
                    label="Abbrechen" 
                    variant="ghost" 
                    onClick={() => setRejectId(null)} 
                  />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
