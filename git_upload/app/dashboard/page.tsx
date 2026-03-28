"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "../../lib/store/useAppStore";
import { FirebaseManager } from "../../lib/firebase/firebaseManager";
import { Entry, calculateTargetPoints } from "../../lib/firebase/models";
import { motion } from "framer-motion";
import { Briefcase } from "lucide-react";

export default function DashboardPage() {
  const currentMember = useAppStore((state) => state.currentMember);
  const currentClub = useAppStore((state) => state.currentClub);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentClub) {
      const unsubscribe = FirebaseManager.listenToEntries(currentClub.id, (allEntries) => {
        // Filtere nur die Einträge des aktuellen Nutzers für sein privates Dashboard
        const userEntries = allEntries.filter((e) => e.memberId === currentMember?.id);
        setEntries(userEntries);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [currentClub, currentMember]);

  if (!currentMember || !currentClub) return null;

  // Calculators wie in iOS `Models.swift`
  const targetPts = calculateTargetPoints(currentMember, currentClub.requiredPoints);
  const approvedPts = entries.filter((e) => e.status === "Genehmigt").reduce((sum, e) => sum + e.points, 0);
  const pendingPts = entries.filter((e) => e.status === "Ausstehend").reduce((sum, e) => sum + e.points, 0);
  
  const rawMissing = targetPts - approvedPts;
  const missingPts = currentMember.memberType === "Vorstand" || currentMember.memberType === "Jugend" 
    ? 0 
    : Math.max(0, rawMissing);
    
  let progress = targetPts > 0 ? (approvedPts / targetPts) * 100 : 100;
  if (progress > 100) progress = 100;

  return (
    <div className="flex flex-col gap-8 p-8 max-w-5xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-end"
      >
        <div>
          <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white mb-2">
            Hallo, {currentMember.firstName}!
          </h1>
          <p className="text-gray-500 dark:text-[#8A8A8A] font-poppins">
            Hier ist deine aktuelle Punkteübersicht für die Saison.
          </p>
        </div>
      </motion.div>

      {loading ? (
        <div className="flex items-center justify-center p-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-900 dark:border-white border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-2xl relative overflow-hidden"
          >
            {/* Background Blob */}
            <div className="absolute right-0 top-0 h-[200px] w-[200px] -translate-y-1/2 translate-x-1/2 rounded-full bg-black/5 dark:bg-white/5 blur-[80px]" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              {/* Circular Progress (Desktop adaptiert) */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="84"
                    fill="none"
                    className="stroke-gray-200 dark:stroke-[#1A1A1A]"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  <motion.circle
                    initial={{ strokeDasharray: "0 1000" }}
                    animate={{ strokeDasharray: `${(progress / 100) * 527.78} 1000` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="96"
                    cy="96"
                    r="84"
                    fill="none"
                    stroke={missingPts === 0 ? "#34C759" : "url(#gradient)"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    style={{ strokeDasharray: `${(progress / 100) * 527.78} 1000` }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C8D0E0" />
                      <stop offset="100%" stopColor="#8A8A8A" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-poppins font-bold text-gray-900 dark:text-white">
                    {approvedPts.toFixed(1)}
                  </span>
                  <span className="text-sm font-poppins text-gray-500 dark:text-[#8A8A8A]">
                    / {targetPts.toFixed(1)} Pkt.
                  </span>
                </div>
              </div>

              {/* Stats Layout */}
              <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                <StatCard label="Genehmigt" value={approvedPts.toFixed(1)} highlight="#34C759" />
                <StatCard label="Ausstehend" value={pendingPts.toFixed(1)} highlight="#FF9500" />
                <StatCard label="Noch offen" value={missingPts.toFixed(1)} highlight={missingPts === 0 ? "#8A8A8A" : "#FF3B30"} />
                <StatCard label="Soll pro Mitglied" value={targetPts.toFixed(1)} highlight="#C8D0E0" />
              </div>
            </div>
          </motion.div>

          {/* Letzte Einträge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <h2 className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">Deine letzten Einträge</h2>
            {entries.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-[#111111] p-10 text-center flex flex-col items-center">
                <span className="p-4 bg-gray-200 dark:bg-white/5 rounded-full mb-4">
                  <Briefcase className="text-gray-500 dark:text-[#8A8A8A]" size={32} />
                </span>
                <p className="text-gray-500 dark:text-[#8A8A8A] font-poppins">Du hast noch keine Tätigkeiten eingetragen.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {entries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#111111] p-5 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-4">
                      <div className={`flex w-12 h-12 rounded-xl items-center justify-center font-bold font-poppins
                        ${entry.activityCategory === "A" ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500" :
                          entry.activityCategory === "B" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500" :
                          entry.activityCategory === "C" ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500" :
                          "bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-500"}`}
                      >
                        {entry.activityCategory}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-poppins font-medium text-gray-900 dark:text-white">{entry.activityName}</span>
                        <span className="text-xs font-poppins text-gray-500 dark:text-[#8A8A8A] mt-1 space-x-2">
                          <span>{new Date(entry.date as any).toLocaleDateString("de-DE")}</span>
                          <span>•</span>
                          <span className={`${entry.status === "Genehmigt" ? "text-green-600 dark:text-green-500" : entry.status === "Abgelehnt" ? "text-red-600 dark:text-red-500" : "text-orange-600 dark:text-orange-500"}`}>
                            {entry.status}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="font-poppins font-semibold text-gray-900 dark:text-white">+{entry.points.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  );
}

const StatCard = ({ label, value, highlight }: { label: string; value: string; highlight: string }) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] p-5 overflow-hidden relative shadow-sm dark:shadow-none">
    <div className="flex items-center justify-between">
      <span className="text-gray-500 dark:text-[#8A8A8A] font-poppins text-sm">{label}</span>
      <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ color: highlight, backgroundColor: highlight }} />
    </div>
    <span className="text-3xl font-poppins font-bold text-gray-900 dark:text-white mt-2">{value}</span>
  </div>
);
