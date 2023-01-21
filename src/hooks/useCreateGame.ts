import React, { useState } from "react";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
type GamesDBType = Database["public"]["Tables"]["games"]["Row"];
import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";
import { useRouter } from "next/router";
import {
  default_avatar,
  default_computer,
  local_game,
} from "@utilities/constants";
import { useUserProfileStore } from "@components/store";

export const useCreateGame = () => {
  const user = useUser();
  const router = useRouter();
  const { userProfile } = useUserProfileStore();
  const [secondPlayer, setSecondPlayer] = useState("");

  const supabaseGameDB = useSupabaseClient<GamesDBType>();

  const [gameType, setGameType] = useState<GameType>(GameType.COMPUTER);
  const [gameDifficulty, setGameDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");

  const createGame = async () => {
    const newGame: Partial<GamesDBType> = {
      current_word: "a",
      current_letter_index: 0,
      player_one_id: user?.id ?? "not-logged-in-user",
      current_player_id: user?.id ?? "not-logged-in-user",
      player_one_name: userProfile?.full_name ?? "Player One",
      player_one_avatar: userProfile?.avatar_url ?? default_avatar,
      game_type: gameType,
      current_player_index: 0,
      difficulty: gameType === GameType.COMPUTER ? gameDifficulty : "hard",
      player_one_score: 0,
      player_two_score: 0,
    };
    if (
      gameType === GameType.COMPUTER ||
      gameType === GameType.LOCAL_MULTIPLAYER
    ) {
      const savedItems = window.localStorage.getItem(local_game);
      newGame.player_two_id = crypto.randomUUID();
      newGame.player_two_name =
        gameType === GameType.COMPUTER ? "Computer" : secondPlayer;
      newGame.player_two_avatar =
        gameType === GameType.COMPUTER ? default_computer : default_avatar;

      const arrayOfGames: GamesDBType[] = [];
      if (savedItems) {
        arrayOfGames.push(...JSON.parse(savedItems));
      }
      newGame.id = arrayOfGames.length + 1;
      window.localStorage.setItem(
        local_game,
        JSON.stringify([...arrayOfGames, newGame])
      );
      router.push(`/game/${newGame.id}?gametype=local`);
    }

    if (gameType === GameType.ONLINE_MULTIPLAYER) {
      try {
        const { data, error } = await supabaseGameDB
          .from("games")
          .insert(newGame)
          .select();
        if (data) {
          router.push(`/game/${data[0].id}?gametype=online`);
        }
        if (error) throw new Error(error.message);
      } catch (error) {
        console.error("Error loading user data!");
        console.error(error);
      }
    }
  };
  return {
    gameType,
    setGameType,
    createGame,
    gameDifficulty,
    setGameDifficulty,
    secondPlayer,
    setSecondPlayer,
  };
};
