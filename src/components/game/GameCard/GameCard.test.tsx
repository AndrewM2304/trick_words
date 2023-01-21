import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { GameCard } from "./index";
import { mockGame } from "@testing/mockData";
import userAvatar from "../../../../public/user.svg";
import { GameType } from "@utilities/game";
jest.mock("@hooks/useDownloadImages", () => ({
  useDownloadImages: jest.fn(() => ({
    setImage: (e: any) => Promise.resolve(userAvatar),
  })),
}));

jest.mock("@hooks/useDeleteGame", () => ({
  useDeleteGame: jest.fn(() => ({
    deleteGame: jest.fn(),
  })),
}));

describe("GameCard Component", () => {
  test("it should exist", async () => {
    render(<GameCard game={mockGame} />);
    await waitFor(() =>
      expect(screen.getByTestId("GameCard-wrapper")).toBeInTheDocument()
    );
  });

  test("it displays a card with the score and opponents name", async () => {
    render(<GameCard game={mockGame} />);
    await waitFor(() =>
      expect(screen.getByTestId("GameCard-wrapper")).toBeInTheDocument()
    );
    expect(screen.getByTestId("local_multiplayer-game")).toBeInTheDocument();
    expect(screen.getAllByText(/p1/i).length).toBe(2);
    expect(screen.getByTestId("score")).toBeInTheDocument();
    expect(screen.getAllByText(/0 - 0/i).length).toBe(2);
  });

  it("displays a placeholder card with buttons to cancel and invite players if a multiplayer game does not have a second player", async () => {
    const multiGame = { ...mockGame };
    multiGame.game_type = GameType.ONLINE_MULTIPLAYER;
    multiGame.player_two_id = null;
    render(<GameCard game={multiGame} />);
    await waitFor(() =>
      expect(screen.getByTestId("GameCard-wrapper")).toBeInTheDocument()
    );
    expect(screen.getByTestId("waiting-overlay")).toBeInTheDocument();
    expect(screen.getAllByRole("button").length).toBe(2);
  });
});
