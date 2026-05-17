"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Plus, Trash, Check, X, Shield, Users, Layers, Award } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Shift, getPlanFeatures, isLightColor } from "@/lib/firebase/models";
import { GlassSection, TButton, TBadge } from "@/app/components/ui/NativeUI";
import { useI18n } from "@/lib/i18n/I18nContext";

type ShiftFormData = {
  title: string;
  event: string;
  date: string;
  time: string;
  points: string;
};

const defaultForm = (): ShiftFormData => ({
  title: "",
  event: "",
  date: new Date().toISOString().split("T")[0],
  time: "12:00 - 14:00",
  points: "2.0",
});

export default function ShiftsPage() {
  const { t } = useI18n();
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ShiftFormData>(defaultForm());
  const [saving, setSaving] = useState(false);

  const isAdmin = currentMember?.isAdmin === true;
  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
  const hasAccess = planFeatures.hasSelfServiceShifts === true;

  const accentRaw = currentClub?.accentColor ?? currentClub?.brandColor ?? "#0A0A0A";
  const accent = planFeatures.hasClubColors ? accentRaw : "#0A0A0A";

  // Firestore sync for active clubs
  useEffect(() => {
    if (!currentClub) return;
    const unsub = FirebaseManager.listenToShifts(currentClub.id, (loadedShifts) => {
      setShifts(loadedShifts.sort((a, b) => a.date.localeCompare(b.date)));
      setLoading(false);
    });
    return unsub;
  }, [currentClub]);

  const saveForm = async () => {
    if (!currentClub || !form.title.trim() || !form.event.trim()) return;
    setSaving(true);
    try {
      await FirebaseManager.addShift(currentClub.id, {
        title: form.title,
        event: form.event,
        date: form.date,
        time: form.time,
        points: parseFloat(form.points) || 2.0,
        claimedById: null,
        claimedByName: null,
      });
      setShowForm(false);
      setForm(defaultForm());
    } catch (e) {
      console.error("Error adding shift:", e);
    } finally {
      setSaving(false);
    }
  };

  const deleteShift = async (shiftId: string) => {
    if (!currentClub || !confirm("Möchtest du diese Schicht wirklich löschen?")) return;
    try {
      await FirebaseManager.deleteShift(currentClub.id, shiftId);
    } catch (e) {
      console.error("Error deleting shift:", e);
    }
  };

  const claimShift = async (shift: Shift) => {
    if (!currentClub || !currentMember) return;
    try {
      const memberName = `${currentMember.firstName} ${currentMember.lastName}`;
      // 1. Claim in Shifts collection
      await FirebaseManager.updateShift(currentClub.id, shift.id, {
        claimedById: currentMember.id,
        claimedByName: memberName,
      });

      const entryId = crypto.randomUUID();
      // 2. Automatically log points entry
      await FirebaseManager.addEntry(currentClub.id, entryId, {
        memberId: currentMember.id,
        date: new Date(),
        notes: `Schicht-Börse: ${shift.event} - ${shift.title} (ShiftID: ${shift.id})`,
        points: shift.points,
        status: "Genehmigt",
        activityName: `Schicht: ${shift.event}`,
        activityCategory: "B",
      });
    } catch (e) {
      console.error("Error claiming shift:", e);
    }
  };

  const releaseShift = async (shift: Shift) => {
    if (!currentClub || !currentMember || !confirm("Möchtest du diese Schicht wieder freigeben? Deine Punktegutschrift wird dabei storniert.")) return;
    try {
      // 1. Release in Shifts collection
      await FirebaseManager.updateShift(currentClub.id, shift.id, {
        claimedById: null,
        claimedByName: null,
      });

      // 2. Storno points entry: Find and delete the logged entry
      const entries = await FirebaseManager.getEntries(currentClub.id);
      const shiftEntry = entries.find(
        (e) => e.memberId === currentMember.id && e.notes.includes(`(ShiftID: ${shift.id})`)
      );
      if (shiftEntry) {
        await FirebaseManager.deleteEntry(currentClub.id, shiftEntry.id);
      }
    } catch (e) {
      console.error("Error releasing shift:", e);
    }
  };

  // Mock list for Lower Tier Upsell preview
  const mockShifts: Shift[] = [
    {
      id: "mock-1",
      title: "Grillstation Schicht 1",
      event: "Sommerfest 2026",
      date: "2026-06-20",
      time: "11:30 - 14:00",
      points: 2.5,
      claimedById: null,
      claimedByName: null,
    },
    {
      id: "mock-2",
      title: "Bonverkauf Schicht 2",
      event: "Sommerfest 2026",
      date: "2026-06-20",
      time: "14:00 - 16:30",
      points: 2.0,
      claimedById: "someone",
      claimedByName: "Max Mustermann",
    },
    {
      id: "mock-3",
      title: "Getränkeausschank",
      event: "Clubmeisterschaft",
      date: "2026-07-12",
      time: "18:00 - 21:00",
      points: 3.0,
      claimedById: null,
      claimedByName: null,
    },
  ];

  const shareEventShifts = (eventName: string, list: Shift[]) => {
    let text = `📢 *HELFERSCHICHTEN: ${eventName.toUpperCase()}* 📢\n\nHallo zusammen! Für unser Event werden noch fleißige Helfer gesucht. Bitte tragt euch direkt ein:\n\n`;
    list.forEach((s) => {
      const statusStr = s.claimedById 
        ? `✅ Besetzt von ${s.claimedByName}` 
        : `👉 Noch frei! (+${s.points.toFixed(1)} Pkt.)`;
      text += `🔹 *${s.title}*\n   🕒 ${s.date} | ${s.time}\n   ${statusStr}\n\n`;
    });
    text += `👉 Jetzt im Talo Dashboard anmelden und Wunschschicht buchen:\n${window.location.origin}/dashboard/schichten\n\nWir freuen uns auf eure Unterstützung! 🚀`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const shareSingleShift = (s: Shift) => {
    const statusStr = s.claimedById 
      ? `✅ Besetzt von ${s.claimedByName}` 
      : `👉 Noch frei!`;
    const text = `⚽ *TALO HELFERSCHICHT* ⚽\n\nFür das Event *${s.event}* wird ein Helfer gesucht:\n\n📌 *Schicht*: ${s.title}\n📅 *Datum*: ${s.date}\n🕒 *Uhrzeit*: ${s.time}\n🏆 *Punkte*: +${s.points.toFixed(1)} Pkt.\n\n${statusStr}\n\n👉 Jetzt direkt im Talo Dashboard buchen: ${window.location.origin}/dashboard/schichten\n\nDanke für deinen einsatz! 🙌`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const groupedShifts = useMemo(() => {
    const groups: { [eventName: string]: Shift[] } = {};
    shifts.forEach((s) => {
      if (!groups[s.event]) {
        groups[s.event] = [];
      }
      groups[s.event].push(s);
    });
    return Object.entries(groups).map(([eventName, list]) => ({
      eventName,
      list: list.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time)),
    }));
  }, [shifts]);

  const groupedMockShifts = useMemo(() => {
    const groups: { [eventName: string]: Shift[] } = {};
    mockShifts.forEach((s) => {
      if (!groups[s.event]) {
        groups[s.event] = [];
      }
      groups[s.event].push(s);
    });
    return Object.entries(groups).map(([eventName, list]) => ({
      eventName,
      list,
    }));
  }, []);

  return (
    <div className="relative min-h-screen bg-[#FAFAFA]">
      <div className="max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8 pb-16">
        
        {/* Header Action Bar */}
        <div className="flex flex-col gap-5 border-b border-black/5 pb-6 lg:pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {currentClub?.logoUrl ? (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2" style={{ borderColor: `${accent}30` }}>
                  <img src={currentClub.logoUrl} alt={currentClub.name} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white border border-black/10 overflow-hidden shadow-sm p-2 text-[#0A0A0A]">
                  <Layers size={24} />
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Self-Service Schicht-Börse</h1>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">{currentClub?.name}</p>
                  <div className="px-2 py-0.5 bg-black/[0.05] border border-black/10 rounded-full">
                    <p className="text-[#52525B] font-bold text-[10px] uppercase tracking-widest">Schichten</p>
                  </div>
                </div>
              </div>
            </div>
            {hasAccess && isAdmin && (
              <TButton
                label="Neue Schicht"
                icon={Plus}
                onClick={() => setShowForm(true)}
                className="rounded-2xl"
              />
            )}
          </div>
        </div>

        {/* Real Content or Blurred Upsell Mockup */}
        {!hasAccess ? (
          <div className="relative w-full max-w-5xl mx-auto mt-4">
            {/* SaaS Upsell Modal Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/20 backdrop-blur-[6px] rounded-[32px] border border-white/40 shadow-xl text-center">
              <div className="max-w-md bg-white border border-black/10 p-8 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] flex flex-col items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                  <Award size={32} />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="font-poppins font-black text-[#0A0A0A] text-lg">
                    Schicht-Börse ab Pro-Plan verfügbar
                  </h3>
                  <p className="text-xs text-[#52525B] leading-relaxed">
                    Automatisiere deine gesamte Helferplanung! Lass Mitglieder sich selbst für Arbeitseinsätze oder Turnierdienste eintragen. Die Punktegutschrift erfolgt vollkommen automatisch.
                  </p>
                </div>
                <div className="w-full h-[1px] bg-black/5" />
                <div className="flex flex-col gap-1.5 w-full">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">
                    DEINE VORTEILE
                  </span>
                  <ul className="text-left text-xs text-[#52525B] flex flex-col gap-1 list-disc pl-4 font-poppins">
                    <li>Kein mühsames E-Mail-Koordiniere mehr</li>
                    <li>Live-Status wer welche Schicht übernommen hat</li>
                    <li>Automatischer Tauschmarktplatz</li>
                    <li>Direktes Buchen & Punktegutschrift in Talo</li>
                  </ul>
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full mt-2">
                  Upgrade im Hauptmenü unter Einstellungen
                </span>
              </div>
            </div>

            {/* Blurred Mockup Content grouped by Event */}
            <div className="opacity-40 pointer-events-none select-none flex flex-col gap-10">
              {groupedMockShifts.map((group) => (
                <div key={group.eventName} className="flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-black/5 pb-2">
                    <h3 className="font-poppins font-black text-sm text-[#0A0A0A] uppercase tracking-wider">
                      {group.eventName}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {group.list.map((s) => (
                      <GlassSection key={s.id} className="p-5 flex flex-col justify-between min-h-[200px] border border-black/5 rounded-[24px]">
                        <div className="flex justify-between items-start gap-3">
                          <TBadge label={s.event} />
                          <span className="text-xs font-mono font-black text-[#34C759]">+{s.points.toFixed(1)} Pkt.</span>
                        </div>
                        <div>
                          <h4 className="font-poppins font-bold text-sm text-[#0A0A0A]">{s.title}</h4>
                          <div className="flex flex-col gap-1 mt-3">
                            <div className="flex items-center gap-2 text-xs text-[#71717A]">
                              <Calendar size={13} /> <span>{s.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-[#71717A]">
                              <Clock size={13} /> <span>{s.time}</span>
                            </div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-black/5 flex items-center justify-between">
                          <TButton label="Schicht buchen" onClick={() => {}} className="w-full rounded-xl py-2" />
                        </div>
                      </GlassSection>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Pro-Plan Enabled shifts grid */
          <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-[#0A0A0A]" />
                <span className="text-xs text-[#71717A] font-poppins">Lade Schicht-Börse...</span>
              </div>
            ) : (
              <>
                {shifts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white border border-black/5 rounded-[28px] p-6 text-center shadow-sm">
                    <Layers size={48} className="text-[#A1A1AA] mb-4" />
                    <h3 className="font-poppins font-bold text-sm text-[#0A0A0A]">
                      Derzeit keine Schichten eingetragen
                    </h3>
                    <p className="text-xs text-[#71717A] mt-1 max-w-xs">
                      Sobald Admins Arbeitseinsätze oder Helferdienste anlegen, erscheinen sie hier zur Buchung.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-12">
                    {groupedShifts.map((group) => (
                      <div key={group.eventName} className="flex flex-col gap-5">
                        
                        {/* Event Header with WhatsApp Invite Generator */}
                        <div className="flex items-center justify-between border-b border-black/5 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                            <h3 className="font-poppins font-black text-base text-[#0A0A0A] uppercase tracking-wider">
                              {group.eventName}
                            </h3>
                          </div>
                          
                          <button
                            onClick={() => shareEventShifts(group.eventName, group.list)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/15 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                            title="Gesamtes Event auf WhatsApp bewerben"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.002 5.419 5.4 0 12.008 0c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.508 8.49-.004 6.587-5.395 12.002-12.002 12.002-.003 0-.005 0-.008 0-1.997-.001-3.957-.502-5.69-1.455L0 24zm6.59-4.859c1.72.1.1.1-1.815.1 1.72.1-.1.1.002 0l.39.232c1.523.905 3.364 1.382 5.253 1.383 5.4 0 9.794-4.383 9.797-9.77.001-2.607-1.015-5.059-2.862-6.908C17.328 4.249 14.887 3.23 12.28 3.23c-5.4 0-9.794 4.383-9.797 9.771-.001 1.954.512 3.864 1.487 5.568l.243.424-.984 3.593 3.678-.965.421.25c1.653.978 3.536 1.493 5.452 1.493z" />
                            </svg>
                            <span>Event bewerben</span>
                          </button>
                        </div>

                        {/* Shifts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {group.list.map((s) => {
                            const isMine = s.claimedById === currentMember?.id;
                            const isOther = s.claimedById && !isMine;

                            return (
                              <GlassSection key={s.id} className="p-5 flex flex-col justify-between min-h-[220px] border border-black/5 rounded-[24px] hover:shadow-md transition-all">
                                <div className="flex flex-col gap-3">
                                  <div className="flex justify-between items-start gap-3">
                                    <span className="text-xs font-mono font-black text-[#34C759]">+{s.points.toFixed(1)} Pkt.</span>
                                    
                                    {/* Copy / Share Button for WhatsApp */}
                                    <button
                                      onClick={() => shareSingleShift(s)}
                                      className="p-1.5 rounded-lg border border-green-500/20 bg-green-500/10 text-green-600 hover:bg-green-500/15 transition-all"
                                      title="Schicht via WhatsApp teilen"
                                    >
                                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.002 5.419 5.4 0 12.008 0c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.51 5.284 3.508 8.49-.004 6.587-5.395 12.002-12.002 12.002-.003 0-.005 0-.008 0-1.997-.001-3.957-.502-5.69-1.455L0 24zm6.59-4.859c1.72.1.1.1-1.815.1 1.72.1-.1.1.002 0l.39.232c1.523.905 3.364 1.382 5.253 1.383 5.4 0 9.794-4.383 9.797-9.77.001-2.607-1.015-5.059-2.862-6.908C17.328 4.249 14.887 3.23 12.28 3.23c-5.4 0-9.794 4.383-9.797 9.771-.001 1.954.512 3.864 1.487 5.568l.243.424-.984 3.593 3.678-.965.421.25c1.653.978 3.536 1.493 5.452 1.493z" />
                                      </svg>
                                    </button>
                                  </div>
                                  <div>
                                    <h4 className="font-poppins font-bold text-sm text-[#0A0A0A]">{s.title}</h4>
                                    <div className="flex flex-col gap-1 mt-3">
                                      <div className="flex items-center gap-2 text-xs text-[#71717A]">
                                        <Calendar size={13} /> <span>{s.date}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-[#71717A]">
                                        <Clock size={13} /> <span>{s.time}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-black/5 flex flex-col gap-2 mt-4">
                                  {isMine ? (
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2 text-xs text-[#34C759] font-poppins font-bold bg-[#34C759]/10 border border-[#34C759]/20 px-3 py-2 rounded-xl justify-center">
                                        <Check size={14} /> Von dir gebucht!
                                      </div>
                                      <TButton
                                        label="Schicht freigeben"
                                        variant="danger"
                                        onClick={() => releaseShift(s)}
                                        className="w-full rounded-xl py-2"
                                      />
                                    </div>
                                  ) : isOther ? (
                                    <div className="flex items-center gap-2 text-xs text-[#71717A] bg-black/[0.04] px-3 py-2 rounded-xl w-full justify-center">
                                      <Users size={12} /> Gebucht: {s.claimedByName}
                                    </div>
                                  ) : (
                                    <TButton
                                      label="Schicht buchen"
                                      onClick={() => claimShift(s)}
                                      className="w-full rounded-xl py-2"
                                    />
                                  )}

                                  {isAdmin && (
                                    <button
                                      onClick={() => deleteShift(s.id)}
                                      className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors mt-2"
                                    >
                                      <Trash size={12} /> Schicht löschen
                                    </button>
                                  )}
                                </div>
                              </GlassSection>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Sheet Modal: Form */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm"
              >
                <GlassSection className="p-6 flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg">
                      Neue Schicht anlegen
                    </h3>
                    <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Veranstaltung / Event</label>
                      <input
                        autoFocus
                        value={form.event}
                        onChange={(e) => setForm({ ...form, event: e.target.value })}
                        placeholder="z.B. Sommerfest 2026, Clubturnier"
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Schichtbezeichnung</label>
                      <input
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="z.B. Grillstation Schicht 1"
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Datum</label>
                        <input
                          type="date"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Punkte</label>
                        <input
                          type="number"
                          step="0.5"
                          value={form.points}
                          onChange={(e) => setForm({ ...form, points: e.target.value })}
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Uhrzeit</label>
                      <input
                        value={form.time}
                        onChange={(e) => setForm({ ...form, time: e.target.value })}
                        placeholder="z.B. 12:00 - 14:00"
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <TButton
                      label={saving ? "Wird gespeichert..." : "Schicht erstellen"}
                      onClick={saveForm}
                      disabled={saving || !form.title.trim() || !form.event.trim()}
                    />
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
