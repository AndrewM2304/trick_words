import { game_functions_url } from "@utilities/constants";
import { GamePlayer, GameReturnValue } from "@utilities/game";
import { wordlist } from "./wordArray";
import { Database } from "@utilities/supabase";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { letters } from "./word-list";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

export const identifyIfWordInList = (word: string): GameReturnValue => {
  let value: GameReturnValue = { inList: false, exactMatch: false };
  for (let i: number = 0; i < wordlist.length; i++) {
    if (wordlist[i].includes(word)) {
      value.inList = true;
    }
    if (wordlist[i].includes(word) && wordlist[i] === word) {
      value.exactMatch = true;
      value.inList = true;
      break;
    }
  }

  return value;
};

export const playerTurn = async (
  word: string,
  currentGame: GameDBType,
  forfeit: boolean = false
): Promise<{ update: boolean; value: GameDBType; message: string }> => {
  const tempGame = { ...currentGame };

  const result = await fetch(`${game_functions_url}${word}`);

  let returnMessage = "";

  const returnedData: GameReturnValue = await result.json();
  // set winner
  if (
    (returnedData.exactMatch || forfeit) &&
    currentGame.current_letter_index === 25
  ) {
    tempGame.current_player_index === 0
      ? tempGame.player_two_score++
      : tempGame.player_one_score++;
    tempGame.winner =
      tempGame.player_one_score > tempGame.player_two_score
        ? tempGame.player_one_id
        : tempGame.player_two_id;
    returnMessage = `winner is ${
      tempGame.winner === tempGame.player_one_id
        ? tempGame.player_one_name
        : tempGame.player_two_name
    }`;

    return { update: true, value: tempGame, message: returnMessage };
  }
  // set new word, increment letter index and increment score
  if (
    (returnedData.exactMatch || forfeit) &&
    currentGame.current_letter_index < 25
  ) {
    tempGame.current_letter_index = tempGame.current_letter_index + 1;
    tempGame.current_player_index === 0
      ? tempGame.player_two_score++
      : tempGame.player_one_score++;
    tempGame.current_word = letters[tempGame.current_letter_index];
    returnMessage = forfeit ? "" : `${word} is a match, you lose this round!`;
    return { update: true, value: tempGame, message: returnMessage };
  }
  // update word, set next player
  if (!returnedData.exactMatch && returnedData.inList) {
    tempGame.current_word = word;
    tempGame.current_player_index = tempGame.current_player_index === 0 ? 1 : 0;
    return { update: true, value: tempGame, message: returnMessage };
  }

  // not success
  if (!returnedData.exactMatch && !returnedData.inList) {
    returnMessage = `${word} is not a match, try again!`;
    return { update: false, value: currentGame, message: returnMessage };
  } else
    return {
      update: false,
      value: currentGame,
      message: "somethings gone wrong",
    };
};
