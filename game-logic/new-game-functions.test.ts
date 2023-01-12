import {
  checkPlayerWordAndReturnComputerWord,
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
} from "./new-game-functions";
import { words as wordlist } from "./word-list";
import { mockGame } from "@testing/mockData";
import { Database } from "@utilities/supabase";
import { letters } from "./letters";
import { M } from "msw/lib/SetupApi-b2f0e5ac";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

let tempGame: GameDBType;
beforeEach(() => {
  tempGame = { ...mockGame };
});

describe("identifyIfWordInList", () => {
  it("checks if a word is in a list, an exact match and sets computerwords to null if player is false", () => {
    const exactMatch = identifyIfWordInList("hello", "easy", false);
    expect(exactMatch.exactMatch).toBe(true);
    expect(exactMatch.inList).toBe(true);
    expect(exactMatch.computerWords).toBe(null);
    const partialMatch = identifyIfWordInList("he", "easy", false);
    expect(partialMatch.inList).toBeTruthy();
    expect(partialMatch.exactMatch).toBeFalsy();
    expect(partialMatch.computerWords).toBe(null);

    const notMatch = identifyIfWordInList("ztys", "easy", false);
    expect(notMatch.inList).toBeFalsy();
    expect(notMatch.exactMatch).toBeFalsy();
    expect(notMatch.computerWords).toBe(null);
  });

  it("checks if a word is in a list, an exact match and sets computerwords to an array of strings if player is true", () => {
    const exactMatch = identifyIfWordInList("hello", "easy", true);
    expect(exactMatch.exactMatch).toBe(true);
    expect(exactMatch.inList).toBe(true);
    expect(exactMatch.computerWords?.length).toBe(3);
    const partialMatch = identifyIfWordInList("he", "easy", true);
    expect(partialMatch.inList).toBeTruthy();
    expect(partialMatch.exactMatch).toBeFalsy();
    expect(partialMatch.computerWords?.length).toBe(3);
    const notMatch = identifyIfWordInList("ztys", "easy", true);
    expect(notMatch.inList).toBeFalsy();
    expect(notMatch.exactMatch).toBeFalsy();
    expect(notMatch.computerWords?.length).toBe(3);
  });
});

describe("array slicer", () => {
  it("returns 1000 for an easy difficulty ", () => {
    const eastArray = arraySlicer("easy");
    expect(eastArray).toBe(1000);
    const mediumArray = arraySlicer("medium");
    expect(mediumArray).toBe(Math.round(wordlist.length / 2));
    const normalArray = arraySlicer("normal");
    expect(normalArray).toBe(wordlist.length);
    const defaultArray = arraySlicer("");
    expect(defaultArray).toBe(wordlist.length);
  });
});

describe("checkPlayerWordAndReturnComputerWord", () =>
  it("runs a function to create player and computer guesses, then generates a computer turn", () => {
    const { inList, exactMatch, computerWord } =
      checkPlayerWordAndReturnComputerWord("all", "medium");
    expect(inList).toBeTruthy();
    expect(exactMatch).toBeTruthy();
  }));

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

// describe('updateGameBasedOnPlayerTurn', () => {
//   it('hh', () => {
//     const{update,gameToReturn, message} = updateGameBasedOnPlayerTurn('yes','easy',tempGame, false)
//   })})

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
    const setToB = incrementLetter(1);
    expect(letters[setToB]).toBe("b");
    const setToY = incrementLetter(24);
    expect(letters[setToY]).toBe("y");
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
    expect(winner).toBe("Winner is test winner");
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
    expect(message).toBe("You forfeit this round, next player!");
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
