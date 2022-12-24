import React from "react";
import { render, screen } from "@testing-library/react";
import { Keyboard } from "./index";
describe("Keyboard Component", () => {
  test("it should exist", () => {
    render(<Keyboard />);
    expect(screen.getByTestId("Keyboard-wrapper")).toBeInTheDocument();
  });
  test("renders 26 tiles", () => {
    render(<Keyboard />);
    expect(screen.getAllByTestId("top-tile").length).toBe(26);
  });
});
