"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, X, Sparkles, Calendar } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Entry, Member, getMemberFullName, getPlanFeatures, isLightColor } from "@/lib/firebase/models";
import { GlassSection, TLine, TCatBadge, TAvatar, TButton, TStatusBadge } from "@/app/components/ui/NativeUI";
import { useI18n } from "@/lib/i18n/I18nContext";

export default function GenehmigungPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub   = useAppStore((s) => s.currentClub);

  const planFeatures  = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures("starter");
  const accentRaw     = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent        = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight   = isLightColor(accent);

  const [entries,  setEntries]  = useState<Entry[]>([]);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Entry | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [saving,       setSaving]       = useState(false);

  const { t } = useI18n();
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
        <p style={{ color: "#52525B" }} className="font-poppins text-sm">
          {t("genehmigungen.adminOnly")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
            <div className="flex items-center gap-4">
              {currentClub?.logoUrl && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2" style={{ borderColor: `${accent}30` }}>
                  <img src={currentClub.logoUrl} alt={currentClub.name} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{t("genehmigungen.title")}</h1>
                <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name} · {t("genehmigungen.subtitle")}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {pending.length > 0 && (
                <span className="text-[11px] font-poppins font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(255,149,0,0.15)", color: "#FF9500" }}>
                  {pending.length} {t("genehmigungen.pending")}
                </span>
              )}
              {entries.filter(e => e.status === "Genehmigt").length > 0 && (
                <span className="text-[11px] font-poppins font-bold px-3 py-1.5 rounded-full"
                      style={{ background: "rgba(52,199,89,0.12)", color: "#34C759" }}>
                  {entries.filter(e => e.status === "Genehmigt").length} {t("genehmigungen.approved")}
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
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
            <p className="font-poppins font-bold text-[18px] text-[#0A0A0A] mb-2">{t("genehmigungen.allDone")}</p>
            <p className="text-[13px]" style={{ color: "#52525B" }}>
              {t("genehmigungen.noPending")}
            </p>
          </motion.div>

        ) : (
          /* Entry list */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
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
                             style={{ background: "rgba(0,0,0,0.07)" }} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-poppins font-semibold text-[14px] text-[#0A0A0A] leading-tight truncate">
                          {member ? getMemberFullName(member) : t("genehmigungen.unknownMember")}
                        </p>
                        <p className="text-[11px] mt-0.5" style={{ color: "#52525B" }}>
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
                        <p className="font-poppins font-semibold text-[14px] text-[#0A0A0A] truncate">
                          {entry.activityName}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar size={11} style={{ color: "#71717A" }} />
                          <span className="text-[11px]" style={{ color: "#52525B" }}>{dateStr}</span>
                        </div>
                      </div>
                      <span className="font-mono font-black text-[20px] text-[#0A0A0A] shrink-0">
                        +{entry.points.toFixed(1)}
                      </span>
                    </div>

                    {/* Notes (wenn vorhanden) */}
                    {entry.notes && (
                      <>
                        <TLine />
                        <div className="px-4 py-3">
                          <p className="text-[12px] font-poppins italic" style={{ color: "#52525B" }}>
                            &quot;{entry.notes}&quot;
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
                        {t("common.reject")}
                      </button>

                      {/* Genehmigen */}
                      <button
                        onClick={() => approve(entry)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] font-poppins font-semibold text-[13px] transition-all hover:opacity-80"
                        style={{ background: "rgba(52,199,89,0.12)", color: "#34C759" }}
                      >
                        <CheckCircle size={15} />
                        {t("common.approve")}
                      </button>
                    </div>
                  </GlassSection>
                </motion.div>
              );
            })}
          </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Reject Modal ──────────────────────────────────────────── */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {rejectTarget && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) setRejectTarget(null); }}
              className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4"
            >
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-sm max-h-[90dvh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl shadow-[0_-8px_32px_rgba(0,0,0,0.08)] sm:shadow-[0_20px_60px_rgba(0,0,0,0.18)] pb-[env(safe-area-inset-bottom)] sm:pb-0"
              >
                <div className="p-6 flex flex-col gap-4 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-black/15 sm:hidden" aria-hidden="true" />
                  <div className="flex items-center justify-between pt-2 sm:pt-0">
                    <p className="font-poppins font-bold text-[17px] text-[#0A0A0A]">{t("genehmigungen.rejectTitle")}</p>
                    <button
                      onClick={() => setRejectTarget(null)}
                      aria-label="Schließen"
                      className="flex items-center justify-center min-w-[44px] min-h-[44px] -mr-2"
                    >
                      <X size={18} style={{ color: "#52525B" }} />
                    </button>
                  </div>

                  <p className="text-[13px]" style={{ color: "#52525B" }}>
                    <span className="text-[#0A0A0A] font-semibold">{rejectTarget.activityName}</span>
                    {" – "}
                    {memberMap.get(rejectTarget.memberId)
                      ? getMemberFullName(memberMap.get(rejectTarget.memberId)!)
                      : "Unbekannt"}
                  </p>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest pl-0.5"
                           style={{ color: "#71717A" }}>
                      {t("genehmigungen.rejectReason")}
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder={t("genehmigungen.rejectHint")}
                      rows={3}
                      className="w-full rounded-2xl px-4 py-3 text-[14px] font-poppins text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none resize-none transition-all"
                      style={{
                        background: "rgba(0,0,0,0.05)",
                        border: "1px solid rgba(0,0,0,0.09)",
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
                      {saving ? t("genehmigungen.rejecting") : t("common.reject")}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
