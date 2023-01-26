import React from "react";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "./index";
import userEvent from "@testing-library/user-event";

jest.mock("next/router", () => require("next-router-mock"));

beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});
describe("HomeScreen Component", () => {
  test("it should exist", async () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("HomeScreen-wrapper")).toBeInTheDocument();
  });

  test("it opens a modal if user clicks new game", async () => {
    render(<HomeScreen />);
    userEvent.click(screen.getAllByText("New Game")[0]);
    const gameText = await screen.findAllByText("Select Game Type");
    expect(gameText.length).toBe(2);
    userEvent.click(screen.getAllByText("Pass and Play")[0]);
    const inputLabel = await screen.findByText("Enter Second Player Name");
    expect(inputLabel).toBeInTheDocument();

    userEvent.click(screen.getAllByText("Computer")[0]);
    const computerLabel = await screen.findByText("Select game difficulty");
    expect(computerLabel).toBeInTheDocument();
  });
});
