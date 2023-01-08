import {
  exactWord,
  mockPlayerOne,
  mockPlayerTwo,
  wordfail,
  wordPass,
} from "@testing/mockData";
import { identifyIfWordInList, playerTurn } from "./game-functions";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];
import { Database } from "@utilities/supabase";
import { GameType } from "@utilities/game";

describe("identifyIfWordInList", () => {
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
});

describe("player turn", () => {
  let game: GameDBType = {
    id: 0,
    created_at: "",
    current_word: "a",
    current_letter_index: 0,
    game_type: GameType.LOCAL_MULTIPLAYER,
    secret_key: "",
    current_player_index: 0,
    player_one_score: 0,
    player_two_score: 0,
    player_one_id: null,
    player_two_id: null,
    player_one_name: "p1",
    player_two_name: "p2",
    player_one_avatar: "",
    player_two_avatar: "",
    winner: null,
  };
  it("returns a message if the user passes an incorrect message", async () => {
    const localGame = { ...game };
    const returnValue = await playerTurn(wordfail, localGame, false);
    expect(returnValue.update).toBeFalsy();
    expect(returnValue.message).toBe(`${wordfail} is not a match, try again!`);
    expect(returnValue.value).toStrictEqual(game);
  });

  it("updates the current word if the user passes a correct word", async () => {
    const localGame = { ...game };

    expect(localGame.current_word).toBe("a");
    const returnValue = await playerTurn(wordPass, localGame, false);
    expect(returnValue.update).toBeTruthy();
    expect(returnValue.message).toBe("Next player");
    expect(returnValue.value.current_player_index).toBe(1);
    expect(returnValue.value.current_word).toBe(wordPass);
  });

  it("updates the score and sets the next letter if user fails a round and the letter is not z", async () => {
    const localGame = { ...game };

    const returnValue = await playerTurn(exactWord, localGame, false);
    expect(returnValue.update).toBeTruthy();
    expect(returnValue.message).toBe(
      `${exactWord} is a match, you lose this round!`
    );
    expect(returnValue.value.current_letter_index).toBe(1);
    expect(returnValue.value.current_word).toBe("b");
  });

  it("sets a winner if the user gets a wrong word on the letter z", async () => {
    const localGame = { ...game };

    localGame.current_letter_index = 25;
    localGame.player_two_score = 22;
    localGame.player_one_score = 3;
    localGame.current_word = "z";
    const returnValue = await playerTurn(exactWord, localGame, false);
    expect(returnValue.update).toBeTruthy();
    expect(returnValue.message).toBe(
      `winner is ${returnValue.value.player_two_name}`
    );
    expect(returnValue.value.current_letter_index).toBe(25);
    expect(returnValue.value.current_word).toBe("z");
    expect;
  });

  it("updates other players score and moved to next round if user forfeits round", async () => {
    const localGame = { ...game };

    const returnValue = await playerTurn(wordPass, localGame, true);
    expect(returnValue.update).toBeTruthy();
    expect(returnValue.message).toBe(`You forfeit this round, next player`);
    expect(returnValue.value.current_letter_index).toBe(1);
    expect(returnValue.value.current_word).toBe("b");
    expect(returnValue.value.current_player_index).toBe(1);
  });
});
