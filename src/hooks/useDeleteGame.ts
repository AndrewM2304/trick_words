import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { local_game } from "@utilities/constants";
import { useRouter } from "next/router";
type Game = Database["public"]["Tables"]["games"]["Row"];

export const useDeleteGame = () => {
  const supabase = useSupabaseClient<Game>();
  const router = useRouter();

  const deleteGame = async (game: Game) => {
    if (game?.game_type === GameType.ONLINE_MULTIPLAYER) {
      const { data, error } = await supabase
        .from("games")
        .delete()
        .eq("id", game.id);

      if (data) {
        router.push("/games");
      }
      if (error) {
        console.error(error);
      }
    } else {
      const gamesFromLocalStorage = window.localStorage.getItem(local_game);
      if (!gamesFromLocalStorage) return;
      const games: Game[] = JSON.parse(gamesFromLocalStorage);
      const remainingGames = games.filter((g) => g.id !== Number(game?.id));
      window.localStorage.setItem(
        local_game,
        JSON.stringify([...remainingGames])
      );
      router.push("/games");
    }
  };
  return { deleteGame };
};
