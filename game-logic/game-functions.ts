import { Game, GamePlayer, GameReturnValue } from "@utilities/game";
import { wordlist } from "./wordArray";

export const identifyIfWordInList = (word: string): GameReturnValue => {
  let value: GameReturnValue = { inList: false, exactMatch: false };
  for (let i: number = 0; i < wordlist.length; i++) {
    if (wordlist[i].includes(word)) value.inList = true;
    if (wordlist[i].includes(word) && wordlist[i] === word) {
      value.exactMatch = true;
      value.inList = true;
      break;
    }
  }

  return value;
};

export const createNewGame = (
  playerOne: GamePlayer,
  playerTwo: GamePlayer | "computer" | null
): Game => {
  const setupPlayerTwo = (): GamePlayer | null => {
    switch (playerTwo) {
      case null:
        return null;
      case "computer":
        return { id: "computer", score: 0 };
      default:
        return playerTwo;
    }
  };

  const game: Game = {
    players: [playerOne, setupPlayerTwo()],
    currentLetterIndex: 0,
    currentPlayerIndex: 0,
    currentWord: "",
  };

  return game;
};
