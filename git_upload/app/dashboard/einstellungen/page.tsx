"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, LogOut, Building2, Info, Shield, User,
  ChevronRight, Check, AlertTriangle,
} from "lucide-react";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { auth } from "../../../lib/firebase/config";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { SeasonType, calculateTargetPoints, Entry } from "../../../lib/firebase/models";

const SEASON_TYPES = [
  SeasonType.Calendar,
  SeasonType.Club,
  SeasonType.School,
];

export default function SettingsPage() {
  const currentMember = useAppStore((state) => state.currentMember);
  const currentClub = useAppStore((state) => state.currentClub);
  const setCurrentClub = useAppStore((state) => state.setCurrentClub);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Club edit state
  const [clubName, setClubName] = useState(currentClub?.name ?? "");
  const [requiredPoints, setRequiredPoints] = useState(String(currentClub?.requiredPoints ?? 15));
  const [seasonType, setSeasonType] = useState<string>(currentClub?.seasonType ?? SeasonType.Calendar);
  const [approvalRequired, setApprovalRequired] = useState(currentClub?.approvalRequired ?? true);
  const [savingClub, setSavingClub] = useState(false);
  const [clubSaved, setClubSaved] = useState(false);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;
  const canEditClub = isAdmin;

  // Load own entries for stats
  useEffect(() => {
    if (!currentClub || !currentMember) return;
    const unsub = FirebaseManager.listenToEntries(currentClub.id, (all) => {
      setEntries(all.filter((e) => e.memberId === currentMember.id));
    });
    return unsub;
  }, [currentClub, currentMember]);

  // Sync club form when club changes
  useEffect(() => {
    if (!currentClub) return;
    setClubName(currentClub.name);
    setRequiredPoints(String(currentClub.requiredPoints));
    setSeasonType(currentClub.seasonType);
    setApprovalRequired(currentClub.approvalRequired);
  }, [currentClub]);

  const approvedPts = entries
    .filter((e) => e.status === "Genehmigt")
    .reduce((s, e) => s + e.points, 0);

  const targetPts = currentMember && currentClub
    ? calculateTargetPoints(currentMember, currentClub.requiredPoints)
    : 0;

  const progress = targetPts > 0 ? Math.min(1, approvedPts / targetPts) : 1;
  const progressColor =
    progress >= 1 ? "#34C759" : progress >= 0.6 ? "#FF9500" : "#FF3B30";

  const sendPasswordReset = async () => {
    if (!currentMember?.email) return;
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, currentMember.email);
      setResetSent(true);
    } catch {}
    setResetLoading(false);
  };

  const saveClub = async () => {
    if (!currentClub) return;
    setSavingClub(true);
    try {
      const updates = {
        name: clubName.trim(),
        requiredPoints: parseFloat(requiredPoints) || 15,
        seasonType,
        approvalRequired,
      };
      await FirebaseManager.updateClub(currentClub.id, updates);
      setCurrentClub({ ...currentClub, ...updates });
      setClubSaved(true);
      setTimeout(() => setClubSaved(false), 2500);
    } finally {
      setSavingClub(false);
    }
  };

  if (!currentMember) return null;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-2xl mx-auto pb-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-poppins font-bold text-white">Einstellungen</h1>
      </motion.div>

      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-[#ffffff0f] bg-[#111111] overflow-hidden"
      >
        {/* Avatar + Info */}
        <div className="flex flex-col items-center gap-3 pt-8 pb-6 px-6">
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold font-poppins"
            style={{
              background: "linear-gradient(135deg, #1A1A1A, #2A2A2A)",
              boxShadow: `0 0 0 3px ${progressColor}40`,
              outline: `2px solid ${progressColor}`,
            }}
          >
            {currentMember.firstName.charAt(0)}
            {currentMember.lastName.charAt(0)}
          </div>

          <div className="text-center">
            <h2 className="font-poppins font-bold text-white text-xl">
              {currentMember.firstName} {currentMember.lastName}
            </h2>
            <p className="text-sm font-poppins text-[#8A8A8A] mt-0.5">{currentMember.email}</p>
          </div>

          {/* Role Badges */}
          <div className="flex gap-2 flex-wrap justify-center">
            {isAdmin && (
              <span className="flex items-center gap-1 text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-white/10 text-white border border-white/20">
                <Shield size={11} /> Admin
              </span>
            )}
            {isTrainer && (
              <span className="flex items-center gap-1 text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                Trainer
              </span>
            )}
            <span className="text-xs font-poppins font-semibold px-3 py-1 rounded-full bg-white/5 text-[#8A8A8A] border border-white/10">
              {currentMember.memberType}
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="border-t border-[#ffffff0f] grid grid-cols-3 divide-x divide-[#ffffff0f]">
          <StatItem value={approvedPts.toFixed(1)} label="Punkte" color={progressColor} />
          <StatItem value={`${Math.round(progress * 100)}%`} label="Ziel" color={progressColor} />
          <StatItem value={String(entries.length)} label="Einträge" color="#64D2FF" />
        </div>
      </motion.div>

      {/* Account Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SectionLabel icon={<User size={14} />} label="KONTO" />
        <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
          <button
            onClick={sendPasswordReset}
            disabled={resetSent || resetLoading}
            className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#64D2FF]/10 flex items-center justify-center">
                <Lock size={16} className="text-[#64D2FF]" />
              </div>
              <div className="text-left">
                <p className="font-poppins font-medium text-white text-sm">Passwort ändern</p>
                <p className="font-poppins text-xs text-[#8A8A8A]">Reset-Link an deine E-Mail</p>
              </div>
            </div>
            {resetSent ? (
              <span className="text-xs font-poppins text-green-400 flex items-center gap-1">
                <Check size={14} /> Gesendet
              </span>
            ) : resetLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <ChevronRight size={16} className="text-[#8A8A8A]" />
            )}
          </button>
        </div>
      </motion.div>

      {/* Club Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SectionLabel icon={<Building2 size={14} />} label="VEREIN" />
        <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] p-5 flex flex-col gap-4">
          {canEditClub ? (
            <>
              {/* Club Name */}
              <FormField label="Vereinsname">
                <input
                  value={clubName}
                  onChange={(e) => setClubName(e.target.value)}
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
                />
              </FormField>

              {/* Required Points */}
              <FormField label="Pflichtpunkte pro Mitglied">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={requiredPoints}
                  onChange={(e) => setRequiredPoints(e.target.value)}
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-2.5 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
                />
              </FormField>

              {/* Season Type */}
              <FormField label="Saisontyp">
                <div className="rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] overflow-hidden">
                  {SEASON_TYPES.map((s, idx) => (
                    <div key={s}>
                      <button
                        onClick={() => setSeasonType(s)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-poppins transition-colors ${
                          seasonType === s ? "text-white bg-white/5" : "text-[#8A8A8A] hover:bg-white/5"
                        }`}
                      >
                        <span>{s}</span>
                        {seasonType === s && <Check size={15} className="text-[#64D2FF]" />}
                      </button>
                      {idx < SEASON_TYPES.length - 1 && (
                        <div className="border-b border-[#ffffff0a] mx-4" />
                      )}
                    </div>
                  ))}
                </div>
              </FormField>

              {/* Approval Required */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-poppins font-medium text-white text-sm">Genehmigung erforderlich</p>
                  <p className="font-poppins text-xs text-[#8A8A8A]">Einträge müssen genehmigt werden</p>
                </div>
                <button
                  onClick={() => setApprovalRequired(!approvalRequired)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    approvalRequired ? "bg-[#64D2FF]" : "bg-[#333]"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      approvalRequired ? "translate-x-6" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Save Button */}
              <button
                onClick={saveClub}
                disabled={savingClub}
                className="w-full py-3 rounded-xl font-poppins font-semibold text-sm transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{
                  background: clubSaved ? "#34C759" : "white",
                  color: "#080808",
                }}
              >
                {clubSaved ? (
                  <><Check size={16} /> Gespeichert</>
                ) : savingClub ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#080808]/30 border-t-[#080808]" />
                ) : (
                  "Änderungen speichern"
                )}
              </button>
            </>
          ) : (
            /* Non-admin: read-only club info */
            <div className="flex flex-col gap-3">
              <InfoRow label="Verein" value={currentClub?.name ?? "–"} />
              <div className="border-b border-[#ffffff0a]" />
              <InfoRow label="Pflichtpunkte" value={`${currentClub?.requiredPoints ?? "–"} Pkt.`} />
              <div className="border-b border-[#ffffff0a]" />
              <InfoRow label="Saisontyp" value={currentClub?.seasonType ?? "–"} />
              <div className="border-b border-[#ffffff0a]" />
              <InfoRow
                label="Genehmigung"
                value={currentClub?.approvalRequired ? "Erforderlich" : "Nicht erforderlich"}
              />
            </div>
          )}
        </div>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionLabel icon={<Info size={14} />} label="APP-INFO" />
        <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
          <div className="px-5 py-4 flex flex-col gap-3">
            <InfoRow label="App" value="Talo – Jeder Beitrag zählt" />
            <div className="border-b border-[#ffffff0a]" />
            <InfoRow label="Plattform" value="Web" />
            <div className="border-b border-[#ffffff0a]" />
            <InfoRow label="Backend" value="Firebase / Firestore" />
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <SectionLabel icon={<AlertTriangle size={14} />} label="KONTO-AKTIONEN" />
        <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden">
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-500/10 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
              <LogOut size={16} className="text-red-400" />
            </div>
            <span className="font-poppins font-medium text-red-400 text-sm">Abmelden</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <span className="text-[#8A8A8A]">{icon}</span>
      <span className="text-xs font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest">
        {label}
      </span>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-poppins text-[#8A8A8A]">{label}</span>
      <span className="text-sm font-poppins text-white">{value}</span>
    </div>
  );
}

function StatItem({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="flex flex-col items-center py-4 gap-0.5">
      <span className="font-poppins font-bold text-lg" style={{ color }}>
        {value}
      </span>
      <span className="text-[10px] font-poppins text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}
