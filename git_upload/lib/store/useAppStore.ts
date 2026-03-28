import { create } from "zustand";
import { Member, Club } from "../firebase/models";
import { User } from "firebase/auth";

interface AppState {
  // Auth state
  user: User | null;
  currentMember: Member | null;
  setUser: (user: User | null) => void;
  setCurrentMember: (member: Member | null) => void;

  // Club state
  currentClub: Club | null;
  setCurrentClub: (club: Club | null) => void;

  // Loading states
  isLoadingAuthedState: boolean;
  setIsLoadingAuthedState: (isLoading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentMember: null,
  setUser: (user) => set({ user }),
  setCurrentMember: (member) => set({ currentMember: member }),

  currentClub: null,
  setCurrentClub: (club) => set({ currentClub: club }),

  isLoadingAuthedState: true,
  setIsLoadingAuthedState: (isLoading) =>
    set({ isLoadingAuthedState: isLoading }),
}));
