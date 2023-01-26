import {
  updateGameBasedOnPlayerTurn,
  setMessage,
  setWinner,
  switchPlayer,
  forfeitRoundLogic,
  exactMatchLogic,
  nextPlayerLogic,
  arraySlicer,
  identifyIfWordInList,
  computerWordGenerate,
  incrementLetter,
  difficultyFilter,
} from "./new-game-functions";
import { words as wordlist } from "./word-list";
import { mockGame } from "@testing/mockData";
import { Database } from "@utilities/supabase";
import { letters } from "./letters";
import { M } from "msw/lib/SetupApi-b2f0e5ac";
import { GameType } from "@utilities/game";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

let tempGame: GameDBType;
beforeEach(() => {
  tempGame = { ...mockGame };
});

describe("identifyIfWordInList", () => {
  it("checks if a word is in a list, an exact match and sets computerwords to null or a string based on computing a compoter word", () => {
    const exactMatch = identifyIfWordInList("boy", "hard");
    expect(exactMatch.exactMatch).toBe(true);
    expect(exactMatch.inList).toBe(true);
    expect(typeof exactMatch.computerWord.word).toBe("string" || "null");
    const partialMatch = identifyIfWordInList("he", "hard");
    expect(partialMatch.inList).toBeTruthy();
    expect(partialMatch.exactMatch).toBeFalsy();
    expect(typeof partialMatch.computerWord.word).toBe("string" || "null");

    const notMatch = identifyIfWordInList("ztys", "hard");
    expect(notMatch.inList).toBeFalsy();
    expect(notMatch.exactMatch).toBeFalsy();
    expect(notMatch.computerWord.word).toBe(null);
  });
});

describe("array slicer", () => {
  it("returns 1000 for an easy difficulty ", () => {
    const eastArray = arraySlicer("easy");
    expect(eastArray).toBe(1000);
    const mediumArray = arraySlicer("medium");
    expect(mediumArray).toBeGreaterThan(30000);
    const normalArray = arraySlicer("normal");
    expect(normalArray).toBeGreaterThan(70000);
    const defaultArray = arraySlicer("");
    expect(defaultArray).toBe(wordlist.length / 2);
  });
});

describe("difficultyFilter", () => {
  it("returns 6 for easy difficulty", () => {
    const filter = difficultyFilter("easy");
    expect(filter).toBe(6);
  });

  it("returns 8 for medium difficulty", () => {
    const filter = difficultyFilter("medium");
    expect(filter).toBe(8);
  });

  it("returns 14 for any other difficulty", () => {
    const filter = difficultyFilter("hard");
    expect(filter).toBe(14);
  });
});

describe("computerwordgenerate", () => {
  it("takes in a player word, potential word and adds a letter to the front or end of the player word", () => {
    const addToEnd = computerWordGenerate("hel", "helpline");
    expect(addToEnd).toBe("help");
    const addToStart = computerWordGenerate("hel", "othello");
    expect(addToStart).toBe("thel");
    const nullish = computerWordGenerate("hel", "james");
    expect(nullish).toBeNull();
  });
});

describe("switch player", () => {
  it("updates to next player", () => {
    const setPlayerToOne = switchPlayer(1);
    expect(setPlayerToOne).toBe(0);

    const setPlayerToTwo = switchPlayer(0);
    expect(setPlayerToTwo).toBe(1);
  });
});

describe("incrementLetter", () => {
  it("updates to next letter", () => {
    const setToB = incrementLetter(0);
    expect(letters[1]).toBe("b");
    expect(letters[setToB]).toBe("b");
    const setToY = incrementLetter(24);
    expect(letters[setToY]).toBe("z");
    const setToZ = incrementLetter(25);
    expect(letters[setToZ]).toBe("z");
    const higherThan25 = incrementLetter(100);
    expect(higherThan25).toBe(25);
  });
});

describe("setWinner", () => {
  it("sets a winner", () => {
    const winnerA = setWinner(25, 22, 3, "a", "b");
    expect(winnerA).toBe("a");
    const winnerB = setWinner(25, 2, 24, "a", "b");
    expect(winnerB).toBe("b");
  });
  it("sets a draw", () => {
    const draw = setWinner(25, 2, 2, "a", "b");
    expect(draw).toBe("draw");
  });
  it("returns null if game isnt finished", () => {
    const nullish = setWinner(22, 2, 2, "a", "b");
    expect(nullish).toBe(null);
  });
});

describe("set message", () => {
  it("sets a draw message if there is a draw", () => {
    tempGame.winner = "draw";
    const draw = setMessage(tempGame, "other message");
    expect(draw).toBe("Game is a draw!");
  });
  it("sets a winner message", () => {
    tempGame.player_one_id = "test";
    tempGame.player_one_name = "test winner";
    tempGame.winner = "test";
    const winner = setMessage(tempGame, "other message");
    expect(winner).toBe("Winner is test");
  });
  it("sets a base message if no winner", () => {
    tempGame.winner = null;
    const winner = setMessage(tempGame, "other message");
    expect(winner).toBe("other message");
  });
});

