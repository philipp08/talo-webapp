"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, CheckSquare, Edit2, X, ChevronRight } from "lucide-react";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { Entry, ActivityCategory } from "../../../lib/firebase/models";

const categoryColors: Record<string, { bg: string; text: string }> = {
  A: { bg: "bg-red-500/10", text: "text-red-400" },
  B: { bg: "bg-blue-500/10", text: "text-blue-400" },
  C: { bg: "bg-green-500/10", text: "text-green-400" },
  S: { bg: "bg-purple-500/10", text: "text-purple-400" },
};

export default function ApprovalsPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [pendingEntries, setPendingEntries] = useState<Entry[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [rejectTarget, setRejectTarget] = useState<Entry | null>(null);
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

  const rejectWithReason = async () => {
    if (!currentClub || !rejectTarget) return;
    setProcessingId(rejectTarget.id);
    await FirebaseManager.updateEntryStatus(currentClub.id, rejectTarget.id, "Abgelehnt", rejectReason);
    setRejectTarget(null);
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
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-poppins font-bold text-white">Genehmigungen</h1>
        <p className="text-[#8A8A8A] font-poppins text-sm mt-1">
          {loading ? "Laden…" : `${pendingEntries.length} ausstehende Einträge`}
        </p>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      ) : pendingEntries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center p-16 gap-4"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
            <CheckSquare size={36} className="text-green-500" />
          </div>
          <h2 className="font-poppins font-bold text-xl text-white">Alles erledigt!</h2>
          <p className="text-[#8A8A8A] font-poppins text-sm">Keine ausstehenden Einträge.</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="flex flex-col gap-3">
            {pendingEntries.map((entry, idx) => {
              const colors = categoryColors[entry.activityCategory as string] ?? categoryColors.B;
              const isProcessing = processingId === entry.id;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                  transition={{ delay: idx * 0.05 }}
                  className="rounded-2xl border border-[#ffffff0f] bg-[#111111] p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  {/* Category Badge + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold font-poppins text-sm shrink-0 ${colors.bg} ${colors.text}`}>
                      {entry.activityCategory}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-poppins font-semibold text-white truncate">{entry.activityName}</span>
                      <span className="text-xs font-poppins text-[#8A8A8A] mt-0.5">
                        {members[entry.memberId] ?? "Unbekannt"} · {new Date(entry.date as any).toLocaleDateString("de-DE")}
                      </span>
                      {entry.notes && (
                        <span className="text-xs font-poppins text-[#666] mt-0.5 truncate">{entry.notes}</span>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <span className="font-poppins font-bold text-white text-lg shrink-0">
                    +{entry.points.toFixed(1)} Pkt.
                  </span>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setRejectTarget(entry)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                    >
                      <XCircle size={16} />
                      Ablehnen
                    </button>
                    <button
                      onClick={() => approve(entry)}
                      disabled={isProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-poppins font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 transition-colors disabled:opacity-40"
                    >
                      {isProcessing ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
                      ) : (
                        <CheckCircle size={16} />
                      )}
                      Genehmigen
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>
      )}

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setRejectTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-bold text-white text-lg">Eintrag ablehnen</h3>
                <button
                  onClick={() => setRejectTarget(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={18} className="text-[#8A8A8A]" />
                </button>
              </div>
              <p className="text-sm font-poppins text-[#8A8A8A]">
                <span className="text-white">{rejectTarget.activityName}</span> von{" "}
                {members[rejectTarget.memberId] ?? "Unbekannt"}
              </p>
              <div>
                <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider mb-2 block">
                  Ablehnungsgrund (optional)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Grund für die Ablehnung…"
                  rows={3}
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20 resize-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setRejectTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={rejectWithReason}
                  disabled={processingId === rejectTarget.id}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors disabled:opacity-40"
                >
                  Ablehnen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
