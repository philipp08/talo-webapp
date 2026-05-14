"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trophy,
  ChevronRight, Shield, UserPlus,
  ArrowUpRight, Target, MoreVertical,
  X, Mail, User, Check
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry } from "@/lib/firebase/models";
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
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("administration");
  
  // Invite member state
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteFirstName, setInviteFirstName] = useState("");
  const [inviteLastName, setInviteLastName] = useState("");
  const [inviteType, setInviteType] = useState<MemberType>(MemberType.Active);
  const [isCreating, setIsCreating] = useState(false);
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [mailSent, setMailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const isAdmin = currentMember?.isAdmin === true;
  const canViewMembers = isAdmin || currentMember?.isTrainer === true;

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

  const filtered = useMemo(() => {
    if (!searchText.trim()) return members;
    const q = searchText.toLowerCase();
    return members.filter((m) =>
      `${m.firstName} ${m.lastName}`.toLowerCase().includes(q)
    );
  }, [members, searchText]);

  const leaderboard = useMemo(() => {
    return members
      .filter((m) => m.memberType !== MemberType.Passive)
      .map((m) => {
        const approved = entries
          .filter((e) => e.memberId === m.id && e.status === "Genehmigt")
          .reduce((sum, e) => sum + e.points, 0);
        const target = currentClub ? calculateTargetPoints(m, currentClub.requiredPoints) : 15;
        const progress = target > 0 ? Math.min(1, approved / target) : 1;
        return { member: m, approved, target, progress };
      })
      .sort((a, b) => b.approved - a.approved);
  }, [members, entries, currentClub]);

  if (!canViewMembers) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[#8A8A8A] font-poppins font-bold uppercase tracking-widest bg-white/5 px-8 py-4 rounded-full">Kein Zugriff.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#080808]">
      <div className="max-w-[1600px] mx-auto py-6 px-5 md:py-12 md:px-10 flex flex-col gap-8 md:gap-10">
        
        {/* Header Action Bar */}
        <div className="flex flex-col gap-5 border-b border-white/5 pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-3xl md:text-4xl font-poppins font-black text-white tracking-tighter">Team & Engagement</h1>
              <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name}</p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsInviteOpen(true)}
                className="shrink-0 flex items-center gap-2 bg-white text-black hover:bg-gray-200 px-4 py-3 md:px-6 rounded-2xl border border-white/10 transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-white/5"
              >
                <UserPlus size={16} />
                <span className="hidden sm:inline">Mitglied hinzufügen</span>
              </button>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-2xl bg-white/[0.02] border border-white/5 self-start">
            {(["administration", "leaderboard"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2.5 md:px-8 md:py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${
                  viewMode === mode ? "bg-white text-black shadow-2xl" : "text-gray-500 hover:text-white"
                }`}
              >
                {mode === "administration" ? "Verwaltung" : "Leaderboard"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-40">
             <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/5 border-t-white" />
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
                 <div className="w-full max-w-md">
                   <TSearchBar value={searchText} onChange={setSearchText} placeholder="Mitglied suchen…" />
                 </div>
                 <ListView members={filtered} entries={entries} requiredPoints={currentClub?.requiredPoints ?? 15} />
               </motion.div>
             ) : (
               <motion.div 
                 key="lead"
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
               >
                 <LeaderboardView data={leaderboard} />
               </motion.div>
             )}
          </AnimatePresence>
        )}
      </div>

       {/* Invite Member Modal */}
      <AnimatePresence>
        {isInviteOpen && isAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="w-full max-w-lg"
             >
                <GlassSection className="relative overflow-hidden border-white/10 shadow-3xl">
                   {/* Gradient Glow */}
                   <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 rounded-full blur-[80px]" />
                   
                   <div className="p-8 flex flex-col gap-8">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                         <div className="flex flex-col gap-2">
                            <h2 className="text-2xl font-poppins font-black text-white tracking-tight italic">MITGLIED ANLEGEN</h2>
                            <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.2em]">Konto erstellen und Zugangsdaten senden</p>
                         </div>
                         <button 
                           onClick={() => {
                             setIsInviteOpen(false);
                             setGeneratedPassword(null);
                             setErrorMessage(null);
                           }}
                           className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-all"
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
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2 border border-white/10">
                              <Check className="text-[#8A8A8A]" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white">Mitglied erfolgreich angelegt!</h3>
                            <p className="text-sm text-gray-500">Das Konto wurde erstellt. Hier sind die Zugangsdaten:</p>
                          </div>

                          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col gap-4">
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">E-Mail Adresse</span>
                              <div className="w-full bg-black/20 rounded-xl p-3 text-sm text-white font-mono border border-white/5">{inviteEmail}</div>
                            </div>
                            <div className="flex flex-col items-start gap-1">
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1">Passwort</span>
                              <div className="w-full bg-black/20 rounded-xl p-3 text-xl text-white font-mono font-bold border border-white/5 tracking-[0.2em]">{generatedPassword}</div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3">
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
                              className="w-full h-14 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-2xl active:scale-95 disabled:opacity-50"
                            >
                              {isSendingMail ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black" />
                              ) : mailSent ? (
                                <>
                                  <Check size={18} /> Mail gesendet ✓
                                </>
                              ) : (
                                <>
                                  <Mail size={18} /> Willkommens-Mail senden
                                </>
                              )}
                            </button>
                            <button 
                              onClick={() => {
                                setIsInviteOpen(false);
                                setGeneratedPassword(null);
                                setMailSent(false);
                              }}
                              className="w-full h-12 rounded-xl text-gray-500 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all"
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
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1 italic">Vorname</label>
                                <div className="relative">
                                  <User size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                  <input 
                                    value={inviteFirstName}
                                    onChange={(e) => setInviteFirstName(e.target.value)}
                                    placeholder="z.B. Max"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-poppins text-white focus:outline-none focus:border-white/10 transition-all"
                                  />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1 italic">Nachname</label>
                                <input 
                                  value={inviteLastName}
                                  onChange={(e) => setInviteLastName(e.target.value)}
                                  placeholder="Mustermann"
                                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 px-4 text-sm font-poppins text-white focus:outline-none focus:border-white/10 transition-all"
                                />
                            </div>
                            <div className="flex flex-col gap-2 col-span-2">
                                <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1 italic">E-Mail Adresse</label>
                                <div className="relative">
                                  <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                                  <input 
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="name@beispiel.de"
                                    className="w-full bg-white/[0.03] border border-white/5 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-poppins text-white focus:outline-none focus:border-white/10 transition-all"
                                  />
                                </div>
                            </div>
                          </div>

                          <TLine />

                          {/* Member Type Selection */}
                          <div className="flex flex-col gap-4">
                            <label className="text-[10px] font-black text-gray-600 uppercase tracking-widest pl-1 italic">Mitgliedstyp</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {memberTypeOrder.map((type) => (
                                  <button
                                    key={type}
                                    onClick={() => setInviteType(type)}
                                    className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                      inviteType === type 
                                        ? "bg-white text-black border-white" 
                                        : "bg-white/5 text-gray-500 border-white/5 hover:border-white/10"
                                    }`}
                                  >
                                      {type}
                                  </button>
                                ))}
                            </div>
                          </div>

                          {errorMessage && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold uppercase tracking-widest text-center">
                              {errorMessage}
                            </div>
                          )}

                          {/* Footer Actions */}
                          <div className="flex flex-col gap-3 pt-4">
                            <button 
                              onClick={async () => {
                                if (!inviteFirstName || !inviteLastName || !inviteEmail) {
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

                                  const { uid, password } = await AuthService.createMemberAuth(inviteEmail, inviteFirstName, inviteLastName, clubId);
                                  
                                  const newMember = {
                                    firstName: inviteFirstName,
                                    lastName: inviteLastName,
                                    email: inviteEmail,
                                    memberType: inviteType,
                                    isAdmin: false,
                                    isTrainer: false,
                                    clubId: clubId,
                                    clubIds: [clubId]
                                  };
                                  
                                  await FirebaseManager.setMember(uid, newMember);
                                  
                                  setGeneratedPassword(password);
                                } catch (err) {
                                  setErrorMessage(err instanceof Error ? err.message : "Fehler beim Anlegen.");
                                } finally {
                                  setIsCreating(false);
                                }
                              }}
                              disabled={isCreating}
                              className="w-full h-14 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-2xl shadow-white/5 active:scale-95 disabled:opacity-50"
                            >
                                {isCreating ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/10 border-t-black" />
                                ) : (
                                  <>
                                    <UserPlus size={18} /> Mitglied anlegen
                                  </>
                                )}
                            </button>
                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest text-center px-8 leading-relaxed italic">
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

