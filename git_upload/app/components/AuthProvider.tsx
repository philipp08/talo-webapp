"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { useAppStore } from "@/lib/store/useAppStore";
import { FirebaseManager } from "@/lib/firebase/firebaseManager";
import { ADMIN_EMAIL } from "@/lib/firebase/constants";
import { getEffectiveMemberForClub, getMemberClubIds } from "@/lib/firebase/models";

const activeClubStorageKey = (uid: string) => `talo.activeClubId.${uid}`;

const pickActiveClubId = (
  clubIds: string[],
  legacyClubId: string,
  storedClubId: string | null
) => {
  if (storedClubId && clubIds.includes(storedClubId)) return storedClubId;
  if (legacyClubId && clubIds.includes(legacyClubId)) return legacyClubId;
  return clubIds[0] ?? "";
};

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAppStore((state) => state.setUser);
  const setCurrentMember = useAppStore((state) => state.setCurrentMember);
  const setCurrentClub = useAppStore((state) => state.setCurrentClub);
  const setAvailableClubs = useAppStore((state) => state.setAvailableClubs);
  const setIsLoadingAuthedState = useAppStore(
    (state) => state.setIsLoadingAuthedState
  );

  useEffect(() => {
    if (!auth) {
      console.warn("Firebase Auth not initialized. Using guest mode/mock state.");
      setIsLoadingAuthedState(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);

          // Admin has no member/club doc — skip Firestore lookup entirely
          if (firebaseUser.email === ADMIN_EMAIL) {
            setCurrentMember(null);
            setCurrentClub(null);
            setAvailableClubs([]);
          } else {
            // Fetch the Member model from Firestore
            const member = await FirebaseManager.getMember(firebaseUser.uid);
            if (!member) {
              setCurrentMember(null);
              setCurrentClub(null);
              setAvailableClubs([]);
              return;
            }

            const clubIds = getMemberClubIds(member);
            if (clubIds.length === 0) {
              setCurrentMember(member);
              setCurrentClub(null);
              setAvailableClubs([]);
              return;
            }

            const storedClubId =
              typeof window === "undefined"
                ? null
                : window.localStorage.getItem(activeClubStorageKey(firebaseUser.uid));
            const pickedClubId = pickActiveClubId(clubIds, member.clubId, storedClubId);
            const clubs = await FirebaseManager.getClubs(clubIds);
            const activeClub = clubs.find((club) => club.id === pickedClubId) ?? clubs[0] ?? null;

            setAvailableClubs(clubs);
            setCurrentClub(activeClub);
            if (activeClub) {
              setCurrentMember(getEffectiveMemberForClub(member, activeClub.id));
              window.localStorage.setItem(activeClubStorageKey(firebaseUser.uid), activeClub.id);
            } else {
              setCurrentMember(member);
            }
          }
        } else {
          setUser(null);
          setCurrentMember(null);
          setCurrentClub(null);
          setAvailableClubs([]);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoadingAuthedState(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setCurrentMember, setCurrentClub, setAvailableClubs, setIsLoadingAuthedState]);

  return <>{children}</>;
}