describe("forfeitroundlogic", () => {
  it("increments the other players score and increments letters", () => {
    expect(tempGame.player_two_score).toBe(0);
    const { updatedGame, message } = forfeitRoundLogic(tempGame);
    expect(updatedGame.player_two_score).toBe(1);
    expect(message).toBe("You forfeit this round, next letter!");
  });
  it("sets a winner if current letter is z", () => {
    tempGame.current_letter_index = 25;
    tempGame.player_two_name = "test 2";
    expect(letters[tempGame.current_letter_index]).toBe("z");
    const { updatedGame, message } = forfeitRoundLogic(tempGame);
    expect(updatedGame.winner).toBe("test 2");
    expect(message).toBe("Winner is test 2");
  });
});

describe("exactmatch logic", () => {
  it("increments other player score, letter, and switches player if not a computer round", () => {
    expect(tempGame.current_letter_index).toBe(0);
    const { updatedGame, message } = exactMatchLogic(tempGame, "hello");
    expect(updatedGame.game_type).toBe(GameType.LOCAL_MULTIPLAYER);
    expect(updatedGame.current_letter_index).toBe(1);
    expect(updatedGame.current_player_index).toBe(1);
    expect(message).toBe("hello is a match, you lose this round!");
  });

  it("increments other player score, letter, and keeps same player if computer", () => {
    tempGame.game_type = GameType.COMPUTER;
    expect(tempGame.current_letter_index).toBe(0);
    const { updatedGame, message } = exactMatchLogic(tempGame, "hello");
    expect(updatedGame.game_type).toBe(GameType.COMPUTER);
    expect(updatedGame.current_letter_index).toBe(1);
    expect(updatedGame.current_player_index).toBe(0);
    expect(message).toBe("hello is a match, you lose this round!");
  });

  it("sets a winner if game is complete", () => {
    tempGame.player_one_score = 22;
    tempGame.current_letter_index = 24;
    expect(tempGame.current_letter_index).toBe(24);
    expect(tempGame.player_one_score).toBe(22);

    const { updatedGame, message } = exactMatchLogic(tempGame, "hello");
    expect(updatedGame.current_letter_index).toBe(25);
    expect(updatedGame.current_player_index).toBe(1);
    expect(message).toBe(`Winner is ${tempGame.player_one_name}`);
  });
});

describe("next player turn", () => {
  it("sets the current word as the player attempt and switches players if not a computer game", () => {
    expect(tempGame.current_player_index).toBe(0);
    const { updatedGame, message } = nextPlayerLogic(tempGame, "ol", {
      word: "rol",
      exactMatch: false,
    });
    expect(updatedGame.current_word).toBe("ol");
    expect(updatedGame.current_player_index).toBe(1);
    expect(message).toBe("Next player");
  });
  it("increases the current players score and keeps it to player one if its a computer gametype and there is no computer word", () => {
    tempGame.game_type = GameType.COMPUTER;
    const { updatedGame, message } = nextPlayerLogic(tempGame, "ol", {
      word: null,
      exactMatch: false,
    });
    expect(updatedGame.current_word).toBe("bl");
    expect(updatedGame.current_player_index).toBe(0);
    expect(message).toBe("Computer could not find a word, you win this round!");
  });
});

describe("updateGameBasedOnPlayerTurn ", () => {
  it("returns the same game to user if a word is not a match", () => {
    const { update, gameToReturn, message } = updateGameBasedOnPlayerTurn(
      "zstwr",
      "normal",
      tempGame,
      false
    );
    expect(update).toBeFalsy();
    expect(gameToReturn).toStrictEqual(tempGame);
    expect(message).toBe("zstwr is not a match, try again!");
  });
  it("returns an updated game with second player if guess is correct", () => {
    const { update, gameToReturn, message } = updateGameBasedOnPlayerTurn(
      "al",
      "normal",
      tempGame,
      false
    );
    expect(update).toBeTruthy();
    expect(gameToReturn.current_word).toBe("al");
    expect(gameToReturn.current_player_index).toBe(1);
    expect(message).toBe("Next player");
  });
  it("increments the score and keeps the same player if user forfeits a round", () => {
    const { update, gameToReturn, message } = updateGameBasedOnPlayerTurn(
      "al",
      "normal",
      tempGame,
      true
    );
    expect(update).toBeTruthy();
    expect(gameToReturn.current_word).toBe("b");
    expect(gameToReturn.current_player_index).toBe(0);
    expect(gameToReturn.player_two_score).toBe(1);
    expect(gameToReturn.player_one_score).toBe(0);
    expect(message).toBe("You forfeit this round, next letter!");
  });
  it("sets a winner if a player word is an exact match and the current letter is z", () => {
    tempGame.current_letter_index = 25;
    tempGame.player_one_score = 22;
    const { update, gameToReturn, message } = updateGameBasedOnPlayerTurn(
      "al",
      "normal",
      tempGame,
      true
    );
    expect(update).toBeTruthy();
    expect(gameToReturn.current_word).toBe("z");
    expect(gameToReturn.current_player_index).toBe(0);
    expect(gameToReturn.player_two_score).toBe(1);
    expect(gameToReturn.player_one_score).toBe(22);
    expect(gameToReturn.winner).toBe("p1");
    expect(message).toBe("Winner is p1");
  });
});
