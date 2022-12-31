import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { PostgrestError } from "@supabase/supabase-js";
import { local_game } from "@utilities/constants";
import { Database } from "@utilities/supabase";

type Game = Database["public"]["Tables"]["games"]["Row"];
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";

export const useGetGameData = () => {
  const router = useRouter();
  const { game, gametype } = router.query;

  const [gameData, setGameData] = useState<Game | null>(null);
  const [status, setStatus] = useState<number>();
  const [error, setError] = useState<PostgrestError | null>();
  const supabase = useSupabaseClient<Database>();
  const user = useUser();

  useEffect(() => {
    if (gameData) return;
    getGame().then((d) => {
      if (d === undefined) return;
      setGameData(d ?? null);
    });
  }, [router.query, gameData]);

  const getGame = async (): Promise<Game | undefined> => {
    if (!user) return;
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);
    if (gametype === "local" && gamesFromLocalStorage) {
      const games: Game[] = JSON.parse(gamesFromLocalStorage);
      const selectedGame = games.filter((g) => g.id === Number(game))[0];
      return selectedGame;
    }
    if (gametype === undefined) {
      let { data, error, status } = await supabase
        .from("games")
        .select()
        .eq("id", game)
        .single();
      setStatus(status);
      if (data) {
        console.log(data);
        return data;
      }
      if (error) {
        console.log(error);
        setError(error);
      }
    }
  };

  return { gameData: gameData, status: status, error: error };
};
