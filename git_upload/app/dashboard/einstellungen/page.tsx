"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Lock, LogOut, Building2, ShieldCheck, Dumbbell,
  Calendar, Euro, Target, FileSpreadsheet, FileText,
  Users, Settings2, Download, Check, ChevronRight, Key, Sparkles,
  ImageIcon, Palette, Layers, Trash2, Plus
} from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from "firebase/firestore";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { SeasonType, Entry, Member, ClubGroup, PLAN_TIERS, getPlanFeatures, CustomMemberType, isLightColor, MemberType, PointFactors } from "@/lib/firebase/models";
import {
  GlassSection, TLine, TAvatar, TButton, TBadge,
  PlanLockedField, PlanUpsell
} from "@/app/components/ui/NativeUI";
import {
  csvForEntries, csvForMembers, downloadTextFile, exportFilename,
} from "@/lib/exports/csv";
import {
  downloadAnnualReport, downloadMemberList,
} from "@/lib/exports/pdf";

const SEASON_TYPES = [
  SeasonType.Calendar,
  SeasonType.Club,
  SeasonType.School,
];

function formatLicenseDate(value: Timestamp | Date): string {
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleDateString("de-DE");
}

type ExportKey =
  | "entries-csv"
  | "members-csv"
  | "annual-report-pdf"
  | "member-list-pdf";

