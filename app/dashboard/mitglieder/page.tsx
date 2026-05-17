"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trophy,
  ChevronRight, Shield, UserPlus,
  Target, MoreVertical,
  X, Mail, User, Check, Layers, Filter, Swords, Trash, Plus, Calendar, Clock
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry, ClubGroup, getPlanFeatures, isLightColor, Duel, DuelGroupConfig } from "@/lib/firebase/models";
import { AuthService } from "@/lib/firebase/authService";
import { EmailService } from "@/lib/firebase/emailService";
import { TAvatar, GlassSection, TLine, TSearchBar } from "@/app/components/ui/NativeUI";
import { useI18n } from "@/lib/i18n/I18nContext";

const memberTypeOrder = [
  MemberType.Active,
  MemberType.Board,
  MemberType.Passive,
  MemberType.Youth,
];

const memberTypeLabel: Record<string, string> = {
  [MemberType.Active]: "Aktive Mitglieder",
  [MemberType.Board]: "Vorstand",
  [MemberType.Passive]: "Passive Mitglieder",
  [MemberType.Youth]: "Jugend",
};

type ViewMode = "administration" | "leaderboard";
type LeaderboardItem = {
  member: Member;
  approved: number;
  target: number;
  progress: number;
};

export default function MembersPage() {
  const [duels, setDuels] = useState<Duel[]>([]);

  const { t } = useI18n();
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);


  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string | "all">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("administration");
  
  // Invite member state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteType, setInviteType] = useState<MemberType | string>(MemberType.Active);
  const [inviteGroupId, setInviteGroupId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [userAlreadyExisted, setUserAlreadyExisted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const isAdmin = currentMember?.isAdmin === true;
  const canViewMembers = isAdmin || currentMember?.isTrainer === true;

  const closeInviteModal = () => {
    setIsInviteOpen(false);
    setInviteEmail("");
    setInviteFirstName("");
    setInviteLastName("");
    setInviteType(MemberType.Active);
    setInviteGroupId("");
    setIsCreating(false);
    setIsSendingMail(false);
    setMailSent(false);
    setUserAlreadyExisted(false);
    setErrorMessage(null);
    setGeneratedPassword(null);
  };
  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
  const accentRaw     = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent        = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight   = isLightColor(accent);
  const isLimitReached = members.length >= planFeatures.maxMembers;

  useEffect(() => {
    if (!currentClub) return;

    const unsubMembers = FirebaseManager.listenToMembers(currentClub.id, (ms) => {
      setMembers(ms);
      setLoading(false);
    });

    const unsubEntries = FirebaseManager.listenToEntries(currentClub.id, (es) => {
      setEntries(es);
    });

    const unsubDuels = FirebaseManager.listenToDuels(currentClub.id, (ds) => {
      setDuels(ds);
    });

    return () => { unsubMembers(); unsubEntries(); unsubDuels(); };
  }, [currentClub]);

  useEffect(() => {
    if (!currentClub || !planFeatures.hasGroups) return;
    return FirebaseManager.listenToGroups(currentClub.id, setGroups);
  }, [currentClub, planFeatures.hasGroups]);

  const visibleGroups = useMemo(
    () => (planFeatures.hasGroups ? groups : []),
    [groups, planFeatures.hasGroups]
  );

  const availableMemberTypes = useMemo(() => {
    const types: string[] = [...memberTypeOrder];
    if (planFeatures.hasCustomMemberTypes && currentClub?.customMemberTypes) {
      currentClub.customMemberTypes.forEach(c => types.push(c.name));
    }
    return types;
  }, [planFeatures.hasCustomMemberTypes, currentClub?.customMemberTypes]);

  const filtered = useMemo(() => {
    let list = members;
    if (planFeatures.hasAdvancedFilters && memberTypeFilter !== "all") {
      list = list.filter((m) => m.memberType === memberTypeFilter);
    }
    if (planFeatures.hasAdvancedFilters && groupFilter !== "all") {
      list = list.filter((m) => (m.groupId || "") === groupFilter);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, searchText, memberTypeFilter, groupFilter, planFeatures.hasAdvancedFilters]);

  const leaderboard = useMemo(() => {
    return members
      .filter((m) => m.memberType !== MemberType.Passive)
      .map((m) => {
        const approved = entries
          .filter((e) => e.memberId === m.id && e.status === "Genehmigt")
          .reduce((sum, e) => sum + e.points, 0);
        const target = currentClub ? calculateTargetPoints(m, currentClub) : 15;
        const progress = target > 0 ? Math.min(1, approved / target) : 1;
        return { member: m, approved, target, progress };
      })
      .sort((a, b) => b.approved - a.approved);
  }, [members, entries, currentClub]);

  const groupNameById = useMemo(
    () => new Map(visibleGroups.map((group) => [group.id, group.name])),
    [visibleGroups]
  );

  if (!canViewMembers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#52525B] font-poppins font-bold uppercase tracking-widest bg-black/[0.04] px-8 py-4 rounded-full">{t("common.noAccess")}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        
        {/* Header Action Bar */}
        <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentClub?.logoUrl && (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2" style={{ borderColor: `${accent}30` }}>
                  <img src={currentClub.logoUrl} alt={currentClub.name} className="h-full w-full object-contain" />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">{t("mitglieder.title")}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name}</p>
                  <div className="px-2 py-0.5 bg-black/[0.05] border border-black/10 rounded-full">
                    <p className="text-[#52525B] font-bold text-[10px] uppercase tracking-widest">{members.length} / {planFeatures.maxMembers} Mitglieder</p>
                  </div>
                </div>
              </div>
            </div>
            {isAdmin && (
              <button
                onClick={() => {
                  if (isLimitReached) {
                    alert(`Das Mitgliederlimit (${planFeatures.maxMembers}) deines aktuellen Plans ist erreicht. Bitte im Bereich 'Einstellungen' eine neue Lizenz aktivieren.`);
                    return;
                  }
                  setIsInviteOpen(true);
                }}
                style={isLimitReached ? undefined : { backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }}
                className={`shrink-0 flex items-center gap-2 px-4 py-3 md:px-6 rounded-2xl border transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/5 ${
                  isLimitReached ? "bg-black/[0.05] text-[#71717A] border-black/10 cursor-not-allowed" : "hover:opacity-95 border-black/10 text-white"
                }`}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">{isLimitReached ? t("common.limitReached") : t("mitglieder.addMember")}</span>
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start">
            {(["administration", "leaderboard"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2.5 md:px-8 md:py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${
                  viewMode === mode ? "bg-[#0A0A0A] text-white shadow-2xl" : "text-[#71717A] hover:text-[#0A0A0A]"
                }`}
              >
                {mode === "administration" ? t("mitglieder.administration") : t("mitglieder.leaderboard")}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
             <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/5 border-t-[#0A0A0A]" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
             {viewMode === "administration" ? (
               <motion.div 
                 key="admin"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 className="space-y-8"
               >
                 <div className="flex flex-col gap-3">
                   <div className="w-full max-w-md">
                     <TSearchBar value={searchText} onChange={setSearchText} placeholder={t("mitglieder.search")} />
                   </div>
                   {planFeatures.hasAdvancedFilters && (
                     <div className="flex flex-wrap gap-2">
                       <FilterPill
                         label="Alle Typen"
                         selected={memberTypeFilter === "all"}
                         onClick={() => setMemberTypeFilter("all")}
                       />
                       {availableMemberTypes.map((type) => (
                         <FilterPill
                           key={type}
                           label={type}
                           selected={memberTypeFilter === type}
                           onClick={() => setMemberTypeFilter(type)}
                         />
                       ))}
                       {planFeatures.hasGroups && (
                         <>
                           <FilterPill
                             label="Alle Gruppen"
                             selected={groupFilter === "all"}
                             onClick={() => setGroupFilter("all")}
                           />
                           {visibleGroups.map((group) => (
                             <FilterPill
                               key={group.id}
                               label={group.name}
                               selected={groupFilter === group.id}
                               onClick={() => setGroupFilter(group.id)}
                             />
                           ))}
                         </>
                       )}
                     </div>
                   )}
                   {!planFeatures.hasAdvancedFilters && (
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                       <Filter size={12} /> Erweiterte Filter ab Club
                     </div>
                   )}
                 </div>
                 <ListView members={filtered} entries={entries} currentClub={currentClub} groupNameById={groupNameById} showGroups={planFeatures.hasGroups} />
               </motion.div>
             ) : (
               <motion.div 
                 key="lead"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <LeaderboardView
                   data={leaderboard}
                   groups={visibleGroups}
                   showGroupLeaderboards={planFeatures.hasGroupLeaderboards}
                   showAdvancedStats={planFeatures.hasAdvancedStats}
                 />
               </motion.div>
             )}
          </AnimatePresence>
        )}
      </div>

       {/* Invite Member Modal */}
      <AnimatePresence>
        {isInviteOpen && isAdmin && (
          <div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/40 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => { if (e.target === e.currentTarget) closeInviteModal(); }}
          >
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-lg mb-8"
             >
                <GlassSection className="relative overflow-hidden border-black/10 shadow-3xl">
                   {/* Gradient Glow */}
                   <div className="absolute -top-24 -right-24 w-48 h-48 bg-black/[0.04] rounded-full blur-[80px] pointer-events-none" />
                   
                   <div className="p-8 flex flex-col gap-8">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                         <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-poppins font-black text-[#0A0A0A] tracking-tight italic">MITGLIED ANLEGEN</h2>
                            <p className="text-[#71717A] font-bold text-[10px] uppercase tracking-[0.2em]">Konto erstellen und Zugangsdaten senden</p>
                         </div>
                         <button
                           type="button"
                           onClick={(e) => { e.stopPropagation(); closeInviteModal(); }}
                           className="relative z-10 w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] transition-all"
                         >
                            <X size={20} />
                         </button>
                      </div>

                      {generatedPassword ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex flex-col gap-8 text-center py-4"
                        >
                          <div className="flex flex-col gap-2">
                            <div className="w-16 h-16 bg-black/[0.04] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-black/10">
                              <Check className="text-[#52525B]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-[#0A0A0A]">Mitglied erfolgreich angelegt!</h3>
                            <p className="text-sm text-[#71717A]">
                              {userAlreadyExisted ? "Der Nutzer wurde dem Verein hinzugefügt." : "Das Konto wurde erstellt. Hier sind die Zugangsdaten:"}
                            </p>
                          </div>

                          {userAlreadyExisted ? (
                            <div className="bg-black/[0.04] rounded-3xl p-6 border border-black/10 flex flex-col gap-3 items-center">
                              <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest bg-black/[0.05] border border-black/10 px-3 py-1 rounded-full">Bestehender Account</span>
                              <p className="text-sm text-[#0A0A0A] font-semibold mt-2">Nutzer hatte bereits einen Talo-Account.</p>
                              <p className="text-xs text-[#52525B] leading-relaxed">
                                {inviteFirstName} kann sich einfach mit dem <br/>bisherigen Passwort einloggen und sieht nun <br/>deinen Verein im Dashboard.
                              </p>
                            </div>
                          ) : (
                            <div className="bg-black/[0.04] rounded-3xl p-6 border border-black/10 flex flex-col gap-4">
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1">E-Mail Adresse</span>
                                <div className="w-full bg-black/20 rounded-xl p-3 text-sm text-[#0A0A0A] font-mono border border-black/5">{inviteEmail}</div>
                              </div>
                              <div className="flex flex-col items-start gap-1">
                                <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1">Passwort</span>
                                <div className="w-full bg-black/20 rounded-xl p-3 text-xl text-[#0A0A0A] font-mono font-bold border border-black/5 tracking-[0.2em]">{generatedPassword}</div>
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            {!userAlreadyExisted && (
                              <button 
                                onClick={async () => {
                                  if (!currentClub || !currentMember) return;
                                  setIsSendingMail(true);
                                  setErrorMessage(null);
                                  try {
                                    await EmailService.sendWelcomeMail({
                                      to: inviteEmail,
                                      name: `${inviteFirstName} ${inviteLastName}`,
                                      subject: `Willkommen bei ${currentClub.name} – Deine Zugangsdaten`,
                                      memberName: inviteFirstName,
                                      password: generatedPassword!,
                                      clubName: currentClub.name,
                                      clubId: currentClub.id,
                                      adminName: `${currentMember.firstName} ${currentMember.lastName}`
                                    });
                                    setMailSent(true);
                                  } catch (err) {
                                    setErrorMessage(err instanceof Error ? err.message : "E-Mail konnte nicht gesendet werden.");
                                  } finally {
                                    setIsSendingMail(false);
                                  }
                                }}
                                disabled={isSendingMail || mailSent}
                                className="w-full h-14 rounded-2xl bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1F1F23] transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                              >
                                {isSendingMail ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black" />
                                ) : mailSent ? (
                                  <>
                                    <Check size={18} /> Mail gesendet
                                  </>
                                ) : (
                                  <>
                                    <Mail size={18} /> Willkommens-Mail senden
                                  </>
                                )}
                              </button>
                            )}
                            <button
                              onClick={closeInviteModal}
                              className={`w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${userAlreadyExisted ? "bg-[#0A0A0A] text-white hover:bg-[#1F1F23]" : "text-[#71717A] hover:text-[#0A0A0A]"}`}
                            >
                              Schließen
                            </button>
                          </div>
                        </motion.div>
                      ) : (
                        <>
                          {/* Form */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Vorname</label>
                                <div className="relative">
                                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                                  <input 
                                    value={inviteFirstName}
                                    onChange={(e) => setInviteFirstName(e.target.value)}
                                    placeholder="z.B. Max"
                                    className="w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 pl-11 pr-4 text-base font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                                  />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Nachname</label>
                                <input 
                                  value={inviteLastName}
                                  onChange={(e) => setInviteLastName(e.target.value)}
                                  placeholder="Mustermann"
                                  className="w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 px-4 text-base font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">E-Mail Adresse</label>
                                <div className="relative">
                                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                                  <input 
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="name@beispiel.de"
                                    className="w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 pl-11 pr-4 text-base font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                                  />
                                </div>
                            </div>
                          </div>

                          <TLine />

                          {/* Member Type Selection */}
                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Mitgliedstyp</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {availableMemberTypes.map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setInviteType(type)}
                                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                      inviteType === type 
                                        ? "bg-[#0A0A0A] text-white border-black/15" 
                                        : "bg-black/[0.04] text-[#71717A] border-black/5 hover:border-black/10"
                                    }`}
                                  >
                                      {type}
                                  </button>
                                ))}
                            </div>
                          </div>

                          {planFeatures.hasGroups && (
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Gruppe / Team</label>
                              <div className="relative">
                                <Layers size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
                                <select
                                  value={inviteGroupId}
                                  onChange={(e) => setInviteGroupId(e.target.value)}
                                  className="w-full appearance-none bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                                >
                                  <option value="">Keine Gruppe</option>
                                  {visibleGroups.map((group) => (
                                    <option key={group.id} value={group.id}>{group.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          )}

                          {errorMessage && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                              {errorMessage}
                            </div>
                          )}

                          {/* Footer Actions */}
                          <div className="flex flex-col gap-3 pt-4">
                            <button 
                              onClick={async () => {
                                const normalizedEmail = inviteEmail.trim().toLowerCase();
                                if (!inviteFirstName.trim() || !inviteLastName.trim() || !normalizedEmail) {
                                  setErrorMessage("Bitte alle Felder ausfüllen.");
                                  return;
                                }
                                setIsCreating(true);
                                setErrorMessage(null);
                                try {
                                  if (!currentMember?.isAdmin) {
                                    throw new Error("Nur Admins können Mitglieder anlegen.");
                                  }

                                  const clubId = currentClub?.id;
                                  if (!clubId) throw new Error("Kein Verein ausgewählt.");

                                  // Check if member already exists
                                  const existingMember = await FirebaseManager.getMemberByEmail(normalizedEmail);
                                  
                                  if (existingMember) {
                                    if (existingMember.clubIds.includes(clubId) || existingMember.clubId === clubId) {
                                      throw new Error("Dieser Nutzer ist bereits Mitglied im Verein.");
                                    }
                                    
                                    await FirebaseManager.addMemberToClub(existingMember, clubId, {
                                      memberType: inviteType,
                                      isAdmin: false,
                                      isTrainer: false,
                                      ...(inviteGroupId ? { groupId: inviteGroupId } : {}),
                                    });
                                    
                                    setUserAlreadyExisted(true);
                                    setGeneratedPassword("existing");
                                  } else {
                                    const { uid, password } = await AuthService.createMemberAuth(normalizedEmail, inviteFirstName.trim(), inviteLastName.trim(), clubId);
                                    
                                    const newMember = {
                                      firstName: inviteFirstName.trim(),
                                      lastName: inviteLastName.trim(),
                                      email: normalizedEmail,
                                      memberType: inviteType,
                                      isAdmin: false,
                                      isTrainer: false,
                                      clubId: clubId,
                                      clubIds: [clubId],
                                      ...(inviteGroupId ? { groupId: inviteGroupId } : {}),
                                      clubMemberships: {
                                        [clubId]: {
                                          memberType: inviteType,
                                          isAdmin: false,
                                          isTrainer: false,
                                          ...(inviteGroupId ? { groupId: inviteGroupId } : {}),
                                        },
                                      },
                                    };
                                    
                                    await FirebaseManager.setMember(uid, newMember);
                                    
                                    setGeneratedPassword(password);
                                  }
                                } catch (err) {
                                  setErrorMessage(err instanceof Error ? err.message : "Fehler beim Anlegen.");
                                } finally {
                                  setIsCreating(false);
                                }
                              }}
                              disabled={isCreating}
                              className="w-full h-14 rounded-2xl bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#1F1F23] transition-all shadow-2xl shadow-black/5 active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black" />
                                ) : (
                                  <>
                                    <UserPlus size={18} /> Mitglied anlegen
                                  </>
                                )}
                            </button>
                            <p className="text-[9px] text-[#52525B] font-bold uppercase tracking-widest text-center px-8 leading-relaxed italic">
                                Das Konto wird sofort erstellt und kann genutzt werden.
                            </p>
                          </div>
                        </>
                      )}
                   </div>
                </GlassSection>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ListView({
  members,
  entries,
  currentClub,
  groupNameById,
  showGroups,
}: {
  members: Member[];
  entries: Entry[];
  currentClub: any;
  groupNameById: Map<string, string>;
  showGroups: boolean;
}) {
  const { t } = useI18n();
  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
  const accentRaw     = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent        = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight   = isLightColor(accent);
  const allTypes = [...memberTypeOrder];
  if (planFeatures.hasCustomMemberTypes && currentClub?.customMemberTypes) {
    currentClub.customMemberTypes.forEach((c: any) => allTypes.push(c.name));
  }

  const grouped = allTypes
    .map((type) => ({ type, group: members.filter((m) => m.memberType === type) }))
    .filter(({ group }) => group.length > 0);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-white border border-black/5 rounded-[32px]">
        <Search size={40} className="text-gray-800 mb-5" />
        <h3 className="text-lg font-bold text-[#0A0A0A] mb-2">Keine Treffer</h3>
        <p className="font-poppins text-[#71717A] text-sm max-w-xs mx-auto">Versuche es mit einem anderen Namen.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {grouped.map(({ type, group }) => (
        <div key={type} className="flex flex-col gap-5">
          {/* Section header */}
          <div className="flex items-center gap-3 px-1">
            <div className="h-8 w-0.5 rounded-full" style={{
              background: type === "Aktiv" ? "#34C759" : type === "Vorstand" ? "#E87AA0" : type === "Jugend" ? "#FF9500" : "#71717A"
            }} />
            <div className="flex flex-col">
              <span className="text-[15px] font-poppins font-black text-[#0A0A0A] uppercase tracking-tight leading-none italic">
                {type === MemberType.Active ? t("mitglieder.typeActive") : type === MemberType.Board ? t("mitglieder.typeBoard") : type === MemberType.Passive ? t("mitglieder.typePassive") : type === MemberType.Youth ? t("mitglieder.typeYouth") : (memberTypeLabel[type] ?? type)}
              </span>
              <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest mt-0.5 italic">
                {group.length} Personen
              </span>
            </div>
          </div>

          <div className="bg-white border border-black/5 rounded-[32px] overflow-x-auto shadow-xl">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-black/5" style={{ backgroundColor: accent }}>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest rounded-tl-[31px]" style={{ color: accentLight ? "#0A0A0A" : "#FFFFFF" }}>Mitglied</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest" style={{ color: accentLight ? "#0A0A0A" : "#FFFFFF" }}>Fortschritt</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: accentLight ? "#0A0A0A" : "#FFFFFF" }}>Punkte</th>
                  <th className="px-6 py-4 w-12 rounded-tr-[31px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {group.map((member) => {
                  const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt");
                  const approved = mEntries.reduce((sum, e) => sum + e.points, 0);
                  const target = currentClub ? calculateTargetPoints(member, currentClub) : 15;
                  const progress = target > 0 ? Math.min(1, approved / target) : 1;
                  const color = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF453A";

                  return (
                    <tr key={member.id} className="group hover:bg-black/[0.03] transition-colors cursor-pointer">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/mitglieder/${member.id}`} className="flex items-center gap-3">
                          <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} imageUrl={member.profileImageUrl} size={40} />
                          <div className="flex flex-col">
                            <span className="text-sm font-poppins font-bold text-[#0A0A0A] group-hover:underline underline-offset-4 decoration-black/20 whitespace-nowrap">
                              {member.firstName} {member.lastName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-black text-[#52525B] uppercase tracking-widest">{member.memberType}</span>
                              {member.isAdmin && <Shield size={9} className="text-[#52525B]" />}
                              {showGroups && member.groupId && (
                                <span className="text-[9px] font-black text-[#A1A1AA] uppercase tracking-widest">
                                  · {groupNameById.get(member.groupId) ?? "Gruppe"}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5 min-w-[120px] max-w-[200px]">
                          <div className="h-1.5 rounded-full bg-black/[0.04] overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress * 100}%` }}
                              className="h-full"
                              style={{ background: color }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-[#52525B] uppercase tracking-[0.15em]">
                            {(progress * 100).toFixed(0)}% erreicht
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-black text-sm whitespace-nowrap" style={{ color }}>
                        {approved.toFixed(1)}{" "}
                        <span className="text-[10px] font-black text-gray-700">/ {target.toFixed(1)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/dashboard/mitglieder/${member.id}`}
                          className="w-8 h-8 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#52525B] hover:text-[#0A0A0A] hover:bg-black/[0.08] transition-all"
                        >
                          <MoreVertical size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardView({
  data,
  groups,
  showGroupLeaderboards,
  showAdvancedStats,
  duels = [],
  members = [],
  entries = [],
  currentClub,
  isAdmin,
}: {
  data: LeaderboardItem[];
  groups: ClubGroup[];
  showGroupLeaderboards: boolean;
  showAdvancedStats: boolean;
  duels?: Duel[];
  members?: Member[];
  entries?: Entry[];
  currentClub?: any;
  isAdmin?: boolean;
}) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);
  const completedMembers = data.filter((item) => item.progress >= 1).length;

  const [selectedDuelId, setSelectedDuelId] = useState<string>("standard");
  const [showCreateDuelModal, setShowCreateDuelModal] = useState(false);

  // Form States for creating custom duels
  const [duelTitle, setDuelTitle] = useState("");
  const [duelStartDate, setDuelStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [duelEndDate, setDuelEndDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  const [customDuelGroups, setCustomDuelGroups] = useState<{
    id: string;
    name: string;
    mappedGroupIds: string[];
  }[]>([
    { id: "dg-1", name: "Herren Gesamt", mappedGroupIds: [] },
    { id: "dg-2", name: "Damen Gesamt", mappedGroupIds: [] }
  ]);

  const handleAddCustomGroup = () => {
    setCustomDuelGroups(prev => [
      ...prev,
      { id: `dg-${Date.now()}`, name: `Gruppe ${String.fromCharCode(65 + prev.length)}`, mappedGroupIds: [] }
    ]);
  };

  const handleUpdateGroupName = (id: string, name: string) => {
    setCustomDuelGroups(prev => prev.map(g => g.id === id ? { ...g, name } : g));
  };

  const handleToggleMapping = (dgId: string, groupId: string) => {
    setCustomDuelGroups(prev => prev.map(g => {
      if (g.id !== dgId) return g;
      const alreadyMapped = g.mappedGroupIds.includes(groupId);
      return {
        ...g,
        mappedGroupIds: alreadyMapped
          ? g.mappedGroupIds.filter(id => id !== groupId)
          : [...g.mappedGroupIds, groupId]
      };
    }));
  };

  const handleDeleteCustomGroup = (id: string) => {
    setCustomDuelGroups(prev => prev.filter(g => g.id !== id));
  };

  const handleSaveDuel = async () => {
    if (!currentClub || !duelTitle.trim()) return;
    try {
      await FirebaseManager.addDuel(currentClub.id, {
        title: duelTitle.trim(),
        startDate: new Date(duelStartDate),
        endDate: new Date(duelEndDate),
        isActive: true,
        duelGroups: customDuelGroups.map(dg => ({
          id: dg.id,
          name: dg.name.trim(),
          mappedGroupIds: dg.mappedGroupIds
        }))
      });
      // Reset
      setDuelTitle("");
      setCustomDuelGroups([
        { id: "dg-1", name: "Herren Gesamt", mappedGroupIds: [] },
        { id: "dg-2", name: "Damen Gesamt", mappedGroupIds: [] }
      ]);
      setShowCreateDuelModal(false);
    } catch (e) {
      console.error("Error creating duel:", e);
    }
  };

  const handleDeleteDuel = async (duelId: string) => {
    if (!currentClub || !confirm("Möchtest du dieses Gruppen-Duell wirklich löschen?")) return;
    try {
      await FirebaseManager.deleteDuel(currentClub.id, duelId);
      if (selectedDuelId === duelId) {
        setSelectedDuelId("standard");
      }
    } catch (e) {
      console.error("Error deleting duel:", e);
    }
  };

  const getDuelDateMs = (d: any) => {
    if (!d) return Date.now();
    if (d instanceof Date) return d.getTime();
    if (d.seconds) return d.seconds * 1000;
    if (d.toDate && typeof d.toDate === "function") return d.toDate().getTime();
    return new Date(d).getTime();
  };

  const selectedDuel = useMemo(() => {
    return duels.find(d => d.id === selectedDuelId);
  }, [duels, selectedDuelId]);

  const customDuelScores = useMemo(() => {
    if (!selectedDuel) return [];
    
    const startMs = getDuelDateMs(selectedDuel.startDate);
    const endMs = getDuelDateMs(selectedDuel.endDate);

    return selectedDuel.duelGroups.map((dg) => {
      // Find members whose groupId is in dg.mappedGroupIds
      const dgMembers = members.filter(m => m.groupId && dg.mappedGroupIds.includes(m.groupId) && m.memberType !== MemberType.Passive);
      
      let totalPoints = 0;
      dgMembers.forEach((m) => {
        const mEntries = entries.filter((e) => {
          if (e.memberId !== m.id || e.status !== "Genehmigt") return false;
          
          const entryTime = e.date instanceof Date 
            ? e.date.getTime() 
            : (e.date as any)?.toDate 
              ? (e.date as any).toDate().getTime() 
              : new Date(e.date as any).getTime();
            
          return entryTime >= startMs && entryTime <= endMs;
        });
        totalPoints += mEntries.reduce((sum, e) => sum + e.points, 0);
      });

      const memberCount = dgMembers.length;
      const averagePoints = memberCount > 0 ? totalPoints / memberCount : 0;

      return {
        id: dg.id,
        name: dg.name,
        memberCount,
        totalPoints,
        averagePoints
      };
    }).sort((a, b) => b.averagePoints - a.averagePoints);
  }, [selectedDuel, members, entries]);

  const getCountdownText = (endDateStr: any) => {
    const endMs = getDuelDateMs(endDateStr);
    const diff = endMs - Date.now();
    if (diff <= 0) return "Beendet 🏁";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) {
      return `Noch ${days}t ${hours}std verbleibend ⏳`;
    }
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `Noch ${hours}std ${mins}min verbleibend ⏳`;
  };

  return (
    <div className="flex flex-col gap-12 py-10">
      {showAdvancedStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-4xl mx-auto w-full px-3 md:px-4">
          <MetricCard label="Gesamtpunkte" value={totalApproved.toFixed(1)} />
          <MetricCard label="Ziel erreicht" value={String(completedMembers)} />
          <MetricCard label="Ø Fortschritt" value={data.length ? `${Math.round(data.reduce((sum, item) => sum + item.progress, 0) / data.length * 100)}%` : "0%"} />
        </div>
      ) : (
        <div className="max-w-4xl mx-auto w-full px-3 md:px-4">
          <div className="rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
            Erweiterte Statistiken ab Club
          </div>
        </div>
      )}

      {/* Expanded Podium */}
      {top3.length > 0 && (
        <div className="flex items-end justify-center gap-3 md:gap-6 max-w-4xl mx-auto w-full px-4 md:px-12">
          {top3[1] && <PodiumBlock item={top3[1]} rank={2} height={140} medal="🥈" color="#E0E0E0" />}
          {top3[0] && <PodiumBlock item={top3[0]} rank={1} height={200} medal="🥇" color="#FFD700" />}
          {top3[2] && <PodiumBlock item={top3[2]} rank={3} height={110} medal="🥉" color="#CD7F32" />}
        </div>
      )}

      {/* High-End List */}
      <div className="max-w-4xl mx-auto w-full space-y-3 px-3 md:px-4">
        <div className="hidden sm:flex items-center justify-between px-6 text-[10px] font-black text-[#52525B] uppercase tracking-widest border-b border-black/5 pb-4 mb-6">
           <span>PLATZIERUNG</span>
           <span className="ml-12 mr-auto">MITGLIED</span>
           <span>GESAMTPUNKTE</span>
        </div>
        
        {rest.length > 0 ? rest.map((item, idx) => (
          <motion.div
            key={item.member.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="group flex items-center gap-4 md:gap-8 bg-white border border-black/5 rounded-[24px] md:rounded-[32px] p-4 md:p-6 hover:bg-black/[0.03] transition-all"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-black/[0.04] flex items-center justify-center font-mono font-black text-[#0A0A0A]/20 group-hover:text-[#0A0A0A] transition-colors text-sm">
              #{idx + 4}
            </div>
            <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={44} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[15px] md:text-[17px] font-poppins font-bold text-[#0A0A0A] truncate">
                {item.member.firstName} {item.member.lastName}
              </span>
              <span className="text-[10px] font-black text-[#52525B] uppercase tracking-widest mt-0.5">{item.member.memberType}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[18px] md:text-[22px] font-mono font-black" style={{ color: item.progress >= 1 ? "#34C759" : item.progress >= 0.5 ? "#FF9500" : "#FF453A" }}>+{item.approved.toFixed(1)}</span>
              <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest hidden sm:block">GESAMTPUNKTE</span>
            </div>
            <ChevronRight className="text-gray-800 group-hover:text-[#0A0A0A] transition-colors hidden sm:block" size={18} />
          </motion.div>
        )) : data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <Trophy size={64} className="mb-6" />
             <p className="font-poppins font-black uppercase tracking-[0.2em]">Keine Punkte im System</p>
          </div>
        )}
      </div>

      {showGroupLeaderboards ? (
        groups.length > 0 && (
          <div className="max-w-4xl mx-auto w-full px-3 md:px-4 flex flex-col gap-8">
            
            {/* GRP DUELS */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-2">
                <div className="flex items-center gap-2 text-[10px] font-black text-[#52525B] uppercase tracking-widest">
                  <Swords size={13} className="text-amber-500" /> Gruppen-Duelle (Schnitt pro Kopf)
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setShowCreateDuelModal(true)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-black/10 bg-white hover:bg-black/[0.04] text-[#0A0A0A] transition-all text-[9px] font-black uppercase tracking-widest shadow-sm"
                  >
                    <Plus size={10} /> <span>Duell erstellen</span>
                  </button>
                )}
              </div>

              {/* Duel Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedDuelId("standard")}
                  className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                    selectedDuelId === "standard"
                      ? "bg-[#0A0A0A] text-white border-black/15 shadow-sm"
                      : "bg-black/[0.04] text-[#71717A] border-black/10 hover:text-[#0A0A0A]"
                  }`}
                >
                  Standard (Alle Gruppen)
                </button>
                {duels.map((duel) => (
                  <div key={duel.id} className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDuelId(duel.id)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                        selectedDuelId === duel.id
                          ? "bg-[#0A0A0A] text-white border-black/15 shadow-sm"
                          : "bg-black/[0.04] text-[#71717A] border-black/10 hover:text-[#0A0A0A]"
                      }`}
                    >
                      {duel.title}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteDuel(duel.id)}
                        className="p-1.5 rounded-lg border border-red-500/20 bg-red-500/10 text-red-600 hover:bg-red-500/15 transition-all"
                        title="Duell löschen"
                      >
                        <Trash size={10} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Duel Card Container */}
              <div className="rounded-[28px] bg-white border border-black/5 p-6 shadow-sm flex flex-col gap-5">
                {selectedDuelId === "standard" ? (
                  /* Standard auto group duel */
                  groups
                    .map((g) => {
                      const gItems = data.filter((item) => item.member.groupId === g.id);
                      const memberCount = gItems.length;
                      const totalPoints = gItems.reduce((sum, item) => sum + item.approved, 0);
                      const averagePoints = memberCount > 0 ? totalPoints / memberCount : 0;
                      return { ...g, memberCount, totalPoints, averagePoints };
                    })
                    .sort((a, b) => b.averagePoints - a.averagePoints)
                    .map((duel, index, arr) => {
                      const maxAvg = Math.max(...arr.map((d) => d.averagePoints), 1);
                      const percent = (duel.averagePoints / maxAvg) * 100;
                      return (
                        <div key={duel.id} className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] ${
                                index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-black/[0.04] text-[#71717A]"
                              }`}>
                                {index + 1}
                              </span>
                              <span className="font-poppins font-bold text-sm text-[#0A0A0A]">{duel.name}</span>
                              {index === 0 && duel.averagePoints > 0 && (
                                <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md animate-pulse">
                                  IN FÜHRUNG 🔥
                                </span>
                              )}
                            </div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="font-mono font-black text-sm text-[#0A0A0A]">
                                {duel.averagePoints.toFixed(1)} Pkt.
                              </span>
                              <span className="text-[10px] text-[#A1A1AA] hidden sm:inline">({duel.totalPoints.toFixed(0)} total / {duel.memberCount} Pers.)</span>
                            </div>
                          </div>
                          <div className="h-3 w-full bg-black/[0.03] border border-black/5 rounded-full overflow-hidden relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{
                                background: index === 0 ? "linear-gradient(90deg, #FF9500, #FFCC00)" : "linear-gradient(90deg, #0A0A0A, #52525B)",
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : selectedDuel ? (
                  /* Custom group duel */
                  <div className="flex flex-col gap-6">
                    {/* Duel Meta Info Banner */}
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-black/[0.03] border border-black/5 rounded-2xl px-4 py-3 text-xs text-[#52525B] font-poppins">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 font-bold"><Calendar size={13} /> {new Date(getDuelDateMs(selectedDuel.startDate)).toLocaleDateString("de-DE")} - {new Date(getDuelDateMs(selectedDuel.endDate)).toLocaleDateString("de-DE")}</span>
                      </div>
                      <span className="font-black uppercase tracking-wider bg-[#0A0A0A] text-white px-2.5 py-1 rounded-xl text-[9px] shadow-sm">
                        {getCountdownText(selectedDuel.endDate)}
                      </span>
                    </div>

                    {customDuelScores.length === 0 ? (
                      <p className="text-xs text-[#71717A] text-center py-6">Keine Gruppen für dieses Duell konfiguriert.</p>
                    ) : (
                      customDuelScores.map((score, index, arr) => {
                        const maxAvg = Math.max(...arr.map((d) => d.averagePoints), 1);
                        const percent = (score.averagePoints / maxAvg) * 100;
                        return (
                          <div key={score.id} className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] ${
                                  index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-black/[0.04] text-[#71717A]"
                                }`}>
                                  {index + 1}
                                </span>
                                <span className="font-poppins font-bold text-sm text-[#0A0A0A]">{score.name}</span>
                                {index === 0 && score.averagePoints > 0 && (
                                  <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-md animate-pulse">
                                    IN FÜHRUNG 🔥
                                  </span>
                                )}
                              </div>
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-mono font-black text-sm text-[#0A0A0A]">
                                  {score.averagePoints.toFixed(1)} Pkt.
                                </span>
                                <span className="text-[10px] text-[#A1A1AA] hidden sm:inline">({score.totalPoints.toFixed(0)} total / {score.memberCount} Pers.)</span>
                              </div>
                            </div>
                            <div className="h-3 w-full bg-black/[0.03] border border-black/5 rounded-full overflow-hidden relative">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percent}%` }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{
                                  background: index === 0 ? "linear-gradient(90deg, #FF9500, #FFCC00)" : "linear-gradient(90deg, #0A0A0A, #52525B)",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {/* TRADITIONAL GROUPS LIST */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[10px] font-black text-[#52525B] uppercase tracking-widest">
                <Layers size={13} /> Gruppenranglisten (Details)
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {groups.map((group) => {
                  const groupItems = data
                    .filter((item) => item.member.groupId === group.id)
                    .slice(0, 5);
                  return (
                    <div key={group.id} className="rounded-[24px] bg-white border border-black/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-poppins font-black text-[#0A0A0A]">{group.name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
                          {groupItems.length} Personen
                        </span>
                      </div>
                      {groupItems.length === 0 ? (
                        <p className="text-xs text-[#71717A]">Noch keine Punkte in dieser Gruppe.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {groupItems.map((item, index) => (
                            <div key={item.member.id} className="flex items-center gap-3 rounded-xl bg-black/[0.03] px-3 py-2">
                              <span className="w-6 text-xs font-mono font-black text-[#A1A1AA]">#{index + 1}</span>
                              <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={30} />
                              <span className="min-w-0 flex-1 truncate text-sm font-poppins font-bold text-[#0A0A0A]">
                                {item.member.firstName} {item.member.lastName}
                              </span>
                              <span className="font-mono font-black text-sm text-[#0A0A0A]">{item.approved.toFixed(1)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <div className="max-w-4xl mx-auto w-full px-3 md:px-4">
          <div className="rounded-2xl border border-black/5 bg-black/[0.03] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#A1A1AA]">
            Gruppenranglisten & Duelle ab Club
          </div>
        </div>
      )}

      {/* Modal: Setup Custom Group Duel */}
      {typeof document !== "undefined" && showCreateDuelModal && (
        <div
          className="fixed inset-0 z-[999] flex items-start justify-center p-4 pt-12 bg-black/40 backdrop-blur-sm overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateDuelModal(false); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mb-12"
          >
            <GlassSection className="p-6 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg">
                  Gruppen-Duell einrichten
                </h3>
                <button onClick={() => setShowCreateDuelModal(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {/* Titel */}
                <div className="flex flex-col gap-2">
                  <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Duell Bezeichnung</label>
                  <input
                    value={duelTitle}
                    onChange={(e) => setDuelTitle(e.target.value)}
                    placeholder="z.B. Sommer-Challenge, Damen vs Herren"
                    className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                  />
                </div>

                {/* Start / End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Startdatum</label>
                    <input
                      type="date"
                      value={duelStartDate}
                      onChange={(e) => setDuelStartDate(e.target.value)}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Enddatum (Deadline)</label>
                    <input
                      type="date"
                      value={duelEndDate}
                      onChange={(e) => setDuelEndDate(e.target.value)}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>
                </div>

                {/* Custom Duels Groups Builder */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between pl-1">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest">Duell Gruppen definieren</label>
                    <button
                      onClick={handleAddCustomGroup}
                      className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <Plus size={10} /> <span>Gruppe hinzufügen</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    {customDuelGroups.map((dg, idx) => (
                      <div key={dg.id} className="border border-black/5 bg-black/[0.02] rounded-2xl p-4 flex flex-col gap-3 relative">
                        <div className="flex items-center justify-between">
                          <input
                            value={dg.name}
                            onChange={(e) => handleUpdateGroupName(dg.id, e.target.value)}
                            placeholder="Zusammenschluss-Name"
                            className="bg-transparent font-poppins font-bold text-sm text-[#0A0A0A] focus:outline-none border-b border-transparent focus:border-black/20 pb-0.5 max-w-[200px]"
                          />
                          {customDuelGroups.length > 2 && (
                            <button
                              onClick={() => handleDeleteCustomGroup(dg.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Gruppe entfernen"
                            >
                              <Trash size={14} />
                            </button>
                          )}
                        </div>

                        {/* Mapped settings groups selector */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9px] font-black uppercase tracking-widest text-[#71717A]">Gruppen zuteilen:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {groups.map((group) => {
                              const isSelected = dg.mappedGroupIds.includes(group.id);
                              return (
                                <button
                                  key={group.id}
                                  onClick={() => handleToggleMapping(dg.id, group.id)}
                                  className={`px-2.5 py-1 rounded-xl text-[9px] font-bold transition-all border ${
                                    isSelected
                                      ? "bg-[#0A0A0A] text-white border-black/10 shadow-sm"
                                      : "bg-white text-[#71717A] border-black/5 hover:text-[#0A0A0A]"
                                  }`}
                                >
                                  {group.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveDuel}
                  disabled={!duelTitle.trim() || customDuelGroups.some(dg => !dg.name.trim())}
                  className="w-full h-12 rounded-2xl bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#1F1F23] transition-all disabled:opacity-50 mt-2 shadow-xl shadow-black/5"
                >
                  <Plus size={14} /> Duell speichern
                </button>
              </div>
            </GlassSection>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white border border-black/5 px-5 py-4">
      <p className="text-2xl font-poppins font-black text-[#0A0A0A]">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">{label}</p>
    </div>
  );
}

function FilterPill({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
        selected
          ? "bg-[#0A0A0A] text-white border-black/15"
          : "bg-black/[0.04] text-[#71717A] border-black/10 hover:text-[#0A0A0A]"
      }`}
    >
      {label}
    </button>
  );
}

function PodiumBlock({ item, rank, height, medal, color }: { item: LeaderboardItem, rank: number, height: number, medal: string, color: string }) {
  const avatarSize = rank === 1 ? 80 : 60;
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.85 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", damping: 20, stiffness: 100, delay: (3 - rank) * 0.15 }}
      className="flex-1 flex flex-col items-center gap-3 md:gap-6"
    >
      <div className="relative group cursor-pointer">
        <div className="absolute inset-0 rounded-full blur-[30px] opacity-20" style={{ background: color }} />
        <TAvatar
          name={`${item.member.firstName} ${item.member.lastName}`}
          id={item.member.id}
          size={avatarSize}
          imageUrl={item.member.profileImageUrl}
          className="relative z-10 border-[3px] border-[#0c0c0c] shadow-xl"
        />
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 md:w-9 md:h-9 rounded-full bg-white border-2 border-black/10 flex items-center justify-center z-20 text-base md:text-lg shadow-xl">
          {medal}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-poppins font-black text-[#0A0A0A] text-sm md:text-base tracking-tight leading-none line-clamp-1 max-w-[80px] md:max-w-full">
          {item.member.firstName}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg md:text-[24px] font-mono font-black" style={{ color }}>{item.approved.toFixed(1)}</span>
          <span className="text-[7px] font-black text-[#52525B] uppercase tracking-widest mt-1">PKT</span>
        </div>
      </div>

      <div
        className="w-full rounded-[24px] md:rounded-[40px] relative overflow-hidden flex items-center justify-center border border-black/[0.08]"
        style={{ height, background: `linear-gradient(to bottom, ${color}15, transparent)` }}
      >
        <div className="absolute top-0 w-full h-0.5" style={{ background: color }} />
        <Target size={rank === 1 ? 32 : 22} className="opacity-10" />
      </div>
    </motion.div>
  );
}
