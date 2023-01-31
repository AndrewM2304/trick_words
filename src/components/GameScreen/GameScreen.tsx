import { GameCard } from "@components/game/GameCard";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import styles from "./GameScreen.module.css";
import { Database } from "@utilities/supabase";
import { useGamesStore } from "@components/store";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";
import { OutlineText } from "@components/OutlineText";
import { motion, Transition, Variants } from "framer-motion";

type Games = Database["public"]["Tables"]["games"]["Row"];
const GameScreen = () => {
  const { games } = useGamesStore();

  const [gamesToDisplay, setGamesToDisplay] = useState<Games[]>([]);

  useEffect(() => {
    const gamesFromLocalStorage = window.localStorage.getItem(local_game);
    if (gamesFromLocalStorage) {
      const game: Games[] = JSON.parse(gamesFromLocalStorage);
      setGamesToDisplay([...game, ...games]);
    } else {
      setGamesToDisplay([...games]);
    }
  }, [games]);

  const linkSetting = (e: any, gameType: string, playerID: string | null) => {
    if (gameType === GameType.ONLINE_MULTIPLAYER && playerID === null) {
      e.preventDefault();
    }
  };

  const disableLink = (game: Games): boolean => {
    return (
      (!game.player_two_id && game.game_type === GameType.ONLINE_MULTIPLAYER) ||
      (game.winner !== null && game.winner !== undefined)
    );
  };

  const central: Variants = {
    initialState: {
      opacity: 0,
    },
    animateState: {
      opacity: 1,
    },
    exitState: {
      opacity: 0,
    },
  };

  const trans: Transition = {
    type: "tween",
    ease: "backInOut",
    duration: 0.4,
  };

  return (
    <div data-testid="GameScreen-wrapper" className={styles.GameScreenWrapper}>
      <ul className="central-width-container">
        {gamesToDisplay &&
          gamesToDisplay.map((game: Games, idx: number) => {
            return (
              <li key={`${game.id}-local-${idx}`} className={styles.gameLink}>
                {!disableLink(game) && (
                  <Link
                    aria-label={`${game.game_type.replaceAll("_", " ")}, ${
                      game.player_one_score
                    } - ${game.player_one_score}, current work ${
                      game.current_word
                    }`}
                    href={`/game/${game.id}?gametype=${
                      game.game_type === GameType.ONLINE_MULTIPLAYER
                        ? "online"
                        : "local"
                    }`}
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
                    <GameCard id={idx} game={game} />
                  </Link>
                )}
                {disableLink(game) && (
                  <GameCard
                    id={idx}
                    game={game}
                    key={`${game.id}-local-${idx}-nolink`}
                  />
                )}
              </li>
            );
          })}
        {gamesToDisplay?.length === 0 && (
          <motion.li
            className={styles.noGame}
            variants={central}
            initial="initialState"
            animate="animateState"
            exit="exitState"
            transition={trans}
            key={"no-display"}
          >
            <OutlineText
              text={"No games in progress"}
              sizeInRem={2}
              upperCase={false}
              alignment={"center"}
            />
          </motion.li>
        )}
      </ul>
    </div>
  );
};
export default GameScreen;
