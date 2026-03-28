"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase/config";
import { useAppStore } from "../../lib/store/useAppStore";
import { FirebaseManager } from "../../lib/firebase/firebaseManager";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAppStore((state) => state.setUser);
  const setCurrentMember = useAppStore((state) => state.setCurrentMember);
  const setCurrentClub = useAppStore((state) => state.setCurrentClub);
  const setIsLoadingAuthedState = useAppStore(
    (state) => state.setIsLoadingAuthedState
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch the Member model from Firestore
          const member = await FirebaseManager.getMember(firebaseUser.uid);
          setCurrentMember(member);

          if (member?.clubId) {
            // Fetch current club
            const club = await FirebaseManager.getClub(member.clubId);
            setCurrentClub(club);
          }
        } else {
          setUser(null);
          setCurrentMember(null);
          setCurrentClub(null);
        }
      } catch (error) {
        console.error("Auth state change error:", error);
      } finally {
        setIsLoadingAuthedState(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setCurrentMember, setCurrentClub, setIsLoadingAuthedState]);

  return <>{children}</>;
}
