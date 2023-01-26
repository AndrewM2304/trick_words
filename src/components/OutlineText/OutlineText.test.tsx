import React from "react";
import { render, screen } from "@testing-library/react";
import { OutlineText } from "./index";
describe("OutlineText Component", () => {
  test("it should exist", () => {
    render(
      <OutlineText
        text={"hello world"}
        sizeInRem={1}
        upperCase={false}
        alignment={"center"}
      />
    );
    expect(screen.getByTestId("OutlineText-wrapper")).toBeInTheDocument();
    expect(screen.getAllByText("hello world").length).toBe(2);
  });
});
