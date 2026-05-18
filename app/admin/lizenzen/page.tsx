/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/ui/toast";
import { useEscapeKey } from "@/lib/ui/useEscapeKey";
import { db } from "@/lib/firebase/config";
import {
  collection, getDocs, Timestamp, addDoc, doc, deleteDoc, updateDoc, getDoc,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle, Copy, Loader2, Trash2, X, Key, Check,
  Building2, Calendar, Shield, RefreshCw,
} from "lucide-react";
import { GlassSection, TLine, TButton } from "@/app/components/ui/NativeUI";

interface License {
  id: string;
  key: string;
  plan: string;
  memberLimit: number;
  status: string;
  expiresAt: Timestamp | null;
  createdAt: Timestamp | null;
  usedByOrgId: string | null;
  usedAt: Timestamp | null;
  isTrial?: boolean;
  trialDays?: number;
}

const PLAN_OPTIONS = [
  { value: "starter", label: "Starter", limit: 20 },
  { value: "club", label: "Club", limit: 120 },
  { value: "pro", label: "Pro", limit: 300 },
];

function generateKey() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "TALO-";
  for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  key += "-";
  for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
  return key;
}

export default function LizenzenAdminPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [clubNames, setClubNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("club");
  const [expiresAtStr, setExpiresAtStr] = useState("");
  const [creating, setCreating] = useState(false);
  const [isTrial, setIsTrial] = useState(false);
  const [trialDays, setTrialDays] = useState("30");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<License | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Escape closes the delete-confirm modal (unless deletion is running).
  useEscapeKey(!!deleteTarget && !deleting, () => setDeleteTarget(null));

  async function loadLicenses() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "licenses"));
      const docs: License[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          key: data.key,
          plan: data.plan,
          memberLimit: data.memberLimit ?? 0,
          status: data.status ?? "active",
          expiresAt: data.expiresAt ?? null,
          createdAt: data.createdAt ?? null,
          usedByOrgId: data.usedByOrgId ?? null,
          usedAt: data.usedAt ?? null,
          isTrial: data.isTrial ?? false,
          trialDays: data.trialDays ?? 0,
        };
      });
      docs.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setLicenses(docs);

      // Load club names for used licenses
      const orgIds = [...new Set(docs.filter((l) => l.usedByOrgId).map((l) => l.usedByOrgId!))];
      const names: Record<string, string> = {};
      await Promise.all(
        orgIds.map(async (orgId) => {
          try {
            const clubDoc = await getDoc(doc(db, "clubs", orgId));
            if (clubDoc.exists()) names[orgId] = clubDoc.data().name ?? orgId;
            else names[orgId] = orgId.slice(0, 8) + "…";
          } catch { names[orgId] = orgId.slice(0, 8) + "…"; }
        })
      );
      setClubNames(names);
    } catch (e) {
      console.error("Fehler beim Laden der Lizenzen", e);
    }
    setLoading(false);
  }

  useEffect(() => { loadLicenses(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const plan = PLAN_OPTIONS.find((p) => p.value === selectedPlan);
      const expiresDate = isTrial
        ? new Date(Date.now() + (parseInt(trialDays) || 30) * 24 * 60 * 60 * 1000)
        : expiresAtStr
        ? new Date(expiresAtStr)
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, "licenses"), {
        key: generateKey(),
        plan: selectedPlan,
        memberLimit: plan?.limit ?? 0,
        expiresAt: Timestamp.fromDate(expiresDate),
        createdAt: Timestamp.now(),
        status: "active",
        usedByOrgId: null,
        usedAt: null,
        isTrial,
        trialDays: isTrial ? (parseInt(trialDays) || 30) : 0,
      });

      setShowCreate(false);
      setExpiresAtStr("");
      loadLicenses();
    } catch (err) {
      toast.error("Lizenz konnte nicht erstellt werden", { description: String(err) });
    }
    setCreating(false);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // If license was used by a club, reset that club's plan to "starter"
      if (deleteTarget.usedByOrgId && deleteTarget.status === "used") {
        try {
          await updateDoc(doc(db, "clubs", deleteTarget.usedByOrgId), {
            plan: "starter",
            licenseStatus: "expired",
            licenseExpiresAt: null,
          });
        } catch (err) {
          console.error("Fehler beim Zurücksetzen des Vereins:", err);
        }
      }

      // Delete the license document
      await deleteDoc(doc(db, "licenses", deleteTarget.id));
      setDeleteTarget(null);
      loadLicenses();
    } catch (err) {
      toast.error("Lizenz konnte nicht gelöscht werden", { description: String(err) });
    }
    setDeleting(false);
  }

  function copyKey(licId: string, key: string) {
    navigator.clipboard.writeText(key);
    setCopiedId(licId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const activeLicenses = licenses.filter((l) => l.status === "active");
  const usedLicenses = licenses.filter((l) => l.status === "used");

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Lizenzen</h1>
            <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">
              Schlüssel generieren &amp; verwalten
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Aktualisieren"
              onClick={loadLicenses}
              disabled={loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
              style={{ background: "rgba(0,0,0,0.05)", color: "#71717A" }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="shrink-0 flex items-center gap-2 bg-[#0A0A0A] text-white hover:bg-[#1F1F23] px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all"
            >
              <PlusCircle size={16} /> Neue Lizenz
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Gesamt" value={String(licenses.length)} icon={Key} color="#0A0A0A" />
          <StatCard label="Verfügbar" value={String(activeLicenses.length)} icon={Shield} color="#34C759" />
          <StatCard label="Eingelöst" value={String(usedLicenses.length)} icon={Building2} color="#FF9500" />
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: "hidden" }}
            >
              <GlassSection>
                <form onSubmit={handleCreate} className="p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h2 className="font-poppins font-bold text-[17px] text-[#0A0A0A]">Lizenz generieren</h2>
                    <button type="button" onClick={() => setShowCreate(false)}>
                      <X size={18} style={{ color: "#71717A" }} />
                    </button>
                  </div>

                  <TLine />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: "#71717A" }}>Plan</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {PLAN_OPTIONS.map((p) => (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => setSelectedPlan(p.value)}
                            className={`py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                              selectedPlan === p.value
                                ? "bg-[#0A0A0A] text-white border-black/15"
                                : "bg-black/[0.04] text-[#71717A] border-black/5 hover:border-black/10"
                            }`}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: "#71717A" }}>
                        Trial-Modus
                      </label>
                      <div className="flex items-center gap-4 bg-black/[0.04] border border-black/5 rounded-2xl px-4 py-2">
                        <div className="flex-1 flex flex-col">
                          <span className="text-[11px] font-bold text-[#0A0A0A]">Kostenloser Testlauf</span>
                          <span className="text-[10px] text-[#71717A]">Zeitlich begrenzter Zugriff</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={isTrial} 
                          onChange={(e) => setIsTrial(e.target.checked)}
                          className="w-5 h-5 accent-[#0A0A0A]"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-black uppercase tracking-widest pl-1" style={{ color: "#71717A" }}>
                        {isTrial ? "Trial-Dauer (Tage)" : "Ablaufdatum"}
                      </label>
                      {isTrial ? (
                        <input
                          type="number"
                          value={trialDays}
                          onChange={(e) => setTrialDays(e.target.value)}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/5 px-4 py-3 text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                          placeholder="z.B. 30"
                        />
                      ) : (
                        <input
                          type="date"
                          value={expiresAtStr}
                          onChange={(e) => setExpiresAtStr(e.target.value)}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/5 px-4 py-3 text-sm font-poppins text-[#0A0A0A] focus:outline-none focus:border-black/10 transition-all"
                        />
                      )}
                      <p className="text-[10px] font-bold pl-1" style={{ color: "#A1A1AA" }}>
                        {isTrial ? "Dauer des Testzeitraums" : "Standard: 1 Jahr ab heute"}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <TButton label="Abbrechen" variant="ghost" onClick={() => setShowCreate(false)} />
                    <TButton
                      label={creating ? "Generiert…" : "Generieren"}
                      type="submit"
                      disabled={creating}
                    />
                  </div>
                </form>
              </GlassSection>
            </motion.div>
          )}
        </AnimatePresence>

        {/* License List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 rounded-full border-2 border-black/10 border-t-[#0A0A0A] animate-spin" />
          </div>
        ) : licenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "rgba(0,0,0,0.05)" }}>
              <Key size={28} style={{ color: "#71717A" }} />
            </div>
            <p className="font-poppins font-bold text-[18px] text-[#0A0A0A] mb-2">Keine Lizenzen</p>
            <p className="text-[13px]" style={{ color: "#52525B" }}>Erstelle deine erste Lizenz.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Active */}
            {activeLicenses.length > 0 && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] pl-1 flex items-center gap-2" style={{ color: "#71717A" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#34C759]" /> Verfügbare Lizenzen
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {activeLicenses.map((lic) => (
                    <LicenseCard
                      key={lic.id}
                      license={lic}
                      clubName={lic.usedByOrgId ? clubNames[lic.usedByOrgId] : undefined}
                      copied={copiedId === lic.id}
                      onCopy={() => copyKey(lic.id, lic.key)}
                      onDelete={() => setDeleteTarget(lic)}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Used */}
            {usedLicenses.length > 0 && (
              <>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] pl-1 flex items-center gap-2 mt-4" style={{ color: "#71717A" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF9500]" /> Eingelöste Lizenzen
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                  {usedLicenses.map((lic) => (
                    <LicenseCard
                      key={lic.id}
                      license={lic}
                      clubName={lic.usedByOrgId ? clubNames[lic.usedByOrgId] : undefined}
                      copied={copiedId === lic.id}
                      onCopy={() => copyKey(lic.id, lic.key)}
                      onDelete={() => setDeleteTarget(lic)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-7 flex flex-col items-center text-center gap-1 font-poppins">
                <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mb-3 border border-red-500/20">
                  <Trash2 size={28} className="text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-[#0A0A0A]">Lizenz löschen?</h3>
                <p className="text-sm text-[#52525B] mb-1 px-2">
                  <span className="font-mono font-bold text-[#0A0A0A]">{deleteTarget.key}</span>
                </p>
                {deleteTarget.status === "used" && deleteTarget.usedByOrgId && (
                  <div className="rounded-xl bg-[#FF9500]/10 border border-[#FF9500]/20 px-4 py-2.5 mb-2 w-full">
                    <p className="text-[11px] font-bold text-[#FF9500]">
                      ⚠ Der Verein „{clubNames[deleteTarget.usedByOrgId] || "Unbekannt"}" wird auf den Starter-Plan zurückgesetzt.
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 w-full mt-2">
                  <TButton
                    label={deleting ? "Wird gelöscht…" : "Endgültig löschen"}
                    variant="danger"
                    onClick={handleDelete}
                    disabled={deleting}
                  />
                  <TButton label="Abbrechen" variant="secondary" onClick={() => setDeleteTarget(null)} />
                </div>
              </GlassSection>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Sub-Components ─────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div
      className="p-5 rounded-[24px] flex items-center gap-4 relative overflow-hidden"
      style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}12`, color }}>
        <Icon size={20} strokeWidth={2.2} />
      </div>
      <div className="flex flex-col">
        <p className="text-[28px] font-poppins font-bold text-[#0A0A0A] leading-none">{value}</p>
        <p className="text-[10px] font-poppins font-black tracking-[0.2em] uppercase mt-1" style={{ color: "#71717A" }}>{label}</p>
      </div>
    </div>
  );
}

function LicenseCard({
  license, clubName, copied, onCopy, onDelete,
}: {
  license: License;
  clubName?: string;
  copied: boolean;
  onCopy: () => void;
  onDelete: () => void;
}) {
  const isUsed = license.status === "used";
  const planLabel = PLAN_OPTIONS.find((p) => p.value === license.plan)?.label ?? license.plan;

  return (
    <GlassSection>
      <div className="p-4 flex flex-col gap-3">
        {/* Top row: key + actions */}
        <div className="flex items-center justify-between">
          <button
            onClick={onCopy}
            className="flex items-center gap-2 font-mono font-bold text-[14px] text-[#0A0A0A] transition-colors hover:text-[#34C759]"
          >
            {license.key}
            {copied ? <Check size={13} className="text-[#34C759]" /> : <Copy size={13} className="text-[#A1A1AA]" />}
          </button>
          <button
            onClick={onDelete}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A1A1AA] hover:text-[#FF453A] hover:bg-[#FF453A]/10 transition-all"
          >
            <Trash2 size={14} />
          </button>
        </div>

        <TLine />

        {/* Info */}
        <div className="flex items-center gap-3">
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={
              isUsed
                ? { background: "rgba(255,149,0,0.12)", color: "#FF9500" }
                : { background: "rgba(52,199,89,0.12)", color: "#34C759" }
            }
          >
            {isUsed ? "Eingelöst" : "Verfügbar"}
          </span>
          <span className="text-[11px] font-poppins font-bold text-[#0A0A0A] uppercase tracking-wider">{planLabel}</span>
          {license.isTrial && (
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-[#0A0A0A] text-white">Testphase</span>
          )}
          {license.expiresAt && (
            <span className="flex items-center gap-1 text-[10px] ml-auto" style={{ color: "#A1A1AA" }}>
              <Calendar size={10} />
              {license.expiresAt.toDate().toLocaleDateString("de-DE")}
            </span>
          )}
        </div>

        {/* Club info if used */}
        {isUsed && clubName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.03)" }}>
            <Building2 size={13} style={{ color: "#71717A" }} />
            <span className="text-[12px] font-poppins font-semibold text-[#0A0A0A] truncate">{clubName}</span>
          </div>
        )}
      </div>
    </GlassSection>
  );
}
