"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, LogOut } from "lucide-react";
import { GlassSection, TButton, TLine } from "./ui/NativeUI";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { auth } from "@/lib/firebase/config";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { normalizeClubIds, SPORT_TYPE_LABELS } from "@/lib/firebase/models";

const activeClubStorageKey = (uid: string) => `talo.activeClubId.${uid}`;

function getErrorDetails(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code?: unknown }).code)
      : undefined;

  return { code, message };
}

export default function OnboardingFlow() {
  const currentMember = useAppStore((state) => state.currentMember);
  const setCurrentMember = useAppStore((state) => state.setCurrentMember);
  const setCurrentClub = useAppStore((state) => state.setCurrentClub);
  const setAvailableClubs = useAppStore((state) => state.setAvailableClubs);
  const router = useRouter();

  const [clubName, setClubName] = useState("");
  const [sportType, setSportType] = useState("general");
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
      console.log("STEP 1: Creating Club...");
      const newClubId = await FirebaseManager.createClub({
        name: clubName.trim(),
        requiredPoints: 50,
        compensationPerMissingPoint: 10,
        seasonType: "Kalenderjahr",
        approvalRequired: true,
        plan: "free",
        sportType: sportType,
      });
      console.log("Club created with ID:", newClubId);

      // 2. Update the member to be admin and assign to club
      console.log("STEP 2: Updating user to Admin...");
      const clubIds = normalizeClubIds(currentMember.clubIds, currentMember.clubId);
      if (!clubIds.includes(newClubId)) clubIds.push(newClubId);

      await FirebaseManager.updateMember(currentMember.id, {
        clubId: newClubId,
        clubIds: clubIds,
        isAdmin: true,   // First user is the admin
        memberType: "Vorstand", // Optionally set as Vorstand
        clubMemberships: {
          ...(currentMember.clubMemberships ?? {}),
          [newClubId]: {
            memberType: "Vorstand",
            isAdmin: true,
            isTrainer: false,
          },
        },
      });
      console.log("User updated successfully");

      // 3. Add standard activities AFTER user is assigned (so Firebase rules pass!)
      console.log("STEP 3: Creating default activities...");
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
      console.log("Activities created successfully");

      // 4. Update local state
      console.log("STEP 4: Fetching updated states...");
      const updatedMember = await FirebaseManager.getMember(currentMember.id, newClubId);
      const updatedClub = await FirebaseManager.getClub(newClubId);
      
      window.localStorage.setItem(activeClubStorageKey(currentMember.id), newClubId);
      setCurrentMember(updatedMember);
      setCurrentClub(updatedClub);
      setAvailableClubs(updatedClub ? [updatedClub] : []);

    } catch (err: unknown) {
      const details = getErrorDetails(err);
      console.error("Firebase Details:", details.code, details.message, err);
      setError("Es gab ein Problem beim Erstellen des Vereins: " + details.message);
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

          <div className="flex flex-col gap-2">
            <label className="font-poppins text-sm font-bold text-[#0A0A0A]">
              Vereinssparte / Sportart
            </label>
            <select
              value={sportType}
              onChange={(e) => setSportType(e.target.value)}
              className="w-full rounded-xl border border-black/10 bg-white/50 px-4 py-3.5 outline-none transition-all focus:border-black/30 focus:bg-white cursor-pointer font-poppins text-sm text-[#0A0A0A]"
            >
              {Object.entries(SPORT_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
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
