"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trophy,
  ChevronRight, Shield, UserPlus,
  ArrowUpRight, Target, MoreVertical,
  X, Mail, User, Check, Layers, Filter
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry, ClubGroup, getPlanFeatures, TrainingGroup } from "@/lib/firebase/models";
import { AuthService } from "@/lib/firebase/authService";
import { EmailService } from "@/lib/firebase/emailService";
import { TAvatar, GlassSection, TLine, TSearchBar } from "@/app/components/ui/NativeUI";

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
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [members, setMembers] = useState<Member[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [trainingGroups, setTrainingGroups] = useState<TrainingGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState<string | "all">("all");
  const [groupFilter, setGroupFilter] = useState<string>("all");
  const [trainingGroupFilter, setTrainingGroupFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("administration");
  
  // Invite member state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteType, setInviteType] = useState<MemberType | string>(MemberType.Active);
  const [inviteGroupId, setInviteGroupId] = useState("");
  const [inviteTrainingGroupIds, setInviteTrainingGroupIds] = useState<string[]>([]);
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
    setInviteTrainingGroupIds([]);
    setIsCreating(false);
    setIsSendingMail(false);
    setMailSent(false);
    setUserAlreadyExisted(false);
    setErrorMessage(null);
    setGeneratedPassword(null);
  };

  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
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

    return () => { unsubMembers(); unsubEntries(); };
  }, [currentClub]);

  useEffect(() => {
    if (!currentClub || !planFeatures.hasGroups) return;
    const u1 = FirebaseManager.listenToGroups(currentClub.id, setGroups);
    const u2 = FirebaseManager.listenToTrainingGroups(currentClub.id, setTrainingGroups);
    return () => { u1(); u2(); };
  }, [currentClub, planFeatures.hasGroups]);

  const visibleGroups = useMemo(() => (planFeatures.hasGroups ? groups : []), [groups, planFeatures.hasGroups]);
  const visibleTrainingGroups = useMemo(() => (planFeatures.hasGroups ? trainingGroups : []), [trainingGroups, planFeatures.hasGroups]);

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
    if (planFeatures.hasAdvancedFilters && trainingGroupFilter !== "all") {
      list = list.filter((m) => m.trainingGroupIds?.includes(trainingGroupFilter));
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
      );
    }
    return list;
  }, [members, searchText, memberTypeFilter, groupFilter, trainingGroupFilter, planFeatures.hasAdvancedFilters]);

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

  const trainingGroupNameById = useMemo(
    () => new Map(visibleTrainingGroups.map((group) => [group.id, group.name])),
    [visibleTrainingGroups]
  );

  if (!canViewMembers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#52525B] font-poppins font-bold uppercase tracking-widest bg-black/[0.04] px-8 py-4 rounded-full">Kein Zugriff.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        
        {/* Header Action Bar */}
        <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Team & Engagement</h1>
              <div className="flex items-center gap-2">
                <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name}</p>
                <div className="px-2 py-0.5 rounded bg-black/[0.05] border border-black/10 rounded-full">
                  <p className="text-[#52525B] font-bold text-[10px] uppercase tracking-widest">{members.length} / {planFeatures.maxMembers} Mitglieder</p>
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
                className={`shrink-0 flex items-center gap-2 px-4 py-3 md:px-6 rounded-2xl border transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/5 ${
                  isLimitReached ? "bg-black/[0.05] text-[#71717A] border-black/10 cursor-not-allowed" : "bg-[#0A0A0A] text-white hover:bg-[#1F1F23] border-black/10"
                }`}
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">{isLimitReached ? "Limit erreicht" : "Mitglied hinzufügen"}</span>
              </button>
            )}
          </div>

          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start overflow-x-auto max-w-full">
            {(["administration", "leaderboard"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2.5 md:px-8 md:py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest whitespace-nowrap ${
                  viewMode === mode ? "bg-[#0A0A0A] text-white shadow-2xl" : "text-[#71717A] hover:text-[#0A0A0A]"
                }`}
              >
                {mode === "administration" ? "Verwaltung" : "Leaderboard"}
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
               <motion.div key="admin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                  <div className="flex flex-col gap-4">
                    <div className="w-full max-w-md">
                      <TSearchBar value={searchText} onChange={setSearchText} placeholder="Mitglied suchen…" />
                    </div>
                    {planFeatures.hasAdvancedFilters && (
                      <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex flex-wrap gap-2">
                           <FilterPill label="Alle Typen" selected={memberTypeFilter === "all"} onClick={() => setMemberTypeFilter("all")} />
                           {availableMemberTypes.map((type) => (
                             <FilterPill key={type} label={type} selected={memberTypeFilter === type} onClick={() => setMemberTypeFilter(type)} />
                           ))}
                        </div>
                        
                        <div className="h-4 w-px bg-black/10 hidden sm:block" />

                        <div className="flex flex-wrap gap-2">
                           <FilterPill label="Alle Abteilungen" selected={groupFilter === "all"} onClick={() => setGroupFilter("all")} />
                           {visibleGroups.map((g) => (
                             <FilterPill key={g.id} label={g.name} selected={groupFilter === g.id} onClick={() => setGroupFilter(g.id)} />
                           ))}
                        </div>

                        <div className="h-4 w-px bg-black/10 hidden sm:block" />

                        <div className="flex flex-wrap gap-2">
                           <FilterPill label="Alle Trainingsgruppen" selected={trainingGroupFilter === "all"} onClick={() => setTrainingGroupFilter("all")} />
                           {visibleTrainingGroups.map((g) => (
                             <FilterPill key={g.id} label={g.name} selected={trainingGroupFilter === g.id} onClick={() => setTrainingGroupFilter(g.id)} icon={Layers} />
                           ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <ListView 
                    members={filtered} 
                    entries={entries} 
                    currentClub={currentClub} 
                    groupNameById={groupNameById} 
                    trainingGroupNameById={trainingGroupNameById}
                    showGroups={planFeatures.hasGroups} 
                  />
               </motion.div>
             ) : (
               <motion.div key="leader" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <LeaderboardView items={leaderboard} currentMemberId={currentMember?.id || ""} />
               </motion.div>
             )}
          </AnimatePresence>
        )}

        {/* Invite Modal */}
        <AnimatePresence>
          {isInviteOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
               <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="w-full max-w-xl">
                  <GlassSection className="overflow-hidden">
                    <div className="p-6 md:p-8 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-black/[0.04] border border-black/5 flex items-center justify-center text-[#0A0A0A] shadow-sm">
                              <UserPlus size={24} />
                           </div>
                           <h2 className="text-2xl font-poppins font-black text-[#0A0A0A] tracking-tighter uppercase">Mitglied hinzufügen</h2>
                        </div>
                        <button onClick={closeInviteModal} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/[0.05] transition-all"><X size={20} /></button>
                      </div>

                      {generatedPassword ? (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center py-8 gap-6">
                          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-[#34C759] mb-2"><Check size={40} /></div>
                          <div className="flex flex-col gap-2">
                             <h3 className="text-xl font-bold text-[#0A0A0A] uppercase tracking-tight">Erfolgreich erstellt!</h3>
                             <p className="text-sm text-[#71717A] px-6">Das Mitglied wurde angelegt. Sende jetzt die Zugangsdaten per E-Mail.</p>
                          </div>
                          <div className="flex flex-col gap-3 w-full max-w-xs">
                             {generatedPassword !== "existing" && (
                               <div className="p-4 rounded-2xl bg-black/[0.03] border border-dashed border-black/10 font-mono text-sm flex flex-col gap-1">
                                  <span className="text-[9px] uppercase tracking-widest font-black text-[#71717A]">Initial-Passwort</span>
                                  <span className="text-lg font-black text-[#0A0A0A]">{generatedPassword}</span>
                               </div>
                             )}
                             <button 
                               onClick={async () => {
                                 if (isSendingMail) return;
                                 setIsSendingMail(true);
                                 try {
                                   await EmailService.sendWelcomeMail({
                                     to: inviteEmail,
                                     name: inviteFirstName,
                                     memberName: `${inviteFirstName} ${inviteLastName}`,
                                     clubName: currentClub?.name || "Dein Verein",
                                     clubId: currentClub?.id || "",
                                     password: generatedPassword === "existing" ? "" : (generatedPassword || ""),
                                     adminName: currentMember?.firstName || "Dein Admin"
                                   });
                                   setMailSent(true);
                                 } catch (e) {
                                   console.error(e);
                                 } finally {
                                   setIsSendingMail(false);
                                 }
                               }}
                               className="w-full h-14 rounded-2xl bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-95 transition-all"
                             >
                               {isSendingMail ? "Wird gesendet..." : mailSent ? "E-Mail gesendet!" : "Zugangsdaten senden"}
                             </button>
                             <button onClick={closeInviteModal} className="text-[10px] font-black uppercase tracking-widest text-[#71717A] hover:text-[#0A0A0A]">Schließen</button>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="flex flex-col gap-6">
                          <div className="grid grid-cols-2 gap-4">
                            <InputField label="Vorname" value={inviteFirstName} onChange={setInviteFirstName} placeholder="z.B. Max" icon={User} />
                            <InputField label="Nachname" value={inviteLastName} onChange={setInviteLastName} placeholder="Mustermann" />
                            <div className="col-span-2">
                              <InputField label="E-Mail Adresse" value={inviteEmail} onChange={setInviteEmail} placeholder="name@beispiel.de" icon={Mail} />
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
                             <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Mitgliedstyp</label>
                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {availableMemberTypes.map(t => (
                                  <button key={t} onClick={() => setInviteType(t)} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${inviteType === t ? "bg-[#0A0A0A] text-white border-black" : "bg-black/[0.04] text-[#71717A] border-black/5"}`}>{t}</button>
                                ))}
                             </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                               <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Abteilung</label>
                               <select value={inviteGroupId} onChange={(e) => setInviteGroupId(e.target.value)} className="w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 px-4 text-sm font-poppins focus:outline-none transition-all">
                                  <option value="">Keine Abteilung</option>
                                  {visibleGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                               </select>
                            </div>
                            <div className="flex flex-col gap-2">
                               <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Trainingsgruppe</label>
                               <select 
                                 value={inviteTrainingGroupIds[0] || ""} 
                                 onChange={(e) => setInviteTrainingGroupIds(e.target.value ? [e.target.value] : [])} 
                                 className="w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 px-4 text-sm font-poppins focus:outline-none transition-all"
                               >
                                  <option value="">Keine Auswahl</option>
                                  {visibleTrainingGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                               </select>
                            </div>
                          </div>

                          {errorMessage && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{errorMessage}</p>}

                          <div className="flex flex-col gap-3 pt-2">
                            <button 
                              onClick={async () => {
                                if (isCreating) return;
                                if (!inviteFirstName.trim() || !inviteLastName.trim() || !inviteEmail.trim()) {
                                  setErrorMessage("Bitte alle Pflichtfelder ausfüllen.");
                                  return;
                                }
                                setIsCreating(true);
                                setErrorMessage(null);
                                try {
                                  const clubId = currentClub?.id;
                                  if (!clubId) return;
                                  const normalized = inviteEmail.trim().toLowerCase();
                                  const existing = await FirebaseManager.getMemberByEmail(normalized);
                                  
                                  if (existing) {
                                    if (existing.clubIds.includes(clubId)) throw new Error("Bereits Mitglied.");
                                    await FirebaseManager.addMemberToClub(existing, clubId, {
                                      memberType: inviteType,
                                      isAdmin: false,
                                      isTrainer: false,
                                      groupId: inviteGroupId || undefined,
                                      trainingGroupIds: inviteTrainingGroupIds
                                    });
                                    setGeneratedPassword("existing");
                                  } else {
                                    const { uid, password } = await AuthService.createMemberAuth(normalized, inviteFirstName, inviteLastName, clubId);
                                    await FirebaseManager.setMember(uid, {
                                      firstName: inviteFirstName,
                                      lastName: inviteLastName,
                                      email: normalized,
                                      memberType: inviteType,
                                      isAdmin: false,
                                      isTrainer: false,
                                      clubId,
                                      clubIds: [clubId],
                                      groupId: inviteGroupId || undefined,
                                      trainingGroupIds: inviteTrainingGroupIds,
                                      clubMemberships: {
                                        [clubId]: {
                                          memberType: inviteType,
                                          isAdmin: false,
                                          isTrainer: false,
                                          groupId: inviteGroupId || undefined,
                                          trainingGroupIds: inviteTrainingGroupIds
                                        }
                                      }
                                    });
                                    setGeneratedPassword(password);
                                  }
                                } catch (e) {
                                  setErrorMessage(e instanceof Error ? e.message : "Fehler.");
                                } finally {
                                  setIsCreating(false);
                                }
                              }}
                              className="w-full h-14 rounded-2xl bg-[#0A0A0A] text-white font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-black/5"
                            >
                              {isCreating ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <>Mitglied anlegen</>}
                            </button>
                            <p className="text-[9px] text-[#A1A1AA] text-center font-bold uppercase tracking-widest italic">Anmeldedaten können nach Erstellung versendet werden.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </GlassSection>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, icon: Icon }: any) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">{label}</label>
      <div className="relative">
        {Icon && <Icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />}
        <input 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder={placeholder}
          className={`w-full bg-black/[0.04] border border-black/5 rounded-2xl py-3.5 ${Icon ? "pl-11" : "px-4"} pr-4 text-sm font-poppins focus:outline-none transition-all`}
        />
      </div>
    </div>
  );
}

