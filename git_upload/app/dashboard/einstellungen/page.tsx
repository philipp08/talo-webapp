"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, LogOut, Building2, Info, Shield, User,
  ChevronRight, Check, AlertTriangle, Target,
  Euro, Calendar, Settings2, Bell, ShieldCheck, Dumbbell,
  AppWindow, Database, RefreshCcw
} from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { auth } from "@/lib/firebase/config";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import { SeasonType, calculateTargetPoints, Entry, MemberType } from "@/lib/firebase/models";
import { GlassSection, TLine, TAvatar, AmbientBackground, TButton, TBadge } from "@/app/components/ui/NativeUI";

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
    : 15;

  const progress = targetPts > 0 ? Math.min(1, approvedPts / targetPts) : 0;
  const progressColor = progress >= 1 ? "#8A8A8A" : progress >= 0.6 ? "#8A8A8A" : "#333333";

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
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-8 px-6 lg:px-10 pb-16">
        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-8 mb-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-poppins font-black text-white tracking-tighter">Einstellungen</h1>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Konto & Verein</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* LEFT: Profile Hero Card */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
           className="lg:sticky lg:top-6"
        >
          <GlassSection className="relative overflow-hidden">
             <div className="absolute inset-0 bg-white/5 opacity-40" />

             <div className="relative z-10 flex flex-col items-center">
                <div className="pt-8 pb-4 relative">
                   <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-[120px] h-[120px] rounded-full blur-2xl opacity-20" style={{ background: progressColor }} />
                   </div>

                   <div className="relative w-[104px] h-[104px] rounded-full flex items-center justify-center">
                      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
                        <motion.circle
                          cx="50" cy="50" r="46" fill="none" stroke={progressColor} strokeWidth="4" strokeLinecap="round"
                          initial={{ strokeDasharray: "0, 289" }}
                          animate={{ strokeDasharray: `${progress * 289}, 289` }}
                          transition={{ duration: 1.2, delay: 0.3 }}
                        />
                      </svg>
                      <TAvatar
                        name={`${currentMember.firstName} ${currentMember.lastName}`}
                        id={currentMember.id}
                        size={88}
                        imageUrl={currentMember.profileImageUrl}
                      />
                   </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 px-6 pb-2 text-center">
                   <h2 className="text-[22px] font-poppins font-bold text-white leading-tight">
                      {currentMember.firstName} {currentMember.lastName}
                   </h2>
                   <p className="text-[13px] font-poppins text-[#8A8A8A] leading-none mb-2">{currentMember.email}</p>

                   <div className="flex items-center gap-2 flex-wrap justify-center">
                      {isAdmin && <TBadge label="Admin" icon={ShieldCheck} color="white" />}
                      {isTrainer && !isAdmin && <TBadge label="Trainer" icon={Dumbbell} color="#8A8A8A" />}
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-[#8A8A8A]">
                        {currentMember.memberType}
                      </span>
                   </div>
                </div>

                <TLine />

                <div className="grid grid-cols-3 w-full divide-x divide-white/[0.08]">
                   <HeroStat value={approvedPts.toFixed(1)} label="Punkte" color={progressColor} />
                   <HeroStat value={`${Math.round(progress * 100)}%`} label="Ziel" color={progressColor} />
                   <HeroStat value={String(entries.length)} label="Einträge" color="#FFFFFF" />
                </div>
             </div>
          </GlassSection>
        </motion.div>

        {/* RIGHT: Sections */}
        <div className="lg:col-span-2 flex flex-col gap-6">
           {/* Account Section */}
           <div className="flex flex-col gap-3">
              <SectionHeader title="KONTO" icon={User} color="#FFFFFF" />
              <GlassSection>
                 <SettingsRow 
                   icon={Lock} 
                   label="Passwort ändern" 
                   sub="Reset-Link an deine E-Mail" 
                   color="#FFFFFF" 
                   onClick={sendPasswordReset}
                   loading={resetLoading}
                   success={resetSent}
                 />
                 <TLine className="ml-[68px]" />
                 <SettingsRow 
                   icon={Bell} 
                   label="Benachrichtigungen" 
                   sub="Systemeinstellungen" 
                   color="#7C6FE0" 
                 />
              </GlassSection>
           </div>

           {/* Club Section */}
           <div className="flex flex-col gap-3">
              <SectionHeader title={isAdmin ? "VEREIN VERWALTEN" : "VEREIN"} icon={Building2} color="#8A8A8A" />
              {isAdmin ? (
                <GlassSection className="p-4 flex flex-col gap-5">
                   <div className="flex flex-col gap-1.5 px-1">
                      <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">Vereinsname</label>
                      <input 
                        value={clubName}
                        onChange={(e) => setClubName(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 font-poppins text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                      />
                   </div>
                   <div className="flex flex-col gap-1.5 px-1">
                      <label className="text-[11px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-widest pl-1">Pflichtpunkte</label>
                      <input 
                        type="number"
                        value={requiredPoints}
                        onChange={(e) => setRequiredPoints(e.target.value)}
                        className="w-full rounded-2xl bg-white/5 border border-white/10 px-4 py-3 font-poppins text-sm text-white focus:outline-none focus:border-white/20 transition-all"
                      />
                   </div>
                   <TLine />
                   <div className="flex items-center justify-between px-1">
                      <div className="flex flex-col gap-0.5">
                         <span className="font-poppins font-semibold text-white text-sm">Genehmigungspflicht</span>
                         <span className="text-[11px] font-poppins text-[#8A8A8A]">{approvalRequired ? "Einträge brauchen Admin-Freigabe" : "Auto-Genehmigung"}</span>
                      </div>
                      <button 
                        onClick={() => setApprovalRequired(!approvalRequired)}
                        className={`w-11 h-6 rounded-full relative transition-all ${approvalRequired ? "bg-[#8A8A8A]" : "bg-white/10"}`}
                      >
                         <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${approvalRequired ? "left-6" : "left-1"}`} />
                      </button>
                   </div>
                   <TButton label={savingClub ? "Speichert…" : (clubSaved ? "Gespeichert!" : "Änderungen speichern")} onClick={saveClub} disabled={savingClub} />
                </GlassSection>
              ) : (
                <GlassSection>
                   <SettingsRow icon={Building2} label={currentClub?.name ?? "–"} sub="Dein aktiver Verein" color="#8A8A8A" chevron={false} />
                   <TLine className="ml-[68px]" />
                   <SettingsRow icon={Target} label={`${currentClub?.requiredPoints ?? 15} Punkte`} sub="Jahrespflichtpunkte" color="#FFFFFF" chevron={false} />
                   <TLine className="ml-[68px]" />
                   <SettingsRow icon={Calendar} label={currentClub?.seasonType ?? "–"} sub="Saisontyp" color="#7C6FE0" chevron={false} />
                </GlassSection>
              )}
           </div>

           {/* App Info Section */}
           <div className="flex flex-col gap-3">
              <SectionHeader title="APP-INFO" icon={Info} color="#8A8A8A" />
              <GlassSection>
                 <SettingsRow icon={AppWindow} label="Neu gelauncht (Web)" sub="Talo – Jeder Beitrag zählt" color="#8A8A8A" chevron={false} />
                 <TLine className="ml-[68px]" />
                 <SettingsRow icon={Database} label="Backend" sub="Synced with iOS App" color="#8A8A8A" chevron={false} />
              </GlassSection>
           </div>

           {/* Action Zone */}
           <div className="flex flex-col gap-3 pt-4">
              <SectionHeader title="KONTO-AKTIONEN" icon={AlertTriangle} color="#333333" />
              <GlassSection className="bg-red-500/[0.03] border-red-500/10">
                 <SettingsRow 
                   icon={LogOut} 
                   label="Abmelden" 
                   sub="Von diesem Gerät ausloggen" 
                   color="#333333" 
                   onClick={() => signOut(auth)}
                 />
              </GlassSection>
           </div>
        </div>

        </div>{/* end grid */}
      </div>
    </div>
  );
}

function HeroStat({ value, label, color }: { value: string, label: string, color?: string }) {
  return (
    <div className="flex flex-col items-center py-4 gap-0.5">
       <span className="font-mono font-bold text-[18px]" style={{ color }}>{value}</span>
       <span className="text-[10px] font-poppins font-bold text-[#8A8A8A] uppercase tracking-wider">{label}</span>
    </div>
  );
}

function SectionHeader({ title, icon: Icon, color }: { title: string, icon: any, color: string }) {
  return (
    <div className="flex items-center gap-2 px-2 pb-1">
       <Icon size={12} style={{ color }} strokeWidth={3} />
       <span className="text-[10px] font-poppins font-bold text-[#8A8A8A] tracking-[0.15em] uppercase">{title}</span>
    </div>
  );
}

function SettingsRow({ icon: Icon, label, sub, color, onClick, chevron = true, loading = false, success = false }: { icon: any, label: string, sub: string, color: string, onClick?: () => void, chevron?: boolean, loading?: boolean, success?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-4 px-4 py-3.5 transition-all active:bg-white/5 group text-left"
    >
       <div 
         className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-opacity group-active:opacity-60"
         style={{ background: `${color}15`, color }}
       >
          <Icon size={18} strokeWidth={2.5} />
       </div>
       <div className="flex-1 flex flex-col min-w-0">
          <span className="font-poppins font-semibold text-white text-[15px] leading-tight">{label}</span>
          <span className="text-[12px] font-poppins text-[#8A8A8A] truncate">{sub}</span>
       </div>
       {loading ? (
         <RefreshCcw size={14} className="text-[#8A8A8A] animate-spin" />
       ) : success ? (
         <Check size={16} className="text-[#8A8A8A]" />
       ) : chevron && (
         <ChevronRight size={14} className="text-[#383838]" />
       )}
    </button>
  );
}
