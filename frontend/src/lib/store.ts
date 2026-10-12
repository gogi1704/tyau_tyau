import { create } from "zustand";
import type { MatchInfo } from "./types";

interface AppState {
  matchModal: MatchInfo | null;
  showMatch: (match: MatchInfo) => void;
  clearMatch: () => void;

  createChoiceOpen: boolean;
  openCreateChoice: () => void;
  closeCreateChoice: () => void;

  createMeetupOpen: boolean;
  openCreateMeetup: () => void;
  closeCreateMeetup: () => void;

  createGroupOpen: boolean;
  openCreateGroup: () => void;
  closeCreateGroup: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  matchModal: null,
  showMatch: (match) => set({ matchModal: match }),
  clearMatch: () => set({ matchModal: null }),

  createChoiceOpen: false,
  openCreateChoice: () => set({ createChoiceOpen: true }),
  closeCreateChoice: () => set({ createChoiceOpen: false }),

  createMeetupOpen: false,
  openCreateMeetup: () => set({ createChoiceOpen: false, createMeetupOpen: true }),
  closeCreateMeetup: () => set({ createMeetupOpen: false }),

  createGroupOpen: false,
  openCreateGroup: () => set({ createChoiceOpen: false, createGroupOpen: true }),
  closeCreateGroup: () => set({ createGroupOpen: false }),
}));