function FilterPill({ label, selected, onClick, icon: Icon }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
        selected ? "bg-[#0A0A0A] text-white border-black" : "bg-white text-[#71717A] border-black/5 hover:border-black/10 shadow-sm"
      }`}
    >
      {Icon && <Icon size={12} />}
      {label}
    </button>
  );
}

function ListView({ 
  members, 
  entries, 
  currentClub, 
  groupNameById, 
  trainingGroupNameById, 
  showGroups 
}: { 
  members: Member[], 
  entries: Entry[], 
  currentClub: any, 
  groupNameById: Map<string, string>, 
  trainingGroupNameById: Map<string, string>, 
  showGroups: boolean 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {members.map((member: Member, idx: number) => (
        <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }}>
          <Link href={`/dashboard/mitglieder/${member.id}`}>
             <GlassSection className="p-5 flex items-center justify-between group hover:border-black/20 transition-all cursor-pointer h-full">
                <div className="flex items-center gap-4 min-w-0">
                   <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} size={48} />
                   <div className="flex flex-col min-w-0">
                      <h4 className="font-poppins font-black text-[#0A0A0A] text-sm truncate uppercase tracking-tight">{member.firstName} {member.lastName}</h4>
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] font-bold text-[#71717A] uppercase tracking-widest truncate">{member.memberType}</span>
                         {showGroups && member.groupId && (
                           <div className="flex items-center gap-1 text-[10px] font-bold text-[#A1A1AA] uppercase tracking-widest truncate">
                              <span className="w-1 h-1 rounded-full bg-black/10" />
                              {groupNameById.get(member.groupId)}
                           </div>
                         )}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                         {member.trainingGroupIds?.map((tgid: string) => (
                           <div key={tgid} className="px-1.5 py-0.5 rounded-full bg-black/[0.04] border border-black/5 text-[8px] font-black text-[#71717A] uppercase tracking-widest">
                              {trainingGroupNameById.get(tgid)}
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black text-[#0A0A0A] font-mono">
                         {entries.filter((e: any) => e.memberId === member.id && e.status === "Genehmigt").reduce((sum: number, e: any) => sum + e.points, 0)} Pkt.
                      </span>
                      <ChevronRight size={14} className="text-[#A1A1AA] group-hover:text-[#0A0A0A] group-hover:translate-x-1 transition-all" />
                   </div>
                </div>
             </GlassSection>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function LeaderboardView({ items, currentMemberId }: any) {
  return (
    <div className="flex flex-col gap-4">
      {items.map((item: any, idx: number) => (
        <motion.div key={item.member.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
           <GlassSection className={`p-5 flex items-center justify-between border-l-4 ${item.member.id === currentMemberId ? "border-l-[#0A0A0A] bg-black/[0.02]" : "border-l-transparent"}`}>
              <div className="flex items-center gap-5">
                 <span className="w-8 font-poppins font-black text-xl text-[#A1A1AA]">{idx + 1}.</span>
                 <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={44} />
                 <div className="flex flex-col">
                    <span className="font-poppins font-black text-[#0A0A0A] text-sm uppercase tracking-tight">{item.member.firstName} {item.member.lastName}</span>
                    <span className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">{item.member.memberType}</span>
                 </div>
              </div>
              <div className="flex items-center gap-8">
                 <div className="hidden sm:flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#71717A] uppercase tracking-widest">Fortschritt</span>
                    <div className="w-32 h-1.5 bg-black/[0.04] rounded-full overflow-hidden mt-1">
                       <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress * 100}%` }} className="h-full bg-[#0A0A0A]" />
                    </div>
                 </div>
                 <div className="flex flex-col items-end min-w-[80px]">
                    <span className="text-xl font-poppins font-black text-[#0A0A0A]">{item.approved}</span>
                    <span className="text-[10px] font-black text-[#A1A1AA] uppercase tracking-widest">Punkte</span>
                 </div>
              </div>
           </GlassSection>
        </motion.div>
      ))}
    </div>
  );
}
