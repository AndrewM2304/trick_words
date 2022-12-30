import { GameCard } from "@components/game/GameCard";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "./GameScreen.module.css";
import { Database } from "@utilities/supabase";
import { useGamesStore } from "@components/store";
import { useUser } from "@supabase/auth-helpers-react";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";

type Games = Database["public"]["Tables"]["games"]["Row"];
export type GameScreenProps = {};
const GameScreen = ({}: GameScreenProps) => {
  const { games } = useGamesStore();
  const user = useUser();

  const [localGames, setLocalGames] = useState<Games[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);

    if (gamesFromLocalStorage) {
      const game: Games[] = JSON.parse(gamesFromLocalStorage);
      setLocalGames(game);
    }
  }, []);

  return (
    <div data-testid="GameScreen-wrapper">
      <ul>
        {localGames &&
          user &&
          localGames.map((localGame: Games) => {
            return (
              <Link
                href={`/game/${localGame.id}?gametype=local`}
                key={localGame.id}
                className={styles.gameLink}
              >
                <GameCard
                  user={user}
                  playerOneName={localGame.player_one_name}
                  playerOneAvatar={localGame.player_one_avatar}
                  playerOneId={localGame.player_one_id ?? ""}
                  playerOneScore={localGame.player_one_score ?? 0}
                  playerTwoName={localGame.player_two_name}
                  playerTwoAvatar={localGame.player_two_avatar}
                  playerTwoId={localGame.player_two_id ?? ""}
                  playerTwoScore={localGame.player_two_score ?? 0}
                  currentPlayerIndex={localGame.current_letter_index ?? 0}
                  currentWord={localGame.current_word ?? "a"}
                  gameType={localGame.game_type as GameType}
                />
              </Link>
            );
          })}
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
                  gameType={game.game_type as GameType}
                />
              </Link>
            );
          })}
      </ul>
    </div>
  );
};
export default GameScreen;
