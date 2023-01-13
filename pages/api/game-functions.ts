type Game = Database["public"]["Tables"]["games"]["Row"];

import { Database } from "@utilities/supabase";

import { updateGameBasedOnPlayerTurn } from "@game/new-game-functions";
import type { NextApiRequest, NextApiResponse } from "next";

type GameBody = {
  game: Game;
  difficulty: string;
  word: string;
  forfeit: boolean;
};

type GameResponse = {
  update: boolean;
  gameToReturn: Game;
  message: string;
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameResponse | { message: string }>
) {
  // const body: GameBody = JSON.parse(req.body);
  // const { word, difficulty, game, forfeit } = body;

  if (req.method !== "POST") {
    res.status(405).send({ message: "Only POST requests allowed" });
    return;
  }

  // not needed in NextJS v12+
  const body = req.body;
  const { word, difficulty, game, forfeit } = body;
  const { update, gameToReturn, message } = updateGameBasedOnPlayerTurn(
    word,
    difficulty,
    game,
    forfeit
  );

  res
    .status(200)
    .json({ gameToReturn: gameToReturn, update: update, message: message });
}
