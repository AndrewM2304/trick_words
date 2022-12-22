import React from "react";
import { render, screen } from "@testing-library/react";
import { Authentication } from "./";
describe("Authentication Component", () => {
  test("it should exist", () => {
    render(<Authentication />);
    expect(screen.getByTestId("Authentication-wrapper")).toBeInTheDocument();
  });
});
