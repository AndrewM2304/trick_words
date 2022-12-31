import { render, screen, waitFor } from "@testing-library/react";
import { mockGame } from "@testing/mockData";
import { local_game } from "@utilities/constants";
import mockRouter from "next-router-mock";
import Game from "../pages/game/[game]";
import userAvatar from "../../public/user.svg";

// mock localstorage
// mock supabase

const setLocalStorage = (id: string, data: any) => {
  window.localStorage.setItem(id, JSON.stringify(data));
};
jest.mock("next/router", () => require("next-router-mock"));
// jest.mock("@supabase/auth-helpers-react", () => ({
//   useSupabaseClient: jest.fn(),
//   useUser: jest.fn(),
// }));
const mockDownload = {
  playerOneImage: userAvatar,
  playerTwoImage: userAvatar,
  downloadImagesFromUrls: jest.fn(),
};

const mockGameReturn = {
  gameData: mockGame,
  status: 200,
  error: null,
};

jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: () => {
    return mockDownload;
  },
}));

jest.mock("@hooks/useGetGameData", () => ({
  useGetGameData: () => {
    return mockGameReturn;
  },
}));

describe("game", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockRouter.setCurrentUrl("game/1?gametype=local");
  });

  it("loads a game from local storage if the url has ?gametype=local", async () => {
    setLocalStorage(local_game, mockGame);
    render(<Game />);
    await waitFor(() =>
      expect(screen.getByTestId("player-one-name")).toHaveTextContent("p1")
    );
  });
});
