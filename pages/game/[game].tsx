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
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Database } from "@utilities/supabase";
type Game = Database["public"]["Tables"]["games"]["Row"];
import { useRouter } from "next/router";
import { PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";
import { Layout } from "@components/Layout";
import { playerTurn } from "@game/game-functions";
import Image from "next/image";
import { default_avatar, local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";

export default function Game() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [dialogMessage, setDialogMessage] = useState("Checking word...");
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState<number>();
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();
  const [playerOneAvatarUrl, setPlayerOneAvatarUrl] = useState("");
  const [playerTwoAvatarUrl, setPlayerTwoAvatarUrl] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

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
    setIsDragging(true);
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
    setIsDragging(false);
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
      if (!val.update) {
        closeModal();
      }
      if (forfeit) {
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

  const getImage = async (playerOneUrl: string, playerTwoUrl: string) => {
    const p1 = await downloadImage(playerOneUrl);
    const p2 = await downloadImage(playerTwoUrl);
    setPlayerOneAvatarUrl(p1 || "");
    setPlayerTwoAvatarUrl(p2 || "");
  };

  async function downloadImage(path: string) {
    try {
      const { data, error } = await supabase.storage
        .from("avatars")
        .download(path);
      if (error) {
        throw error;
      }
      const url = URL.createObjectURL(data);
      return url;
    } catch (error) {
      console.log("Error downloading image: ", error);
    }
  }

  useEffect(() => {
    getImage(
      game?.player_one_avatar ?? default_avatar,
      game?.player_two_avatar ?? default_avatar
    );
  }, [game]);

  useEffect(() => {
    const getGame = async () => {
      setLoading(true);

      const { game, gametype } = router.query;

      if (!user) return;
      if (gametype === "local") {
        const gamesFromLocalStorage = window.localStorage.getItem(local_game);
        if (gamesFromLocalStorage) {
          const games: Game[] = JSON.parse(gamesFromLocalStorage);
          const selectedGame = games.filter((g) => g.id === Number(game))[0];
          setGame(selectedGame);
          setLoading(false);
        }
      } else {
        let { data, error, status } = await supabase
          .from("games")
          .select()
          .eq("id", game)
          .single();
        setStatus(status);
        if (data) {
          setGame(data);
          console.log(status);
        }
        if (error) {
          setError(error);
        }
        setLoading(false);
      }
    };
    getGame();
  }, [router.query]);

  return (
    <Layout>
      <div className={styles.gameWrapper} data-testid="Game-wrapper">
        {loading && (
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
        {!loading && game && (
          <>
            <nav className={styles.nav}>
              <Link href={"/"}> return home</Link>
            </nav>
            {!game.winner && (
              <>
                <div className={styles.gameBody}>
                  <ScoreSection
                    playerOneAvatar={playerOneAvatarUrl}
                    playerTwoAvatar={playerTwoAvatarUrl}
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
      {playerOneAvatar !== "" && (
        <Image
          className={styles.playerOneImage}
          src={playerOneAvatar}
          height={28}
          width={28}
          alt={`${game.player_one_name} avatar`}
        />
      )}

      <div className={styles.playerOneName}>{game.player_one_name}</div>
      <div className={styles.playerOneScore}>{game.player_one_score}</div>
      {playerTwoAvatar !== "" && (
        <Image
          className={styles.playerTwoImage}
          src={playerTwoAvatar}
          height={28}
          width={28}
          alt={`${game.player_two_name} avatar`}
        />
      )}

      <div className={styles.playerTwoName}>{game.player_two_name}</div>
      <div className={styles.playerTwoScore}>{game.player_two_score}</div>
    </div>
  );
};
