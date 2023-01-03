import React from "react";
import { render, screen } from "@testing-library/react";
import { ProfileImage } from "./index";
describe("ProfileImage Component", () => {
  test("it should exist", () => {
    render(
      <ProfileImage url="" color="red" notification={"!"} text="computer" />
    );
    expect(screen.getByTestId("ProfileImage-wrapper")).toBeInTheDocument();
    expect(screen.getAllByText(/computer/i).length).toBe(2);
    expect(screen.getAllByText(/!/i).length).toBe(2);
  });
});
