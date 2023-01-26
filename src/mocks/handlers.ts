// src/mocks/handlers.js
import { rest } from "msw";
import { game_functions_url } from "@utilities/constants";
import { exactWord, mockGame, wordfail, wordPass } from "@testing/mockData";
type Game = Database["public"]["Tables"]["games"]["Row"];

import { Database } from "@utilities/supabase";
interface RequestBody {
  word: string;
  game: any;
  difficulty: string;
  forfeit: boolean;
}
type GameResponse = {
  update: boolean;
  gameToReturn: Game;
  message: string;
};
interface RequestParams {
  postId: string;
}

const updatedGame = { ...mockGame };
updatedGame.current_player_index = 1;
updatedGame.current_word = "ar";
updatedGame.current_player_id = updatedGame.player_two_id;

export const handlers = [
  rest.post<RequestBody, RequestParams, GameResponse | { message: string }>(
    `${game_functions_url}`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          gameToReturn: updatedGame,
          update: true,
          message: "Next player",
        })
      );
    }
  ),
];
