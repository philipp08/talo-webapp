/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection, getDocs, Timestamp, addDoc,
} from "firebase/firestore";
import { PlusCircle, Copy, Loader2 } from "lucide-react";

export default function LizenzenAdminPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New License State
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("club");
  const [expiresAtStr, setExpiresAtStr] = useState("");
  const [creating, setCreating] = useState(false);

  async function loadLicenses() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "licenses"));
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      docs.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setLicenses(docs);
    } catch (e) {
      console.error("Fehler beim Laden der Lizenzen", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLicenses();
  }, []);

  function generateKey() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let key = "TALO-";
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    key += "-";
    for (let i = 0; i < 4; i++) key += chars.charAt(Math.floor(Math.random() * chars.length));
    return key;
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      let limit = 0;
      if (selectedPlan === "free") limit = 10;
      if (selectedPlan === "verein") limit = 75;
      if (selectedPlan === "club") limit = 150;
      if (selectedPlan === "pro") limit = 300;
      if (selectedPlan === "individual") limit = 99999;

      const newKey = generateKey();
      const expiresDate = expiresAtStr ? new Date(expiresAtStr) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      await addDoc(collection(db, "licenses"), {
        key: newKey,
        plan: selectedPlan,
        memberLimit: limit,
        expiresAt: Timestamp.fromDate(expiresDate),
        createdAt: Timestamp.now(),
        status: "active",
        usedByOrgId: null,
        usedAt: null
      });

      setShowCreate(false);
      setExpiresAtStr("");
      loadLicenses();
    } catch (err) {
      alert("Fehler: " + err);
    }
    setCreating(false);
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0A0A0A] font-poppins">Lizenzen</h1>
          <p className="text-sm mt-1" style={{ color: "#71717A" }}>Lizenzschlüssel für Vereine generieren.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-[#0A0A0A] text-white hover:opacity-90"
        >
          <PlusCircle size={16} />
          Neue Lizenz
        </button>
      </div>

      {showCreate && (
        <form
          onSubmit={handleCreate}
          className="mb-8 p-6 rounded-[1.25rem]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}
        >
          <h2 className="text-lg font-bold mb-4 text-[#0A0A0A]">Lizenz generieren</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: "#B4B4BA" }}>Plan</label>
              <select
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] text-[#0A0A0A] text-sm outline-none"
                style={{ background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)" }}
              >
                <option value="free">Free (10)</option>
                <option value="verein">Verein (75)</option>
                <option value="club">Club (150)</option>
                <option value="pro">Pro (300)</option>
                <option value="individual">Individuell</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2 font-black" style={{ color: "#B4B4BA" }}>Ablaufdatum (optional)</label>
              <input
                type="date"
                value={expiresAtStr}
                onChange={e => setExpiresAtStr(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] text-[#0A0A0A] text-sm outline-none"
                style={{ background: "#FAFAFA", border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <p className="text-[10px] mt-1" style={{ color: "#B4B4BA" }}>Standard: 1 Jahr ab Erstellung.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="px-4 py-2 rounded-xl text-sm transition-colors"
              style={{ color: "#71717A" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#0A0A0A")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#71717A")}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-50"
              style={{ background: "#0A0A0A", color: "#FFFFFF" }}
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />} Generieren
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin" style={{ color: "rgba(0,0,0,0.3)" }} /></div>
      ) : (
        <div className="rounded-[1.25rem] overflow-hidden" style={{ background: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)" }}>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-widest" style={{ color: "#B4B4BA", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#FAFAFA" }}>
              <tr>
                <th className="px-6 py-4 font-black">Schlüssel</th>
                <th className="px-6 py-4 font-black">Plan</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black">Abläuft am</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(lic => (
                <tr key={lic.id} style={{ borderTop: "1px solid rgba(0,0,0,0.05)" }} className="hover:bg-black/[0.02]">
                  <td className="px-6 py-4 font-mono text-[#0A0A0A]">
                    <button
                      onClick={() => navigator.clipboard.writeText(lic.key)}
                      className="flex items-center gap-2 transition-colors"
                      style={{ color: "#0A0A0A" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#3FA7A7")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "#0A0A0A")}
                      title="Kopieren"
                    >
                      {lic.key} <Copy size={12} />
                    </button>
                  </td>
                  <td className="px-6 py-4 capitalize text-[#0A0A0A]">{lic.plan}</td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {lic.status === "active" ? (
                      <span className="px-2 py-1 rounded" style={{ background: "rgba(16,185,129,0.12)", color: "#059669" }}>Aktiv</span>
                    ) : (
                      <span className="px-2 py-1 rounded" style={{ background: "rgba(239,68,68,0.10)", color: "#DC2626" }}>Genutzt</span>
                    )}
                  </td>
                  <td className="px-6 py-4" style={{ color: "#71717A" }}>
                    {lic.expiresAt?.toDate().toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center" style={{ color: "#B4B4BA" }}>Keine Lizenzen vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
