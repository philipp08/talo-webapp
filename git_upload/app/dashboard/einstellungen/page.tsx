"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { auth } from "@/lib/firebase/config";
import { signOut, sendPasswordResetEmail } from "firebase/auth";
import {
  SeasonType,
  Entry,
  Member,
} from "@/lib/firebase/models";
import {
  csvForEntries,
  csvForMembers,
  downloadTextFile,
  exportFilename,
} from "@/lib/exports/csv";

const SEASON_TYPES = [
  SeasonType.Calendar,
  SeasonType.Club,
  SeasonType.School,
];

export default function SettingsPage() {
  const currentMember = useAppStore((s) => s.currentMember);
  const currentClub = useAppStore((s) => s.currentClub);
  const setCurrentClub = useAppStore((s) => s.setCurrentClub);

  const [resetState, setResetState] = useState<"idle" | "loading" | "sent">("idle");

  // Club form
  const [clubName, setClubName] = useState(currentClub?.name ?? "");
  const [requiredPoints, setRequiredPoints] = useState(String(currentClub?.requiredPoints ?? 15));
  const [compensation, setCompensation] = useState(String(currentClub?.compensationPerMissingPoint ?? 0));
  const [seasonType, setSeasonType] = useState<string>(currentClub?.seasonType ?? SeasonType.Calendar);
  const [approvalRequired, setApprovalRequired] = useState(currentClub?.approvalRequired ?? true);
  const [clubState, setClubState] = useState<"idle" | "saving" | "saved">("idle");

  // Export period
  const thisYear = new Date().getFullYear();
  const [fromDate, setFromDate] = useState(`${thisYear}-01-01`);
  const [toDate, setToDate] = useState(`${thisYear}-12-31`);

  // Data for export
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allEntries, setAllEntries] = useState<Entry[]>([]);

  const isAdmin = currentMember?.isAdmin === true;
  const isTrainer = currentMember?.isTrainer === true;

  useEffect(() => {
    if (!currentClub) return;
    setClubName(currentClub.name);
    setRequiredPoints(String(currentClub.requiredPoints));
    setCompensation(String(currentClub.compensationPerMissingPoint ?? 0));
    setSeasonType(currentClub.seasonType);
    setApprovalRequired(currentClub.approvalRequired);
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

  const sendPasswordReset = async () => {
    if (!currentMember?.email) return;
    setResetState("loading");
    try {
      await sendPasswordResetEmail(auth, currentMember.email);
      setResetState("sent");
    } catch {
      setResetState("idle");
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
      };
      await FirebaseManager.updateClub(currentClub.id, updates);
      setCurrentClub({ ...currentClub, ...updates });
      setClubState("saved");
      setTimeout(() => setClubState("idle"), 2200);
    } catch {
      setClubState("idle");
    }
  };

  const downloadCsv = (type: "entries-csv" | "members-csv") => {
    if (!currentClub) return;
    const from = new Date(fromDate);
    const to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
    const content =
      type === "entries-csv"
        ? csvForEntries(allEntries, allMembers, from, to)
        : csvForMembers(allMembers, allEntries, currentClub, from, to);
    downloadTextFile(exportFilename(type, currentClub, from, to), content);
  };

  const openPdfReport = (type: "jahresbericht" | "mitgliederliste") => {
    const params = new URLSearchParams({
      type,
      from: fromDate,
      to: toDate,
    });
    window.open(`/dashboard/berichte?${params.toString()}`, "_blank");
  };

  if (!currentMember) return null;

  const memberTypeLabel = isAdmin ? "Admin" : isTrainer ? "Trainer" : String(currentMember.memberType);

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto py-10 px-6 lg:px-10 pb-16">
        <div className="mb-8">
          <h1 className="text-2xl font-poppins font-bold text-[#0A0A0A] tracking-tight">Einstellungen</h1>
          <p className="text-[13px] text-[#71717A] mt-1">Konto, Verein und Exporte</p>
        </div>

        {/* PROFIL */}
        <Section title="Profil">
          <Row label="Name" value={`${currentMember.firstName} ${currentMember.lastName}`} />
          <Row label="E-Mail" value={currentMember.email} />
          <Row label="Rolle" value={memberTypeLabel} />
          <Row label="Mitgliedstyp" value={String(currentMember.memberType)} />
        </Section>

        {/* KONTO */}
        <Section title="Konto">
          <ActionRow
            label="Passwort ändern"
            sub="Reset-Link an deine E-Mail senden"
            buttonLabel={
              resetState === "loading" ? "Sende…" :
              resetState === "sent" ? "Gesendet ✓" :
              "Senden"
            }
            onClick={sendPasswordReset}
            disabled={resetState !== "idle"}
          />
          <ActionRow
            label="Abmelden"
            sub="Von diesem Gerät ausloggen"
            buttonLabel="Logout"
            danger
            onClick={() => signOut(auth)}
          />
        </Section>

        {/* VEREIN */}
        {isAdmin ? (
          <Section title="Verein verwalten">
            <Field label="Vereinsname">
              <input
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
                className="settings-input"
              />
            </Field>
            <Field label="Pflichtpunkte / Jahr">
              <input
                type="number"
                step="0.5"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(e.target.value)}
                className="settings-input"
              />
            </Field>
            <Field label="Ausgleichsbetrag pro fehlendem Punkt (€)">
              <input
                type="number"
                step="0.5"
                value={compensation}
                onChange={(e) => setCompensation(e.target.value)}
                className="settings-input"
              />
            </Field>
            <Field label="Saisontyp">
              <select
                value={seasonType}
                onChange={(e) => setSeasonType(e.target.value)}
                className="settings-input"
              >
                {SEASON_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Genehmigungspflicht">
              <label className="flex items-center gap-2 text-[13px] text-[#0A0A0A]">
                <input
                  type="checkbox"
                  checked={approvalRequired}
                  onChange={(e) => setApprovalRequired(e.target.checked)}
                />
                Einträge brauchen Admin-Freigabe
              </label>
            </Field>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={saveClub}
                disabled={clubState === "saving"}
                className="px-4 py-2 rounded-lg bg-[#0A0A0A] text-white text-[13px] font-semibold disabled:opacity-50"
              >
                {clubState === "saving" ? "Speichert…" : clubState === "saved" ? "Gespeichert ✓" : "Speichern"}
              </button>
            </div>
          </Section>
        ) : (
          <Section title="Verein">
            <Row label="Verein" value={currentClub?.name ?? "–"} />
            <Row label="Pflichtpunkte" value={`${currentClub?.requiredPoints ?? 15}`} />
            <Row label="Ausgleichsbetrag" value={`${(currentClub?.compensationPerMissingPoint ?? 0).toFixed(2)} € / Punkt`} />
            <Row label="Saisontyp" value={currentClub?.seasonType ?? "–"} />
            <Row label="Genehmigungspflicht" value={currentClub?.approvalRequired ? "Aktiviert" : "Auto-Genehmigung"} />
          </Section>
        )}

        {/* EXPORTE (Admin only) */}
        {isAdmin && (
          <Section title="Berichte & Exporte">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Field label="Von">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="settings-input"
                />
              </Field>
              <Field label="Bis">
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="settings-input"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <ExportButton
                title="Einträge (CSV)"
                sub="Alle Einträge im Zeitraum"
                onClick={() => downloadCsv("entries-csv")}
              />
              <ExportButton
                title="Mitglieder (CSV)"
                sub="Punkte, fehlende Punkte, Ausgleich"
                onClick={() => downloadCsv("members-csv")}
              />
              <ExportButton
                title="Jahresbericht (PDF)"
                sub="Übersicht, Mitgliedertabelle, Kategorien"
                onClick={() => openPdfReport("jahresbericht")}
              />
              <ExportButton
                title="Mitgliederliste (PDF)"
                sub="Karten pro Mitglied mit Status"
                onClick={() => openPdfReport("mitgliederliste")}
              />
            </div>
            <p className="text-[11px] text-[#71717A] mt-3">
              PDFs öffnen den Druckdialog des Browsers — wähle „Als PDF speichern".
            </p>
          </Section>
        )}

        {/* APP INFO */}
        <Section title="App">
          <Row label="Version" value="Talo Web · 0.1" />
          <Row label="Backend" value="Synchronisiert mit iOS-App" />
        </Section>
      </div>

      <style jsx global>{`
        .settings-input {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          color: #0A0A0A;
          background: #ffffff;
          font-family: inherit;
          outline: none;
          transition: border-color 0.12s ease;
        }
        .settings-input:focus {
          border-color: #0A0A0A;
        }
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-[11px] font-poppins font-bold text-[#71717A] uppercase tracking-[0.15em] mb-3 pb-2 border-b border-black/10">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[13px] text-[#52525B]">{label}</span>
      <span className="text-[13px] text-[#0A0A0A] font-medium text-right">{value}</span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-poppins font-semibold text-[#52525B]">{label}</label>
      {children}
    </div>
  );
}

function ActionRow({
  label,
  sub,
  buttonLabel,
  onClick,
  danger,
  disabled,
}: {
  label: string;
  sub: string;
  buttonLabel: string;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div className="flex flex-col">
        <span className="text-[13px] text-[#0A0A0A] font-medium">{label}</span>
        <span className="text-[11px] text-[#71717A]">{sub}</span>
      </div>
      <button
        onClick={onClick}
        disabled={disabled}
        className={`shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all disabled:opacity-50 ${
          danger
            ? "text-[#B91C1C] hover:bg-[#B91C1C]/[0.08] border border-[#B91C1C]/30"
            : "bg-[#0A0A0A] text-white hover:bg-[#0A0A0A]/90"
        }`}
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function ExportButton({
  title,
  sub,
  onClick,
}: {
  title: string;
  sub: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left px-4 py-3 border border-black/10 rounded-lg hover:bg-black/[0.03] hover:border-black/20 transition-all"
    >
      <div className="text-[13px] font-semibold text-[#0A0A0A]">{title}</div>
      <div className="text-[11px] text-[#71717A] mt-0.5">{sub}</div>
    </button>
  );
}
