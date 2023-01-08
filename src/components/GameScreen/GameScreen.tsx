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

  const disableLink = (game: Games): boolean => {
    return (
      !game.player_two_id && game.game_type === GameType.ONLINE_MULTIPLAYER
    );
  };

  return (
    <div data-testid="GameScreen-wrapper" className={styles.GameScreenWrapper}>
      <ul className="central-width-container">
        {localGames &&
          localGames.map((localGame: Games, idx: number) => {
            return (
              <Link
                href={`/game/${localGame.id}?gametype=local`}
                key={`${localGame.id}-local-${idx}`}
                className={styles.gameLink}
                data-id={`${localGame.id}-local`}
              >
                <GameCard game={localGame} />
              </Link>
            );
          })}
        {games &&
          games.map((game: Games, idx: number) => {
            return (
              <>
                {!disableLink(game) && (
                  <Link
                    href={`/game/${game.id}`}
                    key={`${game.id}-local-${idx}`}
                    className={styles.gameLink}
                    onClick={(e) =>
                      linkSetting(e, game.game_type, game.player_two_id)
                    }
                    tabIndex={
                      !game.player_two_id &&
                      game.game_type === GameType.ONLINE_MULTIPLAYER
                        ? -1
                        : 0
                    }
                  >
                    <GameCard game={game} />
                  </Link>
                )}
                {disableLink(game) && (
                  <GameCard
                    game={game}
                    key={`${game.id}-local-${idx}-nolink`}
                  />
                )}
              </>
            );
          })}
      </ul>
    </div>
  );
};
export default GameScreen;
