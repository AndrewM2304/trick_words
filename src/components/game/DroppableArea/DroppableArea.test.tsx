import React from "react";
import { render, screen } from "@testing-library/react";
import { DroppableArea } from "./index";
describe("DroppableArea Component", () => {
  test("it should exist", () => {
    render(<DroppableArea area="left" word="a" />);
    expect(screen.getByTestId("DroppableArea-wrapper")).toBeInTheDocument();
    expect(screen.getAllByText(/a/i).length).toBe(2);
  });
});
