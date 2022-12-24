import React from "react";
import { render, screen } from "@testing-library/react";
import AvatarWidget from "./AvatarWidget";

const mockOnUpload = jest.fn();
describe("AvatarWidget Component", () => {
  test("it should exist", () => {
    render(
      <AvatarWidget uid="a" url={"a.com"} size={100} onUpload={mockOnUpload} />
    );
    expect(screen.getByTestId("AvatarWidget-wrapper")).toBeInTheDocument();
  });
});
