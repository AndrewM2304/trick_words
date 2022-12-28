import { GameCard } from "@components/game/GameCard";
import { useGamesStore, useUserProfileStore } from "@components/store";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import styles from "./HomeScreen.module.css";
import { Database } from "@utilities/supabase";

type Profiles = Database["public"]["Tables"]["profiles"]["Row"];
type Games = Database["public"]["Tables"]["games"]["Row"];
export type HomeScreenProps = {};
const HomeScreen = ({}: HomeScreenProps) => {
  const user = useUser();
  const { games } = useGamesStore();
  const { userProfile } = useUserProfileStore();

  const [loading, setLoading] = useState(false);
  const supabase = useSupabaseClient<Games>();
  const router = useRouter();

  const createGame = async () => {
    if (!user) throw new Error("No user");
    const newGame: Partial<Games> = {
      current_word: "a",
      current_letter_index: 0,
      player_one_id: user.id,
      player_one_name: user.user_metadata.full_name,
      player_one_avatar:
        userProfile?.avatar_url ?? user.user_metadata.avatar_url,
      player_two_id: "e8f55cdf-d86c-4934-bb23-236b1c453e2b",
      computer: true,
      current_player_index: 0,
    };

    try {
      const { data, error } = await supabase
        .from("games")
        .insert(newGame)
        .select();
      if (data) {
        router.push(`/game/${data[0].id}`);
        console.log(data);
      }
      if (error) throw new Error(error.message);
    } catch (error) {
      console.log("Error loading user data!");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="HomeScreen-wrapper">
      {loading && "loading"}
      <ul>
        {games &&
          user &&
          !loading &&
          games.map((game: Games) => {
            return (
              <Link
                href={`/game/${game.id}`}
                key={game.id}
                className={styles.gameLink}
              >
                <GameCard
                  user={user}
                  playerOneName={game.player_one_name}
                  playerOneAvatar={game.player_one_avatar}
                  playerOneId={game.player_one_id ?? ""}
                  playerOneScore={game.player_one_score ?? 0}
                  playerTwoName={game.player_two_name}
                  playerTwoAvatar={game.player_two_avatar}
                  playerTwoId={game.player_two_id ?? ""}
                  playerTwoScore={game.player_two_score ?? 0}
                  currentPlayerIndex={game.current_letter_index ?? 0}
                  currentWord={game.current_word ?? "a"}
                />
              </Link>
            );
          })}
      </ul>
      <button onClick={() => createGame()}>
        {" "}
        {loading ? "loading" : "New Game"}
      </button>
    </div>
  );
};
export default HomeScreen;
