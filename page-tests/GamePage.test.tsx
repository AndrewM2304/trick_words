import { render, screen, waitFor } from "@testing-library/react";
import { mockGame, mockUserProfile } from "@testing/mockData";
import { local_game } from "@utilities/constants";
import mockRouter from "next-router-mock";
import Game from "../pages/game/[game]";
import userAvatar from "../../public/user.svg";
import { mockSession, mockUser } from "@testing/mockData";
import { useEffect } from "react";
import { useUserProfileStore } from "@components/store";

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};

jest.mock("next/router", () => require("next-router-mock"));

jest.mock("@supabase/auth-helpers-react", () => ({
  useSession: jest.fn(() => mockSession),
  useUser: jest.fn(() => mockUser),
  useSupabaseClient: jest.fn(() => mockSB),
}));

jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: jest.fn(() => ({
    setImage: (e: any) => Promise.resolve(userAvatar),
  })),
}));

jest.mock("@hooks/useGetGameData", () => ({
  useGetGameData: jest.fn(() => ({
    error: null,
    gameData: mockGame,
  })),
}));

const mockImage = {
  playerOneImage: userAvatar,
  playerTwoImage: userAvatar,
  downloadImagesFromUrls: jest.fn(),
};

const mockSB = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => ({ data: mockGame, status: 200, error: null })),
      })),
      or: jest.fn(() => ({
        data: [mockGame],
        status: 200,
        error: null,
      })),
    })),
  })),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      })),
    })),
  })),
};

jest.mock("@components/store", () => ({
  useUserProfileStore: jest.fn(() => ({
    userProfile: mockUserProfile,
    setUserProfile: jest.fn(() => mockUserProfile),
  })),
  useGamesStore: jest.fn(() => ({
    games: [mockGame],
  })),
}));

beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe("game", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRouter.setCurrentUrl("/game/1?gametype=local");
  });

  it("loads a game from local storage if the url has ?gametype=local", async () => {
    setLocalStorage(local_game, mockGame);
    render(<Game />);
    await waitFor(() =>
      expect(screen.getByTestId("player-one-name")).toHaveTextContent("p1")
    );
  });
});
