import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { act, renderHook, waitFor } from "@testing-library/react";
import { mockGame } from "@testing/mockData";
import { local_game } from "@utilities/constants";
import { usePlayerTurn } from ".././usePlayerTurn";

const mockReturnFromPlayerTurn = {
  computerWord: "",
  message: "Next player",
  update: true,
  value: {
    current_word: "ar",
    current_letter_index: 0,
    player_one_id: "d5bcd50f-4595-4d20-b940-1ac6f800dc13",
    player_one_name: "Ajm Mill",
    player_one_avatar:
      '{"src":"/_next/static/media/default_user_avatar.942977fa.svg","height":90,"width":90}',
    game_type: "local_multiplayer",
    current_player_index: 1,
    player_two_id: "d364e170-6a70-496a-9e2f-060a83125042",
    player_two_name: "Nikki",
    player_two_avatar: "default_user_avatar.svg",
    player_one_score: 0,
    player_two_score: 0,
    id: 1,
  },
};

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};

describe("usePlayerTurn", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it("sets a letter when user drags a tile", () => {
    const { result } = renderHook(() => usePlayerTurn());
    expect(result.current.selectedLetter).toBe("");
    act(() => {
      const dragStart: DragStartEvent = {
        active: {
          id: "u",
          data: { current: undefined },
          rect: {
            current: {
              initial: null,
              translated: null,
            },
          },
        },
      };
      result.current.handleDragStart(dragStart);
    });
    expect(result.current.selectedLetter).toBe("u");
  });

  it("checks the letter the user selects, and updates the current word if it is a pass", async () => {
    setLocalStorage(local_game, [mockGame]);

    const { result } = renderHook(() => usePlayerTurn());
    expect(result.current.selectedLetter).toBe("");
    act(() => {
      result.current.setGame(mockGame);
    });
    expect(result.current.game).not.toBeNull();

    const endEvent = {
      over: {
        id: "right",
        rect: {
          width: 180,
          height: 219.59375,
          top: 336.203125,
          bottom: 555.796875,
          right: 375,
          left: 195,
        },
        data: {},
        disabled: false,
      },
      active: {
        id: "r",
        data: {},
        rect: {
          current: {
            initial: null,
            translated: null,
          },
        },
      },
    };
    act(() => result.current.handleDragEnd(endEvent as DragEndEvent));
    await waitFor(() => {
      expect(result.current.game?.current_word).toBe("ar");
      expect(result.current.game?.current_player_index).toBe(1);
      expect(result.current.dialogMessage).toBe("Next player");
      expect(result.current.showDialog).toBeTruthy();
    });
  });

  it("forfeits a game", async () => {
    setLocalStorage(local_game, [mockGame]);

    const { result } = renderHook(() => usePlayerTurn());
    expect(result.current.selectedLetter).toBe("");
    act(() => {
      result.current.setGame(mockGame);
    });
    expect(result.current.game).not.toBeNull();

    act(() => result.current.forfeitGame());
    await waitFor(() => {
      expect(result.current.game?.current_player_index).toBe(0);
      expect(result.current.dialogMessage).toBe(
        "You forfeit this round, next letter!"
      );
      expect(result.current.showDialog).toBeTruthy();
    });
  });
});
