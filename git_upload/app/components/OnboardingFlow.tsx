"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Check, ChevronRight, Loader2, LogOut } from "lucide-react";
import { GlassSection, TButton, TLine } from "./ui/NativeUI";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function OnboardingFlow() {
  const currentMember = useAppStore((state) => state.currentMember);
  const setCurrentMember = useAppStore((state) => state.setCurrentMember);
  const setCurrentClub = useAppStore((state) => state.setCurrentClub);
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateClub = async () => {
    if (!clubName.trim() || !currentMember?.id) {
      setError("Bitte gib einen Vereinsnamen ein.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      // 1. Create the club
      const newClubId = await FirebaseManager.createClub({
        name: clubName.trim(),
        requiredPoints: 50,
        compensationPerMissingPoint: 10,
        seasonType: "Kalenderjahr",
        approvalRequired: true,
        plan: "free",
      });

      // 2. Add standard activities (optional out of box setup, you can keep it empty or add some)
      await FirebaseManager.addActivity(newClubId, {
        name: "Training",
        points: 1,
        category: "Sport",
        isDefault: true
      });
      await FirebaseManager.addActivity(newClubId, {
        name: "Arbeitseinsatz",
        points: 5,
        category: "Event",
        isDefault: true
      });

      // 3. Update the member to be admin and assign to club
      const clubIds = currentMember.clubIds || [];
      if (!clubIds.includes(newClubId)) clubIds.push(newClubId);

      await FirebaseManager.updateMember(currentMember.id, {
        clubId: newClubId,
        clubIds: clubIds,
        isAdmin: true,   // First user is the admin
        memberType: "Vorstand", // Optionally set as Vorstand
      });

      // 4. Update local state
      const updatedMember = await FirebaseManager.getMember(currentMember.id);
      const updatedClub = await FirebaseManager.getClub(newClubId);
      
      setCurrentMember(updatedMember);
      setCurrentClub(updatedClub);

    } catch (err) {
      console.error(err);
      setError("Es gab ein Problem beim Erstellen des Vereins.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/anmelden");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#FAFAFA] p-6 relative">
      <button 
        onClick={handleLogout}
        className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 rounded-full border border-black/10 text-[#52525B] hover:text-[#0A0A0A] hover:bg-black/5 transition-all text-xs font-poppins font-medium"
      >
        <LogOut size={14} /> Abmelden
      </button>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-[420px]"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A0A0A] text-white shadow-xl shadow-black/10">
            <Building2 size={32} />
          </div>
          <h1 className="font-poppins text-3xl font-black tracking-tight text-[#0A0A0A]">
            Willkommen bei Talo
          </h1>
          <p className="mt-2 text-sm font-medium text-[#71717A]">
            Lass uns deinen ersten Verein vorbereiten.
          </p>
        </div>

        <GlassSection className="p-6 md:p-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="font-poppins text-sm font-bold text-[#0A0A0A]">
              Name des Vereins
            </label>
            <input
              type="text"
              value={clubName}
              onChange={(e) => setClubName(e.target.value)}
              placeholder="z.B. FC Musterstadt e.V."
              className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-3.5 outline-none transition-all placeholder:text-[#A1A1AA] focus:border-black/30 focus:bg-white"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-xs font-semibold text-red-500"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <TLine />

          <TButton
            label={loading ? "Verein wird gegründet..." : "Verein gründen"}
            onClick={handleCreateClub}
            disabled={loading}
            className="w-full justify-center"
          />
        </GlassSection>
      </motion.div>
    </div>
  );
}