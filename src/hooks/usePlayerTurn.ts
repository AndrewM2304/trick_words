import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import React, { useState } from "react";
import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { game_functions_url, local_game } from "@utilities/constants";
type Game = Database["public"]["Tables"]["games"]["Row"];

export const usePlayerTurn = () => {
  const [selectedLetter, setSelectedLetter] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("Checking word...");
  const supabase = useSupabaseClient<Database>();
  const [game, setGame] = useState<Game | null>(null);

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
          method: "POST", // *GET, POST, PUT, DELETE, etc.
          mode: "cors", // no-cors, *cors, same-origin
          cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
          credentials: "same-origin", // include, *same-origin, omit
          headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
          },
          redirect: "follow", // manual, *follow, error
          referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
          body: JSON.stringify({
            game: game,
            difficulty: difficulty,
            word: playerWord,
            forfeit: forfeit,
          }), // body data type must match "Content-Type" header
        }
      );

      setTimeout(() => {
        setDialogMessage(res.message);
      }, 1000);
      if (res.update) {
        successfulResult(res.gameToReturn);
      }
      if (!res.update || forfeit) {
        closeModal();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const successfulResult = async (game: Game) => {
    if (game.game_type === GameType.ONLINE_MULTIPLAYER) {
      const { data, error } = await supabase
        .from("games")
        .update(game)
        .eq("id", game.id)
        .select();

      if (data) {
        setGame(data[0]);
      }
      if (error) {
        console.error(error);
      }
    }
    if (
      game.game_type === GameType.COMPUTER ||
      game.game_type === GameType.LOCAL_MULTIPLAYER
    ) {
      setGame(game);
      const gamesFromLocalStorage = window.localStorage.getItem(local_game);
      if (gamesFromLocalStorage) {
        const games: Game[] = JSON.parse(gamesFromLocalStorage);
        const updatedGames = games.map((g: Game) => {
          if (g.id === game.id) {
            return game;
          }
          return g;
        });
        window.localStorage.setItem(local_game, JSON.stringify(updatedGames));
      }
    }
    closeModal();
  };

  const closeModal = () => {
    setTimeout(() => {
      setShowDialog(false);
      setDialogMessage("Checking word...");
    }, 2000);
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
