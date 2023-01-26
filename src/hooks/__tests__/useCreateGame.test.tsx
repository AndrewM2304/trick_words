import { act, renderHook, waitFor } from "@testing-library/react";
import { mockOnlineGame, mockUser } from "@testing/mockData";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";
import { useCreateGame } from "../useCreateGame";
import mockRouter from "next-router-mock";

jest.mock("next/router", () => require("next-router-mock"));

const mockSB = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => mockOnlineGame),
    })),
  })),
};

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: () => {
    return mockUser;
  },
  useSupabaseClient: () => {
    return mockSB;
  },
}));

describe("usecreategame", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it("creates a local computer game", () => {
    const { result } = renderHook(() => useCreateGame());
    act(() => {
      result.current.setGameType(GameType.COMPUTER);
      result.current.setGameDifficulty("hard");
    });
    act(() => {
      result.current.createGame();
    });
    const game = window.localStorage.getItem(local_game);

    if (!game) return;
    expect(JSON.parse(game)[0]["game_type"]).toBe("computer");
    expect(JSON.parse(game)[0]["difficulty"]).toBe("hard");
  });

  it("creates a local multiplayer game", () => {
    const { result } = renderHook(() => useCreateGame());
    act(() => {
      result.current.setGameType(GameType.LOCAL_MULTIPLAYER);
      result.current.setSecondPlayer("test user");
    });
    act(() => {
      result.current.createGame();
    });
    const game = window.localStorage.getItem(local_game);

    if (!game) return;
    expect(JSON.parse(game)[0]["game_type"]).toBe("local_multiplayer");
    expect(JSON.parse(game)[0]["difficulty"]).toBe("hard");
    expect(JSON.parse(game)[0]["player_two_name"]).toBe("test user");
  });

  it("creates an online multiplayer game", async () => {
    const { result } = renderHook(() => useCreateGame());
    act(() => {
      result.current.setGameType(GameType.ONLINE_MULTIPLAYER);
      result.current.setSecondPlayer("test user");
    });
    act(() => {
      result.current.createGame();
    });
    await waitFor(() => expect(mockRouter.pathname).toBe("/game/1"));
  });
});
