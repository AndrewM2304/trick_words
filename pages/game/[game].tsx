import { Keyboard } from "@components/keyboard/Keyboard";
import React, { useState, useEffect, useRef } from "react";
import styles from "../../styles/Game.module.css";
import {
  KeyboardSensor,
  DndContext,
  MouseSensor,
  TouchSensor,
  useSensors,
  useSensor,
} from "@dnd-kit/core";
import { DroppableArea } from "@components/game/DroppableArea";
import { DragEndEvent } from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { Database } from "@utilities/supabase";
type Game = Database["public"]["Tables"]["games"]["Row"];
import Link from "next/link";
import { Layout } from "@components/Layout";
import { playerTurn } from "@game/game-functions";
import Image from "next/image";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";
import { useGetGameData } from "@hooks/useGetGameData";
import { useDownloadImages } from "@hooks/useDownloadImages";
import { useUserProfileStore } from "@components/store";
import { Button } from "@components/Button";
import { OutlineText } from "@components/OutlineText";
import { KeyboardTile } from "@components/keyboard/KeyboardTile";
import { Gem } from "@components/ProfileImage/ProfileImage";

export default function Game() {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [dialogMessage, setDialogMessage] = useState("Checking word...");
  const [game, setGame] = useState<Game | null>(null);
  const supabase = useSupabaseClient<Database>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();
  const { gameData, status, error } = useGetGameData();
  const user = useUser();
  const { userProfile } = useUserProfileStore();

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor, {});

  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);
  function handleDragStart(e: DragEndEvent) {
    setSelectedLetter(e.active.id.toString());
  }

  function handleDragEnd(e: DragEndEvent) {
    setSelectedLetter("");

    if (e.over === null || !game) return;
    if (e.over.id === "left") {
      const playerWord = `${e.active.id}${game?.current_word}`;
      updateGame(playerWord, game);
    }
    if (e.over.id === "right") {
      const playerWord = `${game?.current_word}${e.active.id}`;
      updateGame(playerWord, game);
    }
  }

  const updateGame = (
    playerWord: string,
    game: Game,
    forfeit: boolean = false
  ) => {
    if (!dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }

    playerTurn(playerWord, game, forfeit).then(async (val) => {
      console.log(val);
      setTimeout(() => {
        setDialogMessage(val.message);
      }, 1000);
      if (val.update) {
        successfulResult(val.value, val.computerWord);
      }
      if (!val.update || forfeit) {
        closeModal();
      }
    });
  };

  const closeModal = () => {
    setTimeout(() => {
      dialogRef.current?.close();
      setDialogMessage("Checking word...");
    }, 2000);
  };

  const successfulResult = async (resultValue: Game, computerWord: string) => {
    if (!game) return;

    if (game.game_type === GameType.ONLINE_MULTIPLAYER) {
      const { data, error } = await supabase
        .from("games")
        .update(resultValue)
        .eq("id", game.id)
        .select();

      if (data) {
        setGame(data[0]);
      }
      if (error) {
        console.log(error);
      }
    }
    if (
      game.game_type === GameType.COMPUTER ||
      game.game_type === GameType.LOCAL_MULTIPLAYER
    ) {
      setGame(resultValue);
      const gamesFromLocalStorage = window.localStorage.getItem(local_game);
      if (gamesFromLocalStorage) {
        const games: Game[] = JSON.parse(gamesFromLocalStorage);
        const updatedGames = games.map((g: Game) => {
          if (g.id === resultValue.id) {
            return resultValue;
          }
          return g;
        });
        window.localStorage.setItem(local_game, JSON.stringify(updatedGames));
      }
    }
    if (
      resultValue.game_type === GameType.COMPUTER &&
      resultValue.current_player_index === 1
    ) {
      const computerEnty = computerTurn(resultValue.current_word, computerWord);
      console.log(computerEnty);
      updateGame(computerEnty, resultValue, false);
    }
    closeModal();
  };

  const computerTurn = (currentWord: string, computerWord: string): string => {
    console.log(currentWord);
    const indexOfWord = computerWord.indexOf(currentWord);
    return indexOfWord >= 1
      ? computerWord.charAt(indexOfWord - 1) + currentWord
      : currentWord + computerWord.charAt(indexOfWord + 1);
  };

  const forfeitGame = () => {
    setDialogMessage("You forfeit this round, next player");
    updateGame(game?.current_word!, game!, true);
  };

  const inviteGame = async () => {
    const shareData = {
      title: `${game?.player_one_name} invites you to a game`,
      text: "Follow the link to join the game",
      url: `https://localhost:3000/game/${game?.id}?gameroom=${game?.secret_key}`,
    };
    try {
      console.log(shareData);
      await navigator.share(shareData);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!userProfile) return;
    setGame(gameData);
    if (!gameData) return;

    downloadImagesFromUrls([
      gameData.player_one_avatar,
      gameData.player_two_avatar,
    ]);
  }, [gameData, userProfile]);

  const displayKeyboard = (): boolean => {
    if (!game) return false;
    if (game.game_type === GameType.LOCAL_MULTIPLAYER) return true;

    if (game.player_one_id === user?.id && game.current_player_index === 0) {
      return true;
    }
    if (game.player_two_id === user?.id && game.current_player_index === 1) {
      return true;
    }
    return false;
  };

  return (
    <Layout>
      <div className={styles.gameWrapper} data-testid="Game-wrapper">
        <div className="central-width-container ">
          <Link href="/games" className={styles.backLink}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.72 12.53a.75.75 0 010-1.06l7.5-7.5a.75.75 0 111.06 1.06L9.31 12l6.97 6.97a.75.75 0 11-1.06 1.06l-7.5-7.5z"
                clipRule="evenodd"
              />
            </svg>
            Games
          </Link>
          {!gameData && (
            <div className={styles.loading} data-testid="loading">
              {" "}
              loading game
            </div>
          )}
          {error && status !== 406 && (
            <div className={styles.error} data-testid="error">
              Something has gone wrong
              <br />
              <b>Error Code: </b> {error.code} <br />
              <b>Error Details: </b>
              {error.details}
            </div>
          )}
          {status === 406 && (
            <div className={styles.noRows} data-testid="noRows">
              no game found, <br />
              <Link href={"/"}> return home</Link>
            </div>
          )}
          {game && userProfile && (
            <>
              <nav className={styles.nav}>
                <Link href={"/"}> </Link>
              </nav>
              {/* <pre>{JSON.stringify(userProfile, null, 2)}</pre> */}
              {!game.winner && (
                <>
                  <div className={styles.gameBody}>
                    <ScoreSection
                      playerOneAvatar={playerOneImage}
                      playerTwoAvatar={playerTwoImage}
                      game={game}
                    />
                    <div className={styles.buttonRow}>
                      {game.game_type === GameType.ONLINE_MULTIPLAYER &&
                        game.player_two_id === null && (
                          <>
                            {navigator.canShare! && (
                              <Button
                                text="invite player"
                                type={"primary"}
                                action={() => inviteGame()}
                              />
                            )}
                            {!navigator.canShare && (
                              <Button
                                text="copy game link"
                                type={"primary"}
                                action={() =>
                                  navigator.clipboard.writeText(
                                    "http://localhost:3000/game/${game?.id}?gameroom=${game?.secret_key"
                                  )
                                }
                              />
                            )}
                          </>
                        )}

                      {game.player_two_id && (
                        <Button
                          text="forfeit round"
                          type={"secondary"}
                          action={() => forfeitGame()}
                        />
                      )}

                      <Button
                        text="End Game"
                        type={"delete"}
                        action={() => forfeitGame()}
                      />
                    </div>

                    <DndContext
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      modifiers={[restrictToWindowEdges]}
                      sensors={sensors}
                    >
                      <div className={styles.dropArea}>
                        <DroppableArea
                          area={"left"}
                          word={`${selectedLetter}${game.current_word}`}
                        />

                        <DroppableArea
                          area={"right"}
                          word={`${game.current_word}${selectedLetter}`}
                        />
                      </div>
                      {displayKeyboard() ? <Keyboard /> : "not yours"}
                    </DndContext>
                    <div className={styles.gameInfo}>
                      <OutlineText
                        sizeInRem={2}
                        text={
                          game.current_player_index === 0
                            ? `${game.player_one_name}'s turn`
                            : `${game.player_two_name}'s turn`
                        }
                        upperCase={false}
                      />
                      <ul className={styles.wordWrapper}>
                        <li
                          className={styles.emptyTile}
                          style={{ marginRight: "10px" }}
                        ></li>
                        {game.current_word.split("").map((w, idx) => {
                          return <KeyboardTile letter={w} key={idx} />;
                        })}
                        <li
                          className={styles.emptyTile}
                          style={{ marginLeft: "10px" }}
                        ></li>
                      </ul>
                    </div>
                  </div>
                </>
              )}
              {game.winner && `winner is ${game.winner}`}
              <dialog ref={dialogRef}>{dialogMessage}</dialog>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}

type Score = {
  playerOneAvatar: string;
  playerTwoAvatar: string;
  game: Game;
};
const ScoreSection = ({ playerOneAvatar, playerTwoAvatar, game }: Score) => {
  return (
    <div
      className={styles.playerScoreWrapper}
      data-testid="player-score-wrapper"
    >
      <Image
        className={styles.playerOneImage}
        src={playerOneAvatar}
        height={28}
        width={28}
        alt={`${game.player_one_name} avatar`}
      />

      <div className={styles.playerOneName} data-testid="player-one-name">
        <OutlineText
          text={game.player_one_name}
          sizeInRem={1.4}
          alignment="left"
          upperCase={false}
        />
      </div>
      <div className={styles.playerOneScore} data-testid="player-one-score">
        <OutlineText
          text={game.player_one_score.toString()}
          sizeInRem={2}
          upperCase
          alignment="left"
        />
      </div>
      <Image
        className={styles.playerTwoImage}
        src={playerTwoAvatar}
        height={28}
        width={28}
        alt={`${game.player_two_name} avatar`}
      />

      <div className={styles.playerTwoName}>
        <OutlineText
          text={game.player_two_name}
          sizeInRem={1.4}
          alignment="right"
          upperCase={false}
        />
      </div>
      <div className={styles.playerTwoScore}>
        <OutlineText
          text={game.player_two_score.toString()}
          sizeInRem={2}
          upperCase
          alignment="right"
        />
      </div>
    </div>
  );
};
