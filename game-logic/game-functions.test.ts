import { mockPlayerOne, mockPlayerTwo } from "@testing/mockData";
import { identifyIfWordInList, createNewGame } from "./game-functions";
describe("game", () => {
  it("checks an input against a word list and returns 1) if the word is in the list, and 2) if it is an exact match", () => {
    const exactMatch = identifyIfWordInList("hello");
    expect(exactMatch.exactMatch).toBe(true);
    expect(exactMatch.inList).toBe(true);
    const partialMatch = identifyIfWordInList("hel");
    expect(partialMatch.inList).toBeTruthy();
    expect(partialMatch.exactMatch).toBeFalsy();
    const notMatch = identifyIfWordInList("ztys");
    expect(notMatch.inList).toBeFalsy();
    expect(notMatch.exactMatch).toBeFalsy();
  });

  it("creates a new game with a computer opponent and sets initial letter to 'a'", () => {
    const game = createNewGame(mockPlayerOne, "computer");
    expect(game.currentLetterIndex).toBe(0);
    expect(game.currentPlayerIndex).toBe(0);
    expect(game.players[0].id).toBe("mock-player-one");
    expect(game.players[1]?.id).toBe("computer");
  });
});
