"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useAppStore } from "../../../lib/store/useAppStore";
import { FirebaseManager } from "../../../lib/firebase/firebaseManager";
import { Activity, ActivityCategory } from "../../../lib/firebase/models";

const categoryMeta: Record<string, { label: string; bg: string; text: string }> = {
  A: { label: "Kategorie A", bg: "bg-red-500/10", text: "text-red-400" },
  B: { label: "Kategorie B", bg: "bg-blue-500/10", text: "text-blue-400" },
  C: { label: "Kategorie C", bg: "bg-green-500/10", text: "text-green-400" },
  S: { label: "Kategorie S", bg: "bg-purple-500/10", text: "text-purple-400" },
};

const ALL_CATS = [ActivityCategory.A, ActivityCategory.B, ActivityCategory.C, ActivityCategory.S];

type FormData = { name: string; points: string; category: ActivityCategory };
const defaultForm = (): FormData => ({ name: "", points: "2", category: ActivityCategory.B });

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
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

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
    setEditTarget(null);
    setForm(defaultForm());
    setShowForm(true);
  };

  const openEdit = (a: Activity) => {
    setEditTarget(a);
    setForm({ name: a.name, points: String(a.points), category: a.category as ActivityCategory });
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

  const deleteActivity = async () => {
    if (!currentClub || !deleteTarget) return;
    await FirebaseManager.deleteActivity(currentClub.id, deleteTarget.id);
    setDeleteTarget(null);
  };

  const isAdmin = currentMember?.isAdmin === true;

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-[#080808] border-b border-[#ffffff0f] px-6 pt-6 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-poppins font-bold text-white">Tätigkeiten</h1>
          {isAdmin && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-poppins font-semibold bg-white text-[#080808] hover:bg-white/90 transition-colors"
            >
              <Plus size={16} />
              Neu
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]" />
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Tätigkeit suchen…"
            className="w-full rounded-xl border border-[#ffffff0f] bg-[#111111] pl-10 pr-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          <button
            onClick={() => setFilterCat(null)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-poppins font-semibold border transition-colors ${
              filterCat === null
                ? "bg-white text-[#080808] border-white"
                : "border-[#ffffff1a] text-[#8A8A8A] hover:text-white"
            }`}
          >
            Alle
          </button>
          {ALL_CATS.map((cat) => {
            const meta = categoryMeta[cat];
            const active = filterCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilterCat(filterCat === cat ? null : cat)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-poppins font-semibold border transition-colors ${
                  active
                    ? `${meta.bg} ${meta.text} border-transparent`
                    : "border-[#ffffff1a] text-[#8A8A8A] hover:text-white"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${active ? meta.text.replace("text-", "bg-") : "bg-[#555]"}`}
                />
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {loading ? (
          <div className="flex items-center justify-center p-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Search size={40} className="text-[#333] mb-4" />
            <p className="font-poppins text-[#8A8A8A]">Keine Tätigkeiten gefunden.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#ffffff0f] bg-[#111111] overflow-hidden mb-8">
            {filtered.map((activity, idx) => {
              const meta = categoryMeta[activity.category as string] ?? categoryMeta.B;
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Category Badge */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-poppins text-sm shrink-0 ${meta.bg} ${meta.text}`}>
                      {activity.category}
                    </div>

                    {/* Name + Category Label */}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-poppins font-semibold text-white text-sm truncate">
                        {activity.name}
                      </span>
                      <span className={`text-xs font-poppins ${meta.text}`}>
                        {meta.label}
                      </span>
                    </div>

                    {/* Points */}
                    <span className="font-mono font-bold text-white shrink-0">
                      {activity.points.toFixed(1)}
                    </span>

                    {/* Actions (admin only) */}
                    {isAdmin && (
                      <div className="flex gap-1 shrink-0 ml-2">
                        <button
                          onClick={() => openEdit(activity)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors text-[#8A8A8A] hover:text-white"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(activity)}
                          className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-[#8A8A8A] hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  {idx < filtered.length - 1 && (
                    <div className="border-b border-[#ffffff0a] mx-5" />
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6 flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-poppins font-bold text-white text-lg">
                  {editTarget ? "Tätigkeit bearbeiten" : "Neue Tätigkeit"}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={18} className="text-[#8A8A8A]" />
                </button>
              </div>

              {/* Name */}
              <div>
                <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider mb-2 block">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Name der Tätigkeit"
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Points */}
              <div>
                <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider mb-2 block">Punkte</label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={form.points}
                  onChange={(e) => setForm({ ...form, points: e.target.value })}
                  className="w-full rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] px-4 py-3 text-sm font-poppins text-white placeholder-[#555] focus:outline-none focus:border-white/20"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-poppins text-[#8A8A8A] uppercase tracking-wider mb-2 block">Kategorie</label>
                <div className="rounded-xl border border-[#ffffff0f] bg-[#1A1A1A] overflow-hidden">
                  {ALL_CATS.map((cat, idx) => {
                    const meta = categoryMeta[cat];
                    const selected = form.category === cat;
                    return (
                      <div key={cat}>
                        <button
                          onClick={() => setForm({ ...form, category: cat })}
                          className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                            selected ? `${meta.bg}` : "hover:bg-white/5"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold font-poppins text-xs ${meta.bg} ${meta.text}`}>
                            {cat}
                          </div>
                          <span className="font-poppins text-sm text-white flex-1">{meta.label}</span>
                          {selected && <Check size={16} className={meta.text} />}
                        </button>
                        {idx < ALL_CATS.length - 1 && <div className="border-b border-[#ffffff0a] mx-4" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Save */}
              <button
                onClick={saveForm}
                disabled={saving || !form.name.trim()}
                className="w-full py-3 rounded-xl font-poppins font-semibold text-sm bg-white text-[#080808] hover:bg-white/90 transition-colors disabled:opacity-40"
              >
                {saving ? "Speichern…" : editTarget ? "Änderungen speichern" : "Tätigkeit hinzufügen"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={() => setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-[#ffffff0f] bg-[#111111] p-6 flex flex-col gap-4"
            >
              <h3 className="font-poppins font-bold text-white text-lg">Tätigkeit löschen?</h3>
              <p className="text-sm font-poppins text-[#8A8A8A]">
                <span className="text-white">{deleteTarget.name}</span> wird unwiderruflich gelöscht.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-[#8A8A8A] hover:text-white hover:bg-white/5 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={deleteActivity}
                  className="px-4 py-2 rounded-xl text-sm font-poppins font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
                >
                  Löschen
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
