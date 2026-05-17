"use client";

import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Plus, Trash, Check, X, Shield, Users, Layers, Award, MessageCircle } from "lucide-react";
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
  slotsRequired: string;
};

const defaultForm = (): ShiftFormData => ({
  title: "",
  event: "",
  date: new Date().toISOString().split("T")[0],
  time: "12:00 - 14:00",
  points: "2.0",
  slotsRequired: "1",
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
  const [viewMode, setViewMode] = useState<"cards" | "timeline">("cards");

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
        title: form.title.trim(),
        event: form.event.trim(),
        date: form.date,
        time: form.time.trim(),
        points: parseFloat(form.points) || 2.0,
        slotsRequired: parseInt(form.slotsRequired) || 1,
        claimedSlots: [],
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
    
    // Check if already claimed by this member
    const alreadyClaimed = shift.claimedSlots?.some(slot => slot.memberId === currentMember.id) 
      || shift.claimedById === currentMember.id;
      
    if (alreadyClaimed) {
      alert("Du hast diese Schicht bereits gebucht!");
      return;
    }

    const required = shift.slotsRequired || 1;
    const currentClaimedCount = shift.claimedSlots?.length || (shift.claimedById ? 1 : 0);
    
    if (currentClaimedCount >= required) {
      alert("Diese Schicht ist bereits voll belegt!");
      return;
    }

    try {
      const memberName = `${currentMember.firstName} ${currentMember.lastName}`;
      const newSlots = shift.claimedSlots ? [...shift.claimedSlots] : [];
      if (shift.claimedById && newSlots.length === 0) {
        newSlots.push({ memberId: shift.claimedById, memberName: shift.claimedByName || "" });
      }
      newSlots.push({ memberId: currentMember.id, memberName: memberName });

      // 1. Claim in Shifts collection
      await FirebaseManager.updateShift(currentClub.id, shift.id, {
        claimedSlots: newSlots,
        claimedById: newSlots[0].memberId,
        claimedByName: newSlots[0].memberName,
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
      let newSlots = shift.claimedSlots ? [...shift.claimedSlots] : [];
      if (shift.claimedById && newSlots.length === 0) {
        newSlots.push({ memberId: shift.claimedById, memberName: shift.claimedByName || "" });
      }
      newSlots = newSlots.filter(s => s.memberId !== currentMember.id);

      // 1. Release in Shifts collection
      await FirebaseManager.updateShift(currentClub.id, shift.id, {
        claimedSlots: newSlots,
        claimedById: newSlots.length > 0 ? newSlots[0].memberId : null,
        claimedByName: newSlots.length > 0 ? newSlots[0].memberName : null,
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

  const existingEvents = useMemo(() => {
    const eventsSet = new Set<string>();
    shifts.forEach((s) => {
      if (s.event && s.event.trim()) {
        eventsSet.add(s.event.trim());
      }
    });
    return Array.from(eventsSet);
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

  const parseTime = (timeStr: string) => {
    const parts = timeStr.split("-");
    const start = parts[0]?.trim() || "08:00";
    const end = parts[1]?.trim() || "18:00";
    
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    
    const startDecimal = (sh || 8) + (sm || 0) / 60;
    const endDecimal = (eh || 18) + (em || 0) / 60;
    
    return { startDecimal, endDecimal, start, end };
  };

  const timelineData = useMemo(() => {
    const dateGroups: { [dateStr: string]: Shift[] } = {};
    shifts.forEach((s) => {
      if (!dateGroups[s.date]) dateGroups[s.date] = [];
      dateGroups[s.date].push(s);
    });

    return Object.entries(dateGroups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([dateStr, dateShifts]) => {
        let dayMin = 8;
        let dayMax = 20;
        dateShifts.forEach((s) => {
          const { startDecimal, endDecimal } = parseTime(s.time);
          dayMin = Math.min(dayMin, Math.floor(startDecimal));
          dayMax = Math.max(dayMax, Math.ceil(endDecimal));
        });
        
        dayMin = Math.max(0, dayMin - 1);
        dayMax = Math.min(24, dayMax + 1);
        const dayDuration = dayMax - dayMin;

        const hoursArray: number[] = [];
        for (let h = dayMin; h <= dayMax; h++) {
          hoursArray.push(h);
        }

        const sorted = [...dateShifts].sort((a, b) => {
          return parseTime(a.time).startDecimal - parseTime(b.time).startDecimal;
        });

        const lanes: Shift[][] = [];
        sorted.forEach((s) => {
          const { startDecimal } = parseTime(s.time);
          let placed = false;
          for (let i = 0; i < lanes.length; i++) {
            const lane = lanes[i];
            const lastShift = lane[lane.length - 1];
            const { endDecimal: lastEnd } = parseTime(lastShift.time);
            if (lastEnd <= startDecimal) {
              lane.push(s);
              placed = true;
              break;
            }
          }
          if (!placed) {
            lanes.push([s]);
          }
        });

        let formattedDate = dateStr;
        try {
          const dObj = new Date(dateStr);
          formattedDate = dObj.toLocaleDateString("de-DE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
          });
        } catch(e) {}

        return {
          dateStr,
          formattedDate,
          dayMin,
          dayMax,
          dayDuration,
          hoursArray,
          lanes
        };
      });
  }, [shifts]);

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

        {hasAccess && shifts.length > 0 && (
          <div className="flex items-center justify-between gap-4 max-w-6xl mx-auto w-full px-1 mt-2">
            <div className="flex items-center gap-1.5 bg-black/[0.04] p-1 rounded-2xl border border-black/5">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "cards" ? "bg-white text-[#0A0A0A] shadow-sm border border-[#0A0A0A]/5" : "text-[#71717A] hover:text-[#0A0A0A]"
                }`}
              >
                Karten-Ansicht
              </button>
              <button
                type="button"
                onClick={() => setViewMode("timeline")}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "timeline" ? "bg-white text-[#0A0A0A] shadow-sm border border-[#0A0A0A]/5" : "text-[#71717A] hover:text-[#0A0A0A]"
                }`}
              >
                Zeitplan / Timeline
              </button>
            </div>
          </div>
        )}

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
          /* Pro-Plan Enabled shifts grid & Timeline view */
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
                ) : viewMode === "timeline" ? (
                  /* Dynamic Overlap-Safe Horizontal Timeline View */
                  <div className="flex flex-col gap-8 w-full">
                    {timelineData.map((day) => (
                      <div key={day.dateStr} className="flex flex-col gap-6 bg-white border border-black/5 rounded-[28px] p-6 shadow-sm">
                        {/* Day Header */}
                        <div className="flex items-center justify-between border-b border-black/5 pb-3">
                          <span className="font-poppins font-black text-sm text-[#0A0A0A] uppercase tracking-wider">
                            {day.formattedDate}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#71717A]">
                            {day.lanes.reduce((sum, l) => sum + l.length, 0)} Schichten
                          </span>
                        </div>

                        {/* Horizontal Timeline Track Area */}
                        <div className="relative pt-6 pb-2 min-h-[140px] flex flex-col gap-4 overflow-x-auto no-scrollbar">
                          {/* Vertical hour grid lines */}
                          <div className="absolute inset-0 flex justify-between pointer-events-none px-4">
                            {day.hoursArray.map((hour) => (
                              <div key={hour} className="h-full border-l border-black/[0.03] relative flex-1 flex justify-start">
                                <span className="absolute -top-5 left-0 -translate-x-1/2 text-[8px] font-black text-[#A1A1AA] tracking-tighter">
                                  {String(hour).padStart(2, "0")}:00
                                </span>
                              </div>
                            ))}
                          </div>

                          {/* Lanes Container */}
                          <div className="flex flex-col gap-3 relative z-10 min-w-[650px] px-4">
                            {day.lanes.map((lane, laneIdx) => (
                              <div key={laneIdx} className="relative h-[68px] w-full border border-black/[0.02] bg-black/[0.01] rounded-2xl">
                                {lane.map((s) => {
                                  const { startDecimal, endDecimal, start, end } = parseTime(s.time);
                                  const left = ((startDecimal - day.dayMin) / day.dayDuration) * 100;
                                  const width = ((endDecimal - startDecimal) / day.dayDuration) * 100;
                                  
                                  const required = s.slotsRequired || 1;
                                  const claimedCount = s.claimedSlots?.length || (s.claimedById ? 1 : 0);
                                  const hasClaimedThis = s.claimedSlots?.some(slot => slot.memberId === currentMember?.id) || s.claimedById === currentMember?.id;
                                  const isFull = claimedCount >= required;

                                  return (
                                    <div
                                      key={s.id}
                                      style={{
                                        left: `${left}%`,
                                        width: `${width}%`,
                                      }}
                                      className="absolute top-1/2 -translate-y-1/2 h-[52px] px-1"
                                    >
                                      <div
                                        className={`h-full rounded-xl border p-2 flex flex-col justify-between hover:scale-[1.02] hover:shadow-md transition-all ${
                                          hasClaimedThis
                                            ? "bg-green-500/10 border-green-500/20 text-green-700 shadow-sm"
                                            : isFull
                                              ? "bg-black/[0.04] border-black/5 text-[#71717A] opacity-70"
                                              : "bg-white border-black/10 text-[#0A0A0A]"
                                        }`}
                                      >
                                        {/* Title & Points Row */}
                                        <div className="flex items-center justify-between gap-1">
                                          <span className="text-[10px] font-poppins font-black truncate max-w-[70%]" title={s.title}>
                                            {s.title}
                                          </span>
                                          <span className="text-[8px] font-mono font-black shrink-0">
                                            +{s.points.toFixed(1)} P
                                          </span>
                                        </div>

                                        {/* Time and Action */}
                                        <div className="flex items-center justify-between gap-2 border-t border-black/5 pt-1 mt-0.5">
                                          <span className="text-[8px] font-bold opacity-80">
                                            {start} - {end}
                                          </span>

                                          {/* Claims Actions */}
                                          {hasClaimedThis ? (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); releaseShift(s); }}
                                              className="text-[7px] font-black text-red-600 bg-red-500/10 px-1 py-0.5 rounded border border-red-500/20 uppercase tracking-widest transition-all"
                                            >
                                              Storno
                                            </button>
                                          ) : isFull ? (
                                            <span className="text-[7px] font-black bg-black/5 text-[#71717A] px-1 py-0.5 rounded border border-black/5 uppercase tracking-widest">
                                              Voll
                                            </span>
                                          ) : (
                                            <button
                                              type="button"
                                              onClick={(e) => { e.stopPropagation(); claimShift(s); }}
                                              className="text-[7px] font-black text-white bg-[#0A0A0A] hover:bg-[#1F1F23] px-1 py-0.5 rounded uppercase tracking-widest transition-all"
                                            >
                                              Buchen ({claimedCount}/{required})
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Cards List view grouped by Event */
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
                            <MessageCircle size={14} className="stroke-[2.5]" />
                            <span>Event bewerben</span>
                          </button>
                        </div>

                        {/* Shifts Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {group.list.map((s) => {
                            const required = s.slotsRequired || 1;
                            const claimedCount = s.claimedSlots?.length || (s.claimedById ? 1 : 0);
                            const hasClaimedThis = s.claimedSlots?.some(slot => slot.memberId === currentMember?.id) || s.claimedById === currentMember?.id;
                            const isFull = claimedCount >= required;

                            let claimersList: string[] = [];
                            if (s.claimedSlots) {
                              claimersList = s.claimedSlots.map(c => c.memberName);
                            } else if (s.claimedById) {
                              claimersList = [s.claimedByName || ""];
                            }

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
                                      <MessageCircle size={14} className="stroke-[2.5]" />
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

                                  {/* Slots and Claimers display */}
                                  <div className="flex flex-col gap-1 mt-2 border-t border-black/[0.03] pt-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-[#71717A] pb-1.5">
                                      <span>Platzbelegung</span>
                                      <span className={isFull ? "text-green-600 font-bold" : "text-[#0A0A0A]"}>
                                        {claimedCount} / {required} Personen
                                      </span>
                                    </div>
                                    
                                    {claimersList.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {claimersList.map((name, idx) => (
                                          <span key={idx} className="text-[9px] font-bold bg-black/[0.03] text-[#52525B] border border-black/5 px-2 py-0.5 rounded-md truncate max-w-full">
                                            👤 {name}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="pt-3 border-t border-black/5 flex flex-col gap-2 mt-4">
                                  {hasClaimedThis ? (
                                    <div className="flex flex-col gap-2">
                                      <div className="flex items-center gap-2 text-xs text-[#34C759] font-poppins font-bold bg-[#34C759]/10 border border-[#34C759]/20 px-3 py-2 rounded-xl justify-center">
                                        <Check size={14} /> Du hast gebucht!
                                      </div>
                                      <TButton
                                        label="Schicht freigeben"
                                        variant="danger"
                                        onClick={() => releaseShift(s)}
                                        className="w-full rounded-xl py-2"
                                      />
                                    </div>
                                  ) : isFull ? (
                                    <div className="flex items-center gap-2 text-xs text-[#71717A] bg-black/[0.04] border border-black/5 px-3 py-2 rounded-xl w-full justify-center font-bold">
                                      <Users size={12} /> Schicht voll belegt
                                    </div>
                                  ) : (
                                    <TButton
                                      label={`Schicht buchen (${claimedCount}/${required})`}
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
                    <div className="flex flex-col gap-2 relative">
                      <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Veranstaltung / Event</label>
                      <input
                        autoFocus
                        value={form.event}
                        onChange={(e) => setForm({ ...form, event: e.target.value })}
                        placeholder="z.B. Sommerfest 2026, Clubturnier"
                        className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                      />
                      
                      {existingEvents.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-1 max-h-[80px] overflow-y-auto no-scrollbar">
                          {existingEvents.map((evt) => (
                            <button
                              key={evt}
                              type="button"
                              onClick={() => setForm({ ...form, event: evt })}
                              className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${
                                form.event === evt
                                  ? "bg-[#0A0A0A] text-white border-black/15 shadow-sm"
                                  : "bg-black/[0.04] text-[#71717A] border-black/10 hover:text-[#0A0A0A]"
                              }`}
                            >
                              {evt}
                            </button>
                          ))}
                        </div>
                      )}
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

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Uhrzeit</label>
                        <input
                          value={form.time}
                          onChange={(e) => setForm({ ...form, time: e.target.value })}
                          placeholder="z.B. 12:00 - 14:00"
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Helfer-Slots</label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          value={form.slotsRequired}
                          onChange={(e) => setForm({ ...form, slotsRequired: e.target.value })}
                          placeholder="z.B. 5"
                          className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3 font-poppins text-[14px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                        />
                      </div>
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
