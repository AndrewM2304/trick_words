import { Database } from "@utilities/supabase";
import { GameReturnValue, GameType } from "@utilities/game";
import { computerReturnedWords, letters } from "./letters";
import { words as wordlist } from "./word-list";
type GameDBType = Database["public"]["Tables"]["games"]["Row"];

export const identifyIfWordInList = (
  word: string,
  difficulty: string,
  player: boolean
): GameReturnValue => {
  let value: GameReturnValue = {
    inList: false,
    exactMatch: false,
    computerWords: null,
  };

  const computerWords: { index: number; word: string }[] = [];

  // iterate and build player matching words
  for (let i = 0; i < wordlist.length; i++) {
    if (wordlist[i].includes(word)) {
      value.inList = true;
      computerWords.push({ index: i, word: wordlist[i] });
    }
    if (wordlist[i].includes(word) && wordlist[i] === word) {
      value.exactMatch = true;
      value.inList = true;
      break;
    }
  }
  // build computer words based on slicing wordlist into easy, medium or normal length words
  if (player && computerWords.length > 0) {
    const wordsWithinDifficulty = computerWords.filter(
      (c) => c.word.length <= difficultyFilter("normal")
    );
    if (wordsWithinDifficulty.length > 0) {
      value.computerWords = [
        wordsWithinDifficulty[
          Math.floor(Math.random() * wordsWithinDifficulty.length)
        ]?.word ?? "",
        wordsWithinDifficulty[
          Math.floor(Math.random() * wordsWithinDifficulty.length)
        ]?.word ?? "",
        wordsWithinDifficulty[
          Math.floor(Math.random() * wordsWithinDifficulty.length)
        ]?.word ?? "",
      ];
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

export const checkPlayerWordAndReturnComputerWord = (
  playerGuess: string,
  difficulty: string
): { inList: boolean; exactMatch: boolean; computerWord: string | null } => {
  const playerResponse = identifyIfWordInList(playerGuess, difficulty, true);

  let compWord: string | null = null;

  if (playerResponse.computerWords) {
    for (let i = 0; i < playerResponse.computerWords.length; i++) {
      const computerWordToAttempt = computerWordGenerate(
        playerGuess,
        playerResponse.computerWords[i]
      );
      if (!computerWordToAttempt) {
        compWord = null;
      }
      // check if generated words match the dictionary
      if (computerWordToAttempt) {
        const checkComputerWordAgainstList = identifyIfWordInList(
          computerWordToAttempt,
          difficulty,
          false
        );
        if (
          !checkComputerWordAgainstList.exactMatch &&
          checkComputerWordAgainstList.inList
        ) {
          compWord = computerWordToAttempt;
          break;
        }
      }
    }
  }
  return {
    inList: playerResponse.inList,
    exactMatch: playerResponse.exactMatch,
    computerWord: compWord,
  };
};

export const updateGameBasedOnPlayerTurn = (
  playerGuess: string,
  difficulty: string,
  game: GameDBType,
  forfeit: boolean
): { update: boolean; gameToReturn: GameDBType; message: string } => {
  // if its multiplayers do this once
  // if its computer, do it twice

  // first time user goes through it
  // if forfeit or not a match still their go
  // if exact match switch to other player

  if (forfeit) {
    const { message, updatedGame } = forfeitRoundLogic(game);
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  const { inList, exactMatch, computerWord } =
    checkPlayerWordAndReturnComputerWord(playerGuess, difficulty);
  if (exactMatch) {
    // switch player
    // increment other players score
    // increment letter
    // if letter is z set other player winner
    // message about match
    const { message, updatedGame } = exactMatchLogic(game, playerGuess);
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  if (!exactMatch && inList) {
    // switch player
    // add to word
    // message about okay next player
    const { message, updatedGame } = nextPlayerLogic(
      game,
      playerGuess,
      computerWord
    );
    return { update: true, gameToReturn: updatedGame, message: message };
  }

  // message try again
  return {
    update: false,
    gameToReturn: game,
    message: `${playerGuess} is not a match, try again!`,
  };
};

export const switchPlayer = (currentPlayerIndex: number): number => {
  return currentPlayerIndex === 0 ? 1 : 0;
};

export const incrementLetter = (currentLetterIndex: number): number => {
  return currentLetterIndex <= 24 ? currentLetterIndex + 1 : 25;
};

export const setWinner = (
  currentLetterIndex: number,
  player_one_score: number,
  player_two_score: number,
  player_one_id: string,
  player_two_id: string
): string | null => {
  if (player_one_score > player_two_score && currentLetterIndex === 25) {
    return player_one_id;
  }
  if (player_two_score > player_one_score && currentLetterIndex === 25) {
    return player_two_id;
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
    const name =
      g.winner === g.player_one_id ? g.player_one_name : g.player_two_name;
    return `Winner is ${name}`;
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
    g.player_one_id!,
    g.player_two_id!
  );
  g.current_letter_index = incrementLetter(g.current_letter_index);
  g.current_word = letters[g.current_letter_index];

  return {
    updatedGame: g,
    message: setMessage(g, "You forfeit this round, next player!"),
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
    g.player_one_id!,
    g.player_two_id!
  );
  if (g.game_type !== GameType.COMPUTER) {
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
  computerWord: string | null
): { updatedGame: GameDBType; message: string } => {
  if (g.game_type !== GameType.COMPUTER) {
    g.current_word = playerGuess;
    g.current_player_index = switchPlayer(g.current_player_index);
    return { updatedGame: g, message: "Next player" };
  }

  if (g.game_type === GameType.COMPUTER && !computerWord) {
    g.player_one_score++;
    g.current_letter_index = incrementLetter(g.current_letter_index);
    g.current_word = computerReturnedWords[g.current_letter_index];
    g.winner = setWinner(
      g.current_letter_index,
      g.player_one_score,
      g.player_two_score,
      g.player_one_id!,
      g.player_two_id!
    );
    return {
      updatedGame: g,
      message: setMessage(
        g,
        `Computer could not find a word, you win this round!`
      ),
    };
  }

  g.current_word = computerWord!;

  return {
    updatedGame: g,
    message: setMessage(g, `Computer played ${computerWord}, your turn`),
  };
};
