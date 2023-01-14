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

export const handlers = [
  // failling value
  rest.post<RequestBody, RequestParams, GameResponse | { message: string }>(
    `${game_functions_url}`,
    (req, res, ctx) => {
      const { word, difficulty, game, forfeit } = req.json() as any;

      return res(
        ctx.status(200),
        ctx.json({
          gameToReturn: mockGame,
          update: true,
          message: "passed",
        })
      );
    }
  ),

  // supabase mocks
  // rest.get(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/avatars/default_user_avatar.svg`, (_req, res, ctx) => {

  //   const mockBlob:Blob = {size: 588, type: 'image/svg+xml', arrayBuffer:Buffer.from('abc')}
  //   return res(
  //     ctx.status(200),
  //     ctx.json({
  //       inList: true,
  //       exactMatch: true,
  //     })
  //   );
  // }),
];
