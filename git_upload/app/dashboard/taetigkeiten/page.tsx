"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, X } from "lucide-react";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { Activity, ActivityCategory, getPlanFeatures } from "@/lib/firebase/models";
import { GlassSection, TCatBadge, TSearchBar, TButton, TBadge } from "@/app/components/ui/NativeUI";

const categoryLabels: Record<string, string> = {
  A: "Kategorie A",
  B: "Kategorie B",
  C: "Kategorie C",
  S: "Kategorie S",
};

const categoryColors: Record<string, string> = {
  A: "#34C759",
  B: "#FF9500",
  C: "#E87AA0",
  S: "#7C6FE0",
};

const ALL_CATS = [ActivityCategory.A, ActivityCategory.B, ActivityCategory.C, ActivityCategory.S];

type FormData = { name: string; points: string; category: ActivityCategory };
const defaultForm = (): FormData => ({ name: "", points: "2.0", category: ActivityCategory.B });

export default function ActivitiesPage() {
  const currentClub = useAppStore((state) => state.currentClub);
  const currentMember = useAppStore((state) => state.currentMember);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filterCat, setFilterCat] = useState<ActivityCategory | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Activity | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm());
  const [saving, setSaving] = useState(false);

  const isAdmin = currentMember?.isAdmin === true;
  const planFeatures = currentClub ? getPlanFeatures(currentClub.plan) : getPlanFeatures();
  const isLimitReached = activities.length >= planFeatures.maxActivities;

  useEffect(() => {
    if (!currentClub) return;
    const unsub = FirebaseManager.listenToActivities(currentClub.id, (acts) => {
      setActivities(acts.sort((a, b) => a.name.localeCompare(b.name)));
      setLoading(false);
    });
    return unsub;
  }, [currentClub]);

  const filtered = useMemo(() => {
    let list = activities;
    if (filterCat) list = list.filter((a) => a.category === filterCat);
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter((a) => a.name.toLowerCase().includes(q));
    }
    return list;
  }, [activities, filterCat, searchText]);

  const openAdd = () => {
    if (isLimitReached) {
      alert(`Das Kategorienlimit (${planFeatures.maxActivities}) deines aktuellen Plans ist erreicht. Bitte im Bereich 'Einstellungen' den Plan upgraden.`);
      return;
    }
    setEditTarget(null);
    setForm(defaultForm());
    setShowForm(true);
  };

  const openEdit = (a: Activity) => {
    setEditTarget(a);
    setForm({ name: a.name, points: String(a.points.toFixed(1)), category: a.category as ActivityCategory });
    setShowForm(true);
  };

  const saveForm = async () => {
    if (!currentClub || !form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      points: parseFloat(form.points) || 0,
      category: form.category,
      isDefault: false,
    };
    try {
      if (editTarget) {
        await FirebaseManager.updateActivity(currentClub.id, editTarget.id, payload);
      } else {
        await FirebaseManager.addActivity(currentClub.id, payload);
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      <div className="relative z-10 max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:py-8 lg:px-10 flex flex-col gap-7 lg:gap-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-start justify-between gap-4 border-b border-black/5 pb-6 lg:pb-8 mb-2">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-poppins font-black text-[#0A0A0A] tracking-tighter">Tätigkeiten</h1>
                <TBadge color={isLimitReached ? "#EF4444" : "#0A0A0A"} className="hidden sm:inline-flex" label={`${activities.length} ${planFeatures.maxActivities < 999 ? `/ ${planFeatures.maxActivities}` : ""}  Kategorien`} />
              </div>
              <p className="text-[#71717A] font-bold text-xs uppercase tracking-[0.2em]">Aktivitätskatalog verwalten</p>
            </div>
            {isAdmin && (
              <button
                onClick={openAdd}
                disabled={isLimitReached}
                className={`shrink-0 flex items-center gap-2 ${isLimitReached ? "bg-[#E4E4E7] text-[#A1A1AA] cursor-not-allowed" : "bg-[#0A0A0A] text-white hover:bg-[#1F1F23]"} px-4 sm:px-5 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all`}
              >
                <Plus size={16} /> Neu
              </button>
            )}
          </div>
        </motion.div>

        {/* Search & Filter */}
        <div className="flex flex-col gap-4">
          <TSearchBar value={searchText} onChange={setSearchText} placeholder="Tätigkeit suchen…" />
          
          <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setFilterCat(null)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-poppins font-bold transition-all border ${
                filterCat === null
                  ? "bg-[#0A0A0A] text-white border-black/15 shadow-lg"
                  : "bg-black/[0.04] text-[#52525B] border-black/10 hover:text-[#0A0A0A]"
              }`}
            >
              Alle
            </button>
            {ALL_CATS.map((cat) => {
              const catColor = categoryColors[cat];
              const isActive = filterCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                  className="shrink-0 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-poppins font-bold transition-all border"
                  style={isActive
                    ? { background: `${catColor}20`, color: catColor, borderColor: `${catColor}60` }
                    : { background: "rgba(0,0,0,0.06)", color: "#52525B", borderColor: "rgba(0,0,0,0.11)" }
                  }
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center p-20 opacity-20">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
            <Search size={40} className="text-[#0A0A0A] mb-4" />
            <p className="font-poppins text-[#52525B]">Keine Tätigkeiten gefunden.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3.5 pb-20">
            <AnimatePresence mode="popLayout">
              {filtered.map((activity, idx) => (
                <motion.div
                  key={activity.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <GlassSection className="p-4 flex items-center gap-4">
                    <TCatBadge category={activity.category} />
                    
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-poppins font-semibold text-[#0A0A0A] text-[15px] truncate leading-tight">
                        {activity.name}
                      </span>
                      <span className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-wider mt-1 opacity-60">
                         {categoryLabels[activity.category]}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono font-bold text-[15px]" style={{ color: categoryColors[activity.category] ?? "#0A0A0A" }}>
                        {activity.points.toFixed(1)}
                      </span>
                      {isAdmin && (
                        <button 
                          onClick={() => openEdit(activity)}
                          className="w-8 h-8 rounded-lg bg-black/[0.04] flex items-center justify-center text-[#71717A] hover:text-[#0A0A0A] transition-all"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                    </div>
                  </GlassSection>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Sheet Modal: Form */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm"
            >
              <GlassSection className="p-6 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins font-bold text-[#0A0A0A] text-lg">
                    {editTarget ? "Bearbeiten" : "Neu"}
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-[#52525B] hover:text-[#0A0A0A]">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Name</label>
                    <input
                      autoFocus
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="z.B. Training geleitet"
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3.5 font-poppins text-[15px] text-[#0A0A0A] placeholder-[#A1A1AA] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Punkte</label>
                    <input
                      type="number"
                      step="0.5"
                      value={form.points}
                      onChange={(e) => setForm({ ...form, points: e.target.value })}
                      className="w-full rounded-2xl bg-black/[0.04] border border-black/10 px-4 py-3.5 font-poppins text-[15px] text-[#0A0A0A] focus:outline-none focus:border-black/15 transition-all"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-poppins font-bold text-[#52525B] uppercase tracking-widest pl-1">Kategorie</label>
                    <div className="grid grid-cols-4 gap-2">
                      {ALL_CATS.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setForm({ ...form, category: cat })}
                          className={`h-12 rounded-xl flex items-center justify-center font-bold font-poppins transition-all border ${
                            form.category === cat
                              ? "bg-[#0A0A0A] text-white border-black/15"
                              : "bg-black/[0.04] text-[#52525B] border-black/10"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <TButton 
                    label={saving ? "Speichern…" : (editTarget ? "Speichern" : "Erstellen")} 
                    onClick={saveForm}
                    disabled={saving || !form.name.trim()}
                  />
                  {editTarget && (
                    <TButton 
                      label="Löschen" 
                      variant="danger" 
                      onClick={async () => {
                         if (!currentClub || !editTarget) return;
                         await FirebaseManager.deleteActivity(currentClub.id, editTarget.id);
                         setShowForm(false);
                      }} 
                    />
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
