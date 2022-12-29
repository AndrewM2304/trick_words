import React from "react";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "./index";

jest.mock("next/router", () => require("next-router-mock"));
describe("HomeScreen Component", () => {
  test("it should exist", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("HomeScreen-wrapper")).toBeInTheDocument();
  });
});
