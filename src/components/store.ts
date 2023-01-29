import { Database } from "@utilities/supabase";
import { create } from "zustand";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

type Games = Database["public"]["Tables"]["games"]["Row"];
type userProfileStore = {
  userProfile: Profiles | null;
  setUserProfile: (user: Profiles) => void;
};

type useGamesStore = {
  games: Games[];
  addGame: (game: Games) => void;
  deleteGame: (game: Games) => void;
  updateGame: (game: Games) => void;
};

type useErrorModal = {
  displayErrorModal: boolean;
  errorMessage: string;
  setDisplayErrorModal: () => void;
  setErrorMessage: (m: string) => void;
};

type useDeleteModal = {
  displayDeleteModal: boolean;
  deleteType: "single" | "all";
  setDeleteType: (t: "single" | "all") => void;
  setDisplayDeleteModal: () => void;
  buttonText: string;
  setButtonText: (m: string) => void;
  gameToDelete: Games | null;
  setGameToDelete: (g: Games) => void;
};

export const useUserProfileStore = create<userProfileStore>((set) => ({
  userProfile: null,
  setUserProfile: (user: Profiles) => set({ userProfile: user }),
}));

export const useGamesStore = create<useGamesStore>((set, get) => ({
  games: [],
  addGame: (game: Games) => set((state) => ({ games: [...state.games, game] })),
  deleteGame: (game: Games) => {
    const filteredGames = get().games.filter((g) => g.id !== game.id);
    set(() => ({ games: filteredGames }));
  },
  updateGame: (game: Games) => {
    const filteredGames = [...get().games];

    const updatedItems = filteredGames.map((obj) => {
      if (obj.id === game.id) {
        return game;
      }

      return obj;
    });
    set(() => ({ games: updatedItems }));
  },
}));

export const useErrorModal = create<useErrorModal>((set, get) => ({
  displayErrorModal: false,
  errorMessage: "",
  setDisplayErrorModal: () => {
    set(() => ({ displayErrorModal: !get().displayErrorModal }));
  },
  setErrorMessage: (message: string) => set({ errorMessage: message }),
}));

export const useDeleteModal = create<useDeleteModal>((set, get) => ({
  displayDeleteModal: false,
  setDisplayDeleteModal: () => {
    set(() => ({ displayDeleteModal: !get().displayDeleteModal }));
  },
  buttonText: "",
  setButtonText: (m: string) => set({ buttonText: m }),
  gameToDelete: null,
  setGameToDelete: (g: Games) => set({ gameToDelete: g }),
  deleteType: "single",
  setDeleteType: (t: "single" | "all") => set({ deleteType: t }),
}));
