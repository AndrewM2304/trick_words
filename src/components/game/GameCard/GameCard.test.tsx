import React from "react";
import { render, screen } from "@testing-library/react";
import { GameCard } from "./index";
describe("GameCard Component", () => {
  test("it should exist", () => {
    render(<GameCard />);
    expect(screen.getByTestId("GameCard-wrapper")).toBeInTheDocument();
  });

  test("it displays a card with two players names, avatars, scores and the current word", () => {
    render(<GameCard />);
    expect(screen.getByTestId("player-one-name")).toHaveTextContent(
      "mock player one"
    );
    expect(screen.getByTestId("player-two-name")).toHaveTextContent(
      "mock player two"
    );
    expect(screen.getByTestId("player-one-score")).toHaveTextContent("0");
    expect(screen.getByTestId("player-two-score")).toHaveTextContent("1");
  });
});
