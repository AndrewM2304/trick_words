import { Keyboard } from "@components/keyboard/Keyboard";
import React, { useState, useEffect } from "react";
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

export default function Game() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState("");
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState<number>();
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();
  const [playerOneAvatarUrl, setPlayerOneAvatarUrl] = useState("");
  const [playerTwoAvatarUrl, setPlayerTwoAvatarUrl] = useState("");

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
    console.log(e);
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
    // window.alert(e.over.id + " " + e.active.id);
    setIsDragging(false);
  }

  const updateGame = (
    playerWord: string,
    game: Game,
    forfeit: boolean = false
  ) => {
    playerTurn(playerWord, game, forfeit).then(async (val) => {
      if (val.update) {
        const { data, error } = await supabase
          .from("games")
          .update(val.value)
          .eq("id", game.id)
          .select();

        if (data) {
          setGame(data[0]);
        }
        if (error) {
          console.log(error);
        }
      }
      console.log(val.message);
    });
  };

  const forfeitGame = () => {
    updateGame(game?.current_word!, game!, true);
  };

  const getImage = async (url: string, player: "one" | "two") => {
    const value = await downloadImage(url);
    if (player === "one") setPlayerOneAvatarUrl(value || "");
    if (player === "two") setPlayerTwoAvatarUrl(value || "");
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
    getImage(game?.player_one_avatar ?? "default_user_avatar.svg", "one");
    getImage(game?.player_two_avatar ?? "default_user_avatar.svg", "two");
  }, [game]);

  useEffect(() => {
    const getGame = async () => {
      setLoading(true);

      const { game } = router.query;

      if (!user) return;
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
    };
    getGame();
  }, [router.query]);

  return (
    <Layout>
      <div data-testid="Game-wrapper">
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
            <ScoreSection
              playerAvatar={playerOneAvatarUrl}
              playerName={game.player_one_name}
              playerScore={game.player_one_score}
            />
            <ScoreSection
              playerAvatar={playerTwoAvatarUrl}
              playerName={game.player_two_name}
              playerScore={game.player_two_score}
            />
            <button onClick={() => forfeitGame()}>forfeit</button>

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
            <h1>{game.current_word}</h1>
          </>
        )}
      </div>
    </Layout>
  );
}

type Score = {
  playerAvatar: string;
  playerName: string;
  playerScore: number;
};
const ScoreSection = ({ playerAvatar, playerName, playerScore }: Score) => {
  return (
    <div
      className={styles.playerScoreWrapper}
      data-testid="player-score-wrapper"
    >
      <div className={styles.playerOne}>
        {playerAvatar !== "" && (
          <Image
            src={playerAvatar}
            height={24}
            width={24}
            alt={`${playerName} avatar`}
          />
        )}

        <div className={styles.playerName}>{playerName}</div>
        <div className={styles.playerScore}>{playerScore}</div>
      </div>
    </div>
  );
};
