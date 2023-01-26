import { renderHook, act, waitFor } from "@testing-library/react";
import { useGamesStore } from "@components/store";
import { mockGame, mockOnlineGame } from "@testing/mockData";

const updatesMockGame = { ...mockGame };
updatesMockGame.current_word = "test";
describe("use games store", () => {
  it("initiallly has no games", () => {
    const { result } = renderHook(() => useGamesStore());
    expect(result.current.games).toStrictEqual([]);
  });
  it("adds and removed games from ", async () => {
    const { result } = renderHook(() => useGamesStore());
    expect(result.current.games).toStrictEqual([]);
    act(() => result.current.addGame(mockGame));
    act(() => result.current.addGame(mockOnlineGame));
    expect(result.current.games).toStrictEqual([mockGame, mockOnlineGame]);
    act(() => result.current.deleteGame(mockOnlineGame));
    expect(result.current.games.length).toBe(1);
    act(() => result.current.updateGame(updatesMockGame));
    expect(result.current.games.length).toBe(1);
    expect(result.current.games[0].current_word).toBe("test");
  });
});
