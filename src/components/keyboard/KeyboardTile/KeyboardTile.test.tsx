import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KeyboardTile } from "./index";

describe("KeyboardTile Component", () => {
  test("it should exist", () => {
    render(<KeyboardTile letter="a" />);
    expect(screen.getByTestId("KeyboardTile-wrapper")).toBeInTheDocument();
    expect(screen.getByTestId("top-tile")).toHaveTextContent("a");
  });
});
