import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  waitFor,
} from "@testing-library/react";
import { Dialog } from "./index";

const closer = jest.fn();

beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn();
  HTMLDialogElement.prototype.showModal = jest.fn();
  HTMLDialogElement.prototype.close = jest.fn();
});

describe("Dialog Component", () => {
  test("it should exist", () => {
    render(
      <Dialog display={true} setDisplay={() => closer()}>
        {" "}
        hello world
      </Dialog>
    );
    expect(screen.getByTestId("Dialog-wrapper")).toBeInTheDocument();
    expect(screen.getByText(/hello world/i)).toBeInTheDocument();
  });

  test("should trigger close action when escape pressed", async () => {
    render(
      <Dialog display={true} setDisplay={() => closer()}>
        {" "}
        hello world
      </Dialog>
    );
    act(() => {
      fireEvent.keyDown(screen.getByTestId("Dialog-wrapper")),
        {
          key: "Escape",
          code: "Escape",
          keyCode: 27,
          charCode: 27,
        };
    });

    waitFor(() => expect(closer).toHaveBeenCalled());
  });
});