function SettingsPricingCard({
  tier,
  isCurrent,
  isSimulating,
  simulateUpgrade
}: {
  tier: typeof PLAN_TIERS[0],
  isCurrent: boolean,
  isSimulating: string | null,
  simulateUpgrade: (key: string) => void
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleFeatures = showAll ? tier.features : tier.features.slice(0, 4);
  const hasMore = tier.features.length > 4;

  return (
    <div className={`relative flex flex-col p-5 rounded-2xl bg-white border shrink-0 ${tier.popular ? "border-black/20 shadow-md scale-[1.01]" : "border-black/5 shadow-sm"} overflow-hidden`}>
      {tier.popular && (
        <div className="absolute top-0 right-0 bg-[#0A0A0A] text-white px-3 py-1 rounded-bl-xl rounded-tr-2xl text-[10px] items-center gap-1 font-bold flex">
          <Sparkles size={10} /> Favorit
        </div>
      )}
      <h3 className="text-xl font-bold font-logo text-[#0A0A0A] uppercase tracking-wide">
        {tier.name}
      </h3>
      <p className="text-xs text-[#52525B] mt-1 line-clamp-1">{tier.desc}</p>
      
      <div className="mt-4 mb-5">
        <span className="text-3xl font-black font-poppins text-[#0A0A0A]">{tier.price}</span>
        <span className="text-sm font-semibold text-[#71717A] ml-1">{tier.period}</span>
      </div>

      <div className="flex flex-col gap-2.5 mb-6 flex-1">
        {visibleFeatures.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 text-[#0A0A0A] mt-0.5 shrink-0" strokeWidth={3} />
            <span className="text-[11px] font-medium text-[#52525B] leading-snug">{feature}</span>
          </div>
        ))}
        {hasMore && (
          <button 
            onClick={() => setShowAll(!showAll)}
            className="text-[11px] font-semibold text-[#71717A] underline underline-offset-2 hover:text-[#0A0A0A] self-start mt-1"
          >
            {showAll ? "Weniger anzeigen" : `+ ${tier.features.length - 4} weitere`}
          </button>
        )}
      </div>

      <div className="mt-auto">
        <button
          onClick={() => simulateUpgrade(tier.key)}
          disabled={isCurrent || isSimulating === tier.key}
          className={`w-full py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-200 border ${
            isCurrent
              ? "bg-green-50 text-green-700 border-green-200/50 cursor-default"
              : tier.popular
              ? "bg-[#0A0A0A] text-white hover:bg-black/80 border-transparent active:scale-95"
              : "bg-white text-[#0A0A0A] border-black/10 hover:bg-black/5 active:scale-95"
          }`}
        >
          {isSimulating === tier.key
            ? "Lade..."
            : isCurrent
            ? "Aktueller Plan"
            : "Plan auswählen"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub = useAppStore((s) => s.currentClub);
  const setCurrentClub = useAppStore((s) => s.setCurrentClub);

  const [resetState, setResetState] = useState<"idle" | "loading" | "sent">("idle");

  const [clubName, setClubName] = useState(currentClub?.name ?? "");
  const [requiredPoints, setRequiredPoints] = useState(String(currentClub?.requiredPoints ?? 15));
  const [compensation, setCompensation] = useState(String(currentClub?.compensationPerMissingPoint ?? 0));
  const [seasonType, setSeasonType] = useState<string>(currentClub?.seasonType ?? SeasonType.Calendar);
  const [approvalRequired, setApprovalRequired] = useState(currentClub?.approvalRequired ?? true);
  const [logoUrl, setLogoUrl] = useState(currentClub?.logoUrl ?? "");
  const [sStart, setSStart] = useState<string>("");
  const [sEnd, setSEnd] = useState<string>("");
  const [brandColor, setBrandColor] = useState(currentClub?.brandColor ?? "#0A0A0A");
  const [accentColor, setAccentColor] = useState(currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A");
  const [customMemberTypes, setCustomMemberTypes] = useState<CustomMemberType[]>(currentClub?.customMemberTypes ?? []);
  const [memberTypeFactors, setMemberTypeFactors] = useState<Record<string, number>>(currentClub?.memberTypeFactors ?? {});
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeFactor, setNewTypeFactor] = useState("100");
  const [clubState, setClubState] = useState<"idle" | "saving" | "saved">("idle");

  const thisYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${thisYear}-01-01`);
  const [toDate, setToDate] = useState(`${thisYear}-12-31`);

  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);
  const [groups, setGroups] = useState<ClubGroup[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [savingGroup, setSavingGroup] = useState(false);
  const [busyExport, setBusyExport] = useState<ExportKey | null>(null);

  // License Activation State
  const [licKeyInput, setLicKeyInput] = useState("");
  const [licState, setLicState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [licMsg, setLicMsg] = useState("");
  const [isSimulating, setIsSimulating] = useState<string | null>(null);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;
  const planFeatures = getPlanFeatures(currentClub?.plan);

  const formatTimestampForInput = (ts: any) => {
    if (!ts) return "";
    const date = ts instanceof Date ? ts : ts.toDate ? ts.toDate() : new Date(ts);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (!currentClub) return;
    setClubName(currentClub.name);
    setRequiredPoints(String(currentClub.requiredPoints));
    setCompensation(String(currentClub.compensationPerMissingPoint ?? 0));
    setSeasonType(currentClub.seasonType);
    setApprovalRequired(currentClub.approvalRequired);
    setLogoUrl(currentClub.logoUrl ?? "");
    setSStart(formatTimestampForInput(currentClub.seasonStart));
    setSEnd(formatTimestampForInput(currentClub.seasonEnd));
    setBrandColor(currentClub.brandColor ?? "#0A0A0A");
    setAccentColor(currentClub.accentColor ?? currentClub.brandColor ?? "#0A0A0A");
    setCustomMemberTypes(currentClub.customMemberTypes ?? []);
    setMemberTypeFactors(currentClub.memberTypeFactors ?? {});
  }, [currentClub]);

  useEffect(() => {
    if (!currentClub || !isAdmin) return;
    const u1 = FirebaseManager.listenToMembers(currentClub.id, setAllMembers);
    const u2 = FirebaseManager.listenToEntries(currentClub.id, setAllEntries);
    return () => {
      u1();
      u2();
    };
  }, [currentClub, isAdmin]);

  useEffect(() => {
    if (!currentClub || !planFeatures.hasGroups) return;
    return FirebaseManager.listenToGroups(currentClub.id, setGroups);
  }, [currentClub, planFeatures.hasGroups]);

  const visibleGroups = planFeatures.hasGroups ? groups : [];

  const sendPasswordReset = async () => {
    if (!currentMember?.email) return;
    setResetState("loading");
    try {
      const res = await fetch("/api/auth/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentMember.email }),
      });
      if (res.ok) {
        setResetState("sent");
      } else {
        setResetState("idle");
      }
    } catch {
      setResetState("idle");
    }
  };

  const simulateUpgrade = async (planKey: string) => {
    if (!currentClub) return;
    setIsSimulating(planKey);
    try {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      const updates = {
        plan: planKey,
        licenseStatus: "active",
        licenseExpiresAt: expiresAt
      };
      await FirebaseManager.updateClub(currentClub.id, updates);
      setCurrentClub({ ...currentClub, ...updates });
      
      setLicState("success");
      setLicMsg(`Erfolgreich auf den ${planKey} Plan gewechselt! (Zahlungssimulation)`);
      setTimeout(() => {
        setLicState("idle");
        setLicMsg("");
      }, 4000);
    } catch {
      setLicState("error");
      setLicMsg("Fehler beim Plan-Upgrade.");
    } finally {
      setIsSimulating(null);
    }
  };

  const activateLicense = async () => {
    if (!currentClub || !licKeyInput.trim()) return;
    setLicState("loading");
    setLicMsg("");
    try {
      const parsedKey = licKeyInput.trim().toUpperCase();
      const q = query(collection(db, "licenses"), where("key", "==", parsedKey));
      const snap = await getDocs(q);
      if (snap.empty) {
        setLicState("error");
        setLicMsg("Ungültiger Lizenzschlüssel.");
        return;
      }
      
      const licDoc = snap.docs[0];
      const licData = licDoc.data();
      
      if (licData.status !== "active") {
        setLicState("error");
        setLicMsg("Dieser Lizenzschlüssel wurde bereits eingelöst oder ist ungültig.");
        return;
      }

      // 1. Update License (Mark as used)
      await updateDoc(doc(db, "licenses", licDoc.id), {
        status: "used",
        usedByOrgId: currentClub.id,
        usedAt: Timestamp.now()
      });

      // 2. Update Club Plan
      const updates = {
        plan: licData.plan,
        licenseStatus: "active",
        licenseExpiresAt: licData.expiresAt,
        isTrial: licData.isTrial ?? false
      };
      
      await FirebaseManager.updateClub(currentClub.id, updates);
      setCurrentClub({ ...currentClub, ...updates });
      
      setLicState("success");
      setLicMsg("Lizenz erfolgreich aktiviert!");
      setLicKeyInput("");
      setTimeout(() => {
        setLicState("idle");
        setLicMsg("");
      }, 4000);

    } catch {
      setLicState("error");
      setLicMsg("Netzwerkfehler.");
    }
  };

  const saveClub = async () => {
    if (!currentClub) return;
    setClubState("saving");
    try {
      const updates = {
        name: clubName.trim(),
        requiredPoints: parseFloat(requiredPoints) || 15,
        compensationPerMissingPoint: parseFloat(compensation) || 0,
        seasonType,
        approvalRequired,
        ...(planFeatures.hasClubLogo ? { logoUrl: logoUrl.trim() } : {}),
        ...(planFeatures.hasCustomSeason && seasonType === SeasonType.Custom ? { 
          seasonStart: sStart ? Timestamp.fromDate(new Date(sStart)) : null,
          seasonEnd: sEnd ? Timestamp.fromDate(new Date(sEnd)) : null
        } : {}),
        ...(planFeatures.hasClubColors ? { brandColor, accentColor } : {}),
        ...(planFeatures.hasCustomMemberTypes ? { customMemberTypes, memberTypeFactors } : {}),
      };
      await FirebaseManager.updateClub(currentClub.id, updates);
      setCurrentClub({ ...currentClub, ...updates });
      setClubState("saved");
      setTimeout(() => setClubState("idle"), 2200);
    } catch {
      setClubState("idle");
    }
  };

  const saveGroup = async () => {
    if (!currentClub || !planFeatures.hasGroups || !groupName.trim()) return;
    setSavingGroup(true);
    try {
      await FirebaseManager.addGroup(currentClub.id, {
        name: groupName.trim(),
        description: groupDescription.trim() || undefined,
      });
      setGroupName("");
      setGroupDescription("");
    } finally {
      setSavingGroup(false);
    }
  };

  const deleteGroup = async (groupId: string) => {
    if (!currentClub || !planFeatures.hasGroups) return;
    if (!window.confirm("Gruppe löschen? Mitglieder werden aus dieser Gruppe entfernt.")) return;
    await FirebaseManager.deleteGroup(currentClub.id, groupId);
  };

  const addCustomMemberType = async () => {
    if (!newTypeName.trim() || !currentClub) return;
    const factor = Math.min(Math.max(parseFloat(newTypeFactor) || 100, 0), 200) / 100;
    const newType: CustomMemberType = {
      id: crypto.randomUUID(),
      name: newTypeName.trim(),
      pointFactor: factor,
    };
    const updated = [...customMemberTypes, newType];
    setCustomMemberTypes(updated);
    setNewTypeName("");
    setNewTypeFactor("100");
    await FirebaseManager.updateClub(currentClub.id, { customMemberTypes: updated });
    setCurrentClub({ ...currentClub, customMemberTypes: updated });
  };

  const removeCustomMemberType = async (id: string) => {
    if (!currentClub) return;
    const updated = customMemberTypes.filter((t) => t.id !== id);
    setCustomMemberTypes(updated);
    await FirebaseManager.updateClub(currentClub.id, { customMemberTypes: updated });
    setCurrentClub({ ...currentClub, customMemberTypes: updated });
  };

  const updateBuiltInFactor = async (typeName: string, pct: string) => {
    if (!currentClub) return;
    const factor = Math.min(Math.max(parseFloat(pct) || 0, 0), 200) / 100;
    const updated = { ...memberTypeFactors, [typeName]: factor };
    setMemberTypeFactors(updated);
    await FirebaseManager.updateClub(currentClub.id, { memberTypeFactors: updated });
    setCurrentClub({ ...currentClub, memberTypeFactors: updated });
  };

  const runExport = async (key: ExportKey) => {
    if (!currentClub) return;
    
    const planFeatures = getPlanFeatures(currentClub.plan);
    const isPdf = key.includes("pdf");
    const isCsv = key.includes("csv");

    if (isCsv && !planFeatures.canExportCsv) {
      alert("CSV-Exporte sind in deinem aktuellen Plan nicht enthalten (ab Verein verfügbar).");
      return;
    }
    if (isPdf && !planFeatures.canExportPdf) {
      alert("PDF-Exporte sind in deinem aktuellen Plan nicht enthalten (ab Club verfügbar).");
      return;
    }

    setBusyExport(key);
    try {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);

      // Small yield so the UI can show the busy state on big exports
      await new Promise((r) => setTimeout(r, 30));

      if (key === "entries-csv") {
        downloadTextFile(
          exportFilename("entries-csv", currentClub, from, to),
          csvForEntries(allEntries, allMembers, from, to),
        );
      } else if (key === "members-csv") {
        downloadTextFile(
          exportFilename("members-csv", currentClub, from, to),
          csvForMembers(allMembers, allEntries, currentClub, from, to),
        );
      } else if (key === "annual-report-pdf") {
        downloadAnnualReport(currentClub, allMembers, allEntries, from, to);
      } else if (key === "member-list-pdf") {
        downloadMemberList(currentClub, allMembers, allEntries, from, to);
      }
    } finally {
      setTimeout(() => setBusyExport(null), 400);
    }
  };

  if (!currentMember) return null;

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* PAGE HEADER */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between border-b border-black/5 pb-6 lg:pb-8">
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Einstellungen</h1>
              <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Konto, Verein & Exporte</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* LEFT: Profile */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:sticky lg:top-6"
          >
            <GlassSection>
              <div className="p-6 flex flex-col items-center gap-3">
                <TAvatar
                  name={`${currentMember.firstName} ${currentMember.lastName}`}
                  id={currentMember.id}
                  size={72}
                  imageUrl={currentMember.profileImageUrl}
                />
                <div className="flex max-w-full flex-col items-center gap-0.5 text-center">
                  <h2 className="text-[18px] font-poppins font-bold text-[#0A0A0A] leading-tight">
                    {currentMember.firstName} {currentMember.lastName}
                  </h2>
                  <p className="max-w-full break-all text-[12px] font-poppins text-[#52525B]">{currentMember.email}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-center pt-1">
                  {isAdmin && <TBadge label="Admin" icon={ShieldCheck} color="#0A0A0A" />}
                  {isTrainer && !isAdmin && <TBadge label="Trainer" icon={Dumbbell} color="#52525B" />}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wider bg-black/[0.05] border border-black/10 text-[#52525B]">
                    {currentMember.memberType}
                  </span>
                </div>
              </div>

              <TLine />

              <div className="p-2">
                <SettingsRow
                  icon={Lock}
                  label="Passwort ändern"
                  sub="Reset-Link an deine E-Mail"
                  onClick={sendPasswordReset}
                  busy={resetState === "loading"}
                  done={resetState === "sent"}
                />
                <SettingsRow
                  icon={LogOut}
                  label="Abmelden"
                  sub="Von diesem Gerät ausloggen"
                  onClick={() => signOut(auth)}
                  variant="danger"
                />
              </div>
            </GlassSection>
          </motion.div>

          {/* RIGHT: Content sections */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* VEREIN */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col gap-3"
            >
              <SectionHeader title={isAdmin ? "VEREIN VERWALTEN" : "VEREIN"} icon={Building2} color="#0A0A0A" />
              {isAdmin ? (
                <GlassSection>
                  <div className="p-5 flex flex-col gap-4">
                    <Field icon={Building2} label="Vereinsname">
                      <Input value={clubName} onChange={setClubName} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field icon={Target} label="Pflichtpunkte / Jahr">
                        <Input value={requiredPoints} onChange={setRequiredPoints} type="number" step="0.5" />
                      </Field>
                      <Field icon={Euro} label="Ausgleichsbetrag / Punkt">
                        <Input value={compensation} onChange={setCompensation} type="number" step="0.5" suffix="€" />
                      </Field>
                    </div>
                    <Field icon={Calendar} label="Saisontyp">
                      <Select value={seasonType} onChange={setSeasonType} options={Object.values(SeasonType).map(s => ({ value: s, label: s }))} />
                    </Field>

                    <PlanLockedField
                      locked={!planFeatures.hasCustomSeason}
                      label="Individueller Zeitraum"
                      unlockText="ab Verein"
                    >
                      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 transition-opacity ${seasonType !== SeasonType.Custom ? "opacity-40 pointer-events-none" : ""}`}>
                        <Field label="Saisonstart">
                          <Input value={sStart} onChange={setSStart} type="date" />
                        </Field>
                        <Field label="Saisonende">
                          <Input value={sEnd} onChange={setSEnd} type="date" />
                        </Field>
                      </div>
                    </PlanLockedField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PlanLockedField
                        locked={!planFeatures.hasClubLogo}
                        label="Vereinslogo"
                        unlockText="ab Verein"
                      >
                        <Field icon={ImageIcon} label="Logo-URL">
                          <Input value={logoUrl} onChange={setLogoUrl} placeholder="https://..." />
                        </Field>
                      </PlanLockedField>
                      <PlanLockedField
                        locked={!planFeatures.hasClubColors}
                        label="Vereinsfarben"
                        unlockText="ab Pro"
                      >
                        <Field icon={Palette} label="Akzentfarbe">
                          <ColorPicker value={accentColor} onChange={setAccentColor} />
                        </Field>
                      </PlanLockedField>
                    </div>

                    <TLine />

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-poppins font-semibold text-[#0A0A0A] text-sm">Genehmigungspflicht</span>
                        <span className="text-[11px] font-poppins text-[#52525B]">
                          {approvalRequired ? "Einträge brauchen Admin-Freigabe" : "Auto-Genehmigung"}
                        </span>
                      </div>
                      <Toggle value={approvalRequired} onChange={setApprovalRequired} />
                    </div>

                    <div className="pt-1">
                      <TButton
                        label={clubState === "saving" ? "Speichert…" : clubState === "saved" ? "Gespeichert ✓" : "Änderungen speichern"}
                        onClick={saveClub}
                        disabled={clubState !== "idle"}
                      />
                    </div>
                  </div>
                </GlassSection>
              ) : (
                <GlassSection>
                  <div className="p-2">
                    <InfoRow icon={Building2} label="Verein" value={currentClub?.name ?? "–"} color="#0A0A0A" />
                    <TLine className="ml-[68px]" />
                    <InfoRow icon={Target} label="Pflichtpunkte" value={`${currentClub?.requiredPoints ?? 15} Punkte / Jahr`} color="#0A0A0A" />
                    <TLine className="ml-[68px]" />
                    <InfoRow icon={Euro} label="Ausgleichsbetrag" value={`${(currentClub?.compensationPerMissingPoint ?? 0).toFixed(2)} € / fehlendem Punkt`} color="#0A0A0A" />
                    <TLine className="ml-[68px]" />
                    <InfoRow icon={Calendar} label="Saisontyp" value={currentClub?.seasonType ?? "–"} color="#0A0A0A" />
                    {currentClub?.logoUrl && planFeatures.hasClubLogo && (
                      <>
                        <TLine className="ml-[68px]" />
                        <InfoRow icon={ImageIcon} label="Vereinslogo" value="Aktiv" color="#0A0A0A" />
                      </>
                    )}
                  </div>
                </GlassSection>
              )}
            </motion.div>

            {/* GRUPPEN & TEAMS (Club+) */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.11 }}
                className="flex flex-col gap-3"
              >
                <SectionHeader title="GRUPPEN & TEAMS" icon={Layers} color="#0A0A0A" />
                <GlassSection>
                  {!planFeatures.hasGroups ? (
                    <PlanUpsell
                      title="Gruppen sind ab dem Club-Plan verfügbar."
                      text="Erstelle Teams, Abteilungen und Gruppenranglisten, sobald der Verein auf Club oder höher läuft."
                    />
                  ) : (
                    <div className="p-5 flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                        <Field icon={Layers} label="Gruppenname">
                          <Input value={groupName} onChange={setGroupName} placeholder="z.B. Jugend, Damen, Team A" />
                        </Field>
                        <Field label="Beschreibung">
                          <Input value={groupDescription} onChange={setGroupDescription} placeholder="Optional" />
                        </Field>
                        <TButton
                          label="Anlegen"
                          icon={Plus}
                          onClick={saveGroup}
                          disabled={savingGroup || !groupName.trim()}
                          className="rounded-xl py-2.5"
                        />
                      </div>

                      <TLine />

                      {visibleGroups.length === 0 ? (
                        <p className="text-sm font-poppins text-[#71717A]">
                          Noch keine Gruppen angelegt.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {visibleGroups.map((group) => {
                            const count = allMembers.filter((member) => member.groupId === group.id).length;
                            return (
                              <div key={group.id} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] border border-black/5 px-4 py-3">
                                <div className="w-9 h-9 rounded-xl bg-white border border-black/5 flex items-center justify-center">
                                  <Layers size={15} className="text-[#0A0A0A]" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-poppins font-bold text-sm text-[#0A0A0A]">{group.name}</p>
                                  <p className="truncate text-[11px] text-[#71717A]">
                                    {count} Mitglieder{group.description ? ` · ${group.description}` : ""}
                                  </p>
                                </div>
                                <button
                                  onClick={() => deleteGroup(group.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </GlassSection>
              </motion.div>
            )}

            {/* MITGLIEDERTYPEN (Club+) */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.115 }}
                className="flex flex-col gap-3"
              >
                <SectionHeader title="MITGLIEDERTYPEN" icon={Users} color="#0A0A0A" />
                <GlassSection>
                  {!planFeatures.hasCustomMemberTypes ? (
                    <PlanUpsell
                      title="Mitgliedertypen konfigurieren ist ab dem Club-Plan verfügbar."
                      text="Passe die Punkt-Faktoren für Aktiv, Passiv & Co. an und erstelle eigene Typen wie Fördermitglied."
                    />
                  ) : (
                    <div className="p-5 flex flex-col gap-5">

                      {/* Built-in types */}
                      <div className="flex flex-col gap-2">
                        <p className="text-[10px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em] pl-1">Standardtypen – Punkte-Faktor</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {([MemberType.Active, MemberType.Passive, MemberType.Youth, MemberType.Board] as const).map((type) => {
                            const defaultPct = Math.round((PointFactors[type] ?? 0) * 100);
                            const currentPct = memberTypeFactors[type] !== undefined
                              ? Math.round(memberTypeFactors[type] * 100)
                              : defaultPct;
                            return (
                              <div key={type} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] border border-black/5 px-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                  <p className="font-poppins font-bold text-sm text-[#0A0A0A]">{type}</p>
                                  <p className="text-[10px] text-[#A1A1AA]">Standard: {defaultPct} %</p>
                                </div>
                                <div className="w-24 shrink-0">
                                  <Input
                                    value={String(currentPct)}
                                    onChange={(v) => setMemberTypeFactors((prev) => ({
                                      ...prev,
                                      [type]: Math.min(Math.max(parseFloat(v) || 0, 0), 200) / 100,
                                    }))}
                                    type="number"
                                    step="5"
                                    suffix="%"
                                  />
                                </div>
                                <button
                                  onClick={() => updateBuiltInFactor(type, String(currentPct))}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#0A0A0A] hover:bg-black/[0.06] transition-all shrink-0"
                                  title="Speichern"
                                >
                                  <Check size={14} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <TLine />

                      {/* Custom types */}
                      <div className="flex flex-col gap-3">
                        <p className="text-[10px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em] pl-1">Eigene Typen anlegen</p>
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
                          <Field icon={Users} label="Bezeichnung">
                            <Input value={newTypeName} onChange={setNewTypeName} placeholder="z.B. Fördermitglied" />
                          </Field>
                          <Field label="Punkte-%">
                            <Input value={newTypeFactor} onChange={setNewTypeFactor} type="number" step="5" suffix="%" />
                          </Field>
                          <TButton
                            label="Anlegen"
                            icon={Plus}
                            onClick={addCustomMemberType}
                            disabled={!newTypeName.trim()}
                            className="rounded-xl py-2.5"
                          />
                        </div>

                        {customMemberTypes.length > 0 && (
                          <div className="flex flex-col gap-2">
                            {customMemberTypes.map((t) => (
                              <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-black/[0.03] border border-black/5 px-4 py-3">
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-poppins font-bold text-sm text-[#0A0A0A]">{t.name}</p>
                                  <p className="text-[11px] text-[#71717A]">{Math.round(t.pointFactor * 100)} % der Pflichtpunkte</p>
                                </div>
                                <button
                                  onClick={() => removeCustomMemberType(t.id)}
                                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] font-poppins text-[#71717A]">
                        Änderungen werden sofort gespeichert. Eigene Typen erscheinen beim Mitglied anlegen.
                      </p>
                    </div>
                  )}
                </GlassSection>
              </motion.div>
            )}

            {/* LIZENZ & PLAN (Admin only) */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-3">
                  <SectionHeader title="LIZENZ & PLAN" icon={Key} color="#0A0A0A" />
                  
                  {/* Current Plan Overview */}
                  <GlassSection>
                    <div className="p-5 flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1.5 p-4 rounded-xl bg-black/[0.03] border border-black/5 flex-1">
                          <span className="text-[10px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em]">Aktueller Plan</span>
                          <span className="font-poppins font-bold text-lg text-[#0A0A0A] flex items-center gap-2">
                            {planFeatures.name}
                            {currentClub?.isTrial && (
                              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#0A0A0A] text-white">Trial</span>
                            )}
                          </span>
                          <span className="text-xs text-[#52525B]">
                            {currentClub?.licenseExpiresAt ? `${currentClub.isTrial ? "Testphase läuft bis" : "Ablauf"}: ${formatLicenseDate(currentClub.licenseExpiresAt)}` : "Kostenlose Version"}
                          </span>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-2 p-4 rounded-xl bg-black/[0.03] border border-black/5">
                          <span className="text-[10px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em]">Lizenzschlüssel einlösen</span>
                          <div className="flex gap-2 w-full">
                            <div className="flex-1">
                              <Input value={licKeyInput} onChange={setLicKeyInput} type="text" />
                            </div>
                            <div className="w-[120px]">
                              <TButton
                                label={licState === "loading" ? "..." : "Einlösen"}
                                onClick={activateLicense}
                                disabled={licState === "loading" || !licKeyInput.trim()}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {licMsg && (
                        <p className={`text-sm ${licState === "error" ? "text-red-500" : "text-green-600"}`}>
                          {licMsg}
                        </p>
                      )}
                    </div>
                  </GlassSection>
                </div>

                {/* Plan Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  {PLAN_TIERS.map((tier) => {
                    const isCurrent = planFeatures.key === tier.key;
                    return (
                      <SettingsPricingCard
                        key={tier.key}
                        tier={tier}
                        isCurrent={isCurrent}
                        isSimulating={isSimulating}
                        simulateUpgrade={simulateUpgrade}
                      />
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* EXPORTE (Admin only) */}
            {isAdmin && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="flex flex-col gap-3"
              >
                <SectionHeader title="BERICHTE & EXPORTE" icon={Download} color="#0A0A0A" />
                <GlassSection>
                  <div className="p-5 flex flex-col gap-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field icon={Calendar} label="Von">
                        <Input value={fromDate} onChange={setFromDate} type="date" />
                      </Field>
                      <Field icon={Calendar} label="Bis">
                        <Input value={toDate} onChange={setToDate} type="date" />
                      </Field>
                    </div>

                    <TLine />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <ExportCard
                        icon={FileSpreadsheet}
                        title="Einträge"
                        sub="CSV · alle Einträge im Zeitraum"
                        badge="CSV"
                        busy={busyExport === "entries-csv"}
                        disabledStr={!getPlanFeatures(currentClub?.plan).canExportCsv ? "Plan Upgrade erforderlich" : undefined}
                        onClick={() => runExport("entries-csv")}
                      />
                      <ExportCard
                        icon={Users}
                        title="Mitglieder"
                        sub="CSV · Punkte, Fehlend, Ausgleich €"
                        badge="CSV"
                        busy={busyExport === "members-csv"}
                        disabledStr={!getPlanFeatures(currentClub?.plan).canExportCsv ? "Plan Upgrade erforderlich" : undefined}
                        onClick={() => runExport("members-csv")}
                      />
                      <ExportCard
                        icon={FileText}
                        title="Jahresbericht"
                        sub="PDF · Übersicht, Tabelle, Kategorien"
                        badge="PDF"
                        busy={busyExport === "annual-report-pdf"}
                        disabledStr={!getPlanFeatures(currentClub?.plan).canExportPdf ? "Plan Upgrade erforderlich" : undefined}
                        onClick={() => runExport("annual-report-pdf")}
                      />
                      <ExportCard
                        icon={FileText}
                        title="Mitgliederliste"
                        sub="PDF · Status pro Mitglied"
                        badge="PDF"
                        busy={busyExport === "member-list-pdf"}
                        disabledStr={!getPlanFeatures(currentClub?.plan).canExportPdf ? "Plan Upgrade erforderlich" : undefined}
                        onClick={() => runExport("member-list-pdf")}
                      />
                    </div>

                    <p className="text-[11px] font-poppins text-[#71717A]">
                      Exporte werden direkt heruntergeladen — kein Druck-Dialog, kein neuer Tab.
                    </p>
                  </div>
                </GlassSection>
              </motion.div>
            )}

            {/* APP INFO */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3"
            >
              <SectionHeader title="APP" icon={Settings2} color="#0A0A0A" />
              <GlassSection>
                <div className="p-2">
                  <InfoRow icon={Settings2} label="Version" value="Talo Web · 0.1" color="#0A0A0A" />
                  <TLine className="ml-[68px]" />
                  <InfoRow icon={User} label="Synchronisation" value="Live mit iOS-App" color="#0A0A0A" />
                </div>
              </GlassSection>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}

// ── Components ────────────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon, color }: { title: string; icon: React.ElementType; color: string }) {
  return (
    <div className="flex items-center gap-2 px-1 pb-1">
      <Icon size={13} style={{ color }} strokeWidth={3} />
      <span className="text-[10px] font-poppins font-bold text-[#52525B] tracking-[0.2em] uppercase">{title}</span>
    </div>
  );
}

function InfoRow({
  icon: Icon, label, value, color,
}: { icon: React.ElementType; label: string; value: string; color: string }) {
  return (
    <div className="w-full flex items-center gap-4 px-4 py-3.5 text-left">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}10`, color }}
      >
        <Icon size={17} strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block font-poppins font-semibold text-[#0A0A0A] text-[14px] leading-tight">{label}</span>
        <span className="block text-[12px] font-poppins text-[#52525B] truncate">{value}</span>
      </div>
    </div>
  );
}

function SettingsRow({
  icon: Icon, label, sub, onClick, busy, done, variant = "default",
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  onClick: () => void;
  busy?: boolean;
  done?: boolean;
  variant?: "default" | "danger";
}) {
  const isDanger = variant === "danger";
  const color = isDanger ? "#B91C1C" : "#0A0A0A";
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="w-full flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-black/[0.03] transition-colors text-left disabled:opacity-50"
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}10`, color }}
      >
        <Icon size={16} strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="block font-poppins font-semibold text-[14px] leading-tight" style={{ color: isDanger ? color : "#0A0A0A" }}>
          {label}
        </span>
        <span className="block text-[11.5px] font-poppins text-[#71717A] truncate">{sub}</span>
      </div>
      {busy ? (
        <span className="text-[11px] font-poppins text-[#71717A]">…</span>
      ) : done ? (
        <Check size={16} className="text-[#16803D]" strokeWidth={2.5} />
      ) : (
        <ChevronRight size={14} className="text-[#A1A1AA]" />
      )}
    </button>
  );
}

function Field({ icon: Icon, label, children }: { icon?: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 pl-1">
        {Icon && <Icon size={11} className="text-[#71717A]" strokeWidth={2.5} />}
        <label className="text-[10px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em]">{label}</label>
      </div>
      {children}
    </div>
  );
}

function Input({
  value, onChange, type = "text", step, suffix, placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  type?: string;
  step?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl bg-black/[0.03] border border-black/10 px-4 py-2.5 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/40 focus:bg-white transition-all"
        style={suffix ? { paddingRight: "2rem" } : undefined}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-poppins font-semibold text-[#71717A] pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function Select({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl bg-black/[0.03] border border-black/10 px-4 py-2.5 font-poppins text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/40 focus:bg-white transition-all appearance-none cursor-pointer"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${value ? "bg-[#0A0A0A]" : "bg-black/[0.12]"}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const light = isLightColor(value);
  return (
    <div className="flex items-center gap-3">
      <label className="relative cursor-pointer shrink-0">
        <div
          className="w-10 h-10 rounded-xl border-2 border-black/10 shadow-sm"
          style={{ background: value }}
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value;
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v);
        }}
        className="w-full rounded-xl bg-black/[0.03] border border-black/10 px-3 py-2.5 font-mono text-sm text-[#0A0A0A] focus:outline-none focus:border-[#0A0A0A]/40 uppercase"
        maxLength={7}
      />
      {light && (
        <span className="shrink-0 text-[10px] font-poppins font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
          Zu hell
        </span>
      )}
    </div>
  );
}

function ExportCard({
  icon: Icon, title, sub, badge, busy, disabledStr, onClick,
}: {
  icon: React.ElementType;
  title: string;
  sub: string;
  badge: string;
  busy?: boolean;
  disabledStr?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={disabledStr ? undefined : onClick}
      disabled={busy || !!disabledStr}
      title={disabledStr}
      className={`group relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border border-black/10 transition-all text-left ${disabledStr ? "opacity-50 cursor-not-allowed bg-black/5" : "bg-black/[0.02] hover:bg-black/[0.05] hover:border-black/20 active:scale-[0.98]"}`}
    >
      <div className={`w-10 h-10 rounded-xl ${disabledStr ? "bg-[#71717A]" : "bg-[#0A0A0A] group-hover:scale-105 transition-transform"} text-white flex items-center justify-center shrink-0`}>
        <Icon size={18} strokeWidth={2.2} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-poppins font-bold text-[14px] text-[#0A0A0A] leading-tight">{title}</span>
          <span className={`text-[9px] font-poppins font-black px-1.5 py-0.5 rounded ${disabledStr ? "bg-[#71717A]" : "bg-[#0A0A0A]"} text-white tracking-wider`}>{badge}</span>
        </div>
        <span className="block text-[11.5px] font-poppins text-[#52525B] mt-0.5">{sub}</span>
        {disabledStr && <span className="block text-[10px] font-poppins font-medium text-red-500 mt-1">{disabledStr}</span>}
      </div>
      {busy ? (
        <span className="absolute right-3 top-3 text-[10px] font-poppins font-bold text-[#71717A]">…</span>
      ) : disabledStr ? (
        <Lock size={14} className="absolute right-3 top-3 text-[#A1A1AA]" />
      ) : (
        <Download size={14} className="absolute right-3 top-3 text-[#A1A1AA] group-hover:text-[#0A0A0A] transition-colors" />
      )}
    </button>
  );
}
