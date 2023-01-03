import { GameCard } from "@components/game/GameCard";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "./GameScreen.module.css";
import { Database } from "@utilities/supabase";
import { useGamesStore } from "@components/store";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";

type Games = Database["public"]["Tables"]["games"]["Row"];
const GameScreen = () => {
  const { games } = useGamesStore();

  const [localGames, setLocalGames] = useState<Games[]>([]);

  useEffect(() => {
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);

    if (gamesFromLocalStorage) {
      const game: Games[] = JSON.parse(gamesFromLocalStorage);
      setLocalGames(game);
    }
  }, []);

  const linkSetting = (e: any, gameType: string, playerID: string | null) => {
    if (gameType === GameType.ONLINE_MULTIPLAYER && playerID === null) {
      e.preventDefault();
    }
  };

  return (
    <div data-testid="GameScreen-wrapper" className={styles.GameScreenWrapper}>
      <ul>
        {localGames &&
          localGames.map((localGame: Games) => {
            return (
              <Link
                href={`/game/${localGame.id}?gametype=local`}
                key={`${localGame.id}-local`}
                className={styles.gameLink}
              >
                <GameCard
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
          games.map((game: Games) => {
            return (
              <Link
                href={`/game/${game.id}`}
                key={game.id}
                className={styles.gameLink}
                onClick={(e) =>
                  linkSetting(e, game.game_type, game.player_two_id)
                }
              >
                <GameCard
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
