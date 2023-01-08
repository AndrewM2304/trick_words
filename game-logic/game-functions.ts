import { game_functions_url } from "@utilities/constants";
import { GamePlayer, GameReturnValue, GameType } from "@utilities/game";
import { wordlist } from "./wordArray";
import { Database } from "@utilities/supabase";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { letters } from "./word-list";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

export const identifyIfWordInList = (word: string): GameReturnValue => {
  let value: GameReturnValue = {
    inList: false,
    exactMatch: false,
    countOfPotentialWords: 0,
    computerWord: "",
  };

  const matchingWords = [];
  for (let i: number = 0; i < wordlist.length; i++) {
    if (wordlist[i].includes(word)) {
      value.inList = true;
      matchingWords.push(wordlist[i]);
    }
    if (wordlist[i].includes(word) && wordlist[i] === word) {
      value.exactMatch = true;
      value.inList = true;
      break;
    }
  }
  const randomInteger = Math.floor(Math.random() * matchingWords.length);
  value.countOfPotentialWords = matchingWords.length;
  value.computerWord = matchingWords[randomInteger];

  return value;
};

export const playerTurn = async (
  word: string,
  currentGame: GameDBType,
  forfeit: boolean = false
): Promise<{
  update: boolean;
  value: GameDBType;
  message: string;
  computerWord: string;
}> => {
  const tempGame = { ...currentGame };

  const result = await fetch(`${game_functions_url}${word}`);

  let returnMessage = "";

  const returnedData: GameReturnValue = await result.json();
  // set winner

  console.log(returnedData);
  console.log(tempGame);
  if (
    (returnedData.exactMatch || forfeit) &&
    currentGame.current_letter_index === 25
  ) {
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
      computerWord: returnedData.computerWord,
    };
  }
  // set new word, increment letter index and increment score
  if (
    (returnedData.exactMatch || forfeit) &&
    currentGame.current_letter_index < 25
  ) {
    console.log("<25 exact");

    tempGame.current_letter_index = tempGame.current_letter_index + 1;
    tempGame.current_player_index === 0
      ? tempGame.player_two_score++
      : tempGame.player_one_score++;
    tempGame.current_word = letters[tempGame.current_letter_index];
    if (forfeit) {
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
      computerWord: returnedData.computerWord,
    };
  }
  // update word, set next player
  if (!returnedData.exactMatch && returnedData.inList) {
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
      computerWord: returnedData.computerWord,
    };
  }

  // not success
  if (!returnedData.exactMatch && !returnedData.inList) {
    console.log("not success");
    returnMessage = `${word} is not a match, try again!`;
    return {
      update: false,
      value: currentGame,
      message: returnMessage,
      computerWord: returnedData.computerWord,
    };
  } else
    return {
      update: false,
      value: currentGame,
      message: "somethings gone wrong",
      computerWord: returnedData.computerWord,
    };
};
