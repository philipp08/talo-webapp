"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X, Sparkles, Calendar, Pencil, Check } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, Member, getMemberFullName } from "@/lib/firebase/models";
import { GlassSection, TLine, TCatBadge, TAvatar, TButton, TStatusBadge } from "@/app/components/ui/NativeUI";

export default function GenehmigungPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub   = useAppStore((s) => s.currentClub);

  const [entries,  setEntries]  = useState<Entry[]>([]);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Entry | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [saving,       setSaving]       = useState(false);

  const isAdmin = currentMember?.isAdmin === true;

  useEffect(() => {
    if (!currentClub) return;
    const unsubEntries = FirebaseManager.listenToEntries(currentClub.id, (e) => {
      setEntries(e);
      setLoading(false);
    });
    const unsubMembers = FirebaseManager.listenToMembers(currentClub.id, setMembers);
    return () => { unsubEntries(); unsubMembers(); };
  }, [currentClub]);

  const memberMap = useMemo(() => {
    const m = new Map<string, Member>();
    members.forEach((mem) => m.set(mem.id, mem));
    return m;
  }, [members]);

  const pending = useMemo(
    () => entries.filter((e) => e.status === "Ausstehend"),
    [entries]
  );

  async function approve(entry: Entry) {
    if (!currentClub) return;
    await FirebaseManager.updateEntryStatus(currentClub.id, entry.id, "Genehmigt");
  }

  async function rejectConfirm() {
    if (!currentClub || !rejectTarget) return;
    setSaving(true);
    try {
      await FirebaseManager.updateEntryStatus(
        currentClub.id,
        rejectTarget.id,
        "Abgelehnt",
        rejectReason.trim() || undefined
      );
      setRejectTarget(null);
      setRejectReason("");
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p style={{ color: "#8A8A8A" }} className="font-poppins text-sm">
          Nur Admins können Genehmigungen verwalten.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 p-6 max-w-2xl mx-auto flex flex-col gap-5 pb-24">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-end justify-between mb-1">
            <h1 className="text-[24px] font-poppins font-bold text-white tracking-tight">
              Genehmigungen
            </h1>
            {pending.length > 0 && (
              <span className="text-[11px] font-poppins font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(255,149,0,0.15)", color: "#FF9500" }}>
                {pending.length} ausstehend
              </span>
            )}
          </div>
          <p className="text-[12px] font-poppins" style={{ color: "#555" }}>
            Einträge prüfen und freigeben
          </p>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-white/10 border-t-white animate-spin" />
          </div>

        ) : pending.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                 style={{ background: "rgba(52,199,89,0.1)" }}>
              <Sparkles size={28} style={{ color: "#34C759" }} />
            </div>
            <p className="font-poppins font-bold text-[18px] text-white mb-2">Alles erledigt!</p>
            <p className="text-[13px]" style={{ color: "#8A8A8A" }}>
              Keine ausstehenden Einträge.
            </p>
          </motion.div>

        ) : (
          /* Entry list */
          <AnimatePresence mode="popLayout">
            {pending.map((entry, idx) => {
              const member = memberMap.get(entry.memberId);
              const dateStr = entry.date instanceof Date
                ? entry.date.toLocaleDateString("de-DE", { day: "2-digit", month: "short", year: "numeric" })
                : "–";

              return (
                <motion.div
                  key={entry.id}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <GlassSection>
                    {/* Top: Member + activity info */}
                    <div className="flex items-start gap-3.5 p-4">
                      {member ? (
                        <TAvatar name={getMemberFullName(member)} id={member.id} size={40} />
                      ) : (
                        <div className="w-10 h-10 rounded-full shrink-0"
                             style={{ background: "rgba(255,255,255,0.06)" }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-[14px] text-white leading-tight truncate">
                          {member ? getMemberFullName(member) : "Unbekanntes Mitglied"}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#8A8A8A" }}>
                          {member?.memberType ?? ""}
                        </p>
                      </div>
                      <TStatusBadge status={entry.status as string} />
                    </div>

                    <TLine />

                    {/* Activity row */}
                    <div className="flex items-center gap-3 px-4 py-3.5">
                      <TCatBadge category={entry.activityCategory as string} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-[14px] text-white truncate">
                          {entry.activityName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar size={11} style={{ color: "#555" }} />
                          <span className="text-[11px]" style={{ color: "#8A8A8A" }}>{dateStr}</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-[20px] text-white shrink-0">
                        +{entry.points.toFixed(1)}
                      </span>
                    </div>

                    {/* Notes (wenn vorhanden) */}
                    {entry.notes && (
                      <>
                        <TLine />
                        <div className="px-4 py-3">
                          <p className="text-[12px] font-poppins italic" style={{ color: "#8A8A8A" }}>
                            „{entry.notes}"
                          </p>
                        </div>
                      </>
                    )}

                    <TLine />

                    {/* Actions */}
                    <div className="flex items-center gap-2 p-3">
                      {/* Ablehnen */}
                      <button
                        onClick={() => { setRejectTarget(entry); setRejectReason(""); }}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-poppins font-semibold text-[13px] transition-all hover:opacity-80"
                        style={{ background: "rgba(255,69,58,0.1)", color: "#FF453A" }}
                      >
                        <XCircle size={15} />
                        Ablehnen
                      </button>

                      {/* Genehmigen */}
                      <button
                        onClick={() => approve(entry)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-poppins font-semibold text-[13px] transition-all hover:opacity-80"
                        style={{ background: "rgba(52,199,89,0.12)", color: "#34C759" }}
                      >
                        <CheckCircle size={15} />
                        Genehmigen
                      </button>
                    </div>
                  </GlassSection>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────── */}
      <AnimatePresence>
        {rejectTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
               style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="font-poppins font-bold text-[17px] text-white">Eintrag ablehnen</p>
                  <button onClick={() => setRejectTarget(null)}>
                    <X size={18} style={{ color: "#8A8A8A" }} />
                  </button>
                </div>

                <p className="text-[13px]" style={{ color: "#8A8A8A" }}>
                  <span className="text-white font-semibold">{rejectTarget.activityName}</span>
                  {" – "}
                  {memberMap.get(rejectTarget.memberId)
                    ? getMemberFullName(memberMap.get(rejectTarget.memberId)!)
                    : "Unbekannt"}
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest pl-0.5"
                         style={{ color: "#555" }}>
                    Ablehnungsgrund (optional)
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="z.B. Nachweis fehlt"
                    rows={3}
                    className="w-full rounded-2xl px-4 py-3 text-[14px] font-poppins text-white placeholder-[#444] focus:outline-none resize-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <TButton label="Abbrechen" variant="ghost" onClick={() => setRejectTarget(null)} className="flex-1" />
                  <button
                    onClick={rejectConfirm}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full font-poppins font-semibold text-[14px] transition-all disabled:opacity-40"
                    style={{ background: "rgba(255,69,58,0.15)", color: "#FF453A" }}
                  >
                    <XCircle size={15} />
                    {saving ? "Wird abgelehnt…" : "Ablehnen"}
                  </button>
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
