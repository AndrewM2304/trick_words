import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import React, { useState } from "react";
import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { game_functions_url, local_game } from "@utilities/constants";
import { PostgrestError } from "@supabase/supabase-js";
type Game = Database["public"]["Tables"]["games"]["Row"];

export const usePlayerTurn = () => {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("Checking word...");
  const supabase = useSupabaseClient<Database>();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);

  function handleDragStart(e: DragStartEvent) {
    setSelectedLetter(e.active.id.toString());
  }

  function handleDragEnd(e: DragEndEvent) {
    setSelectedLetter("");
    if (!e.over || !game) return;
    if (e.over.id === "left") {
      const playerWord = `${e.active.id}${game.current_word}`;
      updateGame(playerWord, game, false, "easy");
    }
    if (e.over.id === "right") {
      const playerWord = `${game?.current_word}${e.active.id}`;

      updateGame(playerWord, game, false, "easy");
    }
  }

  const updateGame = async (
    playerWord: string,
    game: Game,
    forfeit: boolean = false,
    difficulty: "easy" | "medium" | "normal"
  ) => {
    if (!showDialog) {
      setShowDialog(true);
    }
    try {
      const res = await typedFetch<{
        update: boolean;
        gameToReturn: Game;
        message: string;
      }>(
        `${game_functions_url}`,

        {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          headers: {
            "Content-Type": "application/json",
          },
          redirect: "follow",
          referrerPolicy: "no-referrer",
          body: JSON.stringify({
            game: game,
            difficulty: difficulty,
            word: playerWord,
            forfeit: forfeit,
          }), // body data type must match "Content-Type" header
        }
      );
      if (res.update) {
        successfulResult(res);
      }
      if (!res.update || forfeit) {
        setDialogMessage(res.message);
        closeModal(res.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const successfulResult = async (result: {
    update: boolean;
    gameToReturn: Game;
    message: string;
  }) => {
    if (result.gameToReturn.game_type === GameType.ONLINE_MULTIPLAYER) {
      const { data, error } = await supabase
        .from("games")
        .update(result.gameToReturn)
        .eq("id", result.gameToReturn.id)
        .select();

      if (data) {
        setGame(data[0]);

        setDialogMessage(result.message);
        closeModal(result.message);
      }
      if (error) {
        setError(error);
        setDialogMessage(error.message);
      }
    }
    if (
      result.gameToReturn.game_type === GameType.COMPUTER ||
      result.gameToReturn.game_type === GameType.LOCAL_MULTIPLAYER
    ) {
      setDialogMessage(result.message);

      setGame(result.gameToReturn);
      const gamesFromLocalStorage = window.localStorage.getItem(local_game);
      if (gamesFromLocalStorage) {
        const games: Game[] = JSON.parse(gamesFromLocalStorage);
        const updatedGames = games.map((g: Game) => {
          if (g.id === result.gameToReturn.id) {
            return result.gameToReturn;
          }
          return g;
        });
        window.localStorage.setItem(local_game, JSON.stringify(updatedGames));
      }
      closeModal(result.message);
    }
  };

  const closeModal = (message: string) => {
    setTimeout(
      () => {
        setShowDialog(false);
        setDialogMessage("Checking word...");
      },
      message === "Next player" ? 1200 : 2200
    );
  };

  const forfeitGame = () => {
    if (!game) return;
    setDialogMessage("You forfeit this round, next letter!");
    updateGame(game.current_word, game, true, "easy");
  };

  return {
    handleDragStart,
    handleDragEnd,
    setGame,
    forfeitGame,
    setShowDialog,
    setDialogMessage,
    setSelectedLetter,
    updateGame,
    game,
    selectedLetter,
    dialogMessage,
    showDialog,
    error,
  };
};

function typedFetch<TResponse>(
  url: string,
  // `RequestInit` is a type for configuring
  // a `fetch` request. By default, an empty object.
  config: RequestInit = {}
): Promise<TResponse> {
  return fetch(url, config)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`something went wrong ${response}`);
      }
      return response.json();
    })
    .then((data) => data as TResponse);
}
