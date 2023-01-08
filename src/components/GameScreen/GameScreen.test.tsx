import React from "react";
import { render, screen, act, waitFor } from "@testing-library/react";
import { GameScreen } from "./index";
import { local_game } from "@utilities/constants";
import { mockGame } from "@testing/mockData";
import userAvatar from "../../public/user.svg";
import { useGamesStore } from "@components/store";
import { GameType } from "@utilities/game";

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};

let mockGame2 = { ...mockGame };
mockGame2.id = 2;

let supabaseMockGame = { ...mockGame };
supabaseMockGame.game_type = GameType.ONLINE_MULTIPLAYER;

const mockDownload = {
  playerOneImage: userAvatar,
  playerTwoImage: userAvatar,
  downloadImagesFromUrls: jest.fn(),
};

jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: () => {
    return mockDownload;
  },
}));

const MockWrapperComponent = () => {
  const { addGame } = useGamesStore();
  React.useEffect(() => {
    addGame(supabaseMockGame);
  }, []);
  return <GameScreen />;
};

describe("GameScreen Component", () => {
  it("it should exist", () => {
    render(<GameScreen />);
    expect(screen.getByTestId("GameScreen-wrapper")).toBeInTheDocument();
  });

  it("displays a list of local games", async () => {
    act(() => setLocalStorage(local_game, [mockGame, mockGame2]));

    render(<GameScreen />);
    await waitFor(() =>
      expect(screen.getAllByTestId("local_multiplayer-game").length).toBe(2)
    );
  });

  it("displays a list of multiplayer games", async () => {
    render(<MockWrapperComponent />);
    await waitFor(() =>
      expect(screen.getAllByTestId("online_multiplayer-game").length).toBe(1)
    );
  });
});
