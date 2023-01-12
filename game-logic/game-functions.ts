import { game_functions_url } from "@utilities/constants";
import { GamePlayer, GameReturnValue, GameType } from "@utilities/game";
import { words as wordlist } from "./word-list";
import { Database } from "@utilities/supabase";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { letters } from "./letters";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];
export type playerTurnType = {
  update: boolean;
  value: GameDBType;
  message: string;
  computerWords: string[] | null;
};

export const playerTurn = async (
  word: string,
  currentGame: GameDBType,
  forfeit: boolean = false
): Promise<playerTurnType> => {
  const tempGame = { ...currentGame };
  console.log(word);
  const isComputerTurn =
    currentGame.game_type === GameType.COMPUTER &&
    currentGame.current_player_index === 1;

  let result = await fetch(
    `${game_functions_url}${word}?computerTurn=${isComputerTurn}&difficulty=easy`
  );

  let returnMessage = "";

  const returnedData: GameReturnValue = await result.json();
  const { exactMatch, inList, computerWords, countOfPotentialWords } =
    returnedData;

  // set winner

  console.log(tempGame);
  if ((exactMatch || forfeit) && currentGame.current_letter_index === 25) {
    console.log("25 exact");
    tempGame.current_player_index === 0
      ? tempGame.player_two_score++
      : tempGame.player_one_score++;
    tempGame.winner =
      tempGame.player_one_score > tempGame.player_two_score
        ? tempGame.player_one_id
        : tempGame.player_two_id;
    returnMessage = `winner is ${(tempGame.winner =
      tempGame.player_one_score > tempGame.player_two_score
        ? tempGame.player_one_name
        : tempGame.player_two_name)}`;

    return {
      update: true,
      value: tempGame,
      message: returnMessage,
      computerWords: computerWords,
    };
  }
  // set new word, increment letter index and increment score
  if ((exactMatch || forfeit) && currentGame.current_letter_index < 25) {
    console.log("<25 exact");

    tempGame.current_letter_index = tempGame.current_letter_index + 1;
    tempGame.current_player_index === 0
      ? tempGame.player_two_score++
      : tempGame.player_one_score++;
    tempGame.current_word = letters[tempGame.current_letter_index];
    if (forfeit && !GameType.COMPUTER) {
      tempGame.current_player_index =
        tempGame.current_player_index === 0 ? 1 : 0;
    }
    if (
      tempGame.game_type === GameType.COMPUTER &&
      tempGame.current_player_index === 1
    ) {
      console.log("newest");
      tempGame.current_player_index = 0;
    }

    returnMessage = forfeit
      ? "You forfeit this round, next player"
      : `${word} is a match, you lose this round!`;
    return {
      update: true,
      value: tempGame,
      message: returnMessage,
      computerWords: computerWords,
    };
  }
  // update word, set next player
  if (!exactMatch && inList) {
    console.log("next player " + word);
    tempGame.current_word = word;

    returnMessage = `Next player`;
    if (
      tempGame.game_type === GameType.COMPUTER &&
      tempGame.current_player_index === 1
    ) {
      console.log("newest");
      tempGame.current_player_index = 0;
    } else {
      tempGame.current_player_index =
        tempGame.current_player_index === 0 ? 1 : 0;
    }
    return {
      update: true,
      value: tempGame,
      message: returnMessage,
      computerWords: computerWords,
    };
  }

  // not success
  if (!exactMatch && !inList) {
    console.log("not success");
    returnMessage = `${word} is not a match, try again!`;
    return {
      update: false,
      value: currentGame,
      message: returnMessage,
      computerWords: computerWords,
    };
  } else
    return {
      update: false,
      value: currentGame,
      message: "somethings gone wrong",
      computerWords: computerWords,
    };
};
