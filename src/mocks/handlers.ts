// src/mocks/handlers.js
import { rest } from "msw";
import { game_functions_url } from "@utilities/constants";
import { exactWord, wordfail, wordPass } from "@testing/mockData";

export const handlers = [
  // failling value
  rest.get(`${game_functions_url}${wordfail}`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        inList: false,
        exactMatch: false,
      })
    );
  }),
  rest.get(`${game_functions_url}${wordPass}`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        inList: true,
        exactMatch: false,
      })
    );
  }),
  rest.get(`${game_functions_url}${exactWord}`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        inList: true,
        exactMatch: true,
      })
    );
  }),

  // Handles a GET /user request
  // rest.get('/user', null),
];
