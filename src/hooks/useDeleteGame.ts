import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { local_game } from "@utilities/constants";
import { useRouter } from "next/router";
import { useHandleError } from "./useHandleError";
import { useUserProfileStore } from "@components/store";
type Game = Database["public"]["Tables"]["games"]["Row"];

export const useDeleteGame = () => {
  const supabase = useSupabaseClient<Game>();
  const router = useRouter();
  const { captureError } = useHandleError();
  const { userProfile } = useUserProfileStore();

  const deleteGame = async (game: Game | null) => {
    if (!game) return;
    if (game?.game_type === GameType.ONLINE_MULTIPLAYER) {
      const { data, error } = await supabase
        .from("games")
        .delete()
        .eq("id", game.id);
      if (router.pathname === "/games") {
        router.reload();
      } else {
        router.push("/games");
      }

      if (error) {
        captureError(error);
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
      if (router.pathname === "/games") {
        router.reload();
      } else {
        router.push("/games");
      }
    }
  };

  const deleteAllGames = async () => {
    window.localStorage.removeItem(local_game);
    if (!userProfile) return;
    let { data, error } = await supabase
      .from("games")
      .delete()
      .or(
        `player_one_id.eq.${userProfile.id},player_two_id.eq.${userProfile.id}`
      );
    if (error) {
      captureError(error);
    }
    if (router.pathname === "/games") {
      router.reload();
    } else {
      router.push("/games");
    }
  };
  return { deleteGame, deleteAllGames };
};
