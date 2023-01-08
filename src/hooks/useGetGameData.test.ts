import { act, renderHook, waitFor } from "@testing-library/react";
import { useGetGameData } from "./useGetGameData";
import {
  mockGame,
  mockUser,
  mockUserProfile,
  supabaseMockGame,
} from "@testing/mockData";
import { local_game } from "@utilities/constants";
import { GameType } from "@utilities/game";

let mockRouterValue: { query: { game: number; gametype: string | undefined } } =
  {
    query: {
      game: 1,
      gametype: "l",
    },
  };

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};

const mock = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({
          data: supabaseMockGame,
          status: 200,
          error: null,
        })),
      })),
    })),
  })),
};

jest.mock("@components/store", () => ({
  useUserProfileStore: jest.fn(() => ({
    userProfile: jest.fn(() => mockUserProfile),
  })),
  useGamesStore: jest.fn(() => ({
    games: [mockGame],
  })),
}));

jest.mock("next/router", () => ({
  useRouter: () => {
    return mockRouterValue;
  },
}));

jest.mock("@supabase/auth-helpers-react", () => ({
  useUser: () => {
    return mockUser;
  },
  useSupabaseClient: () => {
    return mock;
  },
}));

describe("useGetGameData", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  it("returns a game from localhost if the url contains local", async () => {
    setLocalStorage(local_game, [mockGame]);
    act(() => (mockRouterValue.query.gametype = "local"));
    const { result } = renderHook(() => useGetGameData());
    expect(result.current.gameData).toBeNull();
    await waitFor(() =>
      expect(result.current.gameData).toStrictEqual(mockGame)
    );
  });

  it("returns value from supabase database if matching game", async () => {
    act(() => (mockRouterValue.query.gametype = undefined));
    const { result } = renderHook(() => useGetGameData());
    expect(result.current.gameData).toBeNull();

    waitFor(() =>
      expect(result.current.gameData).toStrictEqual(supabaseMockGame)
    );
  });
});
