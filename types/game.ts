export type GameReturnValue = { inList: boolean; exactMatch: boolean };

export type GamePlayer = { id: string; score: number };

export type Game = {
  players: [GamePlayer, GamePlayer | null];
  currentLetterIndex: number;
  currentPlayerIndex: 0 | 1;
  currentWord: string;
};

export enum GameType {
  COMPUTER = "computer",
  ONLINE_MULTIPLAYER = "online_multiplayer",
  LOCAL_MULTIPLAYER = "local_multiplayer",
}
