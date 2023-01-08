import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Button } from "./index";

const action = jest.fn();
describe("Button Component", () => {
  test("it should exist", () => {
    render(<Button type={"primary"} text={"hello"} action={() => action} />);
    expect(screen.getByTestId("Button-wrapper")).toBeInTheDocument();
    expect(screen.getAllByText("hello").length).toBe(2);
  });

  it("triggers the action function when clicked", () => {
    render(<Button type={"primary"} text={"hello"} action={() => action} />);
    act(() => {
      fireEvent.click(screen.getByTestId("Button-wrapper"));
    });

    waitFor(() => expect(action).toHaveBeenCalled());
  });
});
