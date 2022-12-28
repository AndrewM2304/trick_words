import { Database } from "@utilities/supabase";
import create from "zustand";
type Profiles = Database["public"]["Tables"]["profiles"]["Row"];

type Games = Database["public"]["Tables"]["games"]["Row"];
type userProfileStore = {
  userProfile: Profiles | null;
  userAvatarUrl: string;
  setUserProfile: (user: Profiles) => void;
  setUserAvatarUrl: (url: string) => void;
};

type useGamesStore = {
  games: Games[];
  addGame: (game: Games) => void;
  deleteGame: (game: Games) => void;
  updateGame: (game: Games) => void;
};

export const useUserProfileStore = create<userProfileStore>((set) => ({
  userProfile: null,
  userAvatarUrl: "",
  setUserProfile: (user: Profiles) => set({ userProfile: user }),
  setUserAvatarUrl: (url: string) => set({ userAvatarUrl: url }),
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
    const itemToUpdate = filteredGames.filter((g) => g.id === game.id);
    itemToUpdate[0] = game;
    console.log(game);

    const updatedItems = filteredGames.map((obj) => {
      if (obj.id === game.id) {
        return game;
      }

      return obj;
    });

    console.log(updatedItems);

    set(() => ({ games: updatedItems }));
  },
}));
