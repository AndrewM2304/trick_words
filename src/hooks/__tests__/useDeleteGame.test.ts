import { act, renderHook, waitFor } from "@testing-library/react";
import { mockGame, mockOnlineGame, mockUser } from "@testing/mockData";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";
import { useCreateGame } from "../useCreateGame";
import mockRouter from "next-router-mock";
import { useDeleteGame } from "@hooks/useDeleteGame";

jest.mock("next/router", () => require("next-router-mock"));

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};

describe("use delete game", () => {
  beforeEach(() => {
    setLocalStorage(local_game, [mockGame]);
  });
  it("deletes a local game ", async () => {
    const { result } = renderHook(() => useDeleteGame());
    const game = window.localStorage.getItem(local_game);
    if (!game) return;
    expect(JSON.parse(game).length).toBe(1);
    await act(async () => result.current.deleteGame(mockGame));
    const gameUpdated = window.localStorage.getItem(local_game);
    expect(JSON.parse(gameUpdated!).length).toBe(0);
  });
});
