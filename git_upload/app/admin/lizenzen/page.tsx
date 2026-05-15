/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/config";
import {
  collection, query, getDocs, Timestamp, addDoc, doc, updateDoc, orderBy
} from "firebase/firestore";
import { Key, PlusCircle, CheckCircle2, Copy, Loader2, XCircle } from "lucide-react";

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
      const expiresDate = expiresAtStr ? new Date(expiresAtStr) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Default 1 year

      await addDoc(collection(db, "licenses"), {
        key: newKey,
        plan: selectedPlan,
        memberLimit: limit,
        expiresAt: Timestamp.fromDate(expiresDate),
        createdAt: Timestamp.now(),
        status: "active", // active, used
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
          <h1 className="text-2xl font-bold text-white font-poppins">Lizenzen</h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>Lizenzschlüssel für Vereine generieren.</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-white text-black hover:opacity-90"
        >
          <PlusCircle size={16} /> 
          Neue Lizenz
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-8 p-6 rounded-[1.25rem] border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <h2 className="text-lg font-bold mb-4">Lizenz generieren</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 font-bold">Plan</label>
              <select
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm outline-none bg-white/5 border border-white/10"
              >
                <option value="free">Free (10)</option>
                <option value="verein">Verein (75)</option>
                <option value="club">Club (150)</option>
                <option value="pro">Pro (300)</option>
                <option value="individual">Individuell</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#8A8A8A] mb-2 font-bold">Ablaufdatum (optional)</label>
              <input
                type="date"
                value={expiresAtStr}
                onChange={e => setExpiresAtStr(e.target.value)}
                className="w-full px-4 py-3 rounded-[10px] text-white text-sm outline-none bg-white/5 border border-white/10 [color-scheme:dark]"
              />
              <p className="text-[10px] text-gray-500 mt-1">Standard: 1 Jahr ab Erstellung.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition-colors">Abbrechen</button>
            <button type="submit" disabled={creating} className="px-6 py-2 rounded-xl text-sm font-semibold bg-[#7DD8D8] text-black hover:opacity-90 flex items-center gap-2">
              {creating && <Loader2 className="w-4 h-4 animate-spin" />} Generieren
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-10"><Loader2 className="animate-spin text-white/50" /></div>
      ) : (
        <div className="rounded-[1.25rem] overflow-hidden border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[#8A8A8A] text-xs uppercase tracking-widest border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-4 font-bold">Schlüssel</th>
                <th className="px-6 py-4 font-bold">Plan</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Abläuft am</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map(lic => (
                <tr key={lic.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="px-6 py-4 font-mono">
                    <button onClick={() => navigator.clipboard.writeText(lic.key)} className="flex items-center gap-2 hover:text-[#7DD8D8] transition-colors" title="Kopieren">
                      {lic.key} <Copy size={12} />
                    </button>
                  </td>
                  <td className="px-6 py-4 capitalize">{lic.plan}</td>
                  <td className="px-6 py-4 text-xs font-bold">
                    {lic.status === "active" ? (
                      <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">Aktiv</span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded">Genutzt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {lic.expiresAt?.toDate().toLocaleDateString("de-DE")}
                  </td>
                </tr>
              ))}
              {licenses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-500">Keine Lizenzen vorhanden.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}