import { Database } from "@utilities/supabase";
import { GameReturnValue, GameType } from "@utilities/game";
import { computerReturnedWords, letters } from "./letters";
import { words as wordlist } from "./word-list";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

export const identifyIfWordInList = (
  word: string,
  difficulty: string
): GameReturnValue => {
  let value: GameReturnValue = {
    inList: false,
    exactMatch: false,
    computerWord: { word: null, exactMatch: false },
  };

  const computerWords: { index: number; word: string; exact: boolean }[] = [];

  // iterate and build player matching words and array to check computer words against
  for (let i = 0; i < wordlist.length; i++) {
    if (wordlist[i].includes(word)) {
      value.inList = true;
      value.exactMatch = wordlist[i] === word ? true : false;
      if (wordlist[i].length <= difficultyFilter(difficulty)) {
        computerWords.push({
          index: i,
          word: wordlist[i],
          exact: wordlist[i] === word ? true : false,
        });
      }
      if (wordlist[i] === word) break;
    }
  }

  for (let i = 0; i < 3; i++) {
    const compTurn = computerWordGenerate(
      word,
      computerWords[Math.floor(Math.random() * computerWords.length)]?.word ??
        ""
    );
    // if there is a word check if its an exact match
    if (compTurn) {
      value.computerWord.exactMatch = wordlist.includes(compTurn);
      value.computerWord.word = compTurn;
      // exit loop if word would pass
      if (!wordlist.includes(compTurn)) break;
    }
    if (!compTurn) {
      value.computerWord.exactMatch = false;
      value.computerWord.word = null;
    }
  }

  return value;
};

export const arraySlicer = (difficulty: string): number => {
  switch (difficulty) {
    case "easy":
      return 1000;
    case "medium":
      return Math.round(wordlist.length / 4);
    default:
      return wordlist.length / 2;
  }
};

export const difficultyFilter = (difficulty: string): number => {
  switch (difficulty) {
    case "easy":
      return 6;
    case "medium":
      return 8;
    default:
      return 14;
  }
};

export const computerWordGenerate = (
  currentWord: string,
  computerWord: string
): string | null => {
  const indexOfWord = computerWord.indexOf(currentWord);
  let response: string | null = "";
  if (indexOfWord >= 1) {
    response = computerWord.charAt(indexOfWord - 1) + currentWord;
  }
  if (indexOfWord === 0) {
    response =
      currentWord + computerWord.charAt(indexOfWord + currentWord.length);
  }
  if (indexOfWord < 0) {
    response = null;
  }

  return response;
};

export const updateGameBasedOnPlayerTurn = (
  playerGuess: string,
  difficulty: string,
  game: GameDBType,
  forfeit: boolean
): { update: boolean; gameToReturn: GameDBType; message: string } => {
  if (forfeit) {
    const { message, updatedGame } = forfeitRoundLogic(game);
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  const { inList, exactMatch, computerWord } = identifyIfWordInList(
    playerGuess,
    difficulty
  );

  if (exactMatch) {
    const { message, updatedGame } = exactMatchLogic(game, playerGuess);
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  if (!exactMatch && inList) {
    const { message, updatedGame } = nextPlayerLogic(
      game,
      playerGuess,
      computerWord
    );
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  return {
    update: false,
    gameToReturn: game,
    message: `${playerGuess} is not a match, try again!`,
  };
};

export const switchPlayer = (currentPlayerIndex: number): number => {
  return currentPlayerIndex === 0 ? 1 : 0;
};

export const switchPlayerID = (
  currentPlayerIndex: number,
  game: GameDBType
): string | null => {
  return currentPlayerIndex === 0 ? game.player_two_id : game.player_one_id;
};

export const incrementLetter = (currentLetterIndex: number): number => {
  return currentLetterIndex <= 24 ? currentLetterIndex + 1 : 25;
};

export const setWinner = (
  currentLetterIndex: number,
  player_one_score: number,
  player_two_score: number,
  player_one_name: string,
  player_two_name: string
): string | null => {
  if (player_one_score > player_two_score && currentLetterIndex === 25) {
    return player_one_name;
  }
  if (player_two_score > player_one_score && currentLetterIndex === 25) {
    return player_two_name;
  }
  if (player_two_score === player_one_score && currentLetterIndex === 25) {
    return "draw";
  }
  return null;
};

export const setMessage = (g: GameDBType, baseMessage: string): string => {
  if (g.winner) {
    if (g.winner === "draw") {
      return `Game is a draw!`;
    }
    return `Winner is ${g.winner}`;
  }
  return baseMessage;
};

export const forfeitRoundLogic = (
  game: GameDBType
): { updatedGame: GameDBType; message: string } => {
  // keep same player unless computer
  // increment other players score
  // increment letter
  // set new word to new letter
  // message about forfeit next player
  const g = { ...game };
  g.current_player_index === 0 ? g.player_two_score++ : g.player_one_score++;
  g.winner = setWinner(
    g.current_letter_index,
    g.player_one_score,
    g.player_two_score,
    g.player_one_name,
    g.player_two_name
  );
  g.current_letter_index = incrementLetter(g.current_letter_index);
  g.current_word = letters[g.current_letter_index];

  return {
    updatedGame: g,
    message: setMessage(g, "You forfeit this round, next letter!"),
  };
};

export const exactMatchLogic = (
  game: GameDBType,
  word: string
): { updatedGame: GameDBType; message: string } => {
  // increment other players score
  // increment letter
  // if letter is z set other player winner
  // set new word to new letter
  // message about match
  // switch player if not a computer game
  const g = { ...game };
  g.current_player_index === 0 ? g.player_two_score++ : g.player_one_score++;
  g.current_letter_index = incrementLetter(g.current_letter_index);
  g.current_word = letters[g.current_letter_index];
  g.winner = setWinner(
    g.current_letter_index,
    g.player_one_score,
    g.player_two_score,
    g.player_one_name,
    g.player_two_name
  );
  if (g.game_type === GameType.LOCAL_MULTIPLAYER) {
    g.current_player_id = switchPlayerID(g.current_player_index, g);
    g.current_player_index = switchPlayer(g.current_player_index);
  }

  return {
    updatedGame: g,
    message: setMessage(g, `${word} is a match, you lose this round!`),
  };
};

export const nextPlayerLogic = (
  g: GameDBType,
  playerGuess: string,
  computerWord: { word: string | null; exactMatch: boolean }
): { updatedGame: GameDBType; message: string } => {
  if (g.game_type !== GameType.COMPUTER) {
    g.current_word = playerGuess;
    g.current_player_id = switchPlayerID(g.current_player_index, g);
    g.current_player_index = switchPlayer(g.current_player_index);
    return { updatedGame: g, message: "Next player" };
  }

  if (
    g.game_type === GameType.COMPUTER &&
    (!computerWord.word || computerWord.exactMatch === true)
  ) {
    g.player_one_score++;
    g.current_letter_index = incrementLetter(g.current_letter_index);
    g.current_word = computerReturnedWords[g.current_letter_index];
    g.winner = setWinner(
      g.current_letter_index,
      g.player_one_score,
      g.player_two_score,
      g.player_one_name,
      g.player_two_name
    );
    return {
      updatedGame: g,
      message: setMessage(
        g,
        computerWord.word
          ? `Computer played ${computerWord.word}, but it is a match. You win this round!`
          : `Computer could not find a word, you win this round!`
      ),
    };
  }

  g.current_word = computerWord.word!;

  return {
    updatedGame: g,
    message: setMessage(g, `Computer played ${computerWord.word}, your turn`),
  };
};
