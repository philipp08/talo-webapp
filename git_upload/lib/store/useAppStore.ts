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
  availableClubs: Club[];
  setCurrentClub: (club: Club | null) => void;
  setAvailableClubs: (clubs: Club[]) => void;

  // Loading states
  isLoadingAuthedState: boolean;
  setIsLoadingAuthedState: (isLoading: boolean) => void;

  // Plan limit states
  isOverLimit: boolean;
  setIsOverLimit: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  currentMember: null,
  setUser: (user) => set({ user }),
  setCurrentMember: (member) => set({ currentMember: member }),

  currentClub: null,
  availableClubs: [],
  setCurrentClub: (club) => set({ currentClub: club }),
  setAvailableClubs: (clubs) => set({ availableClubs: clubs }),

  isLoadingAuthedState: true,
  setIsLoadingAuthedState: (isLoading) =>
    set({ isLoadingAuthedState: isLoading }),

  isOverLimit: false,
  setIsOverLimit: (isOverLimit) => set({ isOverLimit }),
}));
