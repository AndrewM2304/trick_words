// export default function handler(req, res) {
//   const { value } = req.query;
//   res.end(`Post: ${value}`);
// }

import {
  computerWordGenerate,
  identifyIfWordInList,
  playerTurn,
} from "@game/game-functions";
import { GameReturnValue } from "@utilities/game";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  const { value, computerTurn, difficulty } = req.query;
  if (
    value === undefined ||
    computerTurn === undefined ||
    difficulty === undefined
  )
    return res.status(400).json("An error has occurred");

  const wordString = typeof value === "string" ? value : value[0];
  const difficultyString =
    typeof difficulty === "string" ? difficulty : difficulty[0];
  const playerResponse = identifyIfWordInList(wordString, "normal", true);
  if (!playerResponse.computerWords) return;
  let compWord: string | null = null;

  for (let i = 0; i < playerResponse.computerWords.length; i++) {
    const computerWordToAttemp = computerWordGenerate(
      wordString,
      playerResponse.computerWords[i]
    );
    const computerAttempt = identifyIfWordInList(
      computerWordToAttemp,
      difficultyString,
      false
    );
    if (!computerAttempt.exactMatch && computerAttempt.inList) {
      return (compWord = playerResponse.computerWords[i]);
    }
  }

  const response: GameReturnValue = {
    inList: playerResponse.inList,
    exactMatch: playerResponse.exactMatch,
    countOfPotentialWords: playerResponse.countOfPotentialWords,
    computerWords: compWord,
  };

  res.status(200).json(response);
}
