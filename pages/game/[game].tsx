import { Keyboard } from "@components/keyboard/Keyboard";
import React, { useState, useEffect } from "react";
import styles from "../../styles/Game.module.css";
import { DndContext, DragOverlay } from "@dnd-kit/core";
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

export default function Game() {
  const [isDragging, setIsDragging] = useState(false);
  const [game, setGame] = useState<Game | null>(null);
  const [status, setStatus] = useState<number>();
  const [error, setError] = useState<PostgrestError | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = useSupabaseClient<Database>();
  const user = useUser();
  const router = useRouter();
  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd(e: DragEndEvent) {
    console.log(e);
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

  const updateGame = (playerWord: string, game: Game) => {
    playerTurn(playerWord, game).then(async (val) => {
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
            <pre>{JSON.stringify(game, null, 2)}</pre>

            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToWindowEdges]}
            >
              <DroppableArea area={"left"} />

              <h1>{game.current_word}</h1>
              <DroppableArea area={"right"} />
              <Keyboard />
            </DndContext>
            <Link href={"/"}> return home</Link>
          </>
        )}
      </div>
    </Layout>
  );
}
