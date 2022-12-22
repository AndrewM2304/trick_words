// export default function handler(req, res) {
//   const { value } = req.query;
//   res.end(`Post: ${value}`);
// }

import { identifyIfWordInList } from "@game/game-functions";
import { GameReturnValue } from "@utilities/game";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<GameReturnValue>
) {
  const { value } = req.query;
  if (value === undefined) return;
  const response = identifyIfWordInList(
    typeof value === "string" ? value : value[0]
  );
  res.status(200).json(response);
}
