import { useGamesStore, useUserProfileStore } from "@components/store";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { PostgrestError } from "@supabase/supabase-js";
import { local_game } from "@utilities/constants";
import { Database } from "@utilities/supabase";

type GameDB = Database["public"]["Tables"]["games"]["Row"];
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

export const useGetGameData = () => {
  const router = useRouter();
  const { game, gametype, gameroom } = router.query;

  const [gameData, setGameData] = useState<GameDB | null>(null);
  const [status, setStatus] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PostgrestError | null>();
  const supabase = useSupabaseClient<GameDB>();
  const { games } = useGamesStore();
  const { userProfile } = useUserProfileStore();

  useEffect(() => {
    if (gameData || !game || !gametype) return;
    setLoading(true);
    getGame().then((d) => {
      if (d === undefined || !d) {
        setGameData(null);
        setError({
          details: "no_local",
          hint: "none",
          code: "100",
          message: `No game found, return to home`,
        });

        return;
      }

      setGameData(d ?? null);
      addSecondPlayer(d).then((d) => {
        if (d === undefined) return;
        setGameData(d ?? null);
      });
    });
  }, [router.query, gameData]);

  useEffect(() => {
    const currentGame = games.filter((g) => g.id === gameData?.id)[0];
    if (currentGame) {
      setGameData(currentGame);
    }
  }, [games]);

  const getGame = async (): Promise<GameDB | undefined> => {
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);

    if (gametype === "local" && gamesFromLocalStorage) {
      const games: GameDB[] = JSON.parse(gamesFromLocalStorage);
      const selectedGame = games.filter((g) => g.id === Number(game))[0];
      if (!selectedGame) {
        setError({
          details: "no_local",
          hint: "none",
          code: "100",
          message: "No game found, return to home",
        });
      }
      return selectedGame;
    }
    if (gametype === "online") {
      let { data, error, status } = await supabase
        .from("games")
        .select()
        .eq("id", game)
        .single();
      setStatus(status);
      if (data) {
        return data;
      }
      if (error) {
        setError(error);
      }
    }
  };

  const addSecondPlayer = async (game: GameDB): Promise<GameDB | undefined> => {
    if (!userProfile) return;
    if (
      gametype === undefined &&
      game.player_two_id === null &&
      gameroom === game.secret_key &&
      userProfile.id !== game.player_one_id
    ) {
      const { data, error } = await supabase
        .from("games")
        .update({
          player_two_id: userProfile.id,
          player_two_name: userProfile?.full_name,
          player_two_avatar: userProfile?.avatar_url,
        })
        .eq("id", game.id)
        .select();
      if (data) {
        return data[0];
      }
      if (error) {
        setError(error);
      }
    }
    if (
      gametype === undefined &&
      game.player_two_id === null &&
      gameroom !== game.secret_key &&
      userProfile.id !== game.player_one_id
    ) {
      setError({
        details: "no_local",
        hint: "none",
        code: "100",
        message: "You do not have access to this game",
      });
    }
  };

  return { gameData: gameData, status: status, error: error, loading: loading };
};
