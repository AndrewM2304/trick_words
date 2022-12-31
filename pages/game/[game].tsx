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
import { useSupabaseClient } from "@supabase/auth-helpers-react";
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

export default function Game() {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [dialogMessage, setDialogMessage] = useState("Checking word...");
  const [game, setGame] = useState<Game | null>(null);
  const supabase = useSupabaseClient<Database>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { playerOneImage, playerTwoImage, downloadImagesFromUrls } =
    useDownloadImages();
  const { gameData, status, error } = useGetGameData();

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
    dialogRef.current?.showModal();
    playerTurn(playerWord, game, forfeit).then(async (val) => {
      setTimeout(() => {
        setDialogMessage(val.message);
      }, 1000);
      if (val.update) {
        successfulResult(val.value);
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

  const successfulResult = async (resultValue: Game) => {
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
    closeModal();
  };

  const forfeitGame = () => {
    setDialogMessage("You forfeit this round, next player");
    updateGame(game?.current_word!, game!, true);
  };

  useEffect(() => {
    if (!gameData) return;
    setGame(gameData);
    downloadImagesFromUrls([
      gameData.player_one_avatar,
      gameData.player_two_avatar,
    ]);
  }, [gameData]);

  return (
    <Layout>
      <div className={styles.gameWrapper} data-testid="Game-wrapper">
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
        {game && (
          <>
            <nav className={styles.nav}>
              <Link href={"/"}> return home</Link>
            </nav>
            {!game.winner && (
              <>
                <div className={styles.gameBody}>
                  <ScoreSection
                    playerOneAvatar={playerOneImage}
                    playerTwoAvatar={playerTwoImage}
                    game={game}
                  />
                  <div className={styles.buttonRow}>
                    <button onClick={() => forfeitGame()}>forfeit</button>
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

                    <Keyboard />
                  </DndContext>
                  <div className={styles.gameInfo}>
                    <div className={styles.currentPlayer}>
                      {game.current_player_index === 0
                        ? game.player_one_name
                        : game.player_two_name}
                      's turn
                    </div>
                    <div className={styles.currentWord}>
                      {game.current_word}
                    </div>
                  </div>
                </div>
              </>
            )}
            {game.winner && `winner is ${game.winner}`}
            <dialog ref={dialogRef}>{dialogMessage}</dialog>
          </>
        )}
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
        {game.player_one_name}
      </div>
      <div className={styles.playerOneScore} data-testid="player-one-score">
        {game.player_one_score}
      </div>
      <Image
        className={styles.playerTwoImage}
        src={playerTwoAvatar}
        height={28}
        width={28}
        alt={`${game.player_two_name} avatar`}
      />

      <div className={styles.playerTwoName}>{game.player_two_name}</div>
      <div className={styles.playerTwoScore}>{game.player_two_score}</div>
    </div>
  );
};