function ListView({ members, entries, requiredPoints }: { members: Member[]; entries: Entry[]; requiredPoints: number }) {
  const grouped = memberTypeOrder
    .map((type) => ({ type, group: members.filter((m) => m.memberType === type) }))
    .filter(({ group }) => group.length > 0);

  if (members.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center bg-[#0c0c0c] border border-white/5 rounded-[32px]">
        <Search size={40} className="text-gray-800 mb-5" />
        <h3 className="text-lg font-bold text-white mb-2">Keine Treffer</h3>
        <p className="font-poppins text-gray-500 text-sm max-w-xs mx-auto">Versuche es mit einem anderen Namen.</p>
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
              background: type === "Aktiv" ? "#34C759" : type === "Vorstand" ? "#E87AA0" : type === "Jugend" ? "#FF9500" : "#555"
            }} />
            <div className="flex flex-col">
              <span className="text-[15px] font-poppins font-black text-white uppercase tracking-tight leading-none italic">
                {memberTypeLabel[type] ?? type}
              </span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5 italic">
                {group.length} Personen
              </span>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block bg-[#0c0c0c] border border-white/5 rounded-[32px] overflow-hidden shadow-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01]">
                  <th className="px-7 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest w-[40%]">Mitglied</th>
                  <th className="px-7 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest">Fortschritt</th>
                  <th className="px-7 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right">Punkte</th>
                  <th className="px-7 py-5 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {group.map((member) => {
                  const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt");
                  const approved = mEntries.reduce((sum, e) => sum + e.points, 0);
                  const target = calculateTargetPoints(member, requiredPoints);
                  const progress = target > 0 ? Math.min(1, approved / target) : 1;
                  const color = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF453A";

                  return (
                    <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer">
                      <td className="px-7 py-4">
                        <Link href={`/dashboard/mitglieder/${member.id}`} className="flex items-center gap-4">
                          <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} imageUrl={member.profileImageUrl} size={44} />
                          <div className="flex flex-col">
                            <span className="text-[15px] font-poppins font-bold text-white group-hover:underline underline-offset-4 decoration-white/20">
                              {member.firstName} {member.lastName}
                            </span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{member.memberType}</span>
                              {member.isAdmin && <Shield size={9} className="text-[#8A8A8A]" />}
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-7 py-4">
                        <div className="flex flex-col gap-1.5 max-w-[180px]">
                          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress * 100}%` }}
                              className="h-full"
                              style={{ background: color }}
                            />
                          </div>
                          <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.15em]">
                            {(progress * 100).toFixed(0)}% Erreicht
                          </span>
                        </div>
                      </td>
                      <td className="px-7 py-4 text-right font-mono font-black text-base" style={{ color }}>
                        {approved.toFixed(1)}{" "}
                        <span className="text-[10px] font-black text-gray-700">/ {target.toFixed(1)}</span>
                      </td>
                      <td className="px-7 py-4 text-center">
                        <Link
                          href={`/dashboard/mitglieder/${member.id}`}
                          className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-gray-600 hover:text-white hover:bg-white/10 transition-all ml-auto"
                        >
                          <MoreVertical size={15} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden flex flex-col gap-2.5">
            {group.map((member) => {
              const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt");
              const approved = mEntries.reduce((sum, e) => sum + e.points, 0);
              const target = calculateTargetPoints(member, requiredPoints);
              const progress = target > 0 ? Math.min(1, approved / target) : 1;
              const color = progress >= 1 ? "#34C759" : progress >= 0.5 ? "#FF9500" : "#FF453A";

              return (
                <Link
                  key={member.id}
                  href={`/dashboard/mitglieder/${member.id}`}
                  className="flex items-center gap-3.5 p-4 rounded-[22px] transition-all"
                  style={{ background: "#0C0C0C", border: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <TAvatar name={`${member.firstName} ${member.lastName}`} id={member.id} imageUrl={member.profileImageUrl} size={46} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-poppins font-bold text-[15px] text-white truncate">
                        {member.firstName} {member.lastName}
                      </span>
                      {member.isAdmin && <Shield size={11} className="text-[#8A8A8A] shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress * 100}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold shrink-0" style={{ color }}>
                        {approved.toFixed(1)}
                        <span className="text-gray-700"> / {target.toFixed(1)}</span>
                      </span>
                    </div>
                  </div>
                  <ArrowUpRight size={16} className="text-gray-700 shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeaderboardView({ data }: { data: LeaderboardItem[] }) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div className="flex flex-col gap-20 py-10">
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
        <div className="hidden sm:flex items-center justify-between px-6 text-[10px] font-black text-gray-600 uppercase tracking-widest border-b border-white/5 pb-4 mb-6">
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
            className="group flex items-center gap-4 md:gap-8 bg-[#0c0c0c] border border-white/5 rounded-[24px] md:rounded-[32px] p-4 md:p-6 hover:bg-white/[0.02] transition-all"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 flex items-center justify-center font-mono font-black text-white/20 group-hover:text-white transition-colors text-sm">
              #{idx + 4}
            </div>
            <TAvatar name={`${item.member.firstName} ${item.member.lastName}`} id={item.member.id} size={44} />
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-[15px] md:text-[17px] font-poppins font-bold text-white truncate">
                {item.member.firstName} {item.member.lastName}
              </span>
              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mt-0.5">{item.member.memberType}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[18px] md:text-[22px] font-mono font-black" style={{ color: item.progress >= 1 ? "#34C759" : item.progress >= 0.5 ? "#FF9500" : "#FF453A" }}>+{item.approved.toFixed(1)}</span>
              <span className="text-[8px] font-black text-gray-700 uppercase tracking-widest hidden sm:block">GESAMTPUNKTE</span>
            </div>
            <ChevronRight className="text-gray-800 group-hover:text-white transition-colors hidden sm:block" size={18} />
          </motion.div>
        )) : data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 opacity-20">
             <Trophy size={64} className="mb-6" />
             <p className="font-poppins font-black uppercase tracking-[0.2em]">Keine Punkte im System</p>
          </div>
        )}
      </div>
    </div>
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
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 md:w-9 md:h-9 rounded-full bg-black border-2 border-white/10 flex items-center justify-center z-20 text-base md:text-lg shadow-xl">
          {medal}
        </div>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-poppins font-black text-white text-sm md:text-base tracking-tight leading-none line-clamp-1 max-w-[80px] md:max-w-full">
          {item.member.firstName}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-lg md:text-[24px] font-mono font-black" style={{ color }}>{item.approved.toFixed(1)}</span>
          <span className="text-[7px] font-black text-gray-600 uppercase tracking-widest mt-1">PKT</span>
        </div>
      </div>

      <div
        className="w-full rounded-[24px] md:rounded-[40px] relative overflow-hidden flex items-center justify-center border border-white/[0.05]"
        style={{ height, background: `linear-gradient(to bottom, ${color}15, transparent)` }}
      >
        <div className="absolute top-0 w-full h-0.5" style={{ background: color }} />
        <Target size={rank === 1 ? 32 : 22} className="opacity-10" />
      </div>
    </motion.div>
  );
}
