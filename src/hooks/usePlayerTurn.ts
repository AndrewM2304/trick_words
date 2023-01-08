import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import React, { useState } from "react";
import { Database } from "@utilities/supabase";
import { playerTurn } from "@game/game-functions";
import { GameType } from "@utilities/game";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { local_game } from "@utilities/constants";
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
      updateGame(playerWord, game);
    }
    if (e.over.id === "right") {
      console.log("right");
      const playerWord = `${game?.current_word}${e.active.id}`;

      updateGame(playerWord, game);
    }
  }

  const updateGame = (
    playerWord: string,
    game: Game,
    forfeit: boolean = false
  ) => {
    if (!showDialog) {
      setShowDialog(true);
    }

    playerTurn(playerWord, game, forfeit).then(async (val) => {
      console.log(val);
      setTimeout(() => {
        setDialogMessage(val.message);
      }, 1000);
      if (val.update) {
        successfulResult(val.value, val.computerWord, game);
      }
      if (!val.update || forfeit) {
        closeModal();
      }
    });
  };

  const successfulResult = async (
    resultValue: Game,
    computerWord: string,
    game: Game
  ) => {
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

  const closeModal = () => {
    setTimeout(() => {
      setShowDialog(false);
      setDialogMessage("Checking word...");
    }, 2000);
  };

  const forfeitGame = () => {
    setDialogMessage("You forfeit this round, next player");
    updateGame(game?.current_word!, game!, true);
  };

  return {
    handleDragStart,
    handleDragEnd,
    setGame,
    forfeitGame,
    setShowDialog,
    setDialogMessage,
    setSelectedLetter,
    game,
    selectedLetter,
    dialogMessage,
    showDialog,
  };
};
