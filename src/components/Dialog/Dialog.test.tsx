import React from "react";
import { render, screen } from "@testing-library/react";
import { Dialog } from "./index";
describe("Dialog Component", () => {
  test("it should exist", () => {
    render(<Dialog content="hello world" />);
    expect(screen.getByTestId("Dialog-wrapper")).toBeInTheDocument();
  });

  test("should display text content when visible", async () => {
    render(<Dialog content="hello world" />);
    expect(screen.queryByText(/hello world/i)).toBeInTheDocument();
  });
});
