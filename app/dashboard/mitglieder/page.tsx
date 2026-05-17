"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Trophy,
  ChevronRight, Shield, UserPlus, ChevronDown,
  Target, MoreVertical,
  X, Mail, User, Check, Layers, Filter, Swords, Trash, Plus, Calendar, Clock, Upload
} from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Member, MemberType, calculateTargetPoints, Entry, ClubGroup, getPlanFeatures, getEffectivePlanFeatures, isLightColor, Duel, DuelGroupConfig } from "@/lib/firebase/models";
import { AuthService } from "@/lib/firebase/authService";
import { EmailService } from "@/lib/firebase/emailService";
import { TAvatar, GlassSection, TLine, TSearchBar } from "@/app/components/ui/NativeUI";
import { useI18n } from "@/lib/i18n/I18nContext";

const toDate = (d: any): Date => {
  if (!d) return new Date();
  if (d instanceof Date) return d;
  if (typeof d.toDate === "function") return d.toDate();
  return new Date(d);
};

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

  // CSV Import state
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<"clubdesk" | "spielerplus" | "campai">("clubdesk");
  const [importStep, setImportStep] = useState<"upload" | "map" | "preview" | "progress" | "complete">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<string[][]>([]);
  const [fieldMappings, setFieldMappings] = useState<{
    firstName: number;
    lastName: number;
    email: number;
    memberType: number;
  }>({ firstName: -1, lastName: -1, email: -1, memberType: -1 });
  const [mappedMembers, setMappedMembers] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    memberType: string;
    isValid: boolean;
    errorReason?: string;
    selected: boolean;
    alreadyExists: boolean;
    alreadyInClub?: boolean;
  }[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [currentImportingName, setCurrentImportingName] = useState("");
  const [sendWelcomeEmailsBulk, setSendWelcomeEmailsBulk] = useState(true);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [importedResults, setImportedResults] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    status: "success" | "existing" | "error";
    errorMsg?: string;
  }[]>([]);

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

  const closeImportModal = () => {
    setIsImportOpen(false);
    setImportStep("upload");
    setCsvHeaders([]);
    setCsvRows([]);
    setFieldMappings({ firstName: -1, lastName: -1, email: -1, memberType: -1 });
    setMappedMembers([]);
    setImportProgress(0);
    setCurrentImportingName("");
    setSendWelcomeEmailsBulk(true);
    setIsPreviewLoading(false);
    setImportedResults([]);
  };
  const planFeatures = currentClub ? getEffectivePlanFeatures(currentClub) : getPlanFeatures();
  const accentRaw = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight = isLightColor(accent);
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
          .filter((e) => e.memberId === m.id && e.status === "Genehmigt" && toDate(e.date) <= new Date())
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

  const availableTypes = useMemo(() => {
    const list = [MemberType.Active, MemberType.Board, MemberType.Passive, MemberType.Youth];
    if (planFeatures.hasCustomMemberTypes && currentClub?.customMemberTypes) {
      currentClub.customMemberTypes.forEach((c: any) => {
        if (!list.includes(c.name)) list.push(c.name);
      });
    }
    return list;
  }, [planFeatures, currentClub]);

  // CSV Helper Functions
  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [""];
    let insideQuote = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          row[row.length - 1] += '"';
          i++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' || char === ';') {
        if (insideQuote) {
          row[row.length - 1] += char;
        } else {
          row.push("");
        }
      } else if (char === '\n' || char === '\r') {
        if (insideQuote) {
          row[row.length - 1] += char;
        } else {
          if (char === '\r' && nextChar === '\n') {
            i++;
          }
          lines.push(row);
          row = [""];
        }
      } else {
        row[row.length - 1] += char;
      }
    }

    if (row.length > 1 || row[0] !== "") {
      lines.push(row);
    }

    return lines;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      const parsed = parseCSV(text);
      if (parsed.length < 2) {
        alert("Die CSV-Datei enthält nicht genügend Daten.");
        return;
      }

      const headers = parsed[0].map(h => h.trim());
      const rows = parsed.slice(1).filter(r => r.some(c => c.trim() !== ""));

      setCsvHeaders(headers);
      setCsvRows(rows);

      // Auto mapping
      const mapping = { firstName: -1, lastName: -1, email: -1, memberType: -1 };
      headers.forEach((h, index) => {
        const lh = h.toLowerCase();
        if (lh.includes("vorname") || lh.includes("first name") || lh.includes("givenname")) {
          mapping.firstName = index;
        } else if (lh.includes("nachname") || lh.includes("last name") || lh.includes("surname") || lh.includes("familyname") || lh.includes("name")) {
          if (mapping.lastName === -1) mapping.lastName = index;
        }

        if (lh.includes("email") || lh.includes("e-mail") || lh.includes("mail")) {
          mapping.email = index;
        }

        if (lh.includes("typ") || lh.includes("type") || lh.includes("status") || lh.includes("mitgliedertyp")) {
          mapping.memberType = index;
        }
      });

      if (mapping.lastName === -1) {
        const nameIdx = headers.findIndex(h => h.toLowerCase() === "name");
        if (nameIdx !== -1) mapping.lastName = nameIdx;
      }

      setFieldMappings(mapping);
      setImportStep("map");
    };
    reader.readAsText(file);
  };

  const generatePreview = async () => {
    setIsPreviewLoading(true);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const items = csvRows.map(row => {
      const fName = fieldMappings.firstName !== -1 ? row[fieldMappings.firstName]?.trim() : "";
      const lName = fieldMappings.lastName !== -1 ? row[fieldMappings.lastName]?.trim() : "";
      const emailVal = fieldMappings.email !== -1 ? row[fieldMappings.email]?.trim().toLowerCase() : "";
      let mType = fieldMappings.memberType !== -1 ? row[fieldMappings.memberType]?.trim() : "Aktiv";

      const lType = mType.toLowerCase();
      if (lType.includes("vorstand") || lType.includes("board") || lType.includes("admin")) {
        mType = MemberType.Board;
      } else if (lType.includes("jugend") || lType.includes("youth") || lType.includes("kind") || lType.includes("junior")) {
        mType = MemberType.Youth;
      } else if (lType.includes("passiv") || lType.includes("passive")) {
        mType = MemberType.Passive;
      } else {
        mType = MemberType.Active;
      }

      let isValid = true;
      let errorReason = "";

      if (!fName || !lName) {
        isValid = false;
        errorReason = "Name fehlt";
      } else if (!emailVal || !emailRegex.test(emailVal)) {
        isValid = false;
        errorReason = "Ungültige E-Mail";
      }

      return {
        firstName: fName,
        lastName: lName,
        email: emailVal,
        memberType: mType,
        isValid,
        errorReason,
        selected: isValid,
        alreadyExists: false,
        alreadyInClub: false,
      };
    });

    const clubId = currentClub?.id;
    // Check registrations in Firestore in parallel
    const previewItems = await Promise.all(items.map(async (item) => {
      if (!item.isValid || !item.email) return item;
      try {
        const inClub = members.some(m => m.email?.trim().toLowerCase() === item.email.trim().toLowerCase());
        const existing = await FirebaseManager.getMemberByEmail(item.email);
        if (existing || inClub) {
          return {
            ...item,
            alreadyExists: true,
            alreadyInClub: inClub,
            selected: !inClub, // default to unselected if already in the club!
          };
        }
      } catch (err) {
        console.error("Error checking existing member for", item.email, err);
      }
      return item;
    }));

    setMappedMembers(previewItems);
    setIsPreviewLoading(false);
    setImportStep("preview");
  };

  const startImport = async () => {
    setImportStep("progress");
    setImportProgress(0);
    const results: typeof importedResults = [];
    const clubId = currentClub?.id;
    if (!clubId) return;

    const validMembers = mappedMembers.filter(m => m.isValid && m.selected);
    let count = 0;

    for (const m of validMembers) {
      setCurrentImportingName(`${m.firstName} ${m.lastName}`);
      try {
        const existingMember = await FirebaseManager.getMemberByEmail(m.email);
        const inClub = members.some(mb => mb.email?.trim().toLowerCase() === m.email.trim().toLowerCase());

        if (inClub) {
          results.push({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            status: "existing",
          });
        } else if (existingMember) {
          await FirebaseManager.addMemberToClub(existingMember, clubId, {
            memberType: m.memberType,
            isAdmin: false,
            isTrainer: false,
          });

          if (sendWelcomeEmailsBulk) {
            try {
              await EmailService.sendWelcomeMail({
                to: m.email,
                name: `${m.firstName} ${m.lastName}`,
                memberName: m.firstName,
                clubName: currentClub?.name || "Talo",
                clubId: clubId,
                adminName: `${currentMember?.firstName || "Admin"} ${currentMember?.lastName || ""}`,
                isExistingUser: true,
              });
            } catch (mailErr) {
              console.error("Failed to send welcome email for existing user", m.email, mailErr);
            }
          }

          results.push({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            status: "existing",
          });
        } else {
          const { uid, password } = await AuthService.createMemberAuth(m.email, m.firstName, m.lastName, clubId);

          const newMember = {
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            memberType: m.memberType,
            isAdmin: false,
            isTrainer: false,
            clubId: clubId,
            clubIds: [clubId],
            clubMemberships: {
              [clubId]: {
                memberType: m.memberType,
                isAdmin: false,
                isTrainer: false,
              },
            },
          };

          await FirebaseManager.setMember(uid, newMember);

          if (sendWelcomeEmailsBulk) {
            try {
              await EmailService.sendWelcomeMail({
                to: m.email,
                name: `${m.firstName} ${m.lastName}`,
                subject: `Willkommen bei ${currentClub?.name || "Talo"} – Deine Zugangsdaten`,
                memberName: m.firstName,
                password: password,
                clubName: currentClub?.name || "Talo",
                clubId: clubId,
                adminName: `${currentMember?.firstName || "Admin"} ${currentMember?.lastName || ""}`,
              });
            } catch (mailErr) {
              console.error("Failed to send welcome email for", m.email, mailErr);
            }
          }

          results.push({
            firstName: m.firstName,
            lastName: m.lastName,
            email: m.email,
            password: password,
            status: "success",
          });
        }
      } catch (err) {
        console.error("Error importing member:", err);
        results.push({
          firstName: m.firstName,
          lastName: m.lastName,
          email: m.email,
          status: "error",
          errorMsg: err instanceof Error ? err.message : "Unbekannter Fehler",
        });
      }

      count++;
      setImportProgress(Math.round((count / validMembers.length) * 100));
    }

    // Refresh members list
    setLoading(true);
    const list = await FirebaseManager.getMembersForClub(clubId);
    setMembers(list);
    setLoading(false);

    setImportedResults(results);
    setImportStep("complete");
  };

  const downloadResults = () => {
    const header = "Vorname,Nachname,E-Mail,Status,Temporaeres Passwort\n";
    const rows = importedResults.map(r =>
      `"${r.firstName}","${r.lastName}","${r.email}","${r.status === "success" ? "Neu angelegt" : r.status === "existing" ? "Bereits Mitglied" : "Fehler"}","${r.password || ""}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Talo_Import_Ergebnisse_${currentClub?.name || "Verein"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
              <div className="flex gap-2">
                <button
                  onClick={() => setIsImportOpen(true)}
                  className="shrink-0 hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl border border-black/10 bg-white hover:bg-black/[0.02] text-[#0A0A0A] transition-all font-black text-[11px] uppercase tracking-widest shadow-sm"
                >
                  <Upload size={16} />
                  <span>Importieren</span>
                </button>
                <button
                  onClick={() => {
                    if (isLimitReached) {
                      alert(`Das Mitgliederlimit (${planFeatures.maxMembers}) deines aktuellen Plans ist erreicht. Bitte im Bereich 'Einstellungen' eine neue Lizenz aktivieren.`);
                      return;
                    }
                    setIsInviteOpen(true);
                  }}
                  style={isLimitReached ? undefined : { backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }}
                  className={`shrink-0 flex items-center gap-2 px-4 py-3 md:px-6 rounded-2xl border transition-all font-black text-[11px] uppercase tracking-widest shadow-xl shadow-black/5 ${isLimitReached ? "bg-black/[0.05] text-[#71717A] border-black/10 cursor-not-allowed" : "hover:opacity-95 border-black/10 text-white"
                    }`}
                >
                  <UserPlus size={16} />
                  <span className="hidden sm:inline">{isLimitReached ? t("common.limitReached") : t("mitglieder.addMember")}</span>
                </button>
              </div>
            )}
          </div>

          {/* Mode toggle */}
          <div className="flex p-1 rounded-2xl bg-black/[0.03] border border-black/5 self-start">
            {(["administration", "leaderboard"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-5 py-2.5 md:px-8 md:py-3 rounded-xl text-xs font-poppins font-black transition-all uppercase tracking-widest ${viewMode === mode ? "bg-[#0A0A0A] text-white shadow-2xl" : "text-[#71717A] hover:text-[#0A0A0A]"
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
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isInviteOpen && isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) closeInviteModal(); }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
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
                              {inviteFirstName} kann sich einfach mit dem <br />bisherigen Passwort einloggen und sieht nun <br />deinen Verein im Dashboard.
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
                                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${inviteType === type
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

                                if (members.length >= planFeatures.maxMembers) {
                                  throw new Error(`Mitgliederlimit (${planFeatures.maxMembers}) für den ${planFeatures.name}-Plan erreicht. Bitte Lizenz upgraden.`);
                                }

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
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* CSV Import Modal */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {isImportOpen && isAdmin && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => { if (e.target === e.currentTarget) closeImportModal(); }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full ${importStep === "preview" || importStep === "complete" ? "max-w-4xl" : "max-w-2xl"} my-8 transition-all duration-300`}
              >
                <GlassSection className="relative overflow-hidden border-black/10 shadow-3xl">
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-black/[0.04] rounded-full blur-[80px] pointer-events-none" />

                  <div className="p-8 flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-2">
                        <h2 className="text-2xl font-poppins font-black text-[#0A0A0A] tracking-tight italic">MITGLIEDER IMPORTIEREN</h2>
                        <p className="text-[#71717A] font-bold text-[10px] uppercase tracking-[0.2em]">Mitglieder aus Clubdesk oder Excel via CSV importieren</p>
                      </div>
                      <button
                        type="button"
                        onClick={closeImportModal}
                        className="w-10 h-10 rounded-xl bg-black/[0.04] flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] transition-all"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {/* Step 1: Upload */}
                    {importStep === "upload" && (
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] font-black text-[#52525B] uppercase tracking-widest pl-1 italic">Import-Quelle auswählen</label>
                          <div className="grid grid-cols-3 gap-3">
                            {/* ClubDesk */}
                            <button
                              type="button"
                              onClick={() => setSelectedProvider("clubdesk")}
                              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-4 text-center transition-all ${
                                selectedProvider === "clubdesk"
                                  ? "border-[#0A0A0A] bg-black/[0.02] shadow-sm"
                                  : "border-black/5 bg-transparent hover:border-black/10 hover:bg-black/[0.005]"
                              }`}
                            >
                              <div className="h-10 flex items-center justify-center overflow-hidden rounded-xl bg-white px-3 py-1.5 border border-black/5 shadow-sm">
                                <img
                                  src="https://assets.reviews.omr.com/ucezzmrel1u19brhvuz4yix51qhj"
                                  alt="ClubDesk Logo"
                                  className="h-full object-contain"
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-wider">ClubDesk</h4>
                                <p className="text-[9px] text-[#71717A] font-medium mt-0.5">Smarter Spaltenabgleich</p>
                              </div>
                            </button>

                            {/* SpielerPlus */}
                            <button
                              type="button"
                              onClick={() => setSelectedProvider("spielerplus")}
                              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-4 text-center transition-all ${
                                selectedProvider === "spielerplus"
                                  ? "border-[#0A0A0A] bg-black/[0.02] shadow-sm"
                                  : "border-black/5 bg-transparent hover:border-black/10 hover:bg-black/[0.005]"
                              }`}
                            >
                              <div className="h-10 flex items-center justify-center overflow-hidden rounded-xl bg-white px-3 py-1.5 border border-black/5 shadow-sm">
                                <img
                                  src="https://cdn.prod.website-files.com/5f50ccfbebad96116fd08dee/682c7de3f38d7e1e55109dc1_SPIELERPLUS_LOGO.png"
                                  alt="SpielerPlus Logo"
                                  className="h-full object-contain"
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-wider">SpielerPlus</h4>
                                <p className="text-[9px] text-[#71717A] font-medium mt-0.5">Automatisches Mapping</p>
                              </div>
                            </button>

                            {/* Campai */}
                            <button
                              type="button"
                              onClick={() => setSelectedProvider("campai")}
                              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-4 text-center transition-all ${
                                selectedProvider === "campai"
                                  ? "border-[#0A0A0A] bg-black/[0.02] shadow-sm"
                                  : "border-black/5 bg-transparent hover:border-black/10 hover:bg-black/[0.005]"
                              }`}
                            >
                              <div className="h-10 flex items-center justify-center overflow-hidden rounded-xl bg-white px-3 py-1.5 border border-black/5 shadow-sm">
                                <img
                                  src="https://imageserver.stadionwelt.de/Image/7/1/2f415b94389287d1279b8a0e1d61871eaeeb51b82cc77a046a2d8058adf488/Campai_Large_X2.jpg"
                                  alt="Campai Logo"
                                  className="h-full object-contain"
                                />
                              </div>
                              <div className="flex flex-col items-center">
                                <h4 className="text-[11px] font-black text-[#0A0A0A] uppercase tracking-wider">campai</h4>
                                <p className="text-[9px] text-[#71717A] font-medium mt-0.5">Individueller Export</p>
                              </div>
                            </button>
                          </div>
                        </div>

                        {selectedProvider === "clubdesk" && (
                          <div className="flex flex-col gap-6">
                            <div className="p-5 rounded-2xl bg-black/[0.02] border border-black/5 flex flex-col gap-4 text-xs text-[#52525B] leading-relaxed">
                              <p className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[10px]">Anleitung für Clubdesk-Export:</p>
                              <ol className="list-decimal list-inside space-y-2 font-medium">
                                <li>Logge dich bei <strong>Clubdesk</strong> ein.</li>
                                <li>Gehe links im Hauptmenü auf <strong>„Kontakte“</strong> (oder „Mitglieder“).</li>
                                <li>Klicke oben in der Leiste auf den Button <strong>„Exportieren“</strong>.</li>
                                <li>Wähle im folgenden Fenster das Format <strong>„CSV“</strong> und lade die Datei auf deinen Computer herunter.</li>
                              </ol>
                              <p className="italic text-[10px] text-[#71717A]">Talo erkennt die Spalten wie Name, Vorname und E-Mail automatisch.</p>
                            </div>

                            <div className="relative border-2 border-dashed border-black/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-black/20 transition-all cursor-pointer bg-black/[0.01]">
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center text-[#71717A]">
                                <Plus size={20} />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">CSV-Datei auswählen</p>
                                <p className="text-[10px] text-[#71717A] font-medium mt-1">Klicken oder hierher ziehen</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedProvider === "spielerplus" && (
                          <div className="flex flex-col gap-6">
                            <div className="p-5 rounded-2xl bg-black/[0.02] border border-black/5 flex flex-col gap-4 text-xs text-[#52525B] leading-relaxed">
                              <p className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[10px]">Anleitung für SpielerPlus-Export:</p>
                              <ol className="list-decimal list-inside space-y-2 font-medium">
                                <li>Logge dich bei <strong>SpielerPlus</strong> ein.</li>
                                <li>Gehe links im Hauptmenü auf <strong>„Mitglieder“</strong>.</li>
                                <li>Klicke oben rechts auf den Button <strong>„Mitglieder verwalten“</strong> und wähle <strong>„Exportieren (CSV)“</strong>.</li>
                                <li>Lade die Datei herunter und wähle sie unten aus.</li>
                              </ol>
                              <p className="italic text-[10px] text-[#71717A]">Talo erkennt SpielerPlus Spalten und mappt diese automatisch.</p>
                            </div>

                            <div className="relative border-2 border-dashed border-black/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-black/20 transition-all cursor-pointer bg-black/[0.01]">
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center text-[#71717A]">
                                <Plus size={20} />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">CSV-Datei auswählen</p>
                                <p className="text-[10px] text-[#71717A] font-medium mt-1">Klicken oder hierher ziehen</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedProvider === "campai" && (
                          <div className="flex flex-col gap-6">
                            <div className="p-5 rounded-2xl bg-black/[0.02] border border-black/5 flex flex-col gap-4 text-xs text-[#52525B] leading-relaxed">
                              <p className="font-bold text-[#0A0A0A] uppercase tracking-wider text-[10px]">Anleitung für campai-Export:</p>
                              <ol className="list-decimal list-inside space-y-2 font-medium">
                                <li>Logge dich bei <strong>campai</strong> ein und gehe im linken Menü auf <strong>„Mitglieder“</strong>.</li>
                                <li>Filtere die Liste nach Bedarf über den Button <strong>„Filter“</strong> (z. B. Status: Aktiv).</li>
                                <li>Klicke auf das <strong>Zahnrad-Symbol</strong> (Spaltenkonfiguration) und wähle die gewünschten Spalten (Vorname, Nachname, E-Mail) per Haken aus.</li>
                                <li>Klicke oben rechts auf den Aktionen-/Export-Button und lade die <strong>CSV</strong>-Datei herunter.</li>
                              </ol>
                              <p className="italic text-[10px] text-[#71717A]">Talo erkennt die selbst konfigurierten campai-Spalten automatisch.</p>
                            </div>

                            <div className="relative border-2 border-dashed border-black/10 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-black/20 transition-all cursor-pointer bg-black/[0.01]">
                              <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              <div className="w-12 h-12 rounded-full bg-black/[0.04] flex items-center justify-center text-[#71717A]">
                                <Plus size={20} />
                              </div>
                              <div className="text-center">
                                <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">CSV-Datei auswählen</p>
                                <p className="text-[10px] text-[#71717A] font-medium mt-1">Klicken oder hierher ziehen</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Map Fields */}
                    {importStep === "map" && (
                      <div className="flex flex-col gap-6">
                        <p className="text-xs font-semibold text-[#52525B]">
                          Ordne die Talo-Felder den Spalten deiner hochgeladenen CSV-Datei zu:
                        </p>

                        <div className="flex flex-col gap-4 bg-black/[0.01] p-5 rounded-2xl border border-black/5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Vorname *</label>
                            <div className="relative w-full">
                              <select
                                value={fieldMappings.firstName}
                                onChange={(e) => setFieldMappings(prev => ({ ...prev, firstName: Number(e.target.value) }))}
                                className="w-full h-12 pl-4 pr-10 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#0A0A0A] focus:outline-none appearance-none cursor-pointer"
                              >
                                <option value={-1}>-- Spalte auswählen --</option>
                                {csvHeaders.map((h, idx) => (
                                  <option key={idx} value={idx}>{h}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Nachname *</label>
                            <div className="relative w-full">
                              <select
                                value={fieldMappings.lastName}
                                onChange={(e) => setFieldMappings(prev => ({ ...prev, lastName: Number(e.target.value) }))}
                                className="w-full h-12 pl-4 pr-10 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#0A0A0A] focus:outline-none appearance-none cursor-pointer"
                              >
                                <option value={-1}>-- Spalte auswählen --</option>
                                {csvHeaders.map((h, idx) => (
                                  <option key={idx} value={idx}>{h}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">E-Mail *</label>
                            <div className="relative w-full">
                              <select
                                value={fieldMappings.email}
                                onChange={(e) => setFieldMappings(prev => ({ ...prev, email: Number(e.target.value) }))}
                                className="w-full h-12 pl-4 pr-10 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#0A0A0A] focus:outline-none appearance-none cursor-pointer"
                              >
                                <option value={-1}>-- Spalte auswählen --</option>
                                {csvHeaders.map((h, idx) => (
                                  <option key={idx} value={idx}>{h}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider">Mitgliedertyp (Optional)</label>
                            <div className="relative w-full">
                              <select
                                value={fieldMappings.memberType}
                                onChange={(e) => setFieldMappings(prev => ({ ...prev, memberType: Number(e.target.value) }))}
                                className="w-full h-12 pl-4 pr-10 rounded-xl border border-black/10 bg-white text-xs font-semibold text-[#0A0A0A] focus:outline-none appearance-none cursor-pointer"
                              >
                                <option value={-1}>-- Standard (Aktiv) --</option>
                                {csvHeaders.map((h, idx) => (
                                  <option key={idx} value={idx}>{h}</option>
                                ))}
                              </select>
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#71717A]">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setImportStep("upload")}
                            className="flex-1 h-12 rounded-xl border border-black/10 font-bold text-xs uppercase tracking-widest text-[#52525B]"
                          >
                            Zurück
                          </button>
                          <button
                            onClick={generatePreview}
                            disabled={isPreviewLoading || fieldMappings.firstName === -1 || fieldMappings.lastName === -1 || fieldMappings.email === -1}
                            style={{ backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }}
                            className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest text-white disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {isPreviewLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                            ) : (
                              "Vorschau generieren"
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Preview */}
                    {importStep === "preview" && (
                      <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">
                          <span>Vorschau ({mappedMembers.filter(m => m.isValid && m.selected).length} bereit zum Import)</span>
                          {mappedMembers.some(m => !m.isValid) && (
                            <span className="text-red-500 font-semibold">{mappedMembers.filter(m => !m.isValid).length} Fehlerhaft</span>
                          )}
                        </div>

                        <div className="max-h-60 overflow-y-auto border border-black/5 rounded-2xl bg-black/[0.01] overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-black/5 text-[9px] font-black text-[#71717A] uppercase tracking-wider bg-black/[0.02]">
                                <th className="p-3 w-10 text-center">
                                  <input
                                    type="checkbox"
                                    checked={mappedMembers.length > 0 && mappedMembers.filter(m => m.isValid && !m.alreadyInClub).every(m => m.selected)}
                                    onChange={(e) => {
                                      const checked = e.target.checked;
                                      setMappedMembers(prev => prev.map(m => (m.isValid && !m.alreadyInClub) ? { ...m, selected: checked } : m));
                                    }}
                                    className="w-3.5 h-3.5 rounded border-black/10 text-black focus:ring-black accent-black cursor-pointer"
                                  />
                                </th>
                                <th className="p-3">Mitglied</th>
                                <th className="p-3">E-Mail</th>
                                <th className="p-3">Typ</th>
                                <th className="p-3 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-black/5">
                              {mappedMembers.map((m, idx) => (
                                <tr key={idx} className={`hover:bg-black/[0.01] transition-all ${!m.isValid ? "opacity-60 bg-red-500/[0.01]" : ""}`}>
                                  <td className="p-3 text-center">
                                    <input
                                      type="checkbox"
                                      disabled={!m.isValid || m.alreadyInClub}
                                      checked={m.selected}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setMappedMembers(prev => prev.map((item, i) => i === idx ? { ...item, selected: checked } : item));
                                      }}
                                      className="w-3.5 h-3.5 rounded border-black/10 text-black focus:ring-black accent-black cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                    />
                                  </td>
                                  <td className="p-3 font-semibold text-[#0A0A0A] whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span>{m.firstName} {m.lastName}</span>
                                      {m.alreadyInClub ? (
                                        <span className="px-1.5 py-0.5 rounded bg-black/[0.04] border border-black/5 text-[#52525B] text-[9px] font-black uppercase tracking-wider">
                                          Bereits im Verein
                                        </span>
                                      ) : m.alreadyExists ? (
                                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 text-[9px] font-black uppercase tracking-wider">
                                          Bestehendes Konto
                                        </span>
                                      ) : null}
                                    </div>
                                  </td>
                                  <td className="p-3 font-medium text-[#71717A] whitespace-nowrap font-mono text-[10px]">
                                    {m.email || "Keine E-Mail"}
                                  </td>
                                  <td className="p-3 whitespace-nowrap">
                                    {m.isValid ? (
                                      <select
                                        value={m.memberType}
                                        onChange={(e) => {
                                          const newType = e.target.value;
                                          setMappedMembers(prev => prev.map((item, i) => i === idx ? { ...item, memberType: newType } : item));
                                        }}
                                        className="h-8 px-2 py-0.5 rounded-lg border border-black/10 bg-white text-[10px] font-black uppercase tracking-wider text-[#0A0A0A] focus:outline-none cursor-pointer"
                                      >
                                        {availableTypes.map((type) => (
                                          <option key={type} value={type}>{type}</option>
                                        ))}
                                      </select>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-black/[0.04] text-[9px] uppercase tracking-widest font-black text-[#52525B]">
                                        {m.memberType}
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
                                    {m.isValid ? (
                                      <span className="text-green-600 font-bold text-[10px] uppercase tracking-wider">Bereit</span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-500 font-black text-[9px] uppercase tracking-wider">{m.errorReason}</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        <div className="flex items-center gap-3 p-4 rounded-2xl bg-black/[0.02] border border-black/5">
                          <input
                            type="checkbox"
                            id="bulkSendWelcomeEmails"
                            checked={sendWelcomeEmailsBulk}
                            onChange={(e) => setSendWelcomeEmailsBulk(e.target.checked)}
                            className="w-4 h-4 rounded border-black/10 text-black focus:ring-black accent-black cursor-pointer"
                          />
                          <label htmlFor="bulkSendWelcomeEmails" className="text-xs text-[#52525B] font-bold uppercase tracking-wider select-none cursor-pointer">
                            Willkommens-E-Mails direkt nach Erstellung automatisch an alle neuen Mitglieder senden
                          </label>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => setImportStep("map")}
                            className="flex-1 h-12 rounded-xl border border-black/10 font-bold text-xs uppercase tracking-widest text-[#52525B]"
                          >
                            Zurück
                          </button>
                          <button
                            onClick={() => {
                              const validCount = mappedMembers.filter(m => m.isValid && m.selected).length;
                              if (members.length + validCount > planFeatures.maxMembers) {
                                alert(`Mitgliederlimit (${planFeatures.maxMembers}) würde überschritten. Du kannst maximal ${planFeatures.maxMembers - members.length} neue Mitglieder hinzufügen.`);
                                return;
                              }
                              startImport();
                            }}
                            disabled={mappedMembers.filter(m => m.isValid && m.selected).length === 0}
                            style={{ backgroundColor: accent, color: accentLight ? "#0A0A0A" : "#FFFFFF" }}
                            className="flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-widest text-white disabled:opacity-50 shadow-lg shadow-black/10"
                          >
                            Import starten
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Step 4: Progress */}
                    {importStep === "progress" && (
                      <div className="flex flex-col gap-6 items-center justify-center py-8">
                        <div className="relative w-24 h-24 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full border-4 border-black/5" />
                          <div className="absolute inset-0 rounded-full border-4 border-[#0A0A0A] border-t-transparent animate-spin" />
                          <span className="text-lg font-black font-poppins text-[#0A0A0A]">{importProgress}%</span>
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                          <p className="text-xs font-bold text-[#0A0A0A] uppercase tracking-widest">Mitglieder werden angelegt...</p>
                          <p className="text-[10px] text-[#71717A] font-semibold italic">Importiere: {currentImportingName}</p>
                        </div>
                      </div>
                    )}

                    {/* Step 5: Complete */}
                    {importStep === "complete" && (
                      <div className="flex flex-col gap-6">
                        <div className="flex flex-col items-center justify-center gap-3 py-4 text-center">
                          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-600">
                            <Check size={28} strokeWidth={3} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <h3 className="text-lg font-bold font-logo uppercase tracking-widest text-[#0A0A0A]">Import erfolgreich!</h3>
                            <p className="text-xs text-[#52525B] font-medium max-w-sm leading-relaxed">
                              Die Mitglieder wurden erfolgreich in Talo registriert. Du kannst die Liste der Passwörter jetzt herunterladen.
                            </p>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl bg-black/[0.02] border border-black/5 flex justify-between items-center">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-[#0A0A0A] uppercase tracking-wider">Ergebnis-Report</span>
                            <span className="text-[10px] text-[#71717A] font-semibold">Enthält alle neuen Mitglieder und temporäre Passwörter</span>
                          </div>
                          <button
                            onClick={downloadResults}
                            className="px-4 py-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                          >
                            Report herunterladen (CSV)
                          </button>
                        </div>

                        <button
                          onClick={closeImportModal}
                          className="w-full h-12 rounded-xl border border-black/10 font-bold text-xs uppercase tracking-widest text-[#0A0A0A] hover:bg-black/[0.02]"
                        >
                          Fertigstellen
                        </button>
                      </div>
                    )}

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
  const accentRaw = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";
  const accentLight = isLightColor(accent);
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
                  const mEntries = entries.filter((e) => e.memberId === member.id && e.status === "Genehmigt" && toDate(e.date) <= new Date());
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
}: {
  data: LeaderboardItem[];
  groups: ClubGroup[];
  showGroupLeaderboards: boolean;
  showAdvancedStats: boolean;
}) {
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);
  const completedMembers = data.filter((item) => item.progress >= 1).length;

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
                  <Swords size={13} className="text-amber-500" /> Gruppenrangliste (Durchschnitt pro Kopf)
                </div>
              </div>

              {/* Duel Card Container */}
              <div className="rounded-[28px] bg-white border border-black/5 p-6 shadow-sm flex flex-col gap-5">
                {groups
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
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] ${index === 0 ? "bg-amber-100 text-amber-600 border border-amber-200" : "bg-black/[0.04] text-[#71717A]"
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
                              {duel.averagePoints.toFixed(1)} Pkt. / Kopf
                            </span>
                            <span className="text-[10px] text-[#A1A1AA] hidden sm:inline">({duel.totalPoints.toFixed(1)} Pkt. insgesamt / {duel.memberCount} Pers.)</span>
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
                  })}
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
      className={`shrink-0 px-3.5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${selected
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
